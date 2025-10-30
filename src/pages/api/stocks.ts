import type { APIRoute } from 'astro';
import { google } from 'googleapis';
import { getOAuthClient } from '../../lib/auth';
import { getTranslations, getLocaleFromRequest } from '../../i18n';

export const GET: APIRoute = async ({ cookies, request }) => {
  const locale = getLocaleFromRequest(request);
  const { t } = getTranslations(locale);

  try {
    const accessToken = cookies.get('google_access_token')?.value;
    const refreshToken = cookies.get('google_refresh_token')?.value;

    if (!accessToken) {
      return new Response(
        JSON.stringify({
          error: t('auth.notAuthenticated'),
          needsAuth: true
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const spreadsheetId = import.meta.env.SPREADSHEET_ID;
    const sheetName = import.meta.env.SHEET_NAME;

    // Create OAuth client and set credentials
    const oauth2Client = getOAuthClient();
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    // Fetch the data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:I`, // Columns A through I (Company to Normalized to ILS)
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return new Response(
        JSON.stringify({ error: t('errors.noDataFound') }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // First row is headers
    const headers = rows[0];

    // Convert rows to objects
    const stocks = rows.slice(1).map(row => {
      const stock: Record<string, string> = {};
      headers.forEach((header, index) => {
        stock[header] = row[index] || '';
      });
      return stock;
    });

    return new Response(JSON.stringify(stocks), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);

    // Check if it's an auth error
    if (error && typeof error === 'object' && 'code' in error && error.code === 401) {
      return new Response(
        JSON.stringify({
          error: t('auth.authenticationExpired'),
          needsAuth: true
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        error: t('errors.failedToFetchFromSheets'),
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
