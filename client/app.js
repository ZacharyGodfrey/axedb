import frontMatter from 'front-matter';
import Mustache from 'mustache';
import { marked } from 'marked';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import postcss from 'postcss';
import cssnano from 'cssnano';

import { emptyFolder, copyFolder, listFiles, readFile, writeFile } from '../lib/file.js';
import { enums } from '../lib/database.js';
import { buildStats } from '../lib/miscellaneous.js';

const NOW = new Date().toISOString();

Mustache.templateCache = undefined;

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

const prepareHtmlPartial = (text) => {
  return `\n${text.split('\n').filter(x => x.length).join('\n')}\n`;
};

export const renderPage = await (async () => {
  const shell = readFile('client/assets/shell.html');

  const partials = {
    font: readFile('client/assets/FiraCode-Variable.ttf', 'base64'),
    style: await minifyCSS(readFile('client/assets/style.css')),
    siteHeader: prepareHtmlPartial(readFile('client/partials/site-header.html')),
    profileHeader: prepareHtmlPartial(readFile('client/partials/profile-header.html')),
    stats: prepareHtmlPartial(readFile('client/partials/stats.html')),
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

export const buildProfileData = (profileDb, profile) => {
  const career = {
    profile,
    stats: buildStats(profileDb.rows(`
      SELECT tool, target, score
      FROM throws
      ORDER BY matchId ASC, roundId ASC, throwId ASC
    `)),
    seasons: [],
  };

  const seasons = profileDb.rows(`
    SELECT seasonId, name, year
    FROM seasons
    WHERE seasonId IN (
      SELECT DISTINCT seasonId
      FROM matches
      WHERE status = ${enums.matchStatus.processed}
    )
    ORDER BY seasonId ASC
  `);

  for (const sRow of seasons) {
    const season = {
      ...sRow,
      stats: buildStats(profileDb.rows(`
        SELECT t.tool, t.target, t.score
        FROM throws AS t
        JOIN matches AS m ON m.matchId = t.matchId
        WHERE m.seasonId = :seasonId
        ORDER BY t.matchId ASC, t.roundId ASC, t.throwId ASC
      `, { seasonId: sRow.seasonId })),
      matches: []
    };

    const matches = profileDb.rows(`
      SELECT matchId, opponentId
      FROM matches
      WHERE seasonId = :seasonId
      ORDER BY matchId ASC
    `, { seasonId: sRow.seasonId });

    for (const mRow of matches) {
      const match = {
        ...mRow,
        stats: buildStats(profileDb.rows(`
          SELECT tool, target, score
          FROM throws
          WHERE matchId = :matchId
          ORDER BY matchId ASC, roundId ASC, throwId ASC
        `, { matchId: mRow.matchId })),
        throws: []
      };

      season.matches.push(match);
    }

    career.seasons.push(season);
  }

  return career;
};

// Workflow

export const prepareDistFolder = () => {
  console.log('**********');
  console.log('Step: Prepare dist folder');
  console.log('**********');

  emptyFolder('dist');
  copyFolder('client/static', 'dist');
  copyFolder('data/images', 'dist');

  console.log('Done.');
};

export const writeSimplePages = (data) => {
  console.log('**********');
  console.log('Step: Write simple pages');
  console.log('**********');

  for (const filePath of listFiles('client/pages/**/*.{md,html}')) {
    const uri = filePath.split('pages/')[1].replace('.md', '.html');
    const template = readFile(filePath);

    renderAndWritePage(uri, template, data);
  }

  console.log('Done.');
};

const profileTemplate = readFile('client/templates/profile.md');

export const writeProfilePages = (profileDb, profile) => {
  console.log(`Writing profile page for profile ${profile.profileId}...`);

  const uri = `${profile.profileId}.html`;
  const data = buildProfileData(profileDb, profile);

  writeFile(`dist/${profile.profileId}.json`, JSON.stringify(data, null, 2));

  renderAndWritePage(uri, profileTemplate, {
    ...data,
    json: JSON.stringify(data)
  });

  for (const season of data.seasons) {
    writeSeasonPage(data.profile, season);
  }
};

const seasonTemplate = readFile('client/templates/season.md');

export const writeSeasonPage = (profile, season) => {
  console.log(`Writing season page for profile ${profile.profileId} season ${season.seasonId}...`);

  const uri = `${profile.profileId}/s/${season.seasonId}.html`;
  const data = { profile, season };

  renderAndWritePage(uri, seasonTemplate, {
    ...data,
    json: JSON.stringify(data)
  });
};