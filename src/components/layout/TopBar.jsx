const ANNOUNCEMENT = "Admissions are now open for O Level & A Level classes";

const TopBar = () => {
    return (
          <div className="w-full bg-slate-950 border-b border-white/5">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-9 flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0 overflow-hidden">
                                  <div className="ticker-track flex items-center gap-16 whitespace-nowrap text-[11px] font-bold uppercase tracking-widest text-slate-300">
                                              <span className="flex items-center gap-2 shrink-0">
                                                            <i className="fas fa-bullhorn text-cyan-400 text-[10px]" />
                                                {ANNOUNCEMENT}
                                              </span>
                                              <span className="flex items-center gap-2 shrink-0">
                                                            <i className="fas fa-bullhorn text-cyan-400 text-[10px]" />
                                                {ANNOUNCEMENT}
                                              </span>
                                  </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-5 shrink-0 text-[11px] font-semibold text-slate-300">
                                  <a
                                                href="https://wa.me/966556687417"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 hover:text-emerald-400 transition"
                                              >
                                              <i className="fab fa-whatsapp text-emerald-400" />
                                              +966 556 687417
                                  </a>
                                  <a
                                                href="mailto:admin@virtualcityschool.com"
                                                className="flex items-center gap-1.5 hover:text-cyan-400 transition"
                                              >
                                              <i className="fas fa-envelope text-cyan-400" />
                                              admin@virtualcityschool.com
                                  </a>
                        </div>
                        <div className="flex sm:hidden items-center gap-4 shrink-0">
                                  <a href="https://wa.me/966556687417" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                                              <i className="fab fa-whatsapp text-emerald-400 text-sm" />
                                  </a>
                                  <a href="mailto:admin@virtualcityschool.com" aria-label="Email">
                                              <i className="fas fa-envelope text-cyan-400 text-sm" />
                                  </a>
                        </div>
                </div>
          </div>
        );
};

export default TopBar;
