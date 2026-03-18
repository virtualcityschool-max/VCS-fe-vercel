import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../store/slices/authSlice";

const StudentFeed = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);
  const onLogout = () => {
    dispatch(logoutUser());
  };
  return (
    <section
      id="feed-view"
      className="min-h-screen bg-[#0f172a] text-white font-inter"
    >
      {/* Feed Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar - Mini Profile Card */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-slate-800/50 rounded-4xl overflow-hidden border border-slate-700 shadow-xl">
            <div className="h-24 bg-linear-to-br from-indigo-600 to-blue-700"></div>
            <div className="px-6 pb-8 text-center -mt-12">
              <img
                src="https://i.pravatar.cc/150?u=sarah_j"
                className="w-24 h-24 rounded-4xl border-4 border-[#0f172a] mx-auto mb-4 object-cover shadow-2xl"
              />
              <h3 className="text-xl font-bold font-poppins">
                {auth.username || "Sarah"}
              </h3>
              <p className="text-indigo-400 text-xs font-black uppercase tracking-widest mb-6">
                Student • Grade 12
              </p>

              <div className="flex justify-between border-t border-slate-700/50 pt-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <div className="text-center">
                  <p>Connections</p>
                  <p className="text-white text-lg mt-1">1,204</p>
                </div>
                <div className="w-px h-8 bg-slate-700"></div>
                <div className="text-center">
                  <p>Courses</p>
                  <p className="text-white text-lg mt-1">8</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/30 rounded-4xl p-8 border border-slate-700">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6">
              Shortcuts
            </h4>
            <nav className="space-y-4">
              <button className="w-full flex items-center gap-3 text-sm font-bold text-slate-400 hover:text-white transition">
                <i className="fas fa-users-cog text-indigo-500"></i> My Groups
              </button>
              <button className="w-full flex items-center gap-3 text-sm font-bold text-slate-400 hover:text-white transition">
                <i className="fas fa-calendar-star text-purple-500"></i> School
                Events
              </button>
              <button className="w-full flex items-center gap-3 text-sm font-bold text-slate-400 hover:text-white transition">
                <i className="fas fa-bookmark text-blue-500"></i> Saved
                Resources
              </button>
            </nav>
          </div>
        </div>

        {/* Center Feed - Main Content */}
        <div className="lg:col-span-6 space-y-6">
          {/* Post Input Box */}
          <div className="bg-slate-800/50 rounded-4xl p-6 border border-slate-700 shadow-xl">
            <div className="flex gap-4 items-center">
              <img
                src="https://i.pravatar.cc/150?u=sarah_j"
                className="w-10 h-10 rounded-xl"
              />
              <button className="flex-1 text-left bg-[#0f172a] border border-slate-700 text-slate-500 px-6 py-4 rounded-2xl hover:bg-slate-900 transition text-sm font-medium">
                Share something with your class...
              </button>
            </div>
            <div className="flex justify-between mt-6 px-4 text-slate-500 text-xs font-black uppercase tracking-widest">
              <button className="hover:text-indigo-400 transition flex items-center gap-2">
                <i className="fas fa-image text-indigo-500"></i> Media
              </button>
              <button className="hover:text-purple-400 transition flex items-center gap-2">
                <i className="fas fa-poll-h text-purple-500"></i> Poll
              </button>
              <button className="hover:text-emerald-400 transition flex items-center gap-2">
                <i className="fas fa-file-alt text-emerald-500"></i> Doc
              </button>
            </div>
          </div>

          {/* Post 1: Admin Announcement */}
          <div className="bg-slate-800/50 rounded-4xl border border-slate-700 shadow-xl overflow-hidden animate-fadeIn">
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-500 flex items-center justify-center text-xl">
                  <i className="fas fa-shield-check"></i>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">
                    VirtualCity Admin{" "}
                    <span className="text-emerald-500 text-[10px] ml-2 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      Official
                    </span>
                  </h4>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                    Campus News • 45m ago
                  </p>
                </div>
              </div>
              <button className="text-slate-600 hover:text-white transition">
                <i className="fas fa-ellipsis-h"></i>
              </button>
            </div>
            <div className="px-6 pb-6">
              <h3 className="text-xl font-bold font-poppins mb-4 text-white">
                Mid-Term Exams Schedule Released
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                All departments have finalized their exam dates. Please check
                your personalized dashboard under the 'Academics' tab for your
                specific testing locations and requirements. Good luck to all
                students!
              </p>
              <div className="bg-[#0f172a] border border-slate-700 rounded-2xl p-4 flex items-center justify-between group cursor-pointer hover:border-emerald-500 transition">
                <div className="flex items-center gap-4">
                  <i className="fas fa-file-pdf text-3xl text-rose-500"></i>
                  <div>
                    <p className="text-xs font-bold text-slate-200">
                      Exam_Schedule_Winter_2025.pdf
                    </p>
                    <p className="text-[9px] text-slate-600 uppercase font-black">
                      2.4 MB • PDF Document
                    </p>
                  </div>
                </div>
                <i className="fas fa-download text-slate-600 group-hover:text-emerald-500 transition"></i>
              </div>
            </div>
            <div className="p-4 border-t border-slate-700/50 flex justify-between text-slate-500 text-[10px] font-black uppercase tracking-widest">
              <button className="hover:text-indigo-400 flex items-center gap-2 px-4 py-2">
                <i className="far fa-thumbs-up text-sm"></i> 842 Likes
              </button>
              <button className="hover:text-indigo-400 flex items-center gap-2 px-4 py-2">
                <i className="far fa-comment text-sm"></i> 24 Comments
              </button>
              <button className="hover:text-indigo-400 flex items-center gap-2 px-4 py-2">
                <i className="fas fa-share text-sm"></i> Share
              </button>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-4xl border border-slate-700 shadow-xl overflow-hidden animate-fadeIn">
            <div className="p-6 flex items-center gap-4">
              <img
                src="https://i.pravatar.cc/150?u=samuel_okoro"
                className="w-12 h-12 rounded-xl border border-slate-700"
              />
              <div>
                <h4 className="font-bold text-sm text-white">
                  Dr. Samuel Okoro{" "}
                  <span className="text-blue-500 text-[10px] ml-1">
                    <i className="fas fa-check-circle"></i>
                  </span>
                </h4>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                  Physics Faculty • 2h ago
                </p>
              </div>
            </div>
            <div className="px-6 pb-6">
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Here is a great article on Quantum Mechanics for my physics
                students. This deep dive into superposition will be extremely
                helpful for our upcoming lab session. Make sure to read the
                section on Schrödinger's equations!
              </p>
              <div className="rounded-3xl overflow-hidden border border-slate-700 relative group cursor-pointer">
                <img
                  src="https://picsum.photos/seed/quantum/800/400"
                  className="w-full h-56 object-cover opacity-60 group-hover:opacity-100 transition duration-700"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-950 to-transparent"></div>
                <div className="absolute bottom-6 left-6 pr-6">
                  <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-1">
                    External Resource • Nature.com
                  </p>
                  <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition">
                    The Future of Quantum Computing: 2026 and Beyond
                  </h4>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-700/50 flex justify-between text-slate-500 text-[10px] font-black uppercase tracking-widest">
              <button className="hover:text-indigo-400 flex items-center gap-2 px-4 py-2">
                <i className="far fa-thumbs-up text-sm"></i> 124
              </button>
              <button className="hover:text-indigo-400 flex items-center gap-2 px-4 py-2">
                <i className="far fa-comment text-sm"></i> 15
              </button>
              <button className="hover:text-indigo-400 flex items-center gap-2 px-4 py-2">
                <i className="fas fa-share text-sm"></i> Share
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Trends & Following */}
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-slate-800/30 rounded-4xl p-8 border border-slate-700 shadow-xl">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-8">
              Trending Topics
            </h4>
            <div className="space-y-6">
              {[
                { tag: "#Exams2025", count: "2.4k" },
                { tag: "#PythonCoding", count: "1.8k" },
                { tag: "#QuantumLeap", count: "942" },
                { tag: "#OLevelSupport", count: "523" },
                { tag: "#ArtHistory", count: "312" },
              ].map((trend, i) => (
                <div key={i} className="group cursor-pointer">
                  <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition mb-1">
                    {trend.tag}
                  </p>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                    {trend.count} Students
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/30 rounded-4xl p-8 border border-slate-700 shadow-xl">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-8">
              Who to Follow
            </h4>
            <div className="space-y-6">
              {[
                {
                  name: "Dr. Sarah Miller",
                  role: "CS Lead",
                  img: "sarah_miller",
                },
                { name: "Elena Petrova", role: "Physics TA", img: "elena" },
                {
                  name: "Prof. Alex Vance",
                  role: "Math Specialist",
                  img: "vance",
                },
              ].map((user, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://i.pravatar.cc/150?u=${user.img}`}
                      className="w-10 h-10 rounded-xl border border-slate-700"
                    />
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-indigo-400 transition">
                        {user.name}
                      </p>
                      <p className="text-[9px] text-slate-500 uppercase font-black">
                        {user.role}
                      </p>
                    </div>
                  </div>
                  <button className="w-8 h-8 rounded-lg border border-slate-700 flex items-center justify-center text-slate-500 hover:text-white hover:bg-indigo-600 hover:border-indigo-600 transition">
                    <i className="fas fa-plus text-[10px]"></i>
                  </button>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-3 bg-slate-900 border border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition">
              Find Connections
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StudentFeed;
