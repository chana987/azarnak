import type { APIRoute } from 'astro';

// This endpoint helps you verify your environment variables are loaded
// Visit: http://localhost:4321/api/test-env

export const GET: APIRoute = async () => {
  const checks = {
    hasClientId: !!import.meta.env.GOOGLE_CLIENT_ID,
    hasClientSecret: !!import.meta.env.GOOGLE_CLIENT_SECRET,
    hasSpreadsheetId: !!import.meta.env.SPREADSHEET_ID,
    hasSheetName: !!import.meta.env.SHEET_NAME,
    hasSessionSecret: !!import.meta.env.SESSION_SECRET,

    // Show partial values to verify they're correct (without exposing secrets)
    clientIdPreview: import.meta.env.GOOGLE_CLIENT_ID
      ? `${import.meta.env.GOOGLE_CLIENT_ID.substring(0, 20)}...`
      : 'NOT SET',
    spreadsheetId: import.meta.env.SPREADSHEET_ID || 'NOT SET',
    sheetName: import.meta.env.SHEET_NAME || 'NOT SET',
  };

  const allSet = checks.hasClientId &&
                 checks.hasClientSecret &&
                 checks.hasSpreadsheetId &&
                 checks.hasSheetName;

  return new Response(
    JSON.stringify({
      status: allSet ? 'OK' : 'INCOMPLETE',
      message: allSet
        ? 'All required environment variables are set!'
        : 'Some environment variables are missing. Check your .env file.',
      checks,
    }, null, 2),
    {
      status: allSet ? 200 : 500,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};
