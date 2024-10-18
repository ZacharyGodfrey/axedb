import puppeteer from 'puppeteer';

import { database } from '../../lib/database.js';
import {
  seedProfiles,
  processProfiles,
  processMatches,
  updateRankings,
  processOpponents,
  getImages,
  databaseReport,
  teardown
} from '../app.js';

const start = Date.now();
const db = database();
const browser = await puppeteer.launch();
const page = await browser.newPage();

await seedProfiles(db, page);

await processProfiles(db, page);

await processMatches(db, page);

await updateRankings(db);

await processOpponents(db, page);

await getImages(db);

databaseReport(db);

await teardown(start, db, browser);