import puppeteer from 'puppeteer';

import { database } from '../lib/database.js';
import { getProfileImage, getPlayerData, getMatchData, getStats } from './app.js';

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

// Seed profiles

console.log('Seeding profiles...');

db.insertOrIgnore('profiles', {
  profileId: PROFILE_ID,
  fetch: 1
});

console.log('Done.');

// Fetch profile data

console.log('Fetching profile data...');

const profiles = db.rows(`
  SELECT profileId
  FROM profiles
  WHERE fetch = 1
`);

for (const { profileId } of profiles) {
  console.log(`Profile ${profileId}`);

  const [image, playerData] = await Promise.all([
    getProfileImage(profileId),
    getPlayerData(profileId)
  ]);

  db.run(`
    UPDATE profiles
    SET name = :name, image = :image
    WHERE profileId = :profileId
  `, { profileId, name: playerData.name, image });

  for (const season of playerData.leagues) {
    const { id: seasonId, seasonWeeks, performanceName } = season;

    if (performanceName !== MATCH_TYPE) {
      continue;
    }

    console.log(`Season ${seasonId}`);

    const seasonName = `${season.name} ${season.shortName}`;
    const seasonYear = parseInt(season.date.split('-')[0]);

    db.run(`
      INSERT INTO seasons (seasonId, name, year)
      VALUES (:seasonId, :seasonName, :seasonYear)
      ON CONFLICT (seasonId) DO UPDATE
      SET name = :seasonName, year = :seasonYear
    `, { seasonId, seasonName, seasonYear });

    for (const { week, matches } of seasonWeeks) {
      console.log(`Week ${week}`);

      for (const { id: matchId } of matches) {
        console.log(`Match ${matchId}`);

        db.run(`
          INSERT INTO matches (profileId, seasonId, week, matchId)
          VALUES (:profileId, :seasonId, :week, :matchId)
          ON CONFLICT (profileId, matchId) DO UPDATE
          SET week = :week
        `, { profileId, seasonId, week, matchId });
      }
    }
  }
}

console.log('Done.');

// Fetch throw data

console.log('Fetching throw data...');

const newMatches = db.rows(`SELECT * FROM matches WHERE processed = 0`);

console.log(`Processing ${newMatches.length} new matches...`);

for (const { profileId, matchId } of newMatches) {
  console.log(`Match ${matchId}`);

  const { opponentId, throws } = await getMatchData(page, profileId, matchId);

  console.table(throws);

  throws.forEach((row) => db.insert('throws', row));

  db.run(`
    UPDATE matches
    SET processed = 1, opponentId = :opponentId
    WHERE matchId = :matchId
  `, { profileId, opponentId });
}

console.log('Done.');

// Reset aggregations

console.log('Resetting aggregations...');

db.run('DELETE FROM aggregations');

console.log('Done.');

// Career stats

console.log('Aggregating career stats...');

createAggregation(db, 'Career', 'career', db.rows(`
  SELECT *
  FROM throws
  ORDER BY seasonId, week, matchId, round, throw
`));

console.log('Done.');

// Season stats

console.log('Aggregating season stats...');

const seasonIds = db.rows(`
  SELECT DISTINCT seasonId
  FROM throws
  ORDER BY seasonId ASC
`);

seasonIds.forEach(({ seasonId }, index) => {
  console.log(`Season: ${seasonId}`);

  createAggregation(db, `Season #${index + 1} (${seasonId})`, 'season', db.rows(`
    SELECT *
    FROM throws
    WHERE seasonId = ?
    ORDER BY seasonId, week, matchId, round, throw
  `, [seasonId]));
});

console.log('Done.');

// Tear Down

console.log('Tearing down...');

await browser.close();

db.run('VACUUM');

console.log('Done.');
console.log(`Total Runtime: ${Date.now() - START}ms`);