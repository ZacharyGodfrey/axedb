import { database } from '../lib/database.js';
import { readFile, listFiles } from '../lib/file.js';
import { sort } from '../lib/miscellaneous.js';
import { prepareDistFolder, writeProfileImages, writeSimplePages } from './app.js';

const start = Date.now();
const db = database('data');

prepareDistFolder();

writeProfileImages(db);

writeSimplePages({
  seasonCount: db.row(`SELECT COUNT(*) AS count FROM seasons`).count,
  matchCount: db.row(`SELECT COUNT(*) AS count FROM (SELECT DISTINCT matchId FROM matches WHERE processed = 1)`).count,
  throwCount: db.row(`SELECT COUNT(*) AS count FROM throws`).count,
  profiles: db.rows(`SELECT * FROM profiles WHERE fetch = 1 LIMIT 1`).map((profile) => {
    console.log(profile);
    const { profileId } = profile;
    const data = JSON.parse(readFile(`data/profiles/${profileId}.json`));

    profile.spa = data.stats.overall.scorePerAxe;
    profile.rank = data.rank;
  }).sort(sort.byAscending(x => x.rank))
});

console.log('Done.');
console.log(`Running Time: ${Date.now() - start} milliseconds`);