import { database } from '../lib/database.js';
import { readFile } from '../lib/file.js';
import { formatNumber } from '../lib/miscellaneous.js'
import { prepareDistFolder, writeSimplePages, writeComparePage, writeProfilePages } from './app.js';

const start = Date.now();
const mainDb = database.main();
const stats = JSON.parse(readFile('data/stats.json'));
const profiles = mainDb.rows(`
  SELECT *
  FROM profiles
  WHERE fetch = 1
  ORDER BY rank ASC
`);

prepareDistFolder();

stats.formatted = {
  throws: formatNumber(stats.throws),
  profiles: formatNumber(profiles.length),
};

writeSimplePages({ stats, profiles });

writeComparePage(profiles);

for (const profile of profiles) {
  const profileDb = database.profile(profile.profileId);

  writeProfilePages(mainDb, profileDb, profile);

  profileDb.close();
}

mainDb.close();

console.log(`Running Time: ${Date.now() - start} milliseconds`);