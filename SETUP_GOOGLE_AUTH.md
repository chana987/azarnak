# Google Sheets OAuth Setup Guide

This guide will help you set up Google OAuth authentication to access your private Google Sheet.

## Prerequisites

- A Google Cloud Platform account

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" at the top
3. Click "NEW PROJECT"
4. Enter a project name (e.g., "Stock Portfolio")
5. Click "CREATE"

## Step 2: Enable Google Sheets API

1. In your project, go to "APIs & Services" > "Library"
2. Search for "Google Sheets API"
3. Click on it and press "ENABLE"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "CREATE CREDENTIALS" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - User Type: External (or Internal if you have a Google Workspace)
   - Click "CREATE"
   - Fill in:
     - App name: "Stock Portfolio"
     - User support email: Your email
     - Developer contact: Your email
   - Click "SAVE AND CONTINUE"
   - Scopes: Click "ADD OR REMOVE SCOPES"
     - Search for "Google Sheets API"
     - Select: `.../auth/spreadsheets.readonly`
   - Click "UPDATE" then "SAVE AND CONTINUE"
   - Test users: Add your email address
   - Click "SAVE AND CONTINUE"

4. Back to "Credentials", click "CREATE CREDENTIALS" > "OAuth client ID"
5. Application type: "Web application"
6. Name: "Stock Portfolio Web Client"
7. Authorized redirect URIs:
   - For local development: `http://localhost:4321/api/auth/callback`
   - For production: `https://yourdomain.com/api/auth/callback`
8. Click "CREATE"
9. Copy the **Client ID** and **Client Secret**

## Step 4: Configure Your Application

1. Open the `.env` file in your project root
2. Add your credentials:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
SESSION_SECRET=generate-a-random-string-here
SPREADSHEET_ID=spreadsheet_id_here
SHEET_NAME=sheet_name_here
```

3. Generate a random session secret:
   ```bash
   # On Mac/Linux
   openssl rand -base64 32
   ```

## Step 5: Share Your Google Sheet

Even though you're authenticating, you need to share the sheet with your Google account:

1. Open your Google Sheet
2. Click "Share" button
3. Add your Google account email
4. Set permission to "Viewer" or higher
5. Click "Send"

## Step 6: Test the Application

1. Start your development server:
   ```bash
   yarn dev
   ```

2. Open http://localhost:4321 in your browser
3. Click "Sign in with Google"
4. You'll be redirected to Google's login page
5. Sign in with your Google account
6. Grant permission to access your spreadsheet
7. You'll be redirected back and should see your stock data

## Troubleshooting

### "This app isn't verified" or "Google hasn't verified this app"

This is **NORMAL** for development and testing! Google shows this warning for apps that haven't gone through their verification process. You can safely bypass this:

1. When you see the warning screen, click **"Advanced"** (bottom left)
2. Then click **"Go to Stock Portfolio (unsafe)"**
3. Review the permissions and click **"Continue"**

**Why this happens:**
- Your app is in "Testing" mode
- You haven't submitted it for Google's verification review
- This is expected for personal/development projects

**To remove this warning** (optional, not required for personal use):
- You can add yourself as a test user in the OAuth consent screen
- Or publish your app (requires verification if using sensitive scopes)

### "Missing authorization code"

**Check these in order:**

1. **Verify redirect URI in Google Cloud Console:**
   - Go to Credentials > Your OAuth 2.0 Client
   - Under "Authorized redirect URIs", make sure you have EXACTLY:
     ```
     http://localhost:4321/api/auth/callback
     ```
   - No trailing slash, exact port number

2. **Check your .env file:**
   - Make sure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are filled in
   - No extra spaces or quotes around the values
   - Values should be copied directly from Google Cloud Console

3. **Restart your dev server:**
   ```bash
   # Stop the server (Ctrl+C) and restart
   yarn dev
   ```

4. **Check the browser console:**
   - Open Developer Tools (F12)
   - Look for any error messages
   - Check the Network tab for failed requests

### "Access blocked: This app's request is invalid"
- Make sure your redirect URI in Google Cloud Console exactly matches: `http://localhost:4321/api/auth/callback`
- Check that the Google Sheets API is enabled in your Google Cloud project

### "Error: redirect_uri_mismatch"
- The redirect URI in your Google Cloud Console doesn't match the one being used
- Copy the exact redirect URI shown in the error message
- Add it to "Authorized redirect URIs" in Google Cloud Console

### "Authentication expired"
- Click the logout button and sign in again
- Access tokens expire after 1 hour
- Refresh tokens last 30 days

### "No data found in spreadsheet"
- Verify the SPREADSHEET_ID in .env matches your sheet
- Verify SHEET_NAME is "Stocks"
- Make sure the sheet has data in columns A through I
- Check that you've shared the sheet with your Google account

## Production Deployment

When deploying to production (e.g., Netlify):

1. Add your production URL to authorized redirect URIs in Google Cloud Console:
   ```
   https://yourdomain.com/api/auth/callback
   ```

2. Set environment variables in your hosting platform:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `SESSION_SECRET`
   - `SPREADSHEET_ID`
   - `SHEET_NAME`
   - `SITE` (your production URL, e.g., https://yourdomain.com)

3. Update the OAuth consent screen to "Production" status once you're ready

## Security Notes

- Never commit your `.env` file to git
- Keep your Client Secret secure
- Use HTTPS in production
- Regularly rotate your session secret
