export const config = {
  path: '/p/:profileId',
  preferStatic: true
};

export default async (req, context) => {
  const { profileId } = context.params;

  const content = `Function response for profile ${profileId}`;

  return new Response(content, {
    headers: {
      'Netlify-CDN-Cache-Control': 'public, durable, s-maxage=31536000, must-revalidate'
    }
  });
};