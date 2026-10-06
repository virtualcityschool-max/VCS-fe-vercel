// Short label for a subject chip: its Cambridge code when it has one,
// otherwise the first part of its title ("Islamic Studies — Islamiyat" → "Islamic Studies").
export const subjectChip = (s?: { code?: string; name?: string } | null): string => {
  if (!s) return '—';
  if (s.code) return s.code;
  const base = (s.name || '').split(/ — | - |\(|\|/)[0].trim();
  return base.length > 22 ? `${base.slice(0, 20)}…` : base || '—';
};

// Downloads the table currently shown on the page as a CSV file. Reads the
// rendered cells, so it exports exactly what the admin sees (current filters
// and page included).
export const exportVisibleTableCsv = (filename: string): number => {
  const table = document.querySelector('main table');
  if (!table) return 0;
  const clean = (t: string) => t.replace(/\s+/g, ' ').trim();
  const rows = Array.from(table.querySelectorAll('tr'))
    .map((tr) => Array.from(tr.querySelectorAll('th,td')).map((c) => clean((c as HTMLElement).innerText || '')))
    .map((cells) => cells.filter((_, i, arr) => !(i === 0 && arr.length > 2 && cells[0] === '')))
    .filter((cells) => cells.some(Boolean));
  if (rows.length < 2) return 0;
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csv = rows.map((r) => r.map(esc).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  return rows.length - 1;
};

export const fileSlug = (title: string) =>
  `vcs-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${new Date().toISOString().slice(0, 10)}`;
