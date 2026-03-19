import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const PublicHome = () => {
  const auth = useSelector((state) => state.auth);
  const navigate = useNavigate();

  return (
    <main
      id="public-home"
      className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30 overflow-x-hidden"
    >
      {/* Aurora Background Tints */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full"></div>
        <div className="absolute top-[20%] right-[5%] w-[40%] h-[40%] bg-teal-600/5 blur-[100px] rounded-full"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-40 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-indigo-400 mb-8 animate-fadeIn">
          <i className="fas fa-sparkles"></i>
          Next-Gen Learning Experience
        </div>
        <h1 className="text-3xl sm:text-6xl md:text-8xl font-black font-poppins mb-8 leading-[1.1] tracking-tight">
          Master Any Subject, <br className="hidden sm:block" />
          <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-400 via-blue-400 to-teal-400">
            From Anywhere.
          </span>
        </h1>
        <p className="text-slate-400 text-lg md:text-2xl mb-14 max-w-3xl mx-auto leading-relaxed font-medium">
          Connect with world-class instructors for high-fidelity Live Classes
          and On-Demand mastery modules at{" "}
          <span className="text-white font-bold">VirtualCitySchool</span>.
        </p>

        <div className="max-w-3xl mx-auto relative mb-16 group">
          <div className="absolute inset-0 bg-indigo-600/20 blur-2xl group-hover:bg-indigo-600/30 transition duration-500 rounded-full"></div>
          <form className="relative flex flex-col md:flex-row gap-4 p-2 bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-4xl shadow-2xl">
            <div className="flex-1 flex items-center px-6">
              <i className="fas fa-search text-slate-500 mr-4"></i>
              <input
                type="search"
                placeholder="What do you want to learn today?"
                className="w-full bg-transparent outline-none text-white placeholder-slate-600 py-4 font-medium"
              />
            </div>
            <button
              type="submit"
              onClick={() => navigate("/courses")}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-4xl font-black text-xs uppercase tracking-widest transition shadow-xl shadow-indigo-900/20"
            >
              Search Catalog
            </button>
          </form>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <button
            onClick={() => navigate("/courses")}
            className="group flex items-center justify-center gap-3 bg-white text-slate-950 px-6 sm:px-10 py-4 sm:py-5 rounded-4xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all hover:scale-105 shadow-2xl shadow-white/5"
          >
            Explore Course Catalog
            <i className="fas fa-arrow-right group-hover:translate-x-1 transition"></i>
          </button>
          <button
            onClick={() => navigate("/instructors")}
            className="group flex items-center justify-center gap-3 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white px-6 sm:px-10 py-4 sm:py-5 rounded-4xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all hover:scale-105"
          >
            Find a Private Tutor
            <i className="fas fa-user-graduate group-hover:rotate-12 transition"></i>
          </button>
        </div>
      </section>

      <section className="relative z-10 max-w-7xl mx-auto px-6 py-32 border-t border-white/5">
        <div className="flex justify-between items-end mb-16">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-4">
              Discovery
            </p>
            <h2 className="text-4xl font-black font-poppins">
              Trending Skills
            </h2>
          </div>
          <button
            onClick={() => navigate("/courses")}
            className="text-indigo-400 font-black text-[10px] uppercase tracking-widest hover:text-white transition flex items-center gap-3"
          >
            View all 50+ Courses <i className="fas fa-chevron-right"></i>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              title: "Python for AI Mastery",
              instructor: "Dr. Sarah Miller",
              category: "Tech",
              image: "https://picsum.photos/seed/pyh/600/400",
            },
            {
              title: "SAT Strategic Math",
              instructor: "Prof. Alex Vance",
              category: "Test Prep",
              image: "https://picsum.photos/seed/satm/600/400",
            },
            {
              title: "Urdu Literature",
              instructor: "Mr. Iqbal",
              category: "Arts",
              image: "https://picsum.photos/seed/urduh/600/400",
            },
          ].map((course, i) => (
            <div
              key={i}
              onClick={() => navigate("/courses")}
              className="bg-slate-900/50 border border-white/10 rounded-[2.5rem] overflow-hidden group cursor-pointer hover:border-indigo-500/50 transition-all shadow-xl flex flex-col"
            >
              <div className="h-56 relative overflow-hidden">
                <img
                  src={course.image}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-700 opacity-60 group-hover:opacity-100"
                  alt={course.title}
                />
                <div className="absolute top-6 left-6 px-4 py-1.5 bg-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl">
                  {course.category}
                </div>
              </div>
              <div className="p-8">
                <h4 className="text-xl font-bold font-poppins mb-2 group-hover:text-indigo-400 transition">
                  {course.title}
                </h4>
                <p className="text-slate-500 text-sm font-medium">
                  Instructor: {course.instructor}
                </p>
                <div className="mt-8 flex justify-between items-center border-t border-white/5 pt-6">
                  <span className="text-indigo-400 font-black">$19.99</span>
                  <div className="flex text-yellow-500 text-[10px] gap-0.5">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Teaser */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center border-t border-white/5 opacity-40">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          &copy; {new Date().getFullYear()} VirtualCitySchool Ecosystem. All Rights Reserved.
        </p>
      </footer>
    </main>
  );
};

export default PublicHome;
