import puppeteer from 'puppeteer';

import { database } from '../lib/database.js';
import {
  writeSeedProfiles,
  mainDataStep,
  throwDataStep,
  opponentsStep,
  statsStep,
  jsonStep
} from './app.js';

// Start Up

console.log('Starting up...');

const START = Date.now();
const DATA_DIR = 'data';
const PROFILE_ID = 1207260;
const RULESET = 'IATF Premier';

const db = database(DATA_DIR);
const browser = await puppeteer.launch();
const page = await browser.newPage();

// Seed profiles

console.log('Seeding profiles...');

writeSeedProfiles(db, [PROFILE_ID]);

console.log('Done.');

// Fetch main data

console.log('Fetching main data...');

const profiles = db.main.rows(`
  SELECT profileId FROM profiles
  WHERE fetch = 1
`);

console.log(`Processing ${profiles.length} profiles...`);

await mainDataStep(db, page, profiles, RULESET);

console.log('Done.');

// Fetch throw data

console.log('Fetching throw data...');

const newMatches = db.main.rows(`
  SELECT profileId, seasonId, weekId, matchId
  FROM matches
  WHERE processed = 0
`);

console.log(`Processing ${newMatches.length} new matches...`);

await throwDataStep(db, page, newMatches);

console.log('Done.');

// Fetch Opponents

console.log('Fetching opponent data...');

await opponentsStep(db, page);

console.log('Done.');

// Build stats

console.log('Building stats...');

statsStep(db, profiles);

console.log('Done.');

// Write JSON

console.log('Writing JSON files...');

jsonStep(db);

console.log('Done.');

// Tear Down

console.log('Tearing down...');

await browser.close();

db.shrink();

console.log('Done.');
console.log(`Total Runtime: ${Date.now() - START}ms`);