const { chromium } = require('playwright');
const out = process.argv[2];
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const errs = [];
  async function day(when, name, steps) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const p = await ctx.newPage();
    await p.clock.install({ time: new Date(when) });
    p.on('pageerror', (e) => errs.push(name + ' pageerror ' + e.message));
    p.on('console', (m) => m.type() === 'error' && errs.push(name + ' ' + m.text()));
    await p.goto('http://localhost:5173/');
    await p.waitForTimeout(600);
    await p.getByRole('button', { name: 'Hoy', exact: true }).first().click().catch(() => {});
    await p.waitForTimeout(400);
    await p.screenshot({ path: `${out}/${name}-today.png` });
    await steps(p);
    await ctx.close();
  }
  await day('2026-10-27T10:00:00', 'cardio', async (p) => {
    await p.getByRole('button', { name: 'Empezar', exact: true }).click();
    await p.getByRole('dialog').getByRole('button', { name: 'Empezar', exact: true }).click();
    await p.clock.fastForward('06:00');
    await p.waitForTimeout(600);
    await p.screenshot({ path: `${out}/cardio-run.png` });
  });
  await day('2026-10-31T10:00:00', 'hiit', async (p) => {
    await p.getByRole('button', { name: 'Empezar', exact: true }).click();
    await p.getByRole('dialog').getByRole('button', { name: 'Empezar', exact: true }).click();
    await p.clock.fastForward('09:00');
    await p.waitForTimeout(600);
    await p.screenshot({ path: `${out}/hiit-run.png` });
  });
  await day('2026-10-28T10:00:00', 'recovery', async (p) => {
    await p.getByRole('button', { name: 'Empezar', exact: true }).click();
    await p.waitForTimeout(600);
    await p.screenshot({ path: `${out}/recovery-run.png` });
  });
  await day('2026-11-01T10:00:00', 'rest', async () => {});
  await day('2026-10-26T10:00:00', 'strength', async (p) => {
    await p.getByRole('button', { name: 'Empezar', exact: true }).click();
    await p.getByRole('dialog').getByRole('button', { name: 'Empezar ejercicios' }).click();
    await p.getByRole('dialog').getByRole('button', { name: 'Siguiente ejercicio' }).click();
    await p.waitForTimeout(500);
    await p.screenshot({ path: `${out}/strength-push.png` });
    for (let i = 0; i < 4; i++) await p.getByRole('dialog').getByRole('button', { name: 'Siguiente ejercicio' }).click();
    await p.waitForTimeout(500);
    await p.screenshot({ path: `${out}/strength-plank.png` });
  });
  console.log(errs.length ? 'ERRORS\n' + errs.join('\n') : 'no errors');
  await b.close();
})();
