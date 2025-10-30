import { OAuth2Client } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

export function getOAuthClient() {
  const clientId = import.meta.env.GOOGLE_CLIENT_ID;
  const clientSecret = import.meta.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${import.meta.env.SITE || 'http://localhost:4321'}/api/auth/callback`;

  return new OAuth2Client(clientId, clientSecret, redirectUri);
}

export function getAuthUrl() {
  const oauth2Client = getOAuthClient();

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
}
