import { writeFile, listFiles } from '../lib/file.js';
import { logError, buildStats, imageToWebp } from '../lib/miscellaneous.js';
import { database } from '../lib/database.js';

const TOOL_HATCHET = 'hatchet';
const TOOL_BIG_AXE = 'big axe';

const TARGET_BULLSEYE = 'bullseye';
const TARGET_CLUTCH = 'clutch';

const RULESET = 'IATF Premier';
const TIMEOUT = 2000;

// Helpers

const logProgress = (text) => {
  console.log(text);
};

const reactPageState = (page) => {
  return page.evaluate(() => {
    return document.getElementById('root')
      ._reactRootContainer._internalRoot
      .current.memoizedState.element.props
      .store.getState();
  });
};

const isDesiredResponse = (method, status, url) => {
  return (response) => {
    return response.request().method() === method
      && response.status() === status
      && response.url() === url;
  };
};

// Retrieve Data

const fetchProfileIds = async (page) => {
  const rulesetSelector = '.sc-TuwoP.gpWLXY:nth-child(1) select';

  await page.goto('https://axescores.com/players/collins-rating');
  await page.waitForSelector(rulesetSelector);
  await page.select(rulesetSelector, RULESET);
  await page.waitForNetworkIdle();

  const { globalStandings } = await reactPageState(page);
  const profiles = globalStandings.standings.career;

  return profiles.reduce((result, { id, active }) => {
    if (active) {
      result.push(id);
    }

    return result;
  }, []);
};

const fetchProfileImage = async (profileId) => {
  const response = await fetch(`https://admin.axescores.com/pic/${profileId}`);
  const originalBuffer = await response.arrayBuffer();
  const webpBuffer = await imageToWebp(originalBuffer);

  return webpBuffer;
};

const fetchPlayerData = async (page, profileId) => {
  await page.goto(`https://axescores.com/player/${profileId}`, { waitUntil: 'networkidle2' });
  await page.waitForNetworkIdle();

  const state = await reactPageState(page);

  return state.player.playerData;
};

const fetchMatchData = async (page, matchId, urlProfileId) => {
  const url = `https://axescores.com/player/${urlProfileId}/${matchId}`;
  const apiUrl = `https://api.axescores.com/match/${matchId}/${urlProfileId}`;

  const [apiResponse] = await Promise.all([
    page.waitForResponse(isDesiredResponse('GET', 200, apiUrl), { timeout: TIMEOUT }),
    page.goto(url)
  ]);

  const rawMatch = await apiResponse.json();
  const competitors = rawMatch.players.map(({ id: profileId, name, forfeit }) => ({
    profileId,
    name,
    forfeit,
    invalid: false,
    throws: []
  }));

  if (competitors.some(x => x.forfeit)) {
    return { unplayed: false, invalid: false, competitors };
  }

  if (rawMatch.rounds.length === 0) {
    return { unplayed: true, invalid: false, competitors };
  }

  for (const competitor of competitors.filter(x => !x.forfeit)) {
    const rounds = rawMatch.rounds.flatMap(x => x.games).filter(x => x.player === competitor.profileId);
    const invalidRoundCount = ![3, 4].includes(rounds.length);
    const invalidThrowCount = rounds.slice(0, 3).some(x => x.Axes.length !== 5);

    if (invalidRoundCount || invalidThrowCount) {
      competitor.invalid = true;
      continue;
    }

    for (const { order: roundId, player: profileId, Axes } of rounds) {
      for (const { order: throwId, score, clutchCalled } of Axes) {
        competitor.throws.push({
          matchId,
          roundId,
          throwId,
          tool: roundId === 4 ? TOOL_BIG_AXE : TOOL_HATCHET,
          target: clutchCalled ? TARGET_CLUTCH : TARGET_BULLSEYE,
          score
        });
      }
    }
  }

  return { unplayed: false, invalid: false, competitors };
};

// Workflow

export const seedProfiles = async (mainDb, page) => {
  console.log('**********');
  console.log('Step: Seed Profiles');
  console.log('**********');

  try {
    const profileIds = await fetchProfileIds(page);

    logProgress(`Found ${profileIds.length} profiles.`);

    let i = 1;

    for (const profileId of profileIds) {
      logProgress(`Seeding profile ${profileId} (${i} / ${profileIds.length})...`);

      mainDb.run(`
        INSERT INTO profiles (profileId, fetch)
        VALUES (:profileId, 1)
        ON CONFLICT (profileId) DO UPDATE
        SET fetch = 1
      `, { profileId });

      i++;
    }
  } catch (error) {
    logProgress(error);
  }

  console.log('Done.');
};

