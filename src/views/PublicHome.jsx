import { useSelector, useDispatch } from 'react-redux';
import { setAuthModal, setView } from '../store/slices/uiSlice';
import { logout } from '../store/slices/authSlice';
import { AppView } from '../types';

const PublicHome = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    dispatch(setView(AppView.PUBLIC_HOME));
  };

  const handleSetView = (view) => dispatch(setView(view));
  const handleSetAuthModal = (modal) => dispatch(setAuthModal(modal));

  const getAvatarUrl = () => {
    if (auth.role === 'teacher') return 'https://i.pravatar.cc/150?u=elena';
    if (auth.role === 'admin') return 'https://i.pravatar.cc/150?u=admin';
    if (auth.role === 'parent') return 'https://i.pravatar.cc/150?u=parent';
    return 'https://i.pravatar.cc/150?u=sarah_j';
  };

  const getRoleLabel = () => {
    switch(auth.role) {
      case 'admin': return 'Administrator';
      case 'teacher': return 'Instructor';
      case 'student': return 'Student';
      case 'parent': return 'Parent';
      default: return '';
    }
  };

  return (
    <section id="public-home" className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30 overflow-x-hidden">
      {/* 1. Aurora Background Tints */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full"></div>
        <div className="absolute top-[20%] right-[5%] w-[40%] h-[40%] bg-teal-600/5 blur-[100px] rounded-full"></div>
      </div>

      {/* 2. Navigation Bar */}
      <nav className="relative z-50 w-full border-b border-white/5 bg-slate-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4 sm:gap-12">
            <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer shrink-0" onClick={() => handleSetView(AppView.PUBLIC_HOME)}>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white shadow-xl shadow-indigo-900/40 group-hover:rotate-12 transition-all">V</div>
              <span className="text-[10px] xs:text-base sm:text-xl font-black font-poppins tracking-tighter whitespace-nowrap">VirtualCitySchool</span>
            </div>
            <div className="hidden lg:flex items-center gap-8">
              <button onClick={() => handleSetView(AppView.MARKETPLACE)} className="text-sm font-bold text-slate-400 hover:text-white transition">Browse Courses</button>
              <button onClick={() => handleSetView(AppView.INSTRUCTORS_DIRECTORY)} className="text-sm font-bold text-slate-400 hover:text-white transition">Find Tutors</button>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-6 shrink-0">
            {!auth.isLoggedIn ? (
              <div id="nav-guest" className="flex items-center gap-3 sm:gap-6">
                <button 
                  onClick={() => handleSetAuthModal('login')}
                  className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition whitespace-nowrap"
                >
                  Login
                </button>
                <button 
                  onClick={() => handleSetAuthModal('register')}
                  className="bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white px-4 sm:px-8 py-2.5 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-indigo-900/30 transition active:scale-95 whitespace-nowrap"
                >
                  Register Now
                </button>
              </div>
            ) : (
              <div id="nav-user" className="flex items-center gap-6 animate-fadeIn">
                <div className="flex items-center gap-4 group cursor-pointer" onClick={() => {
                   if(auth.role === 'student') handleSetView(AppView.STUDENT);
                   if(auth.role === 'teacher') handleSetView(AppView.TEACHER);
                   if(auth.role === 'admin') handleSetView(AppView.ADMIN);
                   if(auth.role === 'parent') handleSetView(AppView.PARENT);
                }}>
                  <div className="text-right">
                    <p className="text-sm font-black font-poppins text-white leading-none mb-1">{auth.username}</p>
                    <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest leading-none">
                      {getRoleLabel()}
                    </p>
                  </div>
                  <img 
                    src={getAvatarUrl()} 
                    className="w-10 h-10 rounded-xl border-2 border-white/10 group-hover:border-indigo-500 transition duration-500 shadow-xl" 
                    alt="User Avatar" 
                  />
                </div>
                <div className="w-px h-8 bg-white/10 mx-2"></div>
                <button 
                  onClick={onLogout}
                  className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-400 transition"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* 3. Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-40 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-indigo-400 mb-8 animate-fadeIn">
          <i className="fas fa-sparkles"></i>
          Next-Gen Learning Experience
        </div>
        <h1 className="text-3xl sm:text-6xl md:text-8xl font-black font-poppins mb-8 leading-[1.1] tracking-tight">
          Master Any Subject, <br className="hidden sm:block" />
          <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-400 via-blue-400 to-teal-400">From Anywhere.</span>
        </h1>
        <p className="text-slate-400 text-lg md:text-2xl mb-14 max-w-3xl mx-auto leading-relaxed font-medium">
          Connect with world-class instructors for high-fidelity Live Classes and On-Demand mastery modules at <span className="text-white font-bold">VirtualCitySchool</span>.
        </p>

        <div className="max-w-3xl mx-auto relative mb-16 group">
          <div className="absolute inset-0 bg-indigo-600/20 blur-2xl group-hover:bg-indigo-600/30 transition duration-500 rounded-full"></div>
          <div className="relative flex flex-col md:flex-row gap-4 p-2 bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-4xl shadow-2xl">
             <div className="flex-1 flex items-center px-6">
                <i className="fas fa-search text-slate-500 mr-4"></i>
                <input 
                  type="text" 
                  placeholder="What do you want to learn today?" 
                  className="w-full bg-transparent outline-none text-white placeholder-slate-600 py-4 font-medium"
                />
             </div>
             <button onClick={() => handleSetView(AppView.MARKETPLACE)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-4xl font-black text-xs uppercase tracking-widest transition shadow-xl shadow-indigo-900/20">
               Search Catalog
             </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <button 
            onClick={() => handleSetView(AppView.MARKETPLACE)}
            className="group flex items-center justify-center gap-3 bg-white text-slate-950 px-6 sm:px-10 py-4 sm:py-5 rounded-4xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all hover:scale-105 shadow-2xl shadow-white/5"
          >
            Explore Course Catalog
            <i className="fas fa-arrow-right group-hover:translate-x-1 transition"></i>
          </button>
          <button 
            onClick={() => handleSetView(AppView.INSTRUCTORS_DIRECTORY)}
            className="group flex items-center justify-center gap-3 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white px-6 sm:px-10 py-4 sm:py-5 rounded-4xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all hover:scale-105"
          >
            Find a Private Tutor
            <i className="fas fa-user-graduate group-hover:rotate-12 transition"></i>
          </button>
        </div>
      </div>

      <section className="relative z-10 max-w-7xl mx-auto px-6 py-32 border-t border-white/5">
        <div className="flex justify-between items-end mb-16">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-4">Discovery</p>
            <h2 className="text-4xl font-black font-poppins">Trending Skills</h2>
          </div>
          <button onClick={() => handleSetView(AppView.MARKETPLACE)} className="text-indigo-400 font-black text-[10px] uppercase tracking-widest hover:text-white transition flex items-center gap-3">
            View all 50+ Courses <i className="fas fa-chevron-right"></i>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { title: 'Python for AI Mastery', instructor: 'Dr. Sarah Miller', category: 'Tech', image: 'https://picsum.photos/seed/pyh/600/400' },
            { title: 'SAT Strategic Math', instructor: 'Prof. Alex Vance', category: 'Test Prep', image: 'https://picsum.photos/seed/satm/600/400' },
            { title: 'Urdu Literature', instructor: 'Mr. Iqbal', category: 'Arts', image: 'https://picsum.photos/seed/urduh/600/400' },
          ].map((course, i) => (
            <div key={i} onClick={() => handleSetView(AppView.MARKETPLACE)} className="bg-slate-900/50 border border-white/10 rounded-[2.5rem] overflow-hidden group cursor-pointer hover:border-indigo-500/50 transition-all shadow-xl flex flex-col">
              <div className="h-56 relative overflow-hidden">
                <img src={course.image} className="w-full h-full object-cover group-hover:scale-110 transition duration-700 opacity-60 group-hover:opacity-100" alt={course.title} />
                <div className="absolute top-6 left-6 px-4 py-1.5 bg-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl">{course.category}</div>
              </div>
              <div className="p-8">
                <h4 className="text-xl font-bold font-poppins mb-2 group-hover:text-indigo-400 transition">{course.title}</h4>
                <p className="text-slate-500 text-sm font-medium">Instructor: {course.instructor}</p>
                <div className="mt-8 flex justify-between items-center border-t border-white/5 pt-6">
                  <span className="text-indigo-400 font-black">$19.99</span>
                  <div className="flex text-yellow-500 text-[10px] gap-0.5">
                    <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Teaser */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center border-t border-white/5 opacity-40">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">&copy; 2025 VirtualCitySchool Ecosystem. All Rights Reserved.</p>
      </footer>
    </section>
  );
};

export default PublicHome;
