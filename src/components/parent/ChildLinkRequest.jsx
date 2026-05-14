import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { linkChildren } from "../../store/slices/parentSlice";
import { toastManager } from "../../utils/toastManager";
import { showApiError } from "../../utils/apiErrorHandler";

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isNumericId = (v) => /^\d+$/.test(v);

const ChildLinkRequest = ({ onSuccess }) => {
  const dispatch = useDispatch();
  const [input, setInput] = useState("");
  const [entries, setEntries] = useState([]); // { type: "id"|"email", value: string }
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const tooltipRef = useRef(null);

  const { loading: linkLoading } = useSelector((state) => state.parent.linkChild);

  const handleAdd = () => {
    const val = input.trim();
    if (!val) { toastManager.error("Please enter a student ID or email"); return; }

    if (isNumericId(val)) {
      const id = String(parseInt(val));
      if (entries.some((e) => e.type === "id" && e.value === id)) {
        toastManager.error("This student ID is already added"); return;
      }
      setEntries((prev) => [...prev, { type: "id", value: id }]);
    } else if (isEmail(val)) {
      const email = val.toLowerCase();
      if (entries.some((e) => e.type === "email" && e.value === email)) {
        toastManager.error("This email is already added"); return;
      }
      setEntries((prev) => [...prev, { type: "email", value: email }]);
    } else {
      toastManager.error("Enter a valid numeric ID or email address");
      return;
    }
    setInput("");
  };

  const handleRemove = (idx) => setEntries((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!entries.length) { toastManager.error("Add at least one student ID or email"); return; }

    const student_ids    = entries.filter((e) => e.type === "id").map((e) => parseInt(e.value));
    const student_emails = entries.filter((e) => e.type === "email").map((e) => e.value);

    try {
      const result = await dispatch(linkChildren({ student_ids, student_emails })).unwrap();
      setSuccessData(result.data);
      setShowSuccess(true);
      setEntries([]);
      setInput("");
      toastManager.success(result.message || "Link request(s) sent successfully");
      
      if (onSuccess) {
        setTimeout(() => onSuccess(result.data), 1500);
      } else {
        setTimeout(() => { setShowSuccess(false); setSuccessData(null); }, 5000);
      }
    } catch (error) {
      showApiError(error);
    }
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold font-poppins text-white mb-2 flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
            <i className="fas fa-link text-purple-400 text-sm"></i>
          </div>
         Request Child Access
        </h2>
        <p className="text-slate-400">
          Enter your child's student ID or email to link them to your account. The request will be sent to the school administration for approval.
        </p>
      </div>

      {/* Success Message */}
      {/* {showSuccess && successData && (
        <div className="bg-emerald-600/10 border border-emerald-500/20 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-emerald-600/20 rounded-full flex items-center justify-center shrink-0">
              <i className="fas fa-check-circle text-emerald-400 text-lg"></i>
            </div>
            <div className="flex-1">
              <h4 className="text-emerald-400 font-bold mb-2">Link Request(s) Sent Successfully</h4>
              {successData.message && <p className="text-slate-300 text-sm mb-3">{successData.message}</p>}
              {successData.requested?.length > 0 && (
                <div className="mb-2">
                  <span className="text-emerald-400 font-medium text-sm">Requested: </span>
                  <span className="text-slate-300 text-sm">{successData.requested.join(", ")}</span>
                </div>
              )}
              {successData.already_linked?.length > 0 && (
                <div>
                  <span className="text-yellow-400 font-medium text-sm">Already linked: </span>
                  <span className="text-slate-300 text-sm">{successData.already_linked.join(", ")}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )} */}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Input row */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <label className="text-sm font-medium text-slate-300">
              Student ID or Email
            </label>
            {/* Tooltip */}
            <div className="relative" ref={tooltipRef}>
              <button
                type="button"
                onMouseEnter={() => setTooltipVisible(true)}
                onMouseLeave={() => setTooltipVisible(false)}
                onFocus={() => setTooltipVisible(true)}
                onBlur={() => setTooltipVisible(false)}
                className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white transition"
              >
                <i className="fas fa-question text-[9px]"></i>
              </button>
              {tooltipVisible && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 w-64 pointer-events-none">
                  <div className="bg-slate-800 border border-slate-600 rounded-xl px-3.5 py-3 shadow-xl text-xs text-slate-300 leading-relaxed">
                    <p className="font-semibold text-white mb-1 flex items-center gap-1.5">
                      <i className="fas fa-lightbulb text-yellow-400 text-[10px]"></i>
                      How to find your child's info
                    </p>
                    Ask your child to log into their student account and share their <span className="text-purple-300 font-medium">Student ID</span> or <span className="text-purple-300 font-medium">registered email address</span>. Both can be used to send a link request.
                    <span className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-slate-600"></span>
                  </div>
                </div>
              )}
            </div>
            <span className="text-red-400 text-sm">*</span>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g.  42  or  student@school.com"
              autoComplete="off"
              className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-sm"
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
            />
            <button
              type="button"
              onClick={handleAdd}
              className="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition flex items-center gap-2 text-sm"
            >
              <i className="fas fa-plus text-xs"></i>
              Add
            </button>
          </div>

          {/* Type hint */}
          <div className="flex items-center gap-4 mt-2.5">
            <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="w-4 h-4 rounded bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                <i className="fas fa-hashtag text-purple-400 text-[8px]"></i>
              </span>
              Numeric → treated as ID
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="w-4 h-4 rounded bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                <i className="fas fa-at text-indigo-400 text-[8px]"></i>
              </span>
              Contains @  → treated as email
            </span>
          </div>
        </div>

        {/* Entries list */}
        {entries.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Students to Link
              <span className="ml-2 text-xs text-slate-500 font-normal">{entries.length} added</span>
            </label>
            <div className="space-y-2">
              {entries.map((entry, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-slate-700/40 border border-slate-600/60 rounded-xl px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      entry.type === "id"
                        ? "bg-purple-600/20 border border-purple-500/30"
                        : "bg-indigo-600/20 border border-indigo-500/30"
                    }`}>
                      <i className={`fas text-xs ${
                        entry.type === "id" ? "fa-hashtag text-purple-400" : "fa-at text-indigo-400"
                      }`}></i>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{entry.value}</p>
                      <p className={`text-[10px] uppercase tracking-widest font-bold ${
                        entry.type === "id" ? "text-purple-500" : "text-indigo-500"
                      }`}>
                        {entry.type === "id" ? "Student ID" : "Email"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                  >
                    <i className="fas fa-times text-xs"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={linkLoading || entries.length === 0}
            className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-500 text-white px-8 py-3 rounded-xl font-medium transition flex items-center gap-2 shadow-lg"
          >
            {linkLoading ? (
              <><i className="fas fa-spinner fa-spin text-xs"></i> Sending…</>
            ) : (
              <><i className="fas fa-paper-plane text-xs"></i> Send Access Request{entries.length > 1 ? "s" : ""}</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChildLinkRequest;
