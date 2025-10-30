import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ cookies, redirect }) => {
  // Clear the authentication cookies
  cookies.delete('google_access_token', { path: '/' });
  cookies.delete('google_refresh_token', { path: '/' });

  return redirect('/');
};
