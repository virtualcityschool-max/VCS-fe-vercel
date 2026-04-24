
const DAY_MAP = { SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6 };

  export const isWithinSessionWindow = (recurringSchedule, scheduleAt) => {
    const parsed = parseRecurringSchedule(recurringSchedule);
    if (parsed) {
      const now = new Date();
      if (!parsed.days.includes(now.getDay())) return false;
      const start = new Date();
      start.setHours(parsed.hour, parsed.minute, 0, 0);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      return now >= start && now <= end;
    }
    if (scheduleAt) {
      const now = new Date();
      const scheduled = new Date(scheduleAt);
      const windowStart = new Date(scheduled.getTime() - 15 * 60 * 1000);
      const windowEnd = new Date(scheduled.getTime() + 60 * 60 * 1000);
      return now >= windowStart && now <= windowEnd;
    }
    return true;
  };
export const parseRecurringSchedule = (recurringSchedule) => {
    if (!recurringSchedule) return null;
    const match = recurringSchedule.match(
      /^(.*?)\s*@\s*(\d{1,2}):(\d{2})\s*(AM|PM)$/i,
    );
    if (!match) return null;
    let hour = parseInt(match[2]);
    const minute = parseInt(match[3]);
    const period = match[4].toUpperCase();
    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    const days = match[1]
      .split(/\s*[&,]\s*/)
      .map((d) => DAY_MAP[d.trim().toUpperCase()])
      .filter((d) => d !== undefined);
    return { days, hour, minute };
  };
  export const getWindowLabel = (recurringSchedule, scheduleAt) => {
    if (recurringSchedule) {
      const match = recurringSchedule.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (match) {
        let h = parseInt(match[1]);
        const m = parseInt(match[2]);
        const p = match[3].toUpperCase();
        let endH = h + 1;
        let endP = p;
        if (endH === 12 && p === "AM") endP = "PM";
        if (endH > 12) {
          endH -= 12;
          endP = p === "AM" ? "PM" : "AM";
        }
        const pad = (n) => n.toString().padStart(2, "0");
        return `${h}:${pad(m)} ${p} – ${endH}:${pad(m)} ${endP}`;
      }
    }
    if (scheduleAt) {
      const scheduled = new Date(scheduleAt);
      const windowStart = new Date(scheduled.getTime() - 15 * 60 * 1000);
      const windowEnd = new Date(scheduled.getTime() + 60 * 60 * 1000);
      return `${windowStart.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – ${windowEnd.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    return "";
  };

  export const formatScheduleTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };