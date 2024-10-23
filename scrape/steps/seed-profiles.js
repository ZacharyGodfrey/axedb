import puppeteer from 'puppeteer';

import { database } from '../../lib/database.js';
import { seedProfiles, databaseReport, teardown } from '../app.js';

const start = Date.now();
const mainDb = database.main();
const browser = await puppeteer.launch();
const page = await browser.newPage();

await seedProfiles(mainDb, page);

databaseReport(mainDb);

await teardown(start, mainDb, browser);