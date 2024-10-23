import puppeteer from 'puppeteer';

import { database } from '../../lib/database.js';
import { processMatches, updateRankings, databaseReport, teardown } from '../app.js';

const start = Date.now();
const mainDb = database.main();
const browser = await puppeteer.launch();
const page = await browser.newPage();

await processMatches(mainDb, page, 500);

updateRankings(mainDb);

databaseReport(mainDb);

await teardown(start, mainDb, browser);