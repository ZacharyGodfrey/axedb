import { database } from '../lib/database.js';
import { readFile, listFiles, emptyFolder, copyFolder, writeFile } from '../lib/file.js';
import { sort } from '../lib/miscellaneous.js';
import { minifyCSS, renderAndWritePage } from './app.js';

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

emptyFolder('dist');
copyFolder('client/static', 'dist');
copyFolder('data/profiles', 'dist');

for (const { profileId } of db.rows(`SELECT profileId FROM images LIMIT 1`)) {
  const { image } = db.row(`
    SELECT image
    FROM images
    WHERE profileId = :profileId
  `, { profileId });

  console.log('##### IMAGE Start #####');
  console.log(image);
  console.log('##### IMAGE End   #####');

  writeFile(`dist/${profileId}.webp`, image, null);
}

for (const filePath of listFiles('data/profiles/*.json')) {
  const profile = JSON.parse(readFile(filePath));
  const { profileId } = profile;
  const uri = `${profileId}/index.html`;
  const index = profileLookup[profileId];

  if (index >= 0) {
    globalData.profiles[index].stats = profile.stats;
    globalData.profiles[index].rank = profile.rank;
  }

  renderAndWritePage(uri, shell, partials, { profile }, templates.career);

  for (const { seasonId } of profile.seasons) {
    const season = JSON.parse(readFile(`data/profiles/${profileId}/s/${seasonId}.json`));
    const data = { profile, season };
    const uri = `${profileId}/s/${seasonId}/index.html`;

    renderAndWritePage(uri, shell, partials, data, templates.season);

    for (const week of season.weeks) {
      const data = { profile, season, week };
      const uri = `${profileId}/s/${seasonId}/w/${week.weekId}/index.html`;

      renderAndWritePage(uri, shell, partials, data, templates.week);

      for (const match of week.matches) {
        const data = { profile, season, week, match };
        const uri = `${profileId}/m/${match.matchId}/index.html`;

        renderAndWritePage(uri, shell, partials, data, templates.match);
      }
    }
  }
}

globalData.profiles.sort(sort.byAscending(x => x.rank));

for (const filePath of listFiles('client/pages/**/*.{md,html}')) {
  const uri = filePath.split('pages/')[1].replace('.md', '.html');

  renderAndWritePage(uri, shell, partials, globalData, readFile(filePath));
}

console.log('Done.');
console.log(`Running Time: ${Date.now() - start}ms`);