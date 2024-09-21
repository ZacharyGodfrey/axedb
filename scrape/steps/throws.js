import puppeteer from 'puppeteer';

import { database } from '../../lib/database.js';
import { recordThrowData } from '../app.js';

// Start Up

console.log('Starting up...');

const start = Date.now();
const db = database('data');
const browser = await puppeteer.launch();
const page = await browser.newPage();

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

// Tear Down

console.log('Tearing down...');

await browser.close();

db.shrink();

console.log('Done.');
console.log(`Total Runtime: ${Date.now() - start}ms`);