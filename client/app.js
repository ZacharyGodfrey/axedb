import frontMatter from 'front-matter';
import Mustache from 'mustache';
import { marked } from 'marked';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import postcss from 'postcss';
import cssnano from 'cssnano';

import { emptyFolder, copyFolder, listFiles, readFile, writeFile } from '../lib/file.js';

const NOW = new Date().toISOString();

marked.use(gfmHeadingId({ prefix: '' }));

const cssNano = postcss([cssnano]);

export const pipe = (initial, transforms) => {
  return transforms.reduce((result, transform) => transform(result), initial);
};

export const renderMustache = (template, data, partials) => {
  return Mustache.render(template, { _now: NOW, ...data }, partials);
};

export const renderMD = (fileContent) => {
  return marked.parse(fileContent, { gfm: true });
};

export const renderCustomTags = (fileContent) => {
  const tags = {
    '(section': '<section>',
    'section)': '</section>',
    '(card': '<div class="card">',
    'card)': '</div>',
  };

  return Object.entries(tags).reduce((text, [key, value]) => {
    return text.replaceAll(`<p>${key}</p>`, value);
  }, fileContent);
};

export const minifyCSS = async (fileContent) => {
  return await cssNano.process(fileContent, { from: undefined }).then(({ css }) => css);
};

export const parseMetadata = (fileContent) => {
  const { attributes: meta, body: content } = frontMatter(fileContent);

  return { meta, content };
};

export const renderPage = await (async () => {
  const shell = readFile('client/assets/shell.html');

  const partials = {
    favicon: readFile('client/assets/icon.png', 'base64'),
    font: readFile('client/assets/FiraCode-Variable.ttf', 'base64'),
    style: await minifyCSS(readFile('client/assets/style.css')),
    siteHeader: readFile('client/partials/site-header.html'),
    profileHeader: readFile('client/partials/profile-header.html'),
    stats: readFile('client/partials/stats.html'),
  };

  return (template, data) => pipe(template, [
    (text) => renderMustache(text, data, partials),
    (text) => parseMetadata(text),
    ({ meta, content }) => ({ meta, content: renderMD(content) }),
    ({ meta, content }) => ({ meta, content: renderCustomTags(content) }),
    ({ meta, content }) => renderMustache(shell, { meta }, { ...partials, content })
  ]);
})();

export const renderAndWritePage = (uri, template, data) => {
  writeFile(`dist/${uri}`, renderPage(template, data));
};

// Workflow

export const prepareDistFolder = () => {
  emptyFolder('dist');
  copyFolder('client/static', 'dist');
};

export const writeProfileImages = (db) => {
  for (const { profileId } of db.rows(`SELECT profileId FROM images`)) {
    const { image } = db.row(`
      SELECT image
      FROM images
      WHERE profileId = :profileId
    `, { profileId });

    writeFile(`dist/${profileId}.webp`, image, null);
  }
};

export const writeSimplePages = (data) => {
  for (const filePath of listFiles('client/pages/**/*.{md,html}')) {
    const uri = filePath.split('pages/')[1].replace('.md', '.html');
    const template = readFile(filePath);

    renderAndWritePage(uri, template, data);
  }
};

export const writeProfilePages = (profileJsonPath, profileLookup, globalData, shell, partials, templates) => {
  const profile = JSON.parse(readFile(profileJsonPath));
  const { profileId } = profile;
  const uri = `${profileId}/index.html`;

  // renderAndWritePage(uri, shell, partials, { profile }, templates.career);

  for (const { seasonId } of profile.seasons) {
    const season = JSON.parse(readFile(`data/profiles/${profileId}/s/${seasonId}.json`));
    const uri = `${profileId}/s/${seasonId}/index.html`;

    // renderAndWritePage(uri, shell, partials, { profile, season }, templates.season);

    for (const week of season.weeks) {
      const uri = `${profileId}/s/${seasonId}/w/${week.weekId}/index.html`;

      // renderAndWritePage(uri, shell, partials, { profile, season, week }, templates.week);

      for (const match of week.matches) {
        const uri = `${profileId}/m/${match.matchId}/index.html`;

        // renderAndWritePage(uri, shell, partials, { profile, season, week, match }, templates.match);
      }
    }
  }
};