import type { APIRoute } from 'astro';
import { getOAuthClient } from '../../../lib/auth';
import { getTranslations, getLocaleFromRequest } from '../../../i18n';

export const GET: APIRoute = async ({ url, cookies, redirect, request }) => {
  const locale = getLocaleFromRequest(request);
  const { t } = getTranslations(locale);

  try {
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    // Check if user denied access or there was an error
    if (error) {
      console.error('OAuth error:', error);
      return new Response(
        `<html><body>
          <h1>${t('errors.authenticationError')}</h1>
          <p>${t('common.error')} ${error}</p>
          <p>${url.searchParams.get('error_description') || 'Please try again'}</p>
          <a href="/">${t('errors.goBackHome')}</a>
        </body></html>`,
        { status: 400, headers: { 'Content-Type': 'text/html' } }
      );
    }

    if (!code) {
      console.error('No authorization code received. URL params:', url.searchParams.toString());
      const checks = [
        t('errorPages.missingAuthCode.checks.0'),
        t('errorPages.missingAuthCode.checks.1'),
        t('errorPages.missingAuthCode.checks.2')
      ];

      return new Response(
        `<html><body>
          <h1>${t('errorPages.missingAuthCode.title')}</h1>
          <p>${t('errorPages.missingAuthCode.description')}</p>
          <p>${t('errorPages.missingAuthCode.checkTitle')}</p>
          <ul>
            ${checks.map(check => `<li>${check}</li>`).join('')}
          </ul>
          <a href="/">${t('errors.goBackAndTryAgain')}</a>
        </body></html>`,
        { status: 400, headers: { 'Content-Type': 'text/html' } }
      );
    }

    const oauth2Client = getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);

    // Store tokens in cookies
    cookies.set('google_access_token', tokens.access_token || '', {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
      path: '/',
    });

    if (tokens.refresh_token) {
      cookies.set('google_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });
    }

    return redirect('/');
  } catch (error) {
    console.error('Error handling OAuth callback:', error);
    const checks = [
      t('errorPages.authFailed.checks.0'),
      t('errorPages.authFailed.checks.1'),
      t('errorPages.authFailed.checks.2')
    ];

    return new Response(
      `<html><body>
        <h1>${t('errorPages.authFailed.title')}</h1>
        <p>${t('common.error')} ${error instanceof Error ? error.message : String(error)}</p>
        <p>${t('errorPages.authFailed.checkTitle')}</p>
        <ul>
          ${checks.map(check => `<li>${check}</li>`).join('')}
        </ul>
        <a href="/">${t('errors.goBackAndTryAgain')}</a>
      </body></html>`,
      { status: 500, headers: { 'Content-Type': 'text/html' } }
    );
  }
};
