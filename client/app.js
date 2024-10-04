import frontMatter from 'front-matter';
import Mustache from 'mustache';
import { marked } from 'marked';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import postcss from 'postcss';
import cssnano from 'cssnano';

import { emptyFolder, copyFolder, writeFile } from '../lib/file.js';

marked.use(gfmHeadingId({ prefix: '' }));

const cssNano = postcss([cssnano]);

export const pipe = (initial, transforms) => {
  return transforms.reduce((result, transform) => transform(result), initial);
};

export const renderMustache = Mustache.render;

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

export const renderAndWritePage = (uri, shell, partials, pageData, fileContent) => {
  // const output = pipe(fileContent, [
  //   (text) => renderMustache(text, pageData, partials),
  //   (text) => parseMetadata(text),
  //   ({ meta, content }) => ({ meta, content: renderMD(content) }),
  //   ({ meta, content }) => ({ meta, content: renderCustomTags(content) }),
  //   ({ meta, content }) => renderMustache(shell, { meta, pageData }, { ...partials, content })
  // ]);

  const step1 = renderMustache(fileContent, pageData, partials);
  const { meta, content: step2 } = parseMetadata(step1);
  const step3 = renderCustomTags(step2);
  const output = renderMustache(shell, { meta, pageData }, { ...partials, content: step3 });

  writeFile(`dist/${uri}`, output);
};

// Workflow

export const prepareDistFolder = () => {
  emptyFolder('dist');
  copyFolder('client/static', 'dist');
  copyFolder('data/profiles', 'dist');
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