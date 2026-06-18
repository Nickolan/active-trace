import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 800 });

await page.goto('http://localhost:5173/login');
await page.fill('input[type="email"]', 'admin@trace.dev');
await page.fill('input[type="password"]', 'Admin123456!');
await page.click('button[type="submit"]');
await page.waitForURL('http://localhost:5173/', { timeout: 8000 });

await page.goto('http://localhost:5173/comision');
await page.waitForLoadState('networkidle', { timeout: 8000 });
await page.screenshot({ path: 'screenshot_comision_list.png', fullPage: true });
console.log('LIST done');

const links = await page.locator('a[href*="/comision/"]').all();
console.log('links:', links.length);

if (links.length > 0) {
  const href = await links[0].getAttribute('href');
  await page.goto('http://localhost:5173' + href);
  await page.waitForLoadState('networkidle', { timeout: 8000 });
  await page.screenshot({ path: 'screenshot_comision_atrasados.png', fullPage: true });
  console.log('ATRASADOS done, url=' + page.url());

  await page.goto('http://localhost:5173' + href + '/importar');
  await page.waitForLoadState('networkidle', { timeout: 5000 });
  await page.screenshot({ path: 'screenshot_comision_importar.png', fullPage: true });
  console.log('IMPORTAR done');
}

await browser.close();
