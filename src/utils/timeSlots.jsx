// 15-minute time choices for class and meeting planners, value "HH:MM" (24h)
// like a native time input, label "4:30 PM".
const pad = (n) => String(n).padStart(2, "0");

export const TIME_SLOTS = Array.from({ length: 96 }, (_, i) => {
  const h = Math.floor(i / 4);
  const m = (i % 4) * 15;
  const label = `${h % 12 || 12}:${pad(m)} ${h < 12 ? "AM" : "PM"}`;
  return { value: `${pad(h)}:${pad(m)}`, label };
});

// <option>s for a time select; keeps an off-grid saved value selectable.
export const timeOptions = (current) => {
  const value = (current || "").slice(0, 5);
  const extra = value && !TIME_SLOTS.some((t) => t.value === value) ? [{ value, label: value }] : [];
  return [
    <option key="" value="">Choose a time</option>,
    ...[...extra, ...TIME_SLOTS].map((t) => (
      <option key={t.value} value={t.value}>{t.label}</option>
    )),
  ];
};
