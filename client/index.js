import { database } from '../lib/database.js';
import { readFile, listFiles } from '../lib/file.js';
import { sort } from '../lib/miscellaneous.js';
import {
  minifyCSS,
  renderAndWritePage,
  prepareDistFolder,
  writeProfileImages,
  writeProfilePages,
  writeSimplePages
} from './app.js';

// Read Input

const start = Date.now();
const shell = readFile('client/assets/shell.html');

const partials = {
  favicon: readFile('client/assets/icon.png', 'base64'),
  font: readFile('client/assets/FiraCode-Variable.ttf', 'base64'),
  style: await minifyCSS(readFile('client/assets/style.css')),
  siteHeader: readFile('client/partials/site-header.html'),
  profileHeader: readFile('client/partials/profile-header.html'),
  stats: readFile('client/partials/stats.html'),
};

const templates = listFiles('client/templates/**/*.{md,html}').reduce((result, filePath) => {
  const name = filePath.split('client/templates/')[1].split('.').slice(0, -1).join('-').replaceAll('/', '-');

  result[name] = readFile(filePath);

  return result;
}, {});

const db = database('data');

const globalData = {
  seasonCount: db.row(`SELECT COUNT(*) AS count FROM seasons`).count,
  matchCount: db.row(`SELECT COUNT(*) AS count FROM (SELECT DISTINCT matchId FROM matches WHERE processed = 1)`).count,
  throwCount: db.row(`SELECT COUNT(*) AS count FROM throws`).count,
  profiles: db.rows(`
    SELECT *
    FROM profiles
    WHERE fetch = 1
  `)
};

const profileLookup = globalData.profiles.reduce((result, { profileId }, index) => {
  result[profileId] = index;

  return result;
}, {});

// Write Output

prepareDistFolder();

writeProfileImages(db);

listFiles('data/profiles/*.json').forEach((filePath, i, { length }) => {
  console.log(`Profile ${i + 1} of ${length}`);

  writeProfilePages(filePath, profileLookup, globalData, shell, partials, templates);
});

globalData.profiles.sort(sort.byAscending(x => x.rank));

writeSimplePages(shell, partials, globalData);

console.log('Done.');
console.log(`Running Time: ${Date.now() - start} milliseconds`);