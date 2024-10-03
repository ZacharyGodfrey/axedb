import puppeteer from 'puppeteer';

import { database } from '../../lib/database.js';
import {
  seedProfiles,
  recordProfileData,
  recordThrowData,
  recordOpponentData,
  recordImageData
} from '../app.js';

// Start Up

console.log('Starting up...');

const start = Date.now();
const db = database('data');
const browser = await puppeteer.launch();
const page = await browser.newPage();

const ruleset = 'IATF Premier';

// Seed profiles

console.log('Seeding profiles...');

await seedProfiles(db, page, ruleset, 'Southeast');

console.log('Done.');

// Record profile data

console.log('Recording profile data...');

const profiles = db.rows(`
  SELECT profileId FROM profiles
  WHERE fetch = 1
`);

console.log(`Processing ${profiles.length} profiles...`);

await recordProfileData(db, page, profiles, ruleset);

console.log('Done.');

// Record throw data

console.log('Recording throw data...');

const newMatches = db.rows(`
  SELECT profileId, seasonId, weekId, matchId
  FROM matches
  WHERE processed = 0
`);

console.log(`Processing ${newMatches.length} new matches...`);

await recordThrowData(db, page, newMatches);

console.log('Done.');

// Record Opponents

console.log('Recording opponent data...');

await recordOpponentData(db, page);

console.log('Done.');

// Record Images

console.log('Recording image data...');

await recordImageData(db);

console.log('Done.');

// Database Report

console.log('Database Report:');

console.log(JSON.stringify({
    images: db.row(`SELECT COUNT(*) AS count FROM images`).count,
    profiles: db.row(`SELECT COUNT(*) AS count FROM profiles`).count,
    seasons: db.row(`SELECT COUNT(*) AS count FROM seasons`).count,
    matches: db.row(`SELECT COUNT(*) AS count FROM matches`).count,
    throws: db.row(`SELECT COUNT(*) AS count FROM throws`).count,
}, null, 2));

console.log('Done.');

// Tear Down

console.log('Tearing down...');

await browser.close();

db.shrink();
db.close();

console.log('Done.');
console.log(`Total Runtime: ${Date.now() - start}ms`);