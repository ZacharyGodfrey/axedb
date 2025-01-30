import { database } from '../../lib/database.js';
import { headless, userAgent } from '../../lib/browser.js';
import { processMatches, updateRankings, databaseReport, teardown } from '../app.js';

const start = Date.now();
const mainDb = database.main();
const browser = await headless();
const page = await browser.newPage();

await page.setUserAgent(userAgent);

await processMatches(mainDb, page, 1000);

updateRankings(mainDb);

databaseReport(mainDb);

await teardown(start, mainDb, browser);