export const discoverMatches = async (mainDb, page) => {
  console.log('**********');
  console.log('Step: Discover Matches');
  console.log('**********');

  const profiles = mainDb.rows(`SELECT profileId FROM profiles WHERE fetch = 1`);

  logProgress(`Found ${profiles.length} profiles.`);

  let i = 1;

  for (const { profileId } of profiles) {
    logProgress(`Discovering matches for profile ${profileId} (${i} / ${profiles.length})...`);

    const profileDb = database.profile(profileId);

    try {
      const playerData = await fetchPlayerData(page, profileId);
      const { name, leagues } = playerData;

      mainDb.run(`
        UPDATE profiles
        SET name = :name
        WHERE profileId = :profileId
      `, { profileId, name });

      let seasonCount = 0, matchCount = 0;

      for (const { id: seasonId, seasonWeeks, performanceName, ...season } of leagues) {
        if (performanceName !== RULESET) {
          continue;
        }

        const name = `${season.name.trim()} ${season.shortName.trim()}`;
        const year = parseInt(season.date.split('-')[0]);

        profileDb.run(`
          INSERT INTO seasons (seasonId, name, year)
          VALUES (:seasonId, :name, :year)
          ON CONFLICT (seasonId) DO UPDATE
          SET name = :name, year = :year
        `, { seasonId, name, year });

        seasonCount++;

        for (const { week: weekId, matches } of seasonWeeks) {
          for (const { id: matchId } of matches) {
            profileDb.run(`
              INSERT INTO matches (seasonId, weekId, matchId, status)
              VALUES (:seasonId, :weekId, :matchId, ${database.enums.matchStatus.new})
              ON CONFLICT (matchId) DO UPDATE
              SET weekId = :weekId
            `, { seasonId, weekId, matchId });

            matchCount++;
          }
        }
      }

      logProgress(`Found ${matchCount} matches across ${seasonCount} seasons.`);
    } catch (error) {
      logError(error);
    }

    profileDb.close();

    i++;
  }

  console.log('Done.');
};

export const processMatches = async (mainDb, page, limit = 0) => {
  console.log('**********');
  console.log(`Step: Process Matches (Limit ${limit})`);
  console.log('**********');

  const profiles = mainDb.rows(`SELECT profileId FROM profiles WHERE fetch = 1`);
  const profileIds = new Set();
  const matchIds = new Set();
  const matchProfiles = {}; // matchId => profileId

  for (const { profileId } of profiles) {
    profileIds.add(profileId);

    const profileDb = database.profile(profileId);
    const newMatches = profileDb.rows(`
      SELECT matchId
      FROM matches
      WHERE status = ${database.enums.matchStatus.new}
    `);

    for (const { matchId } of newMatches) {
      matchIds.add(matchId);
      matchProfiles[matchId] = profileId;
    }

    profileDb.close();
  }

  let processed = 0, count = Math.min(matchIds.size, limit);

  logProgress(`Found ${matchIds.size} new matches.`);
  logProgress(`Processing ${count} of ${matchIds.size} new matches.`);

  for (const matchId of matchIds) {
    const urlProfileId = matchProfiles[matchId];

    logProgress(`Processing match ${matchId} with profile ${urlProfileId} (${processed + 1} / ${count})...`);

    try {
      const { unplayed, competitors } = await fetchMatchData(page, matchId, urlProfileId).catch((error) => {
        logProgress(`Failed to fetch match data, treating match as unplayed for now.`);
        console.error(error);

        return { unplayed: true, competitors: [] };
      });

      if (unplayed) {
        logProgress(`Match ${matchId} is unplayed and won't count toward the processing limit.`);

        continue;
      }

      for (const { profileId, forfeit, invalid, throws } of competitors.filter(x => profileIds.has(x.profileId))) {
        const profileDb = database.profile(profileId);

        if (forfeit) {
          logProgress(`Match ${matchId} is forfeit for profile ${profileId}.`);

          profileDb.run(`
            UPDATE matches
            SET status = ${database.enums.matchStatus.processed}
            WHERE matchId = :matchId
          `, { matchId });

          continue;
        }

        if (invalid || throws.length === 0) {
          logProgress(`Match ${matchId} is invalid for profile ${profileId}.`);

          profileDb.run(`
            UPDATE matches
            SET status = ${database.enums.matchStatus.invalid}
            WHERE matchId = :matchId
          `, { matchId });

          continue;
        }

        for (const row of throws) {
          profileDb.run(`
            INSERT INTO throws (matchId, roundId, throwId, tool, target, score)
            VALUES (:matchId, :roundId, :throwId, :tool, :target, :score)
            ON CONFLICT (matchId, roundId, throwId) DO UPDATE
            SET tool = :tool, target = :target, score = :score
          `, row);
        }

        const opponent = competitors.find(x => x.profileId !== profileId);

        profileDb.run(`
          UPDATE matches
          SET opponentId = :opponentId, status = ${database.enums.matchStatus.processed}
          WHERE matchId = :matchId
        `, { opponentId: opponent.profileId, matchId });

        mainDb.run(`
          INSERT OR IGNORE INTO profiles (profileId, name)
          VALUES (:profileId, :name)
        `, opponent);

        profileDb.close();
      }
    } catch (error) {
      logError(error);
    }

    processed++;

    if (processed === count) {
      break;
    }
  }

  console.log('Done.');
};

