const { chromium } = require('playwright');
(async () => {
  const [url, out] = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && errs.push(m.text()));
  await p.goto(url);
  await p.waitForSelector('#done', { timeout: 90000, state: 'attached' });
  await p.screenshot({ path: out, fullPage: true });
  if (errs.length) console.log('ERRORS', errs.slice(0, 8).join('\n'));
  await b.close();
})();
