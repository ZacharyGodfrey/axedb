import puppeteer from 'puppeteer';

import { database } from '../lib/database.js';
import { sequentially, getMatches, getThrows, getStats } from './app.js';

const createAggregation = (db, name, level, throws) => {
  const { hatchet, bigAxe } = getStats(throws);
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

  const table = 'aggregations';
  const create = { name, level, ...stats };
  const conflict = { name, level };
  const update = stats;

  db.upsert(table, create, conflict, update);
};

// Start Up

console.log('Starting up...');

const START = Date.now();
const DB_FILE = 'database.db';
const PROFILE_ID = 1207260;
const MATCH_TYPE = 'IATF Premier';

const db = database(DB_FILE);
const browser = await puppeteer.launch();
const page = await browser.newPage();

// Discover matches

console.log('Discovering matches...');

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

// Fetch throw data

console.log('Fetching throw data...');

const newMatches = db.rows(`SELECT * FROM matches WHERE processed = 0 LIMIT 1`);

await sequentially(newMatches, async ({ seasonId, week, matchId }) => {
  const throws = await getThrows(page, PROFILE_ID, seasonId, week, matchId);

  console.log(`Throws: ${matchId}`, JSON.stringify(throws.map(x => Object.values(x).join(' | ')), null, 2));

  throws.forEach((row) => {
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

  db.run(`UPDATE matches SET processed = 1 WHERE matchId = ?`, [matchId]);
});

// Career stats

console.log('Aggregating career stats...');

createAggregation(db, 'Career', 'career', db.rows(`
  SELECT *
  FROM throws
  ORDER BY seasonId, week, matchId, round, throw
`));

// Season stats

console.log('Aggregating season stats...');

const seasonIds = db.rows(`
  SELECT DISTINCT seasonId
  FROM throws
  ORDER BY seasonId ASC
`);

seasonIds.forEach(({ seasonId }, index) => {
  console.log(`Season ${seasonId}`);

  createAggregation(db, `Season #${index} (${seasonId})`, 'season', db.rows(`
    SELECT *
    FROM throws
    WHERE seasonId = ?
    ORDER BY seasonId, week, matchId, round, throw
  `, [seasonId]));
});

// Tear Down

console.log('Tearing down...');

console.log(JSON.stringify(db.rows(`
  SELECT * FROM throws
  GROUP BY matchId
`), null, 2));

await browser.close();

db.run('VACUUM');

console.log(`Running Time: ${Date.now() - START}ms`);