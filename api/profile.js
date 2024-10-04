import { readFile } from '../lib/file.js';
import { renderPage } from '../client/app.js';

const template = readFile('client/templates/career.md');

const cacheHeader = {
  'Netlify-CDN-Cache-Control': 'public, durable, s-maxage=31536000, must-revalidate'
};

export const config = {
  preferStatic: true,
  path: '/profile/:profileId'
};

export default async (req, context) => {
  const { profileId } = context.params;
  const data = JSON.parse(readFile(`data/profiles/${profileId}.json`));
  const content = renderPage(template, data);

  return new Response(content, {
    headers: {
      'content-type': 'text/html',
      'Netlify-CDN-Cache-Control': 'public, durable, s-maxage=31536000, must-revalidate'
    }
  });
};