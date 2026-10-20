import React from "react";

// Shows the blocks made by outlineBlocks() (src/utils/outlineBlocks.js).

const CourseOutline = ({ blocks }) => (
  <div className="space-y-2.5 max-w-4xl">
    {blocks.map((b, i) => {
      const body = b.lead
        ? <><strong className="text-white font-semibold">{b.lead}</strong>{b.text.slice(b.lead.length)}</>
        : b.text;
      if (b.kind === "heading") {
        return <h3 key={i} className="text-lg font-bold text-indigo-200 pt-3 first:pt-0">{b.text}</h3>;
      }
      if (b.kind === "item") {
        return (
          <div key={i} className="flex gap-3 text-base text-slate-200 leading-relaxed" style={{ paddingLeft: `${b.indent * 1.5}rem` }}>
            <span className={`mt-2.5 w-1.5 h-1.5 rounded-full shrink-0 ${b.indent ? "bg-cyan-400" : "bg-emerald-400"}`} />
            <span>{body}</span>
          </div>
        );
      }
      return <p key={i} className="text-base text-slate-200 leading-relaxed">{body}</p>;
    })}
  </div>
);

export default CourseOutline;
