import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

const ROUTES = ['/', '/dashboard', '/concepts', '/concepts/generics', '/mini-projects', '/playground', '/about'] as const;

/** Console errors that originate from the page itself, not from blocked third parties. */
const collectPageErrors = (page: Page): string[] => {
  const errors: string[] = [];
  const isNoise = (text: string): boolean =>
    /fonts\.googleapis|fonts\.gstatic|net::ERR_|Failed to load resource|favicon/i.test(text);
  page.on('console', (message: ConsoleMessage) => {
    if (message.type() === 'error' && !isNoise(message.text())) errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
};

for (const route of ROUTES) {
  test(`route ${route} renders without page errors`, async ({ page }) => {
    const errors = collectPageErrors(page);
    const response = await page.goto(route);
    expect(response?.ok()).toBe(true);
    await expect(page.locator('#root')).not.toBeEmpty();
    await expect(page.getByRole('navigation').first()).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('unknown routes show the not-found view', async ({ page }) => {
  await page.goto('/this/route/does/not/exist');
  await expect(page.getByText(/404/)).toBeVisible();
});

test('navigation reaches the concepts overview with all curriculum modules', async ({ page }) => {
  await page.goto('/concepts');
  for (const title of ['Foundations', 'Generics', 'Advanced types', 'Decorators', 'Compiler API']) {
    await expect(page.getByText(new RegExp(title, 'i')).first()).toBeVisible();
  }
});

test('the installable manifest and service worker are served', async ({ request }) => {
  const manifest = await request.get('/manifest.webmanifest');
  expect(manifest.ok()).toBe(true);
  expect((await manifest.json()).short_name).toBe('TSVerseHub');
  const sw = await request.get('/sw.js');
  expect(sw.ok()).toBe(true);
});

test('Tailwind utilities and the class-based dark variant reach the bundle', async ({ page }) => {
  // A broken Tailwind pipeline still renders every route, so assert computed styles
  // of the navbar (`sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b`).
  const navbar = page.locator('nav.sticky');
  const styleOf = () =>
    navbar.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        position: s.position,
        zIndex: s.zIndex,
        borderBottomWidth: s.borderBottomWidth,
        backdropFilter: s.backdropFilter,
        backgroundColor: s.backgroundColor,
      };
    });

  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveClass(/\bdark\b/);
  const light = await styleOf();
  expect(light).toMatchObject({ position: 'sticky', zIndex: '50', borderBottomWidth: '1px' });
  expect(light.backdropFilter).toContain('blur(16px)');

  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/\bdark\b/);
  const dark = await styleOf();
  expect(dark.backgroundColor).not.toBe(light.backgroundColor);
});
