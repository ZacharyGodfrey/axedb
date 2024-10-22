import { writeFile, readFile } from '../lib/file.js';
import { sort, imageToWebp } from '../lib/miscellaneous.js';
import { database } from '../lib/database.js';

const RULESET = 'IATF Premier';
const REGIONS = ['Southeast'];
const TOOL_HATCHET = 'hatchet';
const TOOL_BIG_AXE = 'big axe';
const TARGET_BULLSEYE = 'bullseye';
const TARGET_CLUTCH = 'clutch';
const TIMEOUT = 2000;

// Helpers

const logError = (error) => {
  const data = {
    message: error.message,
    stack: error.stack.split('\n').slice(1).map(x => x.trim())
  };

  console.error(`ERROR: ${JSON.stringify(data, null, '\t')}`);
};

const reactPageState = (page, selector) => {
  return page.$eval(selector, (element) => {
    return element._reactRootContainer._internalRoot.current.memoizedState.element.props.store.getState();
    // document.getElementById('root')._reactRootContainer._internalRoot.current.memoizedState.element.props.store.getState();
  });
};

const isDesiredResponse = (method, status, url) => {
  return (response) => {
    return response.request().method() === method
      && response.status() === status
      && response.url() === url;
  };
};

const waitMilliseconds = (milliseconds) => {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
};

const round = (places, value) => {
  const factor = 10 ** places;

  return Math.round(value * factor) / factor;
};

const scorePerAxe = (score, attempts) => {
  return round(2, score / Math.max(1, attempts));
};

export const buildStats = (throws) => {
  const result = {
    overall: {
      attempts: 0,
      totalScore: 0,
      scorePerAxe: 0
    },
    hatchet: {
      overall: {
        attempts: 0,
        totalScore: 0,
        scorePerAxe: 0
      },
      bullseye: {
        attempts: 0,
        totalScore: 0,
        scorePerAxe: 0,
        breakdown: {
          0: 0,
          1: 0,
          3: 0,
          5: 0
        }
      },
      clutch: {
        attempts: 0,
        totalScore: 0,
        scorePerAxe: 0,
        breakdown: {
          0: 0,
          5: 0,
          7: 0
        }
      }
    },
    bigAxe: {
      overall: {
        attempts: 0,
        totalScore: 0,
        scorePerAxe: 0
      },
      bullseye: {
        attempts: 0,
        totalScore: 0,
        scorePerAxe: 0,
        breakdown: {
          0: 0,
          1: 0,
          3: 0,
          5: 0
        }
      },
      clutch: {
        attempts: 0,
        totalScore: 0,
        scorePerAxe: 0,
        breakdown: {
          0: 0,
          5: 0,
          7: 0
        }
      }
    }
  };

  for (const { tool, target, score } of throws) {
    result.overall.attempts += 1;
    result.overall.totalScore += score;

    if (tool === TOOL_HATCHET) {
      result.hatchet.overall.attempts += 1;
      result.hatchet.overall.totalScore += score;

      if (target === TARGET_BULLSEYE) {
        result.hatchet.bullseye.attempts += 1;
        result.hatchet.bullseye.totalScore += score;
        result.hatchet.bullseye.breakdown[score] += 1;
      } else if (target === TARGET_CLUTCH) {
        result.hatchet.clutch.attempts += 1;
        result.hatchet.clutch.totalScore += score;
        result.hatchet.clutch.breakdown[score] += 1;
      }
    } else if (tool === TOOL_BIG_AXE) {
      result.bigAxe.overall.attempts += 1;
      result.bigAxe.overall.totalScore += score;

      if (target === TARGET_BULLSEYE) {
        result.bigAxe.bullseye.attempts += 1;
        result.bigAxe.bullseye.totalScore += score;
        result.bigAxe.bullseye.breakdown[score] += 1;
      } else if (target === TARGET_CLUTCH) {
        result.bigAxe.clutch.attempts += 1;
        result.bigAxe.clutch.totalScore += score;
        result.bigAxe.clutch.breakdown[score] += 1;
      }
    }
  }

  result.overall.scorePerAxe = scorePerAxe(result.overall.totalScore, result.overall.attempts);

  result.hatchet.overall.scorePerAxe = scorePerAxe(result.hatchet.overall.totalScore, result.hatchet.overall.attempts);
  result.hatchet.bullseye.scorePerAxe = scorePerAxe(result.hatchet.bullseye.totalScore, result.hatchet.bullseye.attempts);
  result.hatchet.clutch.scorePerAxe = scorePerAxe(result.hatchet.clutch.totalScore, result.hatchet.clutch.attempts);

  result.bigAxe.overall.scorePerAxe = scorePerAxe(result.bigAxe.overall.totalScore, result.bigAxe.overall.attempts);
  result.bigAxe.bullseye.scorePerAxe = scorePerAxe(result.bigAxe.bullseye.totalScore, result.bigAxe.bullseye.attempts);
  result.bigAxe.clutch.scorePerAxe = scorePerAxe(result.bigAxe.clutch.totalScore, result.bigAxe.clutch.attempts);

  return result;
};

