import { writeFile } from '../lib/file.js'

// Helpers

const enums = {
  tool: {
    hatchet: 'hatchet',
    bigAxe: 'big axe'
  },
  target: {
    bullseye: 'bullseye',
    clutch: 'clutch'
  }
};

const reactPageState = (page, selector) => {
  return page.$eval(selector, (element) => {
    return element._reactRootContainer._internalRoot.current.memoizedState.element.props.store.getState();
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

// Retrieve Data

const fetchProfileImage = async (profileId) => {
  const url = `https://admin.axescores.com/pic/${profileId}`;
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');

  return base64;
};

const fetchPlayerData = async (page, profileId) => {
  await page.goto(`https://axescores.com/player/${profileId}`);
  await waitMilliseconds(2000);

  const state = await reactPageState(page, '#root');

  return state.player.playerData;
};

const fetchThrowData = async (page, profileId, matchId) => {
  const throws = [];
  const url = `https://axescores.com/player/${profileId}/${matchId}`;
  const apiUrl = `https://api.axescores.com/match/${matchId}`;

  const [apiResponse] = await Promise.all([
    page.waitForResponse(isDesiredResponse('GET', 200, apiUrl), { timeout: 2000 }),
    page.goto(url)
  ]);

  const rawMatch = await apiResponse.json();

  const isInvalidRoundCount = rawMatch.rounds.length > 4;
  const isForfeit = rawMatch.players.find(x => x.id === profileId)?.forfeit === true;

  if (isInvalidRoundCount || isForfeit) {
    return throws;
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
        tool: isBigAxe ? enums.tool.bigAxe : enums.tool.hatchet,
        target: isClutch ? enums.target.clutch : enums.target.bullseye,
        score
      });
    }
  }

  return throws;
};

// Process Data

const buildStatGroups = (throws) => {
  const groups = {};

  for (const { profileId, seasonId, weekId, matchId, roundId, tool, target, score } of throws) {
    const profilePath = `p${profileId}`;
    const seasonPath =  `p${profileId}s${seasonId}`;
    const weekPath =    `p${profileId}s${seasonId}w${weekId}`;
    const matchPath =   `p${profileId}m${matchId}`;
    const roundPath =   `p${profileId}m${matchId}r${roundId}`;
    const data = { tool, target, score };

    for (const entityPath of [profilePath, seasonPath, weekPath, matchPath, roundPath]) {
      const { throws } = groups[entityPath] = groups[entityPath] ?? { entityPath, throws: [] };

      throws.push(data);
    }
  }

  return Object.values(groups);
};

