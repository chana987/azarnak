import type { APIRoute } from 'astro';
import { getAuthUrl } from '../../../lib/auth';

export const GET: APIRoute = async () => {
  try {
    const authUrl = getAuthUrl();
    return Response.redirect(authUrl);
  } catch (error) {
    console.error('Error generating auth URL:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to initiate authentication',
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
