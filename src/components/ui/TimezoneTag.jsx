import { useSelector } from "react-redux";
import { getTimezoneAbbr } from "../../utils/validation";

const TimezoneTag = ({ className = "" }) => {
  const timezone = useSelector((s) => s.auth.profile?.timezone) || undefined;
  const abbr = getTimezoneAbbr(timezone);
  if (!abbr) return null;
  return (
    <span className={`relative inline-block ${timezone ? "group/tztag" : ""}`}>
      <span className={`${timezone ? "cursor-help" : ""} ${className}`}>
        {abbr}
      </span>
      {timezone && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-slate-900 border border-white/10 text-white text-[9px] font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover/tztag:opacity-100 pointer-events-none transition-opacity z-[9999] shadow-xl">
          {timezone}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-slate-900" />
        </span>
      )}
    </span>
  );
};

export default TimezoneTag;
