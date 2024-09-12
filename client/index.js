import { database } from '../lib/database.js';
import { readFile, listFiles, emptyFolder, copyFolder, writeFile } from '../lib/file.js';
import { renderMD, renderSections, minifyCSS, parseMetadata, renderMustache } from './app.js';

const START = Date.now();
const DB_FILE = 'database.db';

const db = database(DB_FILE);
const shell = readFile('client/assets/shell.html');

const throwData = {
  career: db.row(`SELECT * FROM aggregations WHERE level = 'career'`),
  seasons: db.rows(`SELECT * FROM aggregations WHERE level = 'season'`),
  matches: db.rows(`SELECT * FROM matches`),
  throws: db.rows(`SELECT * FROM throws`),
};

const partials = {
  favicon: readFile('client/assets/icon.png', 'base64'),
  style: await minifyCSS(readFile('client/assets/style.css')),
  json: JSON.stringify(throwData)
};

const pages = listFiles('client/pages/**/*.md').map(filePath => {
  const uri = filePath.split('pages/')[1].replace('.md', '');
  const fileContent = readFile(`./${filePath}`);
  const { meta, content } = parseMetadata(fileContent);

  return { uri, meta, content };
});

emptyFolder('dist');
copyFolder('client/static', 'dist');

writeFile('dist/data.json', JSON.stringify(throwData, null, 4));

pages.forEach(({ uri, meta, content: rawContent }) => {
  const fileName = `dist/${uri}.html`;
  const data = { meta, throwData };
  const content = renderSections(
    renderMD(
      renderMustache(rawContent, data, partials)
    )
  );

  console.log(`Writing File: ${fileName}`);

  writeFile(fileName, renderMustache(shell, data, { ...partials, content }));
});

console.log(`Running Time: ${Date.now() - START}ms`);