// Retrieve Data

const fetchProfileIds = async (page) => {
  return [
    1207260, // me
  ];

  const rulesetSelector = '.sc-TuwoP.gpWLXY:nth-child(1) select';

  await page.goto('https://axescores.com/players/collins-rating');
  await page.waitForSelector(rulesetSelector);
  await page.select(rulesetSelector, RULESET);
  await page.waitForNetworkIdle();

  const { globalStandings } = await reactPageState(page, '#root');
  const regions = globalStandings.regions.reduce((result, { ID, Name }) => ({ ...result, [Name]: ID }), {});
  const profiles = globalStandings.standings.career;

  return profiles.reduce((result, { id, active, regionIDs }) => {
    if (active && regionIDs && REGIONS.some(x => regionIDs.includes(regions[x]))) {
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

  const state = await reactPageState(page, '#root');

  return state.player.playerData;
};

const fetchMatchData = async (page, matchId) => {
  const result = {
    unplayed: false,
    invalid: false,
    competitors: []
  };

  const throws = [];

  const url = `https://axescores.com/player/1/${matchId}`;
  const apiUrl = `https://api.axescores.com/match/${matchId}`;

  const [apiResponse] = await Promise.all([
    page.waitForResponse(isDesiredResponse('GET', 200, apiUrl), { timeout: TIMEOUT }),
    page.goto(url)
  ]);

  const rawMatch = await apiResponse.json();

  if (rawMatch.rounds.length === 0) {
    return { unplayed: true };
  }

  if (![3, 4].includes(rawMatch.rounds.length)) {
    return { invalid: true };
  }

  if (rawMatch.rounds.slice(0, 3).some(x => x.games.some(y => y.Axes.length !== 5))) {
    return { invalid: true };
  }

  result.competitors = rawMatch.players.map(({ id: profileId, name, forfeit }) => ({ profileId, name, forfeit, throws: [] }));

  for (const { order: roundId, player: profileId, Axes } of rawMatch.rounds.flatMap(x => x.games)) {
    const competitor = result.competitors.find(x => x.profileId === profileId);

    if (competitor.forfeit) {
      continue;
    }

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

  return result;
};

// Workflow

export const seedProfiles = async (mainDb, page) => {
  console.log('Step: Seed Profiles');

  try {
    const profileIds = await fetchProfileIds(page);

    console.log(`Found ${profileIds.length} profiles`);

    let i = 1;

    for (const profileId of profileIds) {
      console.log(`Seed profile ${profileId} (${i} / ${profileIds.length})`);

      mainDb.run(`
        INSERT INTO profiles (profileId, fetch)
        VALUES (:profileId, 1)
        ON CONFLICT (profileId) DO UPDATE
        SET fetch = 1
      `, { profileId });

      i++;
    }
  } catch (error) {
    console.log(error);
  }

  console.log('Done.');
};

export const discoverMatches = async (mainDb, page) => {
  console.log('Step: Discover Matches');

  const profiles = mainDb.rows(`SELECT profileId FROM profiles WHERE fetch = 1`);

  console.log(`Found ${profiles.length} profiles`);

  let i = 1;

  for (const { profileId } of profiles) {
    console.log(`Discover matches for profile ${profileId} (${i} / ${profiles.length})`);

    const profileDb = database.profile(profileId);

    try {
      const playerData = await fetchPlayerData(page, profileId);
      const { name, leagues } = playerData;

      mainDb.run(`
        UPDATE profiles
        SET name = :name
        WHERE profileId = :profileId
      `, { profileId, name });

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

        for (const { week: weekId, matches } of seasonWeeks) {
          for (const { id: matchId } of matches) {
            profileDb.run(`
              INSERT INTO matches (seasonId, weekId, matchId, status)
              VALUES (:seasonId, :weekId, :matchId, ${database.enums.matchStatus.new})
              ON CONFLICT (matchId) DO UPDATE
              SET weekId = :weekId
            `, { seasonId, weekId, matchId });
          }
        }
      }
    } catch (error) {
      logError(error);
    }

    profileDb.close();

    i++;
  }

  console.log('Done.');
};

export const processMatches = async (mainDb, page, limit = 0) => {
  console.log(`Step: Process Matches (Limit ${limit})`);

  const profiles = mainDb.rows(`SELECT profileId FROM profiles WHERE fetch = 1`);
  const profileIds = new Set();
  const matchIds = new Set();
  const profileMatches = {};

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
    }

    profileDb.close();
  }

  const limitedMatchIds = [...matchIds].slice(0, limit > 0 ? limit : matchIds.size);

  console.log(`Processing ${limitedMatchIds.length} of ${matchIds.size} new matches`);

  let i = 1;

  for (const matchId of limitedMatchIds) {
    console.log(`Process match ${matchId} (${i} / ${limitedMatchIds.length})`);

    try {
      const { unplayed, invalid, competitors } = await fetchMatchData(page, matchId);

      for (const { profileId, forfeit, throws } of competitors.filter(x => profileIds.has(x.profileId))) {
        const profileDb = database.profile(profileId);

        if (unplayed) {
          console.log(`Match ${matchId} is unplayed for profile ${profileId}.`);

          profileDb.run(`
            UPDATE matches
            SET status = ${database.enums.matchStatus.unplayed}
            WHERE matchId = :matchId
          `, { matchId });

          continue;
        }

        if (invalid) {
          console.log(`Match ${matchId} is invalid for profile ${profileId}.`);

          profileDb.run(`
            UPDATE matches
            SET status = ${database.enums.matchStatus.invalid}
            WHERE matchId = :matchId
          `, { matchId });

          continue;
        }

        if (forfeit) {
          console.log(`Match ${matchId} is forfeit for profile ${profileId}.`);

          profileDb.run(`
            UPDATE matches
            SET status = ${database.enums.matchStatus.processed}
            WHERE matchId = :matchId
          `, { matchId });

          continue;
        }

        for (const row of throws) {
          profileDb.run(`
            INSERT INTO throws (matchId, roundId, throwId, tool, target, score)
            VALUES (:matchId, :roundId, :throwId, :tool, :target, :score)
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

    i++;
  }

  console.log('Done.');
};

export const updateRankings = (mainDb) => {
  console.log('Step: Update Rankings');

  for (const { profileId } of mainDb.rows(`SELECT profileId FROM profiles WHERE fetch = 1`)) {
    const profileDb = database.profile(profileId);

    const stats = buildStats(profileDb.rows(`
      SELECT tool, target, score
      FROM throws
      ORDER BY matchId ASC, roundId ASC, throwId ASC
    `, { profileId }));

    const { scorePerAxe } = stats.overall;

    mainDb.run(`
      UPDATE profiles
      SET scorePerAxe = :scorePerAxe
      WHERE profileId = :profileId
    `, { profileId, scorePerAxe });

    profileDb.close();
  }

  mainDb.rows(`
    SELECT profileId
    FROM profiles
    WHERE fetch = 1
    ORDER BY scorePerAxe DESC, name ASC
  `).forEach(({ profileId }, i) => {
    mainDb.run(`
      UPDATE profiles
      SET rank = :rank
      WHERE profileId = :profileId
    `, { profileId, rank: i + 1 });
  });

  console.log('Done.');
};

export const getImages = async (mainDb) => {
  console.log('Step: Get Images');

  const profiles = mainDb.rows(`SELECT profileId FROM profiles`);

  console.log(`Fetching ${profiles.length} images`);

  let i = 1;

  for (const { profileId } of profiles) {
    console.log(`Fetch image for profile ${profileId} (${i} / ${profiles.length})`);

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
  console.log('Step: Database Report');

  const tables = {
    profiles: mainDb.row(`SELECT COUNT(*) AS count FROM profiles`).count,
    throws: 0,
  };

  for (const { profileId } of mainDb.rows(`SELECT profileId FROM profiles WHERE fetch = 1`)) {
    const profileDb = database.profile(profileId);

    tables.throws += profileId.row(`SELECT COUNT(*) AS count FROM throws`).count;

    profileDb.close();
  }

  console.table(Object.entries(tables).map(([table, count]) => ({ table, count })));

  console.log('Done.');
};

export const teardown = async (startTime, mainDb, browser) => {
  console.log('Step: Teardown');

  if (browser) {
    await browser.close();
  }

  if (mainDb) {
    for (const { profileId } of mainDb.rows(`SELECT profileId FROM profiles WHERE fetch = 1`)) {
      database.profile(profileId).close();
    }

    mainDb.close();
  }

  if (startTime) {
    const duration = Math.round((Date.now() - startTime) / 1000);

    console.log(`Total Runtime: ${duration} seconds`);
  }

  console.log('Done.');
};