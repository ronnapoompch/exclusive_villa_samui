import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'th', 'zh', 'ru'],
 
  // Used when no locale matches
  defaultLocale: 'en',
  
  // The `pathnames` object maps pathnames to locales.
  // Paths defined here will be localized.
  pathnames: {
    '/': '/',
    '/villas': {
      en: '/villas',
      th: '/วิลล่า',
      zh: '/别墅',
      ru: '/виллы'
    },
    '/about': {
      en: '/about',
      th: '/เกี่ยวกับเรา',
      zh: '/关于我们',
      ru: '/о-нас'
    },
    '/contact': {
      en: '/contact',
      th: '/ติดต่อเรา',
      zh: '/联系我们',
      ru: '/контакты'
    }
  }
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);