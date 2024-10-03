import puppeteer from 'puppeteer';

import { database } from '../../lib/database.js';
import { processProfiles, databaseReport, teardown } from '../app.js';

const start = Date.now();
const db = database('data');
const browser = await puppeteer.launch();
const page = await browser.newPage();

await processProfiles(db, page);

databaseReport(db);

await teardown(start, db, browser);