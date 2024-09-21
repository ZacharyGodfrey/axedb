import puppeteer from 'puppeteer';

import { database } from '../../lib/database.js';
import { recordOpponentData } from '../app.js';

// Start Up

console.log('Starting up...');

const start = Date.now();
const db = database('data');
const browser = await puppeteer.launch();
const page = await browser.newPage();

// Record Opponents

console.log('Recording opponent data...');

await recordOpponentData(db, page);

console.log('Done.');

// Tear Down

console.log('Tearing down...');

await browser.close();

db.shrink();

console.log('Done.');
console.log(`Total Runtime: ${Date.now() - start}ms`);