export const resetInvalidMatches = (mainDb) => {
  console.log('**********');
  console.log('Step: Reset Invalid Matches');
  console.log('**********');

  const profileIds = mainDb.rows(`SELECT profileId FROM profiles WHERE fetch = 1`);

  let i = 1, total = 0;

  for (const { profileId } of profileIds) {
    logProgress(`Resetting invalid matches for profile ${profileId} (${i} / ${profileIds.length})...`);

    try {
      const profileDb = database.profile(profileId);
      const { count } = profileDb.row(`
        SELECT COUNT(*) AS count
        FROM matches
        WHERE status = :status
      `, { status: database.enums.matchStatus.invalid });

      logProgress(`Marking ${count} invalid matches as new.`);

      total += count;

      profileDb.run(`
        UPDATE matches
        SET status = :new
        WHERE status = :invalid
      `, database.enums.matchStatus);

      profileDb.close();
    } catch (error) {
      logError(error);
    }

    i++;
  }

  logProgress(`${total} invalid matches have been reset.`);
};

export const updateRankings = (mainDb) => {
  console.log('**********');
  console.log('Step: Update Rankings');
  console.log('**********');

  const profileIds = mainDb.rows(`SELECT profileId FROM profiles WHERE fetch = 1`);

  let i = 1;

  for (const { profileId } of profileIds) {
    logProgress(`Calculating ranking criteria for profile ${profileId} (${i} / ${profileIds.length})...`);

    try {
      const profileDb = database.profile(profileId);

      const { matchCount } = profileDb.row(`
        SELECT COUNT(matchId) AS matchCount
        FROM matches
        WHERE status = :status
      `, { status: database.enums.matchStatus.processed });

      const throws = profileDb.rows(`
        SELECT tool, target, score
        FROM throws
        ORDER BY matchId ASC, roundId ASC, throwId ASC
      `, { profileId });

      const { scorePerAxe } = buildStats(throws).overall;

      mainDb.run(`
        UPDATE profiles
        SET scorePerAxe = :scorePerAxe, matchCount = :matchCount
        WHERE profileId = :profileId
      `, { profileId, scorePerAxe, matchCount });

      profileDb.close();
    } catch (error) {
      logError(error);
    }

    i++;
  }

  mainDb.run(`UPDATE profiles SET rank = 0`);

  mainDb.rows(`
    SELECT profileId, matchCount
    FROM profiles
    WHERE fetch = 1 AND matchCount >= 28
    ORDER BY scorePerAxe DESC, profileId ASC
  `).forEach(({ profileId, matchCount }, i) => {
    mainDb.run(`
      UPDATE profiles
      SET rank = :rank
      WHERE profileId = :profileId
    `, { profileId, rank: i + 1 });
  });

  console.log('Done.');
};

export const getImages = async (mainDb) => {
  console.log('**********');
  console.log('Step: Get Images');
  console.log('**********');

  const profileIds = mainDb.rows(`SELECT profileId FROM profiles`);

  logProgress(`Fetching ${profileIds.length} images.`);

  let i = 1;

  for (const { profileId } of profileIds) {
    logProgress(`Fetching image for profile ${profileId} (${i} / ${profileIds.length})...`);

    try {
      const image = await fetchProfileImage(profileId);

      writeFile(`data/images/${profileId}.webp`, image, null);
    } catch (error) {
      logError(error);
    }

    i++;
  }

  console.log('Done.');
};

export const databaseReport = (mainDb) => {
  console.log('**********');
  console.log('Step: Database Report');
  console.log('**********');

  const stats = {
    allProfiles: mainDb.row(`SELECT COUNT(*) AS count FROM profiles`).count,
    fetchProfiles: mainDb.row(`SELECT COUNT(*) AS count FROM profiles WHERE fetch = 1`).count,
    images: listFiles('data/images/*.webp').length,
    throws: 0,
  };

  for (const { profileId } of mainDb.rows(`SELECT profileId FROM profiles WHERE fetch = 1`)) {
    const profileDb = database.profile(profileId);

    stats.throws += profileDb.row(`SELECT COUNT(*) AS count FROM throws`).count;

    profileDb.close();
  }

  console.table(Object.entries(stats).map(([stat, count]) => ({ stat, count })));

  writeFile('data/stats.json', JSON.stringify(stats, null, 2));

  console.log('Done.');
};

export const teardown = async (startTime, mainDb, browser) => {
  console.log('**********');
  console.log('Step: Teardown');
  console.log('**********');

  if (browser) {
    await browser.close();
  }

  if (mainDb) {
    mainDb.close();
  }

  if (startTime) {
    const duration = Math.round((Date.now() - startTime) / 1000);

    logProgress(`Total Runtime: ${duration} seconds`);
  }

  console.log('Done.');
};