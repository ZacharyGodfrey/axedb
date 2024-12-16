import { database } from '../../lib/database.js';
import { headless } from '../../lib/browser.js';
import { seedProfiles, databaseReport, teardown } from '../app.js';

const start = Date.now();
const mainDb = database.main();
const browser = await headless();
const page = await browser.newPage();

await seedProfiles(mainDb, page);

databaseReport(mainDb);

await teardown(start, mainDb, browser);