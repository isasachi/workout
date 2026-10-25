import { useRef, useState } from 'react';
import { EXERCISES } from '../data/exercises';
import { DAY_SHORT, KIND_COLOR, SCHEDULE, STRENGTH, WEEK_ORDER, sessionInfo, setsFor } from '../data/plan';
import { Icon } from '../components/Icon';
import { DemoPlayer } from '../demo/DemoPlayer';
import { datesOfWeek, isoDay, nextMonday, parseDay, shortDate, weekPos } from '../lib/dates';
import { formatValues, historyOf, levelOf, readyToLevelUp } from '../lib/progress';
import { exportData, importData, resetAll, setStartDate, useStore } from '../lib/store';
import { useNow } from '../lib/today';
import { useNav } from '../nav';
import s from './Progress.module.css';

const FAMILIES = ['squat', 'push', 'row', 'bridge', 'pike', 'plank', 'rdl', 'lunge', 'back', 'deadbug'];

function WeekGrid() {
  const now = useNow();
  const st = useStore((x) => x);
  const here = weekPos(st.startDate, now);
  if (!st.startDate) return <p className={s.empty}>Elige tu día de inicio en Hoy y aquí verás tus 8 semanas.</p>;
  const today = isoDay(now);
  return (
    <div className={s.grid} role="table" aria-label="Sesiones hechas por semana">
      <div className={s.gridRow} role="row">
        <span role="columnheader" />
        {WEEK_ORDER.map((d) => <span key={d} role="columnheader" className={s.colHead}>{DAY_SHORT[d]}</span>)}
      </div>
      {Array.from({ length: 8 }, (_, i) => i + 1).map((w) => {
        const days = datesOfWeek(st.startDate!, here.cycle, w);
        return (
          <div key={w} className={`${s.gridRow} ${here.started && w === here.week ? s.current : ''}`} role="row">
            <span role="rowheader" className={`num ${s.rowHead}`}>S{w}</span>
            {days.map((d) => {
              const iso = isoDay(d);
              const kind = sessionInfo(SCHEDULE[d.getDay()], w).kind;
              const done = st.logs[iso]?.done;
              const label = `${shortDate(d)}: ${done ? 'hecha' : kind === 'rest' ? 'descanso' : 'sin hacer'}`;
              return (
                <span key={iso} role="cell" aria-label={label} className={s.cell}>
                  <span
                    className={`${s.mark} ${kind === 'rest' ? s.restMark : ''} ${iso === today ? s.todayMark : ''}`}
                    style={done ? { background: KIND_COLOR[kind], borderColor: KIND_COLOR[kind] } : undefined}
                  />
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function DataSection() {
  const st = useStore((x) => x);
  const now = useNow();
  const file = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);

  const download = () => {
    const blob = new Blob([exportData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `entreno-${isoDay(now)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    setMsg('Copia creada. Guárdala en Archivos o en iCloud.');
  };

  return (
    <section className={s.section}>
      <h2 className={s.h2}>Tus datos</h2>
      <p className={s.note}>Todo se guarda solo en este teléfono. Haz una copia de vez en cuando por si cambias de móvil.</p>
      <div className={s.dataActions}>
        <button type="button" className="btn btn-secondary" onClick={download}>Exportar copia</button>
        <button type="button" className="btn btn-secondary" onClick={() => file.current?.click()}>Importar copia</button>
        <input ref={file} id="import-file" type="file" accept="application/json,.json" hidden
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const r = importData(await f.text());
            setMsg(r.ok ? `Copia importada: ${r.sessions} sesiones.` : r.reason);
            e.target.value = '';
          }} />
      </div>
      {st.startDate && (
        <div className={s.startRow}>
          <span>Empezaste el {shortDate(parseDay(st.startDate))}</span>
          <span className={s.startBtns}>
            <button type="button" className="btn btn-quiet" onClick={() => setStartDate(isoDay(now))}>Reiniciar hoy</button>
            <button type="button" className="btn btn-quiet" onClick={() => setStartDate(nextMonday(now))}>El próximo lunes</button>
          </span>
        </div>
      )}
      {confirm ? (
        <div className={s.confirm}>
          <p>Se borrarán todas tus sesiones y variantes de este teléfono.</p>
          <div className={s.dataActions}>
            <button type="button" className={`btn ${s.danger}`} onClick={() => { resetAll(); setConfirm(false); setMsg('Datos borrados.'); }}>Borrar todo</button>
            <button type="button" className="btn btn-secondary" onClick={() => setConfirm(false)}>Cancelar</button>
          </div>
        </div>
      ) : (
        <button type="button" className={`btn btn-quiet ${s.dangerText}`} onClick={() => setConfirm(true)}>Borrar todos los datos</button>
      )}
      {msg && <p className={s.msg} role="status">{msg}</p>}
    </section>
  );
}

export default function Progress() {
  const nav = useNav();
  const now = useNow();
  const st = useStore((x) => x);
  const here = weekPos(st.startDate, now);
  const weekDates = st.startDate ? datesOfWeek(st.startDate, here.cycle, here.week) : [];
  const planned = weekDates.filter((d) => SCHEDULE[d.getDay()] !== 'rest').length;
  const doneThisWeek = weekDates.filter((d) => st.logs[isoDay(d)]?.done).length;
  const total = Object.values(st.logs).filter((l) => l.done).length;

  return (
    <div className={s.screen}>
      <header className={s.head}>
        <h1 className={s.title}>Progreso</h1>
        {st.startDate && here.started && (
          <p className={s.meta}>
            Semana {here.week} de 8 · {doneThisWeek} de {planned} sesiones esta semana · {total} en total
          </p>
        )}
      </header>

      <section className={s.section}>
        <h2 className={s.h2}>Tus semanas</h2>
        <WeekGrid />
      </section>

      <section className={s.section}>
        <h2 className={s.h2}>Ejercicios</h2>
        <ul className="list">
          {FAMILIES.map((id) => {
            const ex = EXERCISES[id];
            const level = levelOf(st, id);
            const hist = historyOf(st.logs, id);
            const slot = [...STRENGTH.A, ...STRENGTH.B].find((x) => x.exercise === id)!;
            const ready = readyToLevelUp(hist, slot, level, setsFor(slot, here.week));
            const last = hist[0];
            return (
              <li key={id}>
                <button type="button" className={s.exRow} onClick={() => nav.open({ type: 'history', exercise: id })}>
                  <DemoPlayer moveId={ex.ladder[level].move} still cues={false} controls={false} className={s.thumb} label={ex.ladder[level].name} />
                  <span className={s.exText}>
                    <span className={s.exName}>{ex.ladder[level].name}</span>
                    <span className={s.exMeta}>
                      Nivel {level + 1} de {ex.ladder.length}
                      {last ? <> · última: <span className="num">{formatValues(last.values, ex.metric)}</span></> : ' · sin registros'}
                    </span>
                  </span>
                  {ready && <span className={s.pill}>Listo para subir</span>}
                  <span className={s.chev}><Icon name="chevron" size={20} /></span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <DataSection />
    </div>
  );
}
