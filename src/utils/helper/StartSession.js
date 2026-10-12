
const DAY_MAP = { SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6 };

  const SESSION_DURATION_MS = 60 * 60 * 1000;
  const SESSION_BUFFER_MS  = 30 * 60 * 1000;
  const SESSION_WINDOW_MS  = SESSION_DURATION_MS + SESSION_BUFFER_MS; // 75 min

  export const isWithinSessionWindow = (scheduleAt) => {
    return true;
  };

  export const isSessionExpired = (scheduleAt) => {
    return false;
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