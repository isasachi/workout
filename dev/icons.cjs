const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 512, height: 512 } });
  await p.goto('http://localhost:5173/dev/icon.html');
  await p.waitForTimeout(1200);
  await p.locator('#root').screenshot({ path: 'public/icon-512.png' });
  await b.close();
})();
