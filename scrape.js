import puppeteer from 'puppeteer';

import { database } from 'lib/database.js';
import { sequentially, repeat } from 'app/utils.js';
import { getMatches, getThrows, getStats } from 'app/core.js';

const createAggregation = (db, name, level, throws) => {
  const stats = getStats(throws);

  db.run(`
    INSERT INTO aggregations (
      name,
      level,
      hatchetBullseyeHitPercent,
      hatchetBullseyeScorePerAxe,
      hatchetClutchHitPercent,
      hatchetClutchScorePerAxe,
      hatchetClutchFiveHitPercent,
      hatchetClutchSevenHitPercent,
      bigAxeBullseyeHitPercent,
      bigAxeBullseyeScorePerAxe,
      bigAxeClutchHitPercent,
      bigAxeClutchScorePerAxe,
      bigAxeClutchFiveHitPercent,
      bigAxeClutchSevenHitPercent
    ) VALUES (${repeat('?', 14).join(', ')})
  `, [
    name,
    level,
    stats.hatchet.bullseye.hitPercent,
    stats.hatchet.bullseye.scorePerAxe,
    stats.hatchet.clutch.hitPercent,
    stats.hatchet.clutch.scorePerAxe,
    stats.hatchet.clutch.fiveHitPercent,
    stats.hatchet.clutch.sevenHitPercent,
    stats.bigAxe.bullseye.hitPercent,
    stats.bigAxe.bullseye.scorePerAxe,
    stats.bigAxe.clutch.hitPercent,
    stats.bigAxe.clutch.scorePerAxe,
    stats.bigAxe.clutch.fiveHitPercent,
    stats.bigAxe.clutch.sevenHitPercent,
  ]);
}

// Start Up

const START = Date.now();
const DB_FILE = 'database.db';
const PROFILE_ID = '1207260';
const MATCH_TYPE = 'IATF Premier';

const db = database(DB_FILE);
const browser = await puppeteer.launch();
const page = await browser.newPage();

// Discover new matches

const allMatches = await getMatches(page, PROFILE_ID, MATCH_TYPE);

allMatches.forEach(({ seasonId, week, matchId }) => {
  console.log(`Match: ${matchId}`);

  db.run(`
    INSERT OR IGNORE INTO matches (seasonId, week, matchId)
    VALUES (?, ?, ?)
  `, [
    seasonId,
    week,
    matchId
  ]);
});

// Record flat throw data

const newMatches = db.rows(`SELECT * FROM matches WHERE processed = 0`);

await sequentially(newMatches, async ({ seasonId, week, matchId }) => {
  const throws = await getThrows(page, PROFILE_ID, seasonId, week, matchId);

  throws.forEach((row) => {
    console.log(`Throw: ${row.matchId} ${row.round} ${row.throw} (${row.type}) ${row.score}`);

    db.run(`
      INSERT INTO throws (seasonId, week, opponentId, matchId, round, throw, tool, target, score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      row.seasonId,
      row.week,
      row.opponentId,
      row.matchId,
      row.round,
      row.throw,
      row.tool,
      row.target,
      row.score
    ]);
  });
});

// Career stats

createAggregation(db, 'Career', 'career', db.rows(`
  SELECT *
  FROM throws
  ORDER BY seasonId, week, matchId, round, throw
`));

// Season stats

const seasonIds = db.rows(`
  SELECT DISTINCT seasonId
  FROM throws
  ORDER BY seasonId ASC
`);

seasonIds.forEach(({ seasonId }) => {
  createAggregation(db, `Season ${seasonId}`, 'season', db.rows(`
    SELECT *
    FROM throws
    WHERE seasonId = ?
    ORDER BY seasonId, week, matchId, round, throw
  `, [seasonId]));
});

// Tear Down

await browser.close();

db.run('VACUUM');

console.log(`Running Time: ${Date.now() - START}ms`);