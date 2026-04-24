import React, { useMemo } from "react";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();
const todayStr = () => new Date().toISOString().slice(0, 10);

const STATUS_STYLE = {
  present: {
    label: "Present",
    cell: "bg-emerald-500/25 text-emerald-300 hover:bg-emerald-500/35",
    dot: "bg-emerald-500",
  },
  absent: {
    label: "Absent",
    cell: "bg-rose-500/25 text-rose-300 hover:bg-rose-500/35",
    dot: "bg-rose-500",
  },
  late: {
    label: "Late",
    cell: "bg-yellow-500/25 text-yellow-300 hover:bg-yellow-500/35",
    dot: "bg-yellow-500",
  },
};

/**
 * Reusable attendance calendar.
 *
 * Props:
 *   attendanceByDate  – { "YYYY-MM-DD": [record, ...] }
 *   fromDate          – "YYYY-MM-DD" range start
 *   toDate            – "YYYY-MM-DD" range end
 *   calMonth          – { year: number, month: number }
 *   onPrevMonth       – () => void
 *   onNextMonth       – () => void
 *   selectedDay       – "YYYY-MM-DD" | null
 *   onDaySelect       – (dateStr | null) => void
 */
const AttendanceCalendar = ({
  attendanceByDate = {},
  fromDate,
  toDate,
  calMonth,
  onPrevMonth,
  onNextMonth,
  selectedDay,
  onDaySelect,
  onDayClick,   // optional: (records[]) => void — called when a day with records is clicked
}) => {
  const today = todayStr();

  const calendarDays = useMemo(() => {
    const { year, month } = calMonth;
    const days = [];
    for (let i = 0; i < getFirstDayOfMonth(year, month); i++) days.push(null);
    for (let d = 1; d <= getDaysInMonth(year, month); d++) {
      days.push(
        `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
      );
    }
    return days;
  }, [calMonth]);

  const getDayStatus = (dateStr) => {
    const records = attendanceByDate[dateStr];
    return records?.length ? records[0].status : null;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onPrevMonth}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-800 transition text-slate-400 hover:text-white"
        >
          <i className="fas fa-chevron-left text-xs"></i>
        </button>
        <span className="font-bold text-sm">
          {MONTH_NAMES[calMonth.month]} {calMonth.year}
        </span>
        <button
          onClick={onNextMonth}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-800 transition text-slate-400 hover:text-white"
        >
          <i className="fas fa-chevron-right text-xs"></i>
        </button>
      </div>

      {/* Day-name headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map((d) => (
          <div
            key={d}
            className="text-center text-[9px] uppercase tracking-widest text-slate-500 font-bold py-0.5"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {calendarDays.map((dateStr, i) => {
          if (!dateStr) return <div key={`e-${i}`} />;

          const status     = getDayStatus(dateStr);
          const cfg        = status ? STATUS_STYLE[status] : null;
          const inRange    = fromDate && toDate ? dateStr >= fromDate && dateStr <= toDate : true;
          const isToday    = dateStr === today;
          const hasRecords = !!attendanceByDate[dateStr]?.length;
          const isSelected = selectedDay === dateStr;

          const handleClick = () => {
            if (!hasRecords || !inRange) return;
            if (onDaySelect) onDaySelect(isSelected ? null : dateStr);
            if (onDayClick) onDayClick(attendanceByDate[dateStr]);
          };

          return (
            <button
              key={dateStr}
              onClick={handleClick}
              className={[
                "relative h-8 flex items-center justify-center rounded-lg text-xs transition select-none",
                isSelected
                  ? "ring-2 ring-indigo-500"
                  : "",
                cfg && inRange
                  ? cfg.cell
                  : isToday
                    ? "ring-1 ring-indigo-400/50 text-indigo-300 hover:bg-slate-800"
                    : inRange
                      ? "text-slate-300 hover:bg-slate-800"
                      : "text-slate-700 cursor-default",
                !inRange || !hasRecords ? "cursor-default" : "cursor-pointer",
              ].join(" ")}
            >
              <span className="font-semibold leading-none text-[11px]">
                {Number(dateStr.slice(8))}
              </span>
              {isToday && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-3 pt-3 border-t border-slate-800 justify-center flex-wrap">
        {Object.entries(STATUS_STYLE).map(([, cfg]) => (
          <div key={cfg.label} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
            <span className="text-[10px] text-slate-400">{cfg.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-slate-700" />
          <span className="text-[10px] text-slate-400">No Session</span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCalendar;
