import { database } from '../../lib/database.js';
import { generateJsonFiles, databaseReport, teardown } from '../app.js';

const start = Date.now();
const db = database('data');

generateJsonFiles(db);

databaseReport(db);

await teardown(start, db);