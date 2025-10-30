import en from './en.json';
import he from './he.json';

export type Locale = 'en' | 'he';

export const translations = {
  en,
  he,
} as const;

export const defaultLocale: Locale = 'he';

/**
 * Get nested translation value using dot notation
 * Example: t('common.loading') => 'Loading stocks...'
 */
export function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path;
}

/**
 * Get translation function for a specific locale
 */
export function getTranslations(locale: Locale = defaultLocale) {
  const localeTranslations = translations[locale] || translations[defaultLocale];

  return {
    t: (key: string): string => {
      return getNestedValue(localeTranslations, key);
    },
    locale,
    direction: localeTranslations.meta.direction,
    lang: localeTranslations.meta.lang,
  };
}

/**
 * Get all available locales
 */
export function getAvailableLocales(): Locale[] {
  return Object.keys(translations) as Locale[];
}

/**
 * Check if locale is valid
 */
export function isValidLocale(locale: string): locale is Locale {
  return getAvailableLocales().includes(locale as Locale);
}

/**
 * Get locale from various sources (cookie, browser, etc.)
 */
export function getLocaleFromRequest(request?: Request): Locale {
  if (!request) {
    return defaultLocale;
  }

  // Try to get from cookie
  const cookies = request.headers.get('cookie');
  if (cookies) {
    const localeCookie = cookies
      .split(';')
      .find(c => c.trim().startsWith('locale='));

    if (localeCookie) {
      const locale = localeCookie.split('=')[1];
      if (isValidLocale(locale)) {
        return locale;
      }
    }
  }

  // Try to get from Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const preferredLang = acceptLanguage.split(',')[0].split('-')[0];
    if (isValidLocale(preferredLang)) {
      return preferredLang;
    }
  }

  return defaultLocale;
}

/**
 * Type-safe translation keys
 */
export type TranslationKey =
  | 'common.appName'
  | 'common.loading'
  | 'common.error'
  | 'common.logout'
  | 'auth.signInTitle'
  | 'auth.signInDescription'
  | 'auth.signInButton'
  | 'auth.signInHelp'
  | 'auth.pleaseSignInAgain'
  | 'auth.notAuthenticated'
  | 'auth.authenticationExpired'
  | 'auth.failedToInitiateAuth'
  | 'errors.failedToFetchStocks'
  | 'errors.noDataFound'
  | 'errors.failedToFetchFromSheets'
  | 'errors.authenticationError'
  | 'errors.missingAuthCode'
  | 'errors.authenticationFailed'
  | 'errors.goBackHome'
  | 'errors.goBackAndTryAgain'
  | 'stock.portfolio'
  | 'stock.exchange'
  | 'stock.ticker'
  | 'stock.officialName'
  | 'meta.direction'
  | 'meta.lang';
