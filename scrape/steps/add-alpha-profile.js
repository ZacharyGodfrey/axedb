import {
  teardown
} from '../app.js';

const start = Date.now();
const profileId = parseInt(process.env.NEW_PROFILE_ID);

console.log(`New Profile ID: ${process.env.NEW_PROFILE_ID} | ${profileId}`);

await teardown(start);