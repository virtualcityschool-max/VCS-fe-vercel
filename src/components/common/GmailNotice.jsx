import React from "react";

/**
 * Compact notice reminding students to be signed into Gmail before joining.
 * compact=true → single line (used inline near Join buttons)
 * compact=false → full banner (used at section level)
 */
const GmailNotice = ({ compact = false }) => {
  if (compact) {
    return (
      <p className="flex items-start gap-1.5 text-[10px] text-slate-400 leading-relaxed">
        <i className="fab fa-google text-amber-400 mt-0.5 shrink-0" />
        Google Meet requires a <strong className="text-amber-300 font-bold">Gmail account</strong>.
        Please sign in to Gmail before clicking Join.
      </p>
    );
  }

  return (
    <div className="flex items-start gap-3 px-4 py-3 bg-amber-500/8 border border-amber-500/20 rounded-xl">
      <div className="w-7 h-7 bg-amber-500/15 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
        <i className="fab fa-google text-amber-400 text-sm" />
      </div>
      <p className="text-xs text-amber-200/80 leading-relaxed">
        <strong className="text-amber-300 font-bold">Gmail required to join sessions.</strong>{" "}
        Google Meet sessions can only be joined using a Gmail account. Please ensure you are
        signed into your Gmail account in your browser before clicking the Join button.
      </p>
    </div>
  );
};

export default GmailNotice;