const buildStats = (throws) => {
  const result = {
    hatchet: {
      bullseye: {
        attempts: 0,
        totalScore: 0,
        scorePerAxe: 0,
        hits: 0,
        hitPercent: 0,
      },
      clutch: {
        attempts: 0,
        totalScore: 0,
        scorePerAxe: 0,
        hits: 0,
        hitPercent: 0,
        fives: 0,
        fiveHitPercent: 0,
        sevens: 0,
        sevenHitPercent: 0,
      }
    },
    bigAxe: {
      bullseye: {
        attempts: 0,
        totalScore: 0,
        scorePerAxe: 0,
        hits: 0,
        hitPercent: 0,
      },
      clutch: {
        attempts: 0,
        totalScore: 0,
        scorePerAxe: 0,
        hits: 0,
        hitPercent: 0,
        fives: 0,
        fiveHitPercent: 0,
        sevens: 0,
        sevenHitPercent: 0,
      }
    }
  };

  throws.forEach(({ tool, target, score }) => {
    if (tool === enums.tool.hatchet) {
      if (target === enums.target.bullseye) {
        result.hatchet.bullseye.attempts += 1;
        result.hatchet.bullseye.totalScore += score;
        result.hatchet.bullseye.hits += score === 5 ? 1 : 0;
      } else if (target === enums.target.clutch) {
        result.hatchet.clutch.attempts += 1;
        result.hatchet.clutch.totalScore += score;
        result.hatchet.clutch.hits += score > 0 ? 1 : 0;
        result.hatchet.clutch.fives += score === 5 ? 1 : 0;
        result.hatchet.clutch.sevens += score === 7 ? 1 : 0;
      }
    } else if (tool === enums.tool.bigAxe) {
      if (target === enums.target.bullseye) {
        result.bigAxe.bullseye.attempts += 1;
        result.bigAxe.bullseye.totalScore += score;
        result.bigAxe.bullseye.hits += score === 5 ? 1 : 0;
      } else if (target === enums.target.clutch) {
        result.bigAxe.clutch.attempts += 1;
        result.bigAxe.clutch.totalScore += score;
        result.bigAxe.clutch.hits += score > 0 ? 1 : 0;
        result.bigAxe.clutch.fives += score === 5 ? 1 : 0;
        result.bigAxe.clutch.sevens += score === 7 ? 1 : 0;
      }
    }
  });

  result.hatchet.bullseye.scorePerAxe = round(3, result.hatchet.bullseye.totalScore / Math.max(1, result.hatchet.bullseye.attempts));
  result.hatchet.bullseye.hitPercent = 100 * round(5, result.hatchet.bullseye.hits / Math.max(1, result.hatchet.bullseye.attempts));

  result.hatchet.clutch.scorePerAxe = round(3, result.hatchet.clutch.totalScore / Math.max(1, result.hatchet.clutch.attempts));
  result.hatchet.clutch.hitPercent = 100 * round(5, result.hatchet.clutch.hits / Math.max(1, result.hatchet.clutch.attempts));
  result.hatchet.clutch.fiveHitPercent = 100 * round(5, result.hatchet.clutch.fives / Math.max(1, result.hatchet.clutch.attempts));
  result.hatchet.clutch.sevenHitPercent = 100 * round(5, result.hatchet.clutch.sevens / Math.max(1, result.hatchet.clutch.attempts));

  result.bigAxe.bullseye.scorePerAxe = round(3, result.bigAxe.bullseye.totalScore / Math.max(1, result.bigAxe.bullseye.attempts));
  result.bigAxe.bullseye.hitPercent = 100 * round(5, result.bigAxe.bullseye.hits / Math.max(1, result.bigAxe.bullseye.attempts));

  result.bigAxe.clutch.scorePerAxe = round(3, result.bigAxe.clutch.totalScore / Math.max(1, result.bigAxe.clutch.attempts));
  result.bigAxe.clutch.hitPercent = 100 * round(5, result.bigAxe.clutch.hits / Math.max(1, result.bigAxe.clutch.attempts));
  result.bigAxe.clutch.fiveHitPercent = 100 * round(5, result.bigAxe.clutch.fives / Math.max(1, result.bigAxe.clutch.attempts));
  result.bigAxe.clutch.sevenHitPercent = 100 * round(5, result.bigAxe.clutch.sevens / Math.max(1, result.bigAxe.clutch.attempts));

  return result;
};

// Write Data

const writeStats = (db, entityPath, throws) => {
  const { hatchet, bigAxe } = buildStats(throws);
  const stats = {
    hatchetBullseyeHitPercent: hatchet.bullseye.hitPercent,
    hatchetBullseyeScorePerAxe: hatchet.bullseye.scorePerAxe,
    hatchetClutchHitPercent: hatchet.clutch.hitPercent,
    hatchetClutchScorePerAxe: hatchet.clutch.scorePerAxe,
    hatchetClutchFiveHitPercent: hatchet.clutch.fiveHitPercent,
    hatchetClutchSevenHitPercent: hatchet.clutch.sevenHitPercent,
    bigAxeBullseyeHitPercent: bigAxe.bullseye.hitPercent,
    bigAxeBullseyeScorePerAxe: bigAxe.bullseye.scorePerAxe,
    bigAxeClutchHitPercent: bigAxe.clutch.hitPercent,
    bigAxeClutchScorePerAxe: bigAxe.clutch.scorePerAxe,
    bigAxeClutchFiveHitPercent: bigAxe.clutch.fiveHitPercent,
    bigAxeClutchSevenHitPercent: bigAxe.clutch.sevenHitPercent,
  };

  const create = { entityPath, ...stats };
  const conflict = { entityPath };
  const update = stats;

  db.stats.insertOrUpdate('stats', create, conflict, update);
};

export const writeSeedProfiles = (db, profileIds) => {
  for (const profileId of profileIds) {
    db.main.run(`
      INSERT INTO profiles (profileId, fetch)
      VALUES (:profileId, 1)
    `, { profileId });
  }
};

