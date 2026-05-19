import { useSelector } from "react-redux";
import {
  formatDate, formatTime, formatDateTime,
  toLocalDatetimeInput, formatTimezoneISO,
} from "../utils/validation";

export const useDateFormatters = () => {
  const timezone = useSelector((s) => s.auth.profile?.timezone) || undefined;
  return {
    timezone,
    formatDate:      (iso)       => formatDate(iso, timezone),
    formatTime:      (iso)       => formatTime(iso, timezone),
    formatDateTime:  (iso)       => formatDateTime(iso, timezone),
    toDatetimeInput: (iso)       => toLocalDatetimeInput(iso, timezone),
    toPayloadISO:    (localStr)  => formatTimezoneISO(localStr, timezone),
  };
};
