import { database } from '../lib/database.js';

import {
  readFile,
  listFiles,
  emptyFolder,
  copyFolder,
  writeFile
} from '../lib/file.js';

import {
  pipe,
  renderMD,
  renderSections,
  minifyCSS,
  parseMetadata,
  renderMustache,
  renderAndWritePage
} from './app.js';

const START = Date.now();

// Read Input

const shell = readFile('client/assets/shell.html');

const partials = {
  favicon: readFile('client/assets/icon.png', 'base64'),
  style: await minifyCSS(readFile('client/assets/style.css'))
};

const pages = listFiles('client/pages/**/*.md').map(filePath => ({
  uri: filePath.split('pages/')[1].replace('.md', ''),
  fileContent: readFile(filePath)
}));

const templates = {
  profile: readFile('client/templates/profile.md')
};

const db = database('data');

const allProfiles = db.main.rows(`SELECT * FROM profiles ORDER BY name ASC`);

// Write Output

emptyFolder('dist');
copyFolder('client/static', 'dist');
copyFolder('data/profiles', 'dist');

for (const { uri, fileContent } of pages) {
  const data = { allProfiles };

  renderAndWritePage(uri, shell, partials, data, fileContent);
}

for (const filePath of listFiles('data/profiles/*.json')) {
  const profile = JSON.parse(readFile(filePath));

  renderAndWritePage(`${profile.profileId}/index`, shell, partials, profile, templates.profile);
}

console.log(`Running Time: ${Date.now() - START}ms`);