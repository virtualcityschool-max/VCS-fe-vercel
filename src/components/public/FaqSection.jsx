import { useState } from "react";
import Reveal from "../ui/Reveal";

export const FAQ_ITEMS = [
  {
        q: "Are your teachers qualified?",
        a: "Yes. Every teacher at Virtual City School is fully qualified and either currently teaches or has taught at recognised institutions, each one an expert in their subject, not a generalist.",
  },
  {
        q: "What time zone are classes held in?",
        a: "All live classes run on Arabian Standard Time (AST, UTC+3), with schedules planned so students across our 13 served countries, from Pakistan to the UK and US, can still attend live.",
  },
  {
        q: "What curriculum and grades do you teach?",
        a: "Cambridge O Level, AS Level and A2 Level, alongside Grade 5-12 curricula.",
  },
  {
        q: "Are classes live or recorded?",
        a: "Live. Every class is taught in real time by a real teacher, not pre-recorded video, so students can ask questions and get answered on the spot.",
  },
  {
        q: "How much do classes cost?",
        a: "Fees vary by grade and subject. Message us on WhatsApp (+966 556 687417) for a personalised quote.",
  },
  {
        q: "How can I get enrolled?",
        a: "Apply for free access through the button above, our team reviews your request, and once approved you are enrolled in your course. No complicated paperwork.",
  },
  ];

const FaqSection = () => {
    const [openIndex, setOpenIndex] = useState(0);

    return (
          <div className="mt-32 md:mt-48 pb-20">
                <Reveal className="text-center mb-16 max-w-2xl mx-auto">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-400 mb-2">
                                  FAQ
                        </p>
                        <h2 className="text-3xl md:text-5xl font-black font-poppins tracking-tight text-white">
                                  Common Questions
                        </h2>
                </Reveal>
          
                <div className="max-w-3xl mx-auto space-y-4">
                  {FAQ_ITEMS.map((item, i) => {
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

export default FaqSection;
