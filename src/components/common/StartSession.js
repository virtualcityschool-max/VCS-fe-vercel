
const DAY_MAP = { SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6 };

  export const isWithinSessionWindow = (scheduleAt) => {
    if (scheduleAt) {
      const now = Date.now();
      const t = new Date(scheduleAt).getTime();
      return now >= t;
    }
    return false;
  };
  export const getWindowLabel = (scheduleAt) => {
    if (scheduleAt) {
      const scheduled = new Date(scheduleAt);
      // windowStart is now exactly the scheduled time
      const windowStart = new Date(scheduled.getTime()); 
      // windowEnd is 60 minutes later
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