import puppeteer from 'puppeteer';

import { database } from 'lib/database.js';
import { sequentially } from 'app/utils.js';
import { getMatches, getThrows, getStats } from 'app/core.js';

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

// Aggregate stats

const allThrows = db.rows(`
  SELECT *
  FROM throws
  ORDER BY seasonId, week, matchId, round, throw
`);

const careerStats = getStats(allThrows);

// Tear Down

await browser.close();

db.run('VACUUM');

console.log(`Running Time: ${Date.now() - START}ms`);