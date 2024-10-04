import frontMatter from 'front-matter';
import Mustache from 'mustache';
import { marked } from 'marked';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import postcss from 'postcss';
import cssnano from 'cssnano';

import { emptyFolder, copyFolder, listFiles, readFile, writeFile } from '../lib/file.js';
import { buildStats } from '../scrape/app.js';

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

export const renderPage = await (async () => {
  const shell = readFile('client/assets/shell.html');

  const partials = {
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

export const buildProfileData = (db, profileId) => {
  const profile = db.row(`
    SELECT profileId, name, rank, scorePerAxe
    FROM profiles
    WHERE profileId = :profileId
  `, { profileId });

  return profile; // TODO: Remove this

  const career = {
    ...profile,
    stats: {},
    seasons: [],
  };

  career.stats = buildStats(db.rows(`
    SELECT tool, target, score
    FROM throws
    WHERE profileId = :profileId
    ORDER BY seasonId ASC, weekId ASC, matchId ASC, roundId ASC, throwId ASC
  `, { profileId }));

  const seasons = db.rows(`
    SELECT seasonId, name, year
    FROM seasons
    WHERE seasonId IN (
      SELECT DISTINCT seasonId
      FROM matches
      WHERE profileId = :profileId
    )
    ORDER BY seasonId ASC
  `, { profileId });

  for (const { seasonId, name, year } of seasons) {
    const season = {
      seasonId,
      name,
      year,
      stats: null,
      weeks: []
    };

    season.stats = buildStats(db.rows(`
      SELECT tool, target, score
      FROM throws
      WHERE profileId = :profileId AND seasonId = :seasonId
      ORDER BY weekId ASC, matchId ASC, roundId ASC, throwId ASC
    `, { profileId, seasonId }));

    const weeks = db.rows(`
      SELECT DISTINCT weekId
      FROM matches
      WHERE profileId = :profileId AND seasonId = :seasonId
      ORDER BY weekId ASC
    `, { profileId, seasonId });

    for (const { weekId } of weeks) {
      const week = {
        weekId,
        stats: null,
        matches: []
      };

      week.stats = buildStats(db.rows(`
        SELECT tool, target, score
        FROM throws
        WHERE profileId = :profileId AND seasonId = :seasonId AND weekId = :weekId
        ORDER BY matchId ASC, roundId ASC, throwId ASC
      `, { profileId, seasonId, weekId }));

      const matches = db.rows(`
        SELECT matchId, opponentId
        FROM matches
        WHERE profileId = :profileId AND seasonId = :seasonId AND weekId = :weekId
        ORDER BY matchId ASC
      `, { profileId, seasonId, weekId });

      for (const { matchId, opponentId } of matches) {
        const match = {
          matchId,
          opponent: {
            id: opponentId,
            name: 'Unknown'
          },
          stats: null,
          rounds: []
        };

        const opponent = db.row(`
          SELECT name
          FROM profiles
          WHERE profileId = :opponentId
        `, { opponentId });

        match.opponent.name = opponent ? opponent.name : match.opponent.name;

        match.stats = buildStats(db.rows(`
          SELECT tool, target, score
          FROM throws
          WHERE profileId = :profileId AND matchId = :matchId
          ORDER BY roundId ASC, throwId ASC
        `, { profileId, matchId }));

        const rounds = db.rows(`
          SELECT DISTINCT roundId
          FROM throws
          WHERE profileId = :profileId AND matchId = :matchId
          ORDER BY roundId ASC
        `, { profileId, matchId });

        for (const { roundId } of rounds) {
          const round = {
            roundId,
            stats: null,
            throws: []
          };

          round.throws = db.rows(`
            SELECT throwId, tool, target, score
            FROM throws
            WHERE profileId = :profileId AND matchId = :matchId AND roundId = :roundId
            ORDER BY throwId ASC
          `, { profileId, matchId, roundId });

          round.stats = buildStats(round.throws);

          match.rounds.push(round);
        }

        week.matches.push(match);
      }

      season.weeks.push(week);
    }

    career.seasons.push(season);
  }

  return career;
};

// Workflow

export const prepareDistFolder = () => {
  console.log('Preparing dist folder...');

  emptyFolder('dist');
  copyFolder('client/static', 'dist');

  console.log('Done.');
};

export const writeProfileImages = (db) => {
  console.log('Writing profile images...');

  for (const { profileId } of db.rows(`SELECT profileId FROM images`)) {
    const { image } = db.row(`
      SELECT image
      FROM images
      WHERE profileId = :profileId
    `, { profileId });

    writeFile(`dist/${profileId}.webp`, image, null);
  }

  console.log('Done.');
};

export const writeSimplePages = (data) => {
  console.log('Writing simple pages...');

  for (const filePath of listFiles('client/pages/**/*.{md,html}')) {
    const uri = filePath.split('pages/')[1].replace('.md', '.html');
    const template = readFile(filePath);

    renderAndWritePage(uri, template, data);
  }

  console.log('Done.');
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