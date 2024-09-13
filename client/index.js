import { database } from '../lib/database.js';
import { readFile, listFiles, emptyFolder, copyFolder, writeFile } from '../lib/file.js';
import { renderMD, renderSections, minifyCSS, parseMetadata, renderMustache } from './app.js';

const START = Date.now();

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

emptyFolder('dist');
copyFolder('client/static', 'dist');
copyFolder('data/profiles', 'dist');

pages.forEach(({ uri, meta, content: rawContent }) => {
  const fileName = `dist/${uri}.html`;
  const data = { meta };
  const content = renderSections(
    renderMD(
      renderMustache(rawContent, data, partials)
    )
  );

  console.log(`Writing File: ${fileName}`);

  writeFile(fileName, renderMustache(shell, data, { ...partials, content }));
});

console.log(`Running Time: ${Date.now() - START}ms`);