import { database } from '../lib/database.js';
import { readFile, listFiles, emptyFolder, copyFolder, writeFile } from '../lib/file.js';
import { renderMD, renderSections, minifyCSS, parseMetadata, renderMustache } from './app.js';

const START = Date.now();

const db = database('data');

const allProfiles = db.main.rows(`SELECT * FROM profiles`);

const shell = readFile('client/assets/shell.html');
const partials = {
  favicon: readFile('client/assets/icon.png', 'base64'),
  style: await minifyCSS(readFile('client/assets/style.css'))
};

const pages = listFiles('client/pages/**/*.md').map(filePath => {
  const uri = filePath.split('pages/')[1].replace('.md', '');
  const fileContent = readFile(`./${filePath}`);
  const { meta, content } = parseMetadata(fileContent);

  return { uri, meta, content };
});

const templates = {
  profile: readFile('client/templates/profile.md')
};

emptyFolder('dist');
copyFolder('client/static', 'dist');
copyFolder('data/profiles', 'dist');

const renderAndWritePage = (uri, shell, partials, data, rawContent) => {
  const fileName = `dist/${uri}.html`;
  const content = renderSections(
    renderMD(
      renderMustache(rawContent, data, partials)
    )
  );

  console.log(`Writing File: ${fileName}`);

  writeFile(fileName, renderMustache(shell, data, { ...partials, content }));
};

for (const { uri, meta, content: rawContent } of pages) {
  const data = { meta, allProfiles };

  renderAndWritePage(uri, shell, partials, data, rawContent);
}

for (const profile of allProfiles) {
  //
}

console.log(`Running Time: ${Date.now() - START}ms`);