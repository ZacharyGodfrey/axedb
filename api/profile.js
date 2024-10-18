import { database } from '../lib/database.js';
import { readFile } from '../lib/file.js';
import { buildProfileData, renderPage } from '../client/app.js';

const db = database();

const template = readFile('client/templates/profile.md');

export const config = {
  preferStatic: true,
  path: '/profile/:profileId'
};

export default async (req, context) => {
  const profile = buildProfileData(db, context.params.profileId);
  const content = renderPage(template, {
    profile,
    profileJson: JSON.stringify(profile, null, 2)
  });

  return new Response(content, {
    headers: {
      'content-type': 'text/html',
      'Netlify-CDN-Cache-Control': 'public, durable, s-maxage=31536000, must-revalidate'
    }
  });
};