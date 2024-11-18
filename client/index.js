import { database } from '../lib/database.js';
import { readFile } from '../lib/file.js';
import { prepareDistFolder, writeSimplePages, writeProfilePage } from './app.js';

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

writeSimplePages({ stats, profiles });

for (const profile of profiles) {
  const profileDb = database.profile(profile.profileId);

  writeProfilePage(profileDb, profile);

  profileDb.close();
}

mainDb.close();

console.log(`Running Time: ${Date.now() - start} milliseconds`);