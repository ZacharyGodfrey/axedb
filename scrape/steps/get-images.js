import { database } from '../../lib/database.js';
import { getImages, databaseReport, teardown } from '../app.js';

const start = Date.now();
const db = database('data');

await getImages(db);

databaseReport(db);

await teardown(start, db);