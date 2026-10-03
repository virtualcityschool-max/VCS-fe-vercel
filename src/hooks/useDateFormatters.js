import { useSelector } from "react-redux";
import {
  formatDate, formatTime, formatDateTime,
  toLocalDatetimeInput, formatTimezoneISO, getTimezoneAbbr,
} from "../utils/validation";

export const useDateFormatters = () => {
  const storeTimezone = useSelector((s) => s.auth.profile?.timezone);
  const timezone = storeTimezone || (typeof window !== "undefined" ? localStorage.getItem("vcs_user_timezone") : null) || undefined;
  const timezoneAbbr = getTimezoneAbbr(timezone);
  return {
    timezone,
    timezoneAbbr,
    formatDate:      (iso)       => formatDate(iso, timezone),
    formatTime:      (iso)       => formatTime(iso, timezone),
    formatDateTime:  (iso)       => formatDateTime(iso, timezone),
    toDatetimeInput: (iso)       => toLocalDatetimeInput(iso, timezone),
    toPayloadISO:    (localStr)  => formatTimezoneISO(localStr, timezone),
  };
};
