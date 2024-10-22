import puppeteer from 'puppeteer';

import { database } from '../../lib/database.js';
import {
  seedProfiles,
  discoverMatches,
  processMatches,
  updateRankings,
  getImages,
  databaseReport,
  teardown
} from '../app.js';

const start = Date.now();
const mainDb = database.main();
const browser = await puppeteer.launch();
const page = await browser.newPage();

await seedProfiles(mainDb, page);

await discoverMatches(mainDb, page);

await processMatches(mainDb, page, 100);

await updateRankings(mainDb);

await getImages(mainDb);

databaseReport(mainDb);

await teardown(start, mainDb, browser);