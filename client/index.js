import { database } from '../lib/database.js';
import { readFile, listFiles } from '../lib/file.js';
import { sort } from '../lib/miscellaneous.js';
import { prepareDistFolder, writeProfileImages, writeSimplePages } from './app.js';

const start = Date.now();
const db = database();

prepareDistFolder();

writeProfileImages(db);

writeSimplePages({
  seasonCount: db.row(`SELECT COUNT(*) AS count FROM seasons`).count,
  matchCount: db.row(`SELECT COUNT(*) AS count FROM (SELECT DISTINCT matchId FROM matches WHERE processed = 1)`).count,
  throwCount: db.row(`SELECT COUNT(*) AS count FROM throws`).count,
  profiles: db.rows(`SELECT * FROM profiles WHERE fetch = 1 ORDER BY rank ASC`)
});

console.log('Done.');
console.log(`Running Time: ${Date.now() - start} milliseconds`);