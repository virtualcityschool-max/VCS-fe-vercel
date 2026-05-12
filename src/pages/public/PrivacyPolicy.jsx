import React, { useState, useEffect } from "react";

// Note: I'll use Lucide icons if I can, but if the user doesn't have it, I'll fallback to FontAwesome.
// Actually, I'll check if I can use FontAwesome equivalents or just standard Lucide imports if I'm sure they are used elsewhere.
// Wait, the previous check said empty. I'll use standard FontAwesome classes instead to be safe, or just check another file to see what icons are used.

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState("introduction");

  const sections = [
    { id: "introduction", label: "Introduction", icon: "fas fa-book-open" },
    { id: "collection", label: "Information Collection", icon: "fas fa-database" },
    { id: "usage", label: "Usage", icon: "fas fa-chart-line" },
    { id: "security", label: "Data Security", icon: "fas fa-shield-alt" },
    { id: "sharing", label: "Third-party Sharing", icon: "fas fa-share-alt" },
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(id);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element && element.offsetTop <= scrollPosition && element.offsetTop + element.offsetHeight > scrollPosition) {
          setActiveSection(section.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans pb-20">
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
            <span className="text-[10px] font-bold tracking-[0.2em] text-indigo-400 uppercase">Compliance & Trust</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl leading-relaxed mb-8">
            Architecting the future of education requires a foundation of absolute trust. 
            Learn how we safeguard your digital intellectual journey.
          </p>
          <div className="flex flex-wrap gap-6 text-sm font-medium text-slate-500">
            <div className="flex items-center gap-2">
              <i className="far fa-calendar text-indigo-400"></i>
              <span>Effective Date: January 31, {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fas fa-code-branch text-indigo-400"></i>
              <span>Version 4.2.1</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3 lg:sticky lg:top-32 h-fit overflow-x-auto lg:overflow-visible no-scrollbar">
            <p className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase mb-6 hidden lg:block">Contents</p>
            <nav className="flex lg:flex-col gap-2 pb-4 lg:pb-0 min-w-max lg:min-w-0">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium group whitespace-nowrap lg:whitespace-normal ${
                    activeSection === section.id 
                      ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" 
                      : "text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <i className={`${section.icon} w-5 text-center transition-transform group-hover:scale-110`}></i>
                  {section.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-24">
            
            {/* Introduction Section */}
            <section id="introduction" className="scroll-mt-32">
              <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-xl hover:bg-white/[0.04] transition-colors duration-500">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <i className="fas fa-book-open text-indigo-500 text-xl"></i>
                  </div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">Introduction</h2>
                </div>
                <div className="space-y-6 text-slate-400 leading-relaxed text-lg">
                  <p>
                    VirtualCitySchool (&quot;we,&quot; &quot;our,&quot; or &quot;the Platform&quot;) is committed to protecting the privacy and security of 
                    our students, faculty, and institutional partners. This Privacy Policy outlines how we collect, process, and 
                    protect personal data within our next-generation digital campus environment.
                  </p>
                  <p>
                    By accessing the VirtualCitySchool ecosystem, you acknowledge the practices described herein. We treat 
                    your data not merely as information, but as a digital extension of your academic identity.
                  </p>
                </div>
              </div>
            </section>

            {/* Information Collection Section */}
            <section id="collection" className="scroll-mt-32">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <i className="fas fa-database text-blue-500 text-xl"></i>
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Information Collection</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                {/* Visual Accent */}
                <div className="absolute -left-12 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500/50 to-transparent hidden lg:block rounded-full"></div>

                <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all duration-300">
                  <h3 className="text-xl font-bold text-white mb-6">Direct Data</h3>
                  <ul className="space-y-4">
                    {[
                      "Full legal name and academic credentials",
                      "Contact information (Email, Institutional Address)",
                      "Biometric verification for proctored examinations",
                      "Payment details for tuition and fees"
                    ].map((item, i) => (
                      <li key={i} className="flex gap-3 text-slate-400 group">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0 group-hover:scale-150 transition-transform"></span>
                        <span className="text-sm leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all duration-300">
                  <h3 className="text-xl font-bold text-white mb-6">Automated Data</h3>
                  <ul className="space-y-4">
                    {[
                      "IP address and neural-network latency logs",
                      "Interaction patterns within the VR Campus",
                      "Learning progress and &quot;Knowledge Node&quot; mastery levels",
                      "Device hardware specifications"
                    ].map((item, i) => (
                      <li key={i} className="flex gap-3 text-slate-400 group">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0 group-hover:scale-150 transition-transform"></span>
                        <span className="text-sm leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Usage Section */}
            <section id="usage" className="scroll-mt-32">
              <h2 className="text-4xl font-black text-white mb-12 tracking-tight text-center md:text-left">How We Use Your Data</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: "Personalization", desc: "Optimizing individual learning paths through AI-driven curriculum adjustment.", icon: "fas fa-brain", color: "indigo" },
                  { title: "Integrity", desc: "Ensuring academic honesty during assessments through secure digital proctoring.", icon: "fas fa-shield-virus", color: "blue" },
                  { title: "Evolution", desc: "Aggregating anonymized data to improve global pedagogical frameworks.", icon: "fas fa-rocket", color: "orange" }
                ].map((item, i) => (
                  <div key={i} className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all duration-500 text-center group">
                    <div className={`w-14 h-14 rounded-2xl bg-${item.color}-500/10 border border-${item.color}-500/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                      <i className={`${item.icon} text-${item.color}-500 text-xl`}></i>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Security Section */}
            <section id="security" className="scroll-mt-32">
              <div className="p-1 rounded-[1.5rem] bg-white/[0.03] border border-white/5 backdrop-blur-3xl overflow-hidden">
                <div className="p-8 md:p-12 relative">
                  {/* Badge */}
                  {/* <div className="absolute top-12 right-12 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 hidden md:flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                    <span className="text-[10px] font-black tracking-widest text-green-500 uppercase">Military Grade Encryption</span>
                  </div> */}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                      <h2 className="text-4xl font-black text-white mb-8 tracking-tight">Data Security</h2>
                      <p className="text-slate-400 leading-relaxed mb-8 text-lg">
                        We utilize AES-256 bit encryption for data at rest and TLS 1.3 for all data in transit. Our 
                        infrastructure is distributed across decentralized, zero-knowledge proof nodes to ensure that even 
                        in the event of a breach, your personal identifiers remain masked.
                      </p>
                      
                      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-5 max-w-sm">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                          <i className="fas fa-key text-indigo-400 text-lg"></i>
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-white mb-1">Hardware-Level Security</h4>
                          <p className="text-xs text-slate-500 leading-tight">Encrypted TPM modules for all institution-issued devices.</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Security Image */}
                    <div className="relative">
                      <div className="absolute -inset-10 bg-indigo-500/10 blur-[100px] rounded-full opacity-50"></div>
                      <div className="aspect-[4/3] md:aspect-square rounded-3xl border border-white/10 overflow-hidden relative shadow-2xl">
                         <img 
                           src="/assets/security.png" 
                           alt="Data Security" 
                           className="w-full h-full object-cover"
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/40 to-transparent"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Sharing Section */}
            <section id="sharing" className="scroll-mt-32">
              <div className="p-10 rounded-3xl bg-white/[0.02] border border-white/5 relative overflow-hidden">
                <h2 className="text-3xl font-bold text-white mb-6">Third-party Sharing</h2>
                <p className="text-slate-400 mb-12 max-w-2xl leading-relaxed">
                  VirtualCitySchool does not sell, rent, or trade your personal data. Sharing only occurs under the following 
                  strict conditions:
                </p>

                <div className="space-y-8">
                  {[
                    { title: "Accreditation Bodies", desc: "Limited data sharing to verify graduation requirements and degree authenticity.", icon: "fas fa-certificate", color: "blue" },
                    { title: "Service Providers", desc: "Essential cloud infrastructure partners (e.g., AWS, Microsoft) who adhere to strict data processing agreements.", icon: "fas fa-cloud", color: "sky" },
                    { title: "Legal Obligations", desc: "Only when mandated by a court order or enforceable government request.", icon: "fas fa-balance-scale", color: "teal" }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6 items-start group">
                      <div className={`w-12 h-12 rounded-2xl bg-${item.color}-500/10 border border-${item.color}-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                        <i className={`${item.icon} text-${item.color}-500 text-lg`}></i>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                        <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Footer Contact */}
            <div className="p-8 rounded-3xl bg-indigo-600/5 border border-indigo-500/20 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Questions about your data?</h3>
                <p className="text-sm text-slate-400">Our Data Protection Officer is available for direct consultation.</p>
              </div>
              <button className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-indigo-600/20">
                Contact DPO
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
