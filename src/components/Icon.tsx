const PATHS: Record<string, string> = {
  today: 'M12 3v2M12 19v2M5 12H3m18 0h-2M6.3 6.3 4.9 4.9m14.2 14.2-1.4-1.4M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  plan: 'M4 7h16M4 12h16M4 17h10M8 3v4m8-4v4M5 21h14a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1Z',
  progress: 'M5 20V11m7 9V4m7 16v-6',
  play: 'M8 5.5v13l10.5-6.5L8 5.5Z',
  pause: 'M8 5v14m8-14v14',
  next: 'M6 6l7 6-7 6M17 6v12',
  close: 'M6 6l12 12M18 6 6 18',
  chevron: 'm9 6 6 6-6 6',
  back: 'm15 6-6 6 6 6',
  check: 'm5 12.5 4.5 4.5L19 7',
  minus: 'M6 12h12',
  plus: 'M12 6v12M6 12h12',
  easier: 'M12 5v14m0 0-5-5m5 5 5-5',
  harder: 'M12 19V5m0 0-5 5m5-5 5 5',
  timer: 'M12 8v5l3 2M9 3h6M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z',
  info: 'M12 11v6m0-10h.01M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
};

const FILLED = new Set(['play']);

export function Icon({ name, size = 24 }: { name: keyof typeof PATHS | string; size?: number }) {
  const d = PATHS[name];
  const filled = FILLED.has(name);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false"
      fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 2}
      strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}
