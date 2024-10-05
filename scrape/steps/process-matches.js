import puppeteer from 'puppeteer';

import { database } from '../../lib/database.js';
import { processMatches, updateRankings, databaseReport, teardown } from '../app.js';

const start = Date.now();
const db = database('data');
const browser = await puppeteer.launch();
const page = await browser.newPage();

await processMatches(db, page, 1000);

updateRankings(db);

databaseReport(db);

await teardown(start, db, browser);