import {getRequestConfig} from 'next-intl/server';
import {routing} from './i18n/routing';
 
export default getRequestConfig(async ({requestLocale}) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
 
  // Load messages with proper path resolution from project root
  let messages;
  try {
    messages = (await import(`../messages/${locale}.json`)).default;
  } catch (error) {
    console.warn(`Failed to load messages for locale ${locale}:`, error);
    // Fallback to English messages
    try {
      messages = (await import(`../messages/en.json`)).default;
    } catch (fallbackError) {
      console.error('Failed to load fallback messages:', fallbackError);
      messages = {};
    }
  }
 
  return {
    locale,
    messages
  };
});