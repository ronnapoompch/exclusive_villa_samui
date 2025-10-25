import {getRequestConfig} from 'next-intl/server';
import {routing} from './src/i18n/routing';

console.log('🔍 i18n.ts file is being loaded!');
 
export default getRequestConfig(async ({requestLocale}) => {
  console.log('🔍 getRequestConfig called with requestLocale:', requestLocale);
  
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;
  console.log('🔍 Resolved locale:', locale);
  
  // Validate that the incoming `locale` parameter is valid
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
    console.log('🔍 Using default locale:', locale);
  }
 
  // Load messages with absolute path from root
  let messages;
  try {
    console.log('🔍 Attempting to load messages for:', locale);
    messages = (await import(`./messages/${locale}.json`)).default;
    console.log('🔍 Successfully loaded messages for:', locale);
  } catch (error) {
    console.warn(`❌ Failed to load messages for locale ${locale}:`, error);
    // Fallback to English messages
    try {
      messages = (await import(`./messages/en.json`)).default;
      console.log('🔍 Loaded fallback English messages');
    } catch (fallbackError) {
      console.error('❌ Failed to load fallback messages:', fallbackError);
      messages = {};
    }
  }
 
  console.log('🔍 Returning config with locale:', locale);
  return {
    locale,
    messages
  };
});