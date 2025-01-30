import { database } from '../../lib/database.js';
import { headless, userAgent } from '../../lib/browser.js';
import { resetInvalidMatches, processMatches, updateRankings, databaseReport, teardown } from '../app.js';

const start = Date.now();
const mainDb = database.main();
const browser = await headless();
const page = await browser.newPage();

await page.setUserAgent(userAgent);

resetInvalidMatches(mainDb);

await processMatches(mainDb, page, 500);

updateRankings(mainDb);

databaseReport(mainDb);

await teardown(start, mainDb, browser);