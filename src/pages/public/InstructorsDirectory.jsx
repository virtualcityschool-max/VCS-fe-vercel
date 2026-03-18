import { useNavigate } from "react-router-dom";

const InstructorsDirectory = () => {
  const navigate = useNavigate();
  const teachers = [
    {
      name: "Dr. Samuel Okoro",
      sub: "Physics Master",
      bio: "Ph.D. from Cambridge. 12+ years experience.",
      rat: 4.9,
      img: "samuel_okoro",
    },
    {
      name: "Dr. Sarah Miller",
      sub: "CS Specialist",
      bio: "Former Senior Architect at Google.",
      rat: 4.8,
      img: "sarah_miller",
    },
  ];

  return (
    <section
      id="instructors-view"
      className="min-h-screen bg-slate-950 text-white font-inter"
    >
      <div className="max-w-7xl mx-auto px-6 py-12 sm:py-20 text-center">
        <h1 className="text-4xl sm:text-6xl font-black font-poppins mb-6">
          Find your <span className="text-indigo-500">Mentor</span>.
        </h1>
        <p className="text-slate-400 text-base sm:text-lg mb-12 max-w-2xl mx-auto">
          Connect with verified world-class educators for direct mastery
          modules.
        </p>

        <div className="max-w-3xl mx-auto relative mb-16 sm:mb-20 px-4 sm:px-0">
          <input
            type="text"
            placeholder="Search mentors..."
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-full px-6 sm:px-10 py-4 sm:py-5 text-sm outline-none focus:ring-4 focus:ring-indigo-500/20 shadow-2xl"
          />
          <button className="mt-4 sm:mt-0 sm:absolute sm:right-3 sm:top-3 sm:bottom-3 w-full sm:w-auto bg-indigo-600 px-8 py-3 sm:py-0 rounded-xl sm:rounded-full font-black text-xs uppercase shadow-xl">
            Search
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 text-left">
          {teachers.map((t, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 p-8 sm:p-10 rounded-4xl text-center group hover:border-indigo-500/50 transition-all shadow-2xl"
            >
              <img
                src={`https://i.pravatar.cc/150?u=${t.img}`}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl sm:rounded-[2.5rem] mx-auto mb-6 border-4 border-slate-800 group-hover:scale-105 transition"
              />
              <h3 className="text-2xl font-black mb-1">{t.name}</h3>
              <p className="text-indigo-400 font-bold uppercase tracking-widest text-[10px] mb-4">
                {t.sub}
              </p>
              <p className="text-slate-500 text-sm mb-8 line-clamp-2">
                {t.bio}
              </p>
              <button
                onClick={() => navigate("/teacher/123")}
                className="w-full py-4 bg-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition shadow-lg"
              >
                View Profile
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstructorsDirectory;
