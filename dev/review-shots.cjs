const { chromium } = require('playwright');
const out = process.argv[2];
// For full-page captures only: fixed bars flow at the end, and an open overlay replaces the page behind it.
const FLOW = `nav[aria-label="Secciones"]{position:static!important}
body:has([role=dialog]) #root > div:first-child{display:none!important}
[role=dialog]{position:static!important;animation:none!important}
[role=dialog] > div{overflow:visible!important}`;
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const errs = [];
  async function ctxAt(when, w = 390, h = 844) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: w < 600, hasTouch: w < 600 });
    const p = await ctx.newPage();
    await p.clock.install({ time: new Date(when) });
    p.on('pageerror', (e) => errs.push(e.message));
    await p.goto('http://localhost:5173/');
    await p.waitForTimeout(700);
    return { ctx, p };
  }
  const full = async (p, name) => {
    const st = await p.addStyleTag({ content: FLOW });
    await p.waitForTimeout(500);
    await p.screenshot({ path: `${out}/${name}.png`, fullPage: true });
    await st.evaluate((n) => n.remove());
  };
  const view = async (p, name) => { await p.waitForTimeout(600); await p.screenshot({ path: `${out}/${name}.png` }); };
  const dlg = (p) => p.getByRole('dialog').last();

  // Monday, first run
  let { ctx, p } = await ctxAt('2026-10-26T10:00:00');
  await full(p, '01-start');
  await p.getByRole('button', { name: 'Hoy', exact: true }).first().click();
  await full(p, '02-today');
  await full(p, 'mobile');
  await p.getByRole('button', { name: 'Empezar', exact: true }).click();
  await dlg(p).getByRole('button', { name: 'Empezar ejercicios' }).click();
  await dlg(p).getByRole('button', { name: /Marcar serie 1/ }).click();
  await view(p, '05-ex1-set');
  await full(p, '05-ex1-set-full');
  await dlg(p).getByRole('button', { name: 'Cerrar' }).click();
  await p.waitForTimeout(300);
  await p.getByRole('button', { name: /Sentadilla libre/ }).first().click();
  await full(p, '06-sheet');
  await dlg(p).getByRole('button', { name: 'Cerrar' }).click();
  await p.getByRole('button', { name: 'Plan', exact: true }).click();
  await full(p, '07-plan');
  await p.getByRole('button', { name: 'Progreso', exact: true }).click();
  await full(p, '08-progress');
  await ctx.close();

  // Desktop
  ({ ctx, p } = await ctxAt('2026-10-26T10:00:00', 1440, 900));
  await p.getByRole('button', { name: 'Hoy', exact: true }).first().click();
  await view(p, 'desktop');
  await ctx.close();

  // Cardio and HIIT runs at the top of their scroll
  for (const [when, name, ff] of [['2026-10-27T10:00:00', 'cardio-run', '06:00'], ['2026-10-31T10:00:00', 'hiit-run', '09:00']]) {
    ({ ctx, p } = await ctxAt(when));
    await p.getByRole('button', { name: 'Hoy', exact: true }).first().click();
    await p.getByRole('button', { name: 'Empezar', exact: true }).click();
    await dlg(p).getByRole('button', { name: 'Empezar', exact: true }).click();
    await p.clock.fastForward(ff);
    await dlg(p).evaluate((d) => d.querySelector(':scope > div:nth-child(2)').scrollTo({ top: 0 }));
    await view(p, name);
    await full(p, name + '-full');
    await ctx.close();
  }
  console.log(errs.length ? 'ERRORS\n' + errs.join('\n') : 'no errors');
  await b.close();
})();
