const { chromium } = require('playwright');
(async () => {
  const [url, out, w = '1500'] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: +w, height: 900 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.goto(url);
  await p.waitForTimeout(1500);
  await p.screenshot({ path: out, fullPage: true });
  if (errs.length) console.log('ERRORS', errs.join('\n'));
  await b.close();
})();
