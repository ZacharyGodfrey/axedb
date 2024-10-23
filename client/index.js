import { database } from '../lib/database.js';
import { readFile } from '../lib/file.js';
import { prepareDistFolder, writeSimplePages } from './app.js';

const start = Date.now();
const mainDb = database.main();
const stats = JSON.parse(readFile('data/stats.json'));

prepareDistFolder();

writeSimplePages({
  stats,
  // seasonCount: mainDb.row(`SELECT COUNT(*) AS count FROM seasons`).count,
  // matchCount: mainDb.row(`SELECT COUNT(*) AS count FROM (SELECT DISTINCT matchId FROM matches WHERE processed = 1)`).count,
  // throwCount: mainDb.row(`SELECT COUNT(*) AS count FROM throws`).count,
  profiles: mainDb.rows(`SELECT * FROM profiles WHERE fetch = 1 ORDER BY rank ASC`)
});

mainDb.close();

console.log('Done.');
console.log(`Running Time: ${Date.now() - start} milliseconds`);