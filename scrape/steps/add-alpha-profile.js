import { readFile, writeFile } from '../../lib/file.js';
import { teardown } from '../app.js';

const ALPHA_PROFILES = JSON.parse(readFile('data/alpha-profiles.json'));

const start = Date.now();
const parsed = parseInt(process.env.NEW_PROFILE_ID);
const profileId = Math.max(0, isNaN(parsed) ? 0 : parsed);

console.log(`New Profile ID: ${process.env.NEW_PROFILE_ID} | ${profileId}`);

if (profileId > 0) {
  const profileIds = [...new Set([...ALPHA_PROFILES, profileId])];
  const json = JSON.stringify(profileIds, null, 2);

  writeFile('data/alpha-profiles.json', json);
}

await teardown(start);