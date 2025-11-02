import type { APIRoute } from 'astro';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import type { Action } from '../../types/stocks';

export const GET: APIRoute = async ({ cookies }) => {
  const accessToken = cookies.get('google_access_token')?.value;
  const refreshToken = cookies.get('google_refresh_token')?.value;

  if (!accessToken || !refreshToken) {
    return new Response(
      JSON.stringify({
        error: 'Not authenticated',
        needsAuth: true,
      }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  try {
    const oauth2Client = new OAuth2Client(
      import.meta.env.GOOGLE_CLIENT_ID,
      import.meta.env.GOOGLE_CLIENT_SECRET,
      `${import.meta.env.SITE || 'http://localhost:4321'}/api/auth/callback`
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
    const spreadsheetId = import.meta.env.SPREADSHEET_ID;

    // Fetch data from the "Actions" sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Actions!A:L', // Columns A through L for all the action data
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'No data found in Actions sheet',
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // First row contains headers
    const headers = rows[0];

    // Convert rows to objects
    const actions: Action[] = rows.slice(1).map((row) => {
      const action: any = {};
      headers.forEach((header, index) => {
        action[header] = row[index] || '';
      });
      return action as Action;
    });

    return new Response(JSON.stringify(actions), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching actions:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch actions',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
