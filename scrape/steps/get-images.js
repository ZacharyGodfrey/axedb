import { database } from '../../lib/database.js';
import { getImages, databaseReport, teardown } from '../app.js';

const start = Date.now();
const mainDb = database.main();

await getImages(mainDb);

databaseReport(mainDb);

await teardown(start, mainDb);