import { writeFile, readFile } from '../lib/file.js';
import { sort, imageToWebp } from '../lib/miscellaneous.js';

const RULESET = 'IATF Premier';
const REGIONS = ['Southeast'];

const TIMEOUT = 2000;

const TOOL_HATCHET = 'hatchet';
const TOOL_BIG_AXE = 'big axe';
const TARGET_BULLSEYE = 'bullseye';
const TARGET_CLUTCH = 'clutch';

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

const buildStats = (throws) => {
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
  const rulesetSelector = '.sc-TuwoP.gpWLXY:nth-child(1) select';

  await page.goto('https://axescores.com/players/collins-rating');
  await page.waitForSelector(rulesetSelector);
  await page.select(rulesetSelector, RULESET);
  await page.waitForNetworkIdle();

  const state = await reactPageState(page, '#root');
  const regions = state.globalStandings.regions.reduce((result, { ID, Name }) => ({ ...result, [Name]: ID }), {});
  const profiles = state.globalStandings.standings.career;

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

const fetchThrowData = async (page, profileId, matchId) => {
  const throws = [];
  const url = `https://axescores.com/player/${profileId}/${matchId}`;
  const apiUrl = `https://api.axescores.com/match/${matchId}`;

  const [apiResponse] = await Promise.all([
    page.waitForResponse(isDesiredResponse('GET', 200, apiUrl), { timeout: TIMEOUT }),
    page.goto(url)
  ]);

  const rawMatch = await apiResponse.json();

  if (![3, 4].includes(rawMatch.rounds.length)) {
    console.log(`Invalid round count: ${rawMatch.rounds.length}`);

    return { throws, forfeit: false };
  }

  if (rawMatch.players.find(x => x.id === profileId)?.forfeit === true) {
    console.log('Match is forfeit');

    return { throws, forfeit: true };
  }

  const opponentId = rawMatch.players.find(x => x.id !== profileId)?.id ?? 0;

  for (const { order: roundNumber, name, games } of rawMatch.rounds) {
    const game = games.find(x => x.player === profileId);

    if (!game || game.forfeit === true) {
      continue;
    }

    const isBigAxe = name === 'Tie Break';
    const { Axes: axes = [] } = game;

    for (const { order: throwNumber, score, clutchCalled: isClutch } of axes) {
      throws.push({
        profileId,
        opponentId,
        matchId,
        roundId: roundNumber,
        throwId: throwNumber,
        tool: isBigAxe ? TOOL_BIG_AXE : TOOL_HATCHET,
        target: isClutch ? TARGET_CLUTCH : TARGET_BULLSEYE,
        score
      });
    }
  }

  return { throws, forfeit: false };
};

// Workflow

export const seedProfiles = async (db, page) => {
  console.log('Step: Seed Profiles');

  try {
    const profileIds = await fetchProfileIds(page);

    console.log(`Found ${profileIds.length} profiles`);

    let i = 1;

    for (const profileId of profileIds) {
      console.log(`Seed profile ${profileId} (${i} / ${profileIds.length})`);

      db.run(`
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

export const processProfiles = async (db, page) => {
  console.log('Step: Process Profiles');

  const profiles = db.rows(`SELECT profileId FROM profiles WHERE fetch = 1`);

  console.log(`Found ${profiles.length} profiles`);

  let i = 1;

  for (const { profileId } of profiles) {
    console.log(`Process profile ${profileId} (${i} / ${profiles.length})`);

    try {
      const playerData = await fetchPlayerData(page, profileId);
      const { name, leagues } = playerData;

      db.run(`
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

        db.run(`
          INSERT INTO seasons (seasonId, name, year)
          VALUES (:seasonId, :name, :year)
          ON CONFLICT (seasonId) DO UPDATE
          SET name = :name, year = :year
        `, { seasonId, name, year });

        for (const { week: weekId, matches } of seasonWeeks) {
          for (const { id: matchId } of matches) {
            db.run(`
              INSERT INTO matches (profileId, seasonId, weekId, matchId)
              VALUES (:profileId, :seasonId, :weekId, :matchId)
              ON CONFLICT (profileId, matchId) DO UPDATE
              SET weekId = :weekId
            `, { profileId, seasonId, weekId, matchId });

            db.run(`
              UPDATE throws
              SET weekId = :weekId
              WHERE profileId = :profileId AND matchId = :matchId
            `, { profileId, matchId, weekId });
          }
        }
      }
    } catch (error) {
      logError(error);
    }

    i++;
  }

  console.log('Done.');
};

export const processMatches = async (db, page) => {
  console.log('Step: Process Matches');

  const newMatches = db.rows(`
    SELECT profileId, seasonId, weekId, matchId
    FROM matches
    WHERE processed = 0
  `);

  console.log(`Found ${newMatches.length} new matches`);

  let i = 1;

  for (const { profileId, seasonId, weekId, matchId } of newMatches) {
    console.log(`Process match ${profileId}:${matchId} (${i} / ${newMatches.length})`);

    try {
      const { throws, forfeit } = await fetchThrowData(page, profileId, matchId);

      if (forfeit) {
        console.log('Match is forfeit.');

        db.run(`
          UPDATE matches
          SET processed = 1
          WHERE profileId = :profileId AND matchId = :matchId
        `, { profileId, matchId });

        i++; continue;
      }

      if (throws.length < 1) {
        console.log('Match has no throws yet.');

        i++; continue;
      }

      const { opponentId } = throws[0];

      console.table(throws);

      for (const row of throws) {
        db.insert('throws', { ...row, seasonId, weekId });
      }

      db.run(`
        UPDATE matches
        SET processed = 1, opponentId = :opponentId
        WHERE profileId = :profileId AND matchId = :matchId
      `, { profileId, opponentId, matchId });
    } catch (error) {
      logError(error);
    }

    i++;
  }

  console.log('Done.');
};

export const processOpponents = async (db, page) => {
  console.log('Step: Process Opponents');

  const opponents = db.rows(`
    SELECT DISTINCT opponentId AS profileId FROM matches
    WHERE opponentId > 0 AND opponentId NOT IN (
      SELECT profileId FROM profiles
      WHERE fetch = 1
    )
  `);

  console.log(`Found ${opponents.length} opponents`);

  let i = 1;

  for (const { profileId } of opponents) {
    console.log(`Process opponent ${profileId} (${i} / ${opponents.length})`);

    try {
      const playerData = await fetchPlayerData(page, profileId);
      const { name } = playerData;

      db.run(`
        INSERT INTO profiles (profileId, name)
        VALUES (:profileId, :name)
        ON CONFLICT (profileId) DO UPDATE
        SET name = :name
      `, { profileId, name });
    } catch (error) {
      logError(error);
    }

    i++;
  }

  console.log('Done.');
};

export const getImages = async (db) => {
  console.log('Step: Get Images');

  const profiles = db.rows(`SELECT profileId FROM profiles`);

  console.log(`Fetching ${profiles.length} images`);

  let i = 1;

  for (const { profileId } of profiles) {
    console.log(`Fetch image for profile ${profileId} (${i} / ${profiles.length})`);

    try {
      const image = await fetchProfileImage(profileId);

      db.run(`
        INSERT INTO images (profileId, image)
        VALUES (:profileId, :image)
        ON CONFLICT (profileId) DO UPDATE
        SET image = :image
      `, { profileId, image });
    } catch (error) {
      logError(error);
    }

    i++;
  }

  console.log('Done.');
};

export const generateJsonFiles = (db) => {
  console.log('Step: Generate JSON Files');

  const profiles = db.rows(`
    SELECT profileId, name
    FROM profiles
    WHERE fetch = 1
  `);

  console.log(`Found ${profiles.length} profiles`);

  let i = 1;

  for (const profile of profiles) {
    console.log(`Write JSON for profile ${profile.profileId} (${i} / ${profiles.length})`);

    try {
      const { profileId, name } = profile;
      const career = {
        profileId,
        name,
        rank: 0,
        stats: null,
        seasons: []
      };

      career.stats = buildStats(db.rows(`
        SELECT tool, target, score
        FROM throws
        WHERE profileId = :profileId
        ORDER BY seasonId ASC, weekId ASC, matchId ASC, roundId ASC, throwId ASC
      `, { profileId }));

      profile.spa = career.stats.overall.scorePerAxe;

      const seasons = db.rows(`
        SELECT seasonId, name, year
        FROM seasons
        WHERE seasonId IN (
          SELECT DISTINCT seasonId
          FROM matches
          WHERE profileId = :profileId
        )
        ORDER BY seasonId ASC
      `, { profileId });

      for (const { seasonId, name, year } of seasons) {
        const season = {
          seasonId,
          name,
          year,
          stats: null,
          weeks: []
        };

        season.stats = buildStats(db.rows(`
          SELECT tool, target, score
          FROM throws
          WHERE profileId = :profileId AND seasonId = :seasonId
          ORDER BY weekId ASC, matchId ASC, roundId ASC, throwId ASC
        `, { profileId, seasonId }));

        const weeks = db.rows(`
          SELECT DISTINCT weekId
          FROM matches
          WHERE profileId = :profileId AND seasonId = :seasonId
          ORDER BY weekId ASC
        `, { profileId, seasonId });

        for (const { weekId } of weeks) {
          const week = {
            weekId,
            stats: null,
            matches: []
          };

          week.stats = buildStats(db.rows(`
            SELECT tool, target, score
            FROM throws
            WHERE profileId = :profileId AND seasonId = :seasonId AND weekId = :weekId
            ORDER BY matchId ASC, roundId ASC, throwId ASC
          `, { profileId, seasonId, weekId }));

          const matches = db.rows(`
            SELECT matchId, opponentId
            FROM matches
            WHERE profileId = :profileId AND seasonId = :seasonId AND weekId = :weekId
            ORDER BY matchId ASC
          `, { profileId, seasonId, weekId });

          for (const { matchId, opponentId } of matches) {
            const match = {
              matchId,
              opponent: {
                id: opponentId,
                name: 'Unknown'
              },
              stats: null,
              rounds: []
            };

            const opponent = db.row(`
              SELECT name
              FROM profiles
              WHERE profileId = :opponentId
            `, { opponentId });

            match.opponent.name = opponent ? opponent.name : match.opponent.name;

            match.stats = buildStats(db.rows(`
              SELECT tool, target, score
              FROM throws
              WHERE profileId = :profileId AND matchId = :matchId
              ORDER BY roundId ASC, throwId ASC
            `, { profileId, matchId }));

            const rounds = db.rows(`
              SELECT DISTINCT roundId
              FROM throws
              WHERE profileId = :profileId AND matchId = :matchId
              ORDER BY roundId ASC
            `, { profileId, matchId });

            for (const { roundId } of rounds) {
              const round = {
                roundId,
                stats: null,
                throws: []
              };

              round.throws = db.rows(`
                SELECT throwId, tool, target, score
                FROM throws
                WHERE profileId = :profileId AND matchId = :matchId AND roundId = :roundId
                ORDER BY throwId ASC
              `, { profileId, matchId, roundId });

              round.stats = buildStats(round.throws);

              match.rounds.push(round);
            }

            week.matches.push(match);
          }

          season.weeks.push(week);
        }

        writeFile(`data/profiles/${profileId}/s/${seasonId}.json`, JSON.stringify(season, null, 2));

        delete season.weeks;

        career.seasons.push(season);
      }

      writeFile(`data/profiles/${profileId}.json`, JSON.stringify(career, null, 2));
    } catch (error) {
      logError(error);
    }

    i++;
  }

  profiles.sort(sort.byDescending(x => x.spa));

  profiles.forEach(({ profileId }, index) => {
    const fileName = `data/profiles/${profileId}.json`;
    const data = JSON.parse(readFile(fileName));

    data.rank = index + 1;

    writeFile(fileName, JSON.stringify(data, null, 2));
  });

  console.log('Done.');
};

export const databaseReport = (db) => {
  console.log('Step: Database Report');

  const tables = {
    images: db.row(`SELECT COUNT(*) AS count FROM images`).count,
    profiles: db.row(`SELECT COUNT(*) AS count FROM profiles`).count,
    seasons: db.row(`SELECT COUNT(*) AS count FROM seasons`).count,
    matches: db.row(`SELECT COUNT(*) AS count FROM matches`).count,
    throws: db.row(`SELECT COUNT(*) AS count FROM throws`).count,
  };

  console.table(Object.entries(tables).map(([table, count]) => ({ table, count })));

  console.log('Done.');
};

export const teardown = async (startTime, db, browser) => {
  console.log('Step: Teardown');

  if (browser) {
    await browser.close();
  }

  if (db) {
    db.shrink();
    db.close();
  }

  if (startTime) {
    const duration = Math.round((Date.now() - startTime) / 1000);

    console.log(`Total Runtime: ${duration} seconds`);
  }

  console.log('Done.');
};