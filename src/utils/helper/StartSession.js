
const DAY_MAP = { SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6 };

  export const isWithinSessionWindow = (scheduleAt) => {
    if (scheduleAt) {
      const now = Date.now();
      const t = new Date(scheduleAt).getTime();
      return now >= t - 30 * 60 * 1000 && now <= t + 60 * 60 * 1000;
    }
    return false;
  };
  export const getWindowLabel = (scheduleAt, timeZone, abbr = "") => {
    if (scheduleAt) {
      const windowStart = new Date(scheduleAt);
      const windowEnd = new Date(windowStart.getTime() + 60 * 60 * 1000);
      const opts = { hour: "2-digit", minute: "2-digit", ...(timeZone ? { timeZone } : {}) };
      const label = `${windowStart.toLocaleTimeString([], opts)} – ${windowEnd.toLocaleTimeString([], opts)}`;
      return abbr ? `${label} ${abbr}` : label;
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