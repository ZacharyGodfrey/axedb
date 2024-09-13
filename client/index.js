import { database } from '../lib/database.js';
import { readFile, listFiles, emptyFolder, copyFolder, writeFile } from '../lib/file.js';
import { renderMD, renderSections, minifyCSS, parseMetadata, renderMustache } from './app.js';

const START = Date.now();

const db = database('data');

const allProfiles = db.main.rows(`
  SELECT *
  FROM profiles
  ORDER BY name ASC
`);

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

emptyFolder('dist');
copyFolder('client/static', 'dist');
copyFolder('data/profiles', 'dist');

const pipe = (initial, transforms) => transforms.reduce((result, transform) => transform(result), initial);

const renderAndWritePage = (uri, shell, partials, pageData, fileContent) => {
  const fileName = `dist/${uri}.html`;
  const output = pipe(fileContent, [
    (text) => renderMustache(text, pageData, partials),
    (text) => parseMetadata(text),
    ({ meta, content }) => ({ meta, content: renderMD(content) }),
    ({ meta, content }) => ({ meta, content: renderSections(content) }),
    ({ meta, content }) => renderMustache(shell, { meta, pageData }, { ...partials, content })
  ]);

  console.log(`Writing File: ${fileName}`);

  writeFile(fileName, output);
};

for (const { uri, fileContent } of pages) {
  const data = { allProfiles };

  renderAndWritePage(uri, shell, partials, data, fileContent);
}

for (const profile of allProfiles) {
  renderAndWritePage(`${profile.profileId}/index`, shell, partials, profile, templates.profile);
}

console.log(`Running Time: ${Date.now() - START}ms`);