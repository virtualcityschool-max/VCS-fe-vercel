import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const TermsAndConditions = () => {
  const [activeSection, setActiveSection] = useState("eligibility");
  const navigate = useNavigate();

  const sections = [
    { id: "eligibility", label: "User Eligibility", icon: "fas fa-user-check" },
    { id: "enrollment", label: "Course Enrollment", icon: "fas fa-graduation-cap" },
    { id: "intellectual", label: "Intellectual Property", icon: "fas fa-copyright" },
    { id: "liability", label: "Limitation of Liability", icon: "fas fa-exclamation-triangle" },
    { id: "governing", label: "Governing Law", icon: "fas fa-balance-scale" },
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
      {/* Header Space for Navbar */}
      <div className="h-20"></div>

      <div className="max-w-7xl mx-auto px-6 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3 lg:sticky lg:top-32 h-fit overflow-x-auto lg:overflow-visible no-scrollbar">
            <h3 className="text-lg font-bold text-white mb-6 hidden lg:block tracking-tight">Legal Overview</h3>
            <nav className="flex lg:flex-col gap-1 pb-4 lg:pb-0 min-w-max lg:min-w-0">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium group whitespace-nowrap lg:whitespace-normal relative ${
                    activeSection === section.id 
                      ? "text-indigo-400 bg-indigo-600/5" 
                      : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                  }`}
                >
                  {activeSection === section.id && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-indigo-500 rounded-full hidden lg:block"></div>
                  )}
                  {section.label}
                </button>
              ))}
            </nav>

            {/* Last Updated Box */}
            <div className="mt-8 p-6 rounded-2xl bg-white/[0.02] border border-white/5 hidden lg:block">
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">Last Updated</p>
              <p className="text-sm text-slate-400 font-medium">January 31, {new Date().getFullYear()}</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
                Terms and Conditions
              </h1>
              <p className="text-lg text-slate-400 leading-relaxed max-w-3xl">
                Welcome to VirtualCitySchool. These terms govern your use of our digital campus and 
                educational services. By accessing our platform, you agree to be bound by these provisions.
              </p>
            </div>

            {/* Sections */}
            <div className="space-y-8">
              
              {/* 1. User Eligibility */}
              <section id="eligibility" className="scroll-mt-32">
                <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all duration-500 group">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <i className="fas fa-user-check text-indigo-400 text-sm"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">1. User Eligibility</h2>
                  </div>
                  <div className="space-y-4 text-slate-400 leading-relaxed">
                    <p>
                      To access the VirtualCitySchool platform, you must be at least 13 years of age. Users under the age of 18 must 
                      have parental or legal guardian consent to enroll in courses or participate in campus activities.
                    </p>
                    <p>
                      By creating an account, you represent and warrant that all information provided is accurate and that you are 
                      not prohibited by any law or previous suspension from accessing educational services.
                    </p>
                  </div>
                </div>
              </section>

              {/* 2. Course Enrollment */}
              <section id="enrollment" className="scroll-mt-32">
                <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all duration-500 group">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <i className="fas fa-graduation-cap text-blue-400 text-sm"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">2. Course Enrollment</h2>
                  </div>
                  <div className="space-y-4 text-slate-400 leading-relaxed">
                    <p>
                      Enrollment in courses is subject to availability and the fulfillment of prerequisites as defined by the Faculty. We 
                      reserve the right to modify course content or schedule at any time to maintain academic excellence.
                    </p>
                    <ul className="space-y-3 mt-4">
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
                        <span className="text-sm">Payment of fees must be completed prior to the start of the curriculum.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
                        <span className="text-sm">Refunds are processed according to our Academic Refund Policy within the first 14 days of enrollment.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
                        <span className="text-sm">Students are expected to adhere to the VirtualCitySchool Code of Conduct.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 3. Intellectual Property */}
              <section id="intellectual" className="scroll-mt-32">
                <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all duration-500 group">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <i className="fas fa-copyright text-cyan-400 text-sm"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">3. Intellectual Property</h2>
                  </div>
                  <div className="space-y-4 text-slate-400 leading-relaxed">
                    <p>
                      All materials provided on the platform, including but not limited to text, graphics, logos, video lectures, and 
                      software, are the property of VirtualCitySchool or its content providers and are protected by international 
                      copyright laws.
                    </p>
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 italic text-sm text-indigo-300/80">
                      &quot;Users are granted a limited, non-exclusive license to view and interact with content for personal educational purposes 
                      only.&quot;
                    </div>
                  </div>
                </div>
              </section>

              {/* 4. Limitation of Liability */}
              <section id="liability" className="scroll-mt-32">
                <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all duration-500 group">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <i className="fas fa-exclamation-triangle text-red-400 text-sm"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">4. Limitation of Liability</h2>
                  </div>
                  <div className="space-y-4 text-slate-400 leading-relaxed">
                    <p>
                      VirtualCitySchool provides its services &quot;as is&quot; without any warranty. We are not liable for any indirect, 
                      incidental, or consequential damages arising from your use of the platform or inability to access services due 
                      to technical issues beyond our control.
                    </p>
                  </div>
                </div>
              </section>

              {/* 5. Governing Law */}
              <section id="governing" className="scroll-mt-32">
                <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all duration-500 group">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <i className="fas fa-balance-scale text-teal-400 text-sm"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">5. Governing Law</h2>
                  </div>
                  <div className="space-y-4 text-slate-400 leading-relaxed">
                    <p>
                      These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which 
                      VirtualCitySchool is incorporated, without regard to its conflict of law provisions. Any legal action or 
                      proceeding related to your access to the platform shall be instituted in a state or federal court in the 
                      designated jurisdiction.
                    </p>
                  </div>
                </div>
              </section>

            </div>

            {/* Support CTA */}
            <div className="p-8 rounded-[2rem] bg-indigo-600/5 border border-indigo-500/10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Have questions about our terms?</h3>
                <p className="text-sm text-slate-500">Our legal team is here to clarify any concerns you might have.</p>
              </div>
              {/* <button className="px-8 py-3 rounded-full border border-indigo-500/30 text-indigo-400 font-bold hover:bg-indigo-500/10 transition-all">
                Contact Legal Support
              </button> */}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
