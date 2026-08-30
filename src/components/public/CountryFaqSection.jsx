import { useState } from "react";
import Reveal from "../ui/Reveal";

// Same accordion pattern/styling as FaqSection, parameterized so each
// country landing page can carry its own question set instead of the
// homepage's generic FAQ_ITEMS.
const CountryFaqSection = ({ items, kicker = "FAQ", heading = "Common Questions" }) => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="mt-20 md:mt-28">
      <Reveal className="text-center mb-16 max-w-2xl mx-auto">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-400 mb-2">
          {kicker}
        </p>
        <h2 className="text-3xl md:text-5xl font-black font-poppins tracking-tight text-white">
          {heading}
        </h2>
      </Reveal>

      <div className="max-w-3xl mx-auto space-y-4">
        {items.map((item, i) => {
          const open = openIndex === i;
          return (
            <div key={item.q} className="bg-[#1a2235]/60 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden">
              <button onClick={() => setOpenIndex(open ? -1 : i)} className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left">
                <span className="text-white font-bold text-sm sm:text-base">{item.q}</span>
                <i className={"fas fa-chevron-down text-slate-500 text-xs shrink-0 transition-transform duration-300 " + (open ? "rotate-180" : "")}></i>
              </button>
              <div className={"grid transition-all duration-300 " + (open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                <div className="overflow-hidden">
                  <p className="text-slate-400 text-sm leading-relaxed px-6 pb-5">{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CountryFaqSection;
