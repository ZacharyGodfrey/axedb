import puppeteer from 'puppeteer';

import { database } from '../../lib/database.js';
import { processOpponents, databaseReport, teardown } from '../app.js';

const start = Date.now();
const db = database();
const browser = await puppeteer.launch();
const page = await browser.newPage();

await processOpponents(db, page);

databaseReport(db);

await teardown(start, db, browser);