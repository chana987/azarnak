# OAuth Setup Debug Checklist

Use this checklist to verify your Google OAuth setup is correct.

## 1. Google Cloud Console Setup

- [ ] Created a Google Cloud project
- [ ] Enabled Google Sheets API
- [ ] Created OAuth 2.0 credentials
- [ ] Added redirect URI: `http://localhost:4321/api/auth/callback`
  - **Important:** Must be exact, no trailing slash
  - **Important:** Port must match your dev server (default 4321)

## 2. OAuth Consent Screen

- [ ] Configured OAuth consent screen
- [ ] Added your email as a test user
- [ ] Added scope: `https://www.googleapis.com/auth/spreadsheets.readonly`
- [ ] App is in "Testing" mode (this is fine for development)

## 3. Local Environment Variables

Check your `.env` file has all required values:

```bash
# In your terminal, run this to check:
cat .env
```

- [ ] `GOOGLE_CLIENT_ID` is filled in (looks like: `xxxx.apps.googleusercontent.com`)
- [ ] `GOOGLE_CLIENT_SECRET` is filled in (random string)
- [ ] `SESSION_SECRET` is filled in (any random string)
- [ ] `SPREADSHEET_ID=1BmZrD3nP4YrOKuYWPRqJWvsl4UIjuHBSHiCvsZHFZgU`
- [ ] `SHEET_NAME=Stocks`

## 4. Development Server

- [ ] Server is running on port 4321
  ```bash
  yarn dev
  ```
- [ ] You can access http://localhost:4321
- [ ] No errors in the terminal

## 5. Google Sheet Access

- [ ] The Google Sheet is shared with your Google account
- [ ] You can open and view the sheet when logged into Google
- [ ] The sheet has a tab named "Stocks"
- [ ] The sheet has data in columns A through I

## 6. Testing the Flow

1. [ ] Visit http://localhost:4321
2. [ ] Click "Sign in with Google" button
3. [ ] **You'll see "This app isn't verified"** - This is normal!
   - Click "Advanced" (bottom left)
   - Click "Go to Stock Portfolio (unsafe)"
4. [ ] Sign in with your Google account
5. [ ] Grant permissions to access spreadsheets
6. [ ] You should be redirected back to your app
7. [ ] Stock data should display

## Common Issues and Quick Fixes

### Issue: "Missing authorization code"

**Most likely cause:** Redirect URI mismatch

**Fix:**
1. Go to Google Cloud Console > Credentials
2. Click on your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs", verify you have:
   ```
   http://localhost:4321/api/auth/callback
   ```
4. Click "SAVE"
5. Restart your dev server
6. Clear browser cookies for localhost
7. Try again

### Issue: "This app isn't verified" warning

**This is NORMAL!** Your app is in testing mode.

**To bypass:**
1. Click "Advanced"
2. Click "Go to Stock Portfolio (unsafe)"
3. Continue with sign-in

### Issue: After sign-in, nothing happens

**Check:**
1. Open browser DevTools (F12)
2. Check Console for errors
3. Check Network tab - look for failed requests to `/api/auth/callback`
4. Verify cookies are being set (Application tab > Cookies)

### Issue: "No data found in spreadsheet"

**Check:**
1. SPREADSHEET_ID in .env is correct
2. SHEET_NAME is exactly "Stocks" (case-sensitive)
3. You've shared the sheet with the Google account you're signing in with
4. The sheet has data in it

## Still Having Issues?

If you're still stuck, check the browser console and terminal for error messages. The improved error messages should tell you exactly what's wrong.

### Get more details:

1. **Check browser console** (F12 > Console tab)
   - Look for red error messages

2. **Check terminal** where `yarn dev` is running
   - Look for error messages

3. **Check the callback URL**
   - After clicking "Sign in with Google", note what URL Google redirects you to
   - Should be: `http://localhost:4321/api/auth/callback?code=...`
   - If it's different, update your redirect URI in Google Cloud Console

### Test environment variables are loaded:

Create a test endpoint to verify:

```typescript
// src/pages/api/test-env.ts
export const GET = () => {
  return new Response(JSON.stringify({
    hasClientId: !!import.meta.env.GOOGLE_CLIENT_ID,
    hasClientSecret: !!import.meta.env.GOOGLE_CLIENT_SECRET,
    hasSpreadsheetId: !!import.meta.env.SPREADSHEET_ID,
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
```

Then visit: http://localhost:4321/api/test-env

All values should be `true`.
