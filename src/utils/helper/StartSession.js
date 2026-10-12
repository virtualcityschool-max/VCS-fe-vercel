
const DAY_MAP = { SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6 };

  const SESSION_DURATION_MS = 90 * 60 * 1000; // max 90 minutes
  const SESSION_EARLY_BUFFER_MS = 20 * 60 * 1000; // 20 minutes early
  const SESSION_WINDOW_MS  = SESSION_DURATION_MS;

  export const isWithinSessionWindow = (scheduleAt) => {
    if (!scheduleAt) return true;
    const now = Date.now();
    const start = new Date(scheduleAt).getTime();
    const windowStart = start - SESSION_EARLY_BUFFER_MS;
    const windowEnd = start + SESSION_DURATION_MS;
    return now >= windowStart && now <= windowEnd;
  };

  export const isTooEarly = (scheduleAt) => {
    if (!scheduleAt) return false;
    const now = Date.now();
    const start = new Date(scheduleAt).getTime();
    return now < (start - SESSION_EARLY_BUFFER_MS);
  };

  export const isSessionExpired = (scheduleAt) => {
    if (!scheduleAt) return false;
    const now = Date.now();
    const start = new Date(scheduleAt).getTime();
    return now > (start + SESSION_DURATION_MS);
  };
  export const getWindowLabel = (scheduleAt, timeZone, abbr = "") => {
    if (scheduleAt) {
      const windowStart = new Date(scheduleAt);
      const windowEnd = new Date(windowStart.getTime() + SESSION_WINDOW_MS);
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
  export const handleJoinSession = async (sessionId, meeting_link, scheduled_at) => {
    if (isSessionExpired(scheduled_at)) {
      setSessionExpiredOpen(true);
      return;
    }
    if(meeting_link) {
      const meetWin = window.open(meeting_link, "_blank");
    }
  };