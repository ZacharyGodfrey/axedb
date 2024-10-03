import puppeteer from 'puppeteer';

import { database } from '../../lib/database.js';
import { seedProfiles, recordProfileData } from '../app.js';

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

// Tear Down

console.log('Tearing down...');

await browser.close();

db.shrink();
db.close();

console.log('Done.');
console.log(`Total Runtime: ${Date.now() - start}ms`);