// Workflow Steps

export const mainDataStep = async (db, page, profiles, ruleset) => {
  for (const { profileId } of profiles) {
    console.log(`Profile ${profileId}`);

    const [image, { name, leagues }] = await Promise.all([
      fetchProfileImage(profileId),
      fetchPlayerData(page, profileId)
    ]);

    db.main.run(`
      UPDATE profiles
      SET name = :name, image = :image
      WHERE profileId = :profileId
    `, { profileId, name, image });

    for (const { id: seasonId, seasonWeeks, performanceName, ...season } of leagues) {
      if (performanceName !== ruleset) {
        continue;
      }

      console.log(`Season ${seasonId}`);

      const name = `${season.name} ${season.shortName}`;
      const year = parseInt(season.date.split('-')[0]);

      db.main.run(`
        INSERT INTO seasons (seasonId, name, year)
        VALUES (:seasonId, :name, :year)
        ON CONFLICT (seasonId) DO UPDATE
        SET name = :name, year = :year
      `, { seasonId, name, year });

      for (const { week: weekId, matches } of seasonWeeks) {
        console.log(`Week ${weekId}`);

        for (const { id: matchId } of matches) {
          console.log(`Match ${matchId}`);

          db.main.run(`
            INSERT INTO matches (profileId, seasonId, weekId, matchId)
            VALUES (:profileId, :seasonId, :weekId, :matchId)
            ON CONFLICT (profileId, matchId) DO UPDATE
            SET weekId = :weekId
          `, { profileId, seasonId, weekId, matchId });
        }
      }
    }
  }
};

export const throwDataStep = async (db, page, newMatches) => {
  for (const { profileId, seasonId, weekId, matchId } of newMatches) {
    console.log(`Match ${matchId}`);

    const throws = await fetchThrowData(page, profileId, matchId);
    const { opponentId = 0 } = throws[0];

    console.table(throws);

    for (const row of throws) {
      db.throws.insert('throws', { ...row, seasonId, weekId });
    }

    db.main.run(`
      UPDATE matches
      SET processed = 1, opponentId = :opponentId
      WHERE profileId = :profileId AND matchId = :matchId
    `, { profileId, opponentId, matchId });
  }
};

export const opponentsStep = async (db, page) => {
  const opponents = db.main.rows(`
    SELECT DISTINCT opponentId FROM matches
    WHERE profileId NOT IN (
      SELECT profileId FROM profiles
      WHERE fetch = 1
    )
  `);

  for (const { profileId } of opponents) {
    const [image, { name }] = await Promise.all([
      fetchProfileImage(profileId),
      fetchPlayerData(page, profileId)
    ]);

    const create = { profileId, name, image };
    const conflict = { profileId };
    const update = { name, image };

    db.main.insertOrUpdate('profiles', create, conflict, update);
  }
};

export const statsStep = (db, profiles) => {
  for (const { profileId } of profiles) {
    console.log(`Profile ${profileId}`);

    const allThrows = db.throws.rows(`
      SELECT * FROM throws
      WHERE profileId = :profileId
    `, { profileId });

    console.log(`Found ${allThrows.length} throws...`);

    const groups = buildStatGroups(allThrows);

    for (const { entityPath, throws } of groups) {
      console.log(`Stats ${entityPath}`);

      writeStats(db, entityPath, throws);
    }
  }
};

export const jsonStep = (db) => {
  const profiles = db.main.rows(`
    SELECT profileId, name FROM profiles
    WHERE fetch = 1
  `);

  for (const profile of profiles) {
    const fileName = `data/profiles/${profile.profileId}.json`;

    const careerStats = db.stats.row(`
      SELECT *
      FROM stats
      WHERE entityPath = ?
    `, [`p${profile.profileId}`]);

    const seasons = db.main.rows(`
      SELECT *
      FROM seasons
      WHERE seasonId IN (
        SELECT DISTINCT seasonId
        FROM matches
        WHERE profileId = :profileId
      )
      ORDER BY seasonId DESC
    `, profile);

    const data = {
      profile: {
        ...profile,
        stats: careerStats
      },
      seasons
    };

    writeFile(fileName, JSON.stringify(data, null, 4));
  }
};