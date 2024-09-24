import { database } from '../lib/database.js';
import { readFile, listFiles, emptyFolder, copyFolder } from '../lib/file.js';
import { minifyCSS, renderAndWritePage } from './app.js';

// Read Input

const start = Date.now();
const shell = readFile('client/assets/shell.html');

const partials = {
  favicon: readFile('client/assets/icon.png', 'base64'),
  font: readFile('client/assets/FiraCode-Variable.ttf', 'base64'),
  style: await minifyCSS(readFile('client/assets/style.css')),
  profileHeader: readFile('client/partials/profile-header.html')
};

const pages = listFiles('client/pages/**/*.md').map(filePath => ({
  uri: filePath.split('pages/')[1].replace('.md', '.html'),
  fileContent: readFile(filePath)
}));

const templates = {
  career: readFile('client/templates/career.md'),
  season: readFile('client/templates/season.md'),
  week: readFile('client/templates/week.md')
};

const db = database('data');

const profiles = db.rows(`
  SELECT p.*, i.image
  FROM profiles p
  JOIN images i ON i.profileId = p.profileId
  WHERE p.fetch = 1
  ORDER BY p.name ASC
`);

// Write Output

emptyFolder('dist');
copyFolder('client/static', 'dist');
copyFolder('data/profiles', 'dist');

for (const { uri, fileContent } of pages) {
  const data = { profiles };

  renderAndWritePage(uri, shell, partials, data, fileContent);
}

for (const filePath of listFiles('data/profiles/*.json')) {
  const profile = JSON.parse(readFile(filePath));
  const { profileId } = profile;
  const uri = `${profileId}/index.html`;

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
    }
  }
}

console.log(`Running Time: ${Date.now() - start}ms`);