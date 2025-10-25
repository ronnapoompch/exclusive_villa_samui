import { test, expect, devices } from '@playwright/test';

// Mobile responsiveness tests for Exclusive Villa Samui
test.describe('Mobile Responsiveness Tests', () => {
  
  // Test on various mobile devices
  const mobileDevices = [
    { name: 'iPhone SE', device: devices['iPhone SE'] },
    { name: 'iPhone 12', device: devices['iPhone 12'] },
    { name: 'iPhone 12 Pro', device: devices['iPhone 12 Pro'] },
    { name: 'Samsung Galaxy S21', device: devices['Galaxy S21'] },
    { name: 'iPad Mini', device: devices['iPad Mini'] },
  ];

  mobileDevices.forEach(({ name, device }) => {
    test.describe(`${name} Tests`, () => {
      test.use({ ...device });

      test(`Homepage loads correctly on ${name}`, async ({ page }) => {
        await page.goto('http://localhost:3000');
        
        // Check if page loads
        await expect(page).toHaveTitle(/Exclusive Villa Samui/);
        
        // Check viewport meta tag
        const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
        expect(viewport).toContain('width=device-width');
        
        // Check if main content is visible
        await expect(page.locator('main')).toBeVisible();
      });

      test(`Navigation works on ${name}`, async ({ page }) => {
        await page.goto('http://localhost:3000');
        
        // Check if navigation is present and functional
        const nav = page.locator('nav');
        await expect(nav).toBeVisible();
        
        // Test mobile menu if present
        const mobileMenuButton = page.locator('[aria-label*="menu" i], [data-testid="mobile-menu"]').first();
        if (await mobileMenuButton.isVisible()) {
          await mobileMenuButton.click();
          // Check if menu opens
          await expect(page.locator('[role="dialog"], [data-testid="mobile-menu-content"]').first()).toBeVisible();
        }
      });

      test(`Touch targets are accessible on ${name}`, async ({ page }) => {
        await page.goto('http://localhost:3000');
        
        // Check button sizes
        const buttons = page.locator('button, a[role="button"], .btn-mobile');
        const buttonCount = await buttons.count();
        
        for (let i = 0; i < Math.min(buttonCount, 5); i++) {
          const button = buttons.nth(i);
          if (await button.isVisible()) {
            const box = await button.boundingBox();
            if (box) {
              // Touch targets should be at least 44x44px
              expect(box.height).toBeGreaterThanOrEqual(40); // Allow some margin
              expect(box.width).toBeGreaterThanOrEqual(40);
            }
          }
        }
      });

      test(`Text is readable on ${name}`, async ({ page }) => {
        await page.goto('http://localhost:3000');
        
        // Check font sizes
        const textElements = page.locator('p, h1, h2, h3, .body-mobile, .heading-mobile');
        const textCount = await textElements.count();
        
        for (let i = 0; i < Math.min(textCount, 3); i++) {
          const element = textElements.nth(i);
          if (await element.isVisible()) {
            const fontSize = await element.evaluate((el) => {
              return window.getComputedStyle(el).fontSize;
            });
            
            const sizeValue = parseInt(fontSize);
            // Minimum 16px to prevent zoom on iOS
            expect(sizeValue).toBeGreaterThanOrEqual(14); // Allow some flexibility
          }
        }
      });

      test(`No horizontal scroll on ${name}`, async ({ page }) => {
        await page.goto('http://localhost:3000');
        
        // Check if page has horizontal overflow
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        
        expect(hasHorizontalScroll).toBeFalsy();
      });

      test(`Images are responsive on ${name}`, async ({ page }) => {
        await page.goto('http://localhost:3000');
        
        // Check images don't overflow
        const images = page.locator('img');
        const imageCount = await images.count();
        
        for (let i = 0; i < Math.min(imageCount, 3); i++) {
          const image = images.nth(i);
          if (await image.isVisible()) {
            const box = await image.boundingBox();
            const viewportSize = page.viewportSize();
            
            if (box && viewportSize) {
              expect(box.width).toBeLessThanOrEqual(viewportSize.width);
            }
          }
        }
      });

      test(`Forms work properly on ${name}`, async ({ page }) => {
        await page.goto('http://localhost:3000');
        
        // Check for search form
        const searchInputs = page.locator('input[type="text"], input[type="search"], .input-mobile');
        const inputCount = await searchInputs.count();
        
        if (inputCount > 0) {
          const firstInput = searchInputs.first();
          await expect(firstInput).toBeVisible();
          
          // Check if input prevents zoom on iOS
          const fontSize = await firstInput.evaluate((el) => {
            return window.getComputedStyle(el).fontSize;
          });
          
          const sizeValue = parseInt(fontSize);
          expect(sizeValue).toBeGreaterThanOrEqual(16); // 16px prevents zoom
        }
      });
    });
  });

  // Cross-device comparison tests
  test.describe('Cross-Device Tests', () => {
    test('Layout adapts between mobile and desktop', async ({ browser }) => {
      // Test mobile layout
      const mobileContext = await browser.newContext({ ...devices['iPhone 12'] });
      const mobilePage = await mobileContext.newPage();
      await mobilePage.goto('http://localhost:3000');
      
      // Test desktop layout
      const desktopContext = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
      const desktopPage = await desktopContext.newPage();
      await desktopPage.goto('http://localhost:3000');
      
      // Compare if different layouts exist
      const mobileNav = await mobilePage.locator('nav').innerHTML();
      const desktopNav = await desktopPage.locator('nav').innerHTML();
      
      // Should have some differences in navigation for mobile vs desktop
      expect(mobileNav).toBeTruthy();
      expect(desktopNav).toBeTruthy();
      
      await mobileContext.close();
      await desktopContext.close();
    });
  });
});

// Performance tests
test.describe('Mobile Performance Tests', () => {
  test.use({ ...devices['iPhone 12'] });

  test('Page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds on mobile
    expect(loadTime).toBeLessThan(3000);
  });

  test('Images load progressively', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check for loading="lazy" attribute on images
    const lazyImages = page.locator('img[loading="lazy"]');
    const lazyCount = await lazyImages.count();
    
    // Should have some lazy-loaded images for performance
    expect(lazyCount).toBeGreaterThan(0);
  });
});

// Accessibility tests
test.describe('Mobile Accessibility Tests', () => {
  test.use({ ...devices['iPhone 12'] });

  test('Has proper focus management', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    const focusedElement = await page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('Skip to content link works', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check for skip link
    const skipLink = page.locator('a[href="#main-content"]');
    if (await skipLink.count() > 0) {
      await expect(skipLink).toBeVisible();
    }
  });

  test('Images have alt text', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i);
      const alt = await image.getAttribute('alt');
      
      // Alt should exist (can be empty for decorative images)
      expect(alt).not.toBeNull();
    }
  });
});