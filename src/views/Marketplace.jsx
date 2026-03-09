import { useDispatch } from 'react-redux';
import { setView } from '../store/slices/uiSlice';
import { AppView } from '../types';

const Marketplace = () => {
  const dispatch = useDispatch();
  const handleSetView = (view) => dispatch(setView(view));
  const courses = [
    { 
      title: 'Complete Python Bootcamp 2026', 
      instructor: 'Dr. Sarah Miller', 
      instructorImg: 'https://i.pravatar.cc/150?u=sarah_miller',
      price: 19.99, 
      oldPrice: 89.99,
      duration: '24h Total', 
      rating: 4.8, 
      reviews: '1.2k', 
      image: 'https://picsum.photos/seed/python_course/800/450',
      badge: 'Bestseller',
      category: 'CS'
    },
    { 
      title: 'Advanced Calculus & Analytical Geometry', 
      instructor: 'Dr. Samuel Okoro', 
      instructorImg: 'https://i.pravatar.cc/150?u=samuel_okoro',
      price: 24.99, 
      oldPrice: 99.99,
      duration: '32h Total', 
      rating: 4.9, 
      reviews: '850', 
      image: 'https://picsum.photos/seed/calc_course/800/450',
      badge: 'Top Rated',
      category: 'Math'
    },
    { 
      title: 'Digital Art Masterclass: Procreate to PS', 
      instructor: 'Elena Graphics', 
      instructorImg: 'https://i.pravatar.cc/150?u=elena',
      price: 29.99, 
      oldPrice: 120.00,
      duration: '15h Total', 
      rating: 4.7, 
      reviews: '2.1k', 
      image: 'https://picsum.photos/seed/art_course/800/450',
      badge: 'Popular',
      category: 'Arts'
    },
    { 
      title: 'Urdu Poetry & Classical Literature', 
      instructor: 'Mr. Iqbal', 
      instructorImg: 'https://i.pravatar.cc/150?u=iqbal',
      price: 14.99, 
      oldPrice: 45.00,
      duration: '18h Total', 
      rating: 5.0, 
      reviews: '420', 
      image: 'https://picsum.photos/seed/urdu_course/800/450',
      badge: 'New',
      category: 'Language'
    },
    { 
      title: 'SAT Math Prep: Targeted Strategy', 
      instructor: 'Prof. Alex Vance', 
      instructorImg: 'https://i.pravatar.cc/150?u=vance',
      price: 19.99, 
      oldPrice: 59.99,
      duration: '12h Total', 
      rating: 4.6, 
      reviews: '900', 
      image: 'https://picsum.photos/seed/sat_course/800/450',
      badge: 'Bestseller',
      category: 'Test Prep'
    },
    { 
      title: 'Introduction to AI & Machine Learning', 
      instructor: 'Dr. Sarah Miller', 
      instructorImg: 'https://i.pravatar.cc/150?u=sarah_miller',
      price: 34.99, 
      oldPrice: 149.99,
      duration: '40h Total', 
      rating: 4.9, 
      reviews: '3.4k', 
      image: 'https://picsum.photos/seed/ai_course/800/450',
      badge: 'New',
      category: 'Tech'
    }
  ];

  return (
    <section id="classes-view" className="min-h-screen bg-[#0f172a] text-white font-inter">
      {/* 1. Global Navigation Bar */}
      <nav className="w-full bg-[#0f172a] border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-4 sm:gap-10 overflow-hidden">
            <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer shrink-0" onClick={() => handleSetView(AppView.PUBLIC_HOME)}>
              <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-black text-white group-hover:rotate-12 transition">V</div>
              <span className="text-[10px] sm:text-sm font-black font-poppins text-white tracking-tight whitespace-nowrap">VirtualCitySchool</span>
            </div>
            <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto custom-scrollbar whitespace-nowrap py-2 no-scrollbar">
              <button 
                onClick={() => handleSetView(AppView.PUBLIC_HOME)}
                className="text-slate-400 font-medium text-xs sm:text-sm hover:text-white transition cursor-pointer"
              >
                Home
              </button>
              <button 
                onClick={() => handleSetView(AppView.FEED)}
                className="text-slate-400 font-medium text-xs sm:text-sm hover:text-white transition cursor-pointer"
              >
                Feed
              </button>
              <button 
                onClick={() => handleSetView(AppView.STUDENT)}
                className="text-slate-400 font-medium text-xs sm:text-sm hover:text-white transition cursor-pointer"
              >
                Dashboard
              </button>
              <button 
                onClick={() => handleSetView(AppView.INSTRUCTORS_DIRECTORY)}
                className="text-slate-400 font-medium text-xs sm:text-sm hover:text-white transition cursor-pointer"
              >
                Instructors
              </button>
              <button 
                className="bg-slate-800 text-white px-3 sm:px-4 py-1.5 rounded-lg font-medium text-xs sm:text-sm cursor-default"
              >
                Catalog
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-5 shrink-0 ml-4">
            <button className="relative text-slate-400 hover:text-white transition text-base sm:text-lg"><i className="far fa-bell"></i></button>
            <img src="https://i.pravatar.cc/150?u=sarah_j" className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-700 shadow-md" alt="Sarah" />
          </div>
        </div>
      </nav>

      {/* Hero Search Section */}
      <div className="relative overflow-hidden bg-linear-to-r from-blue-900/30 via-[#0f172a] to-purple-900/30 border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 py-28 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-black font-poppins mb-6 leading-tight tracking-tight">
            Expand your <span className="text-blue-500">potential</span>.
          </h1>
          <p className="text-slate-400 text-lg mb-14 max-w-2xl mx-auto font-medium">
            Unlock your future with industry-leading courses designed for the ambitious <span className="text-white">VirtualCity</span> student.
          </p>
          <div className="max-w-3xl mx-auto relative mb-10 group px-4 sm:px-0">
            <i className="fas fa-search absolute left-12 sm:left-8 top-1/2 -translate-y-1/2 text-slate-500 text-lg sm:text-xl"></i>
            <input 
              type="text" 
              placeholder="Search topics..." 
              className="w-full bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-3xl sm:rounded-[2.5rem] pl-16 sm:pl-20 pr-10 sm:pr-44 py-5 sm:py-7 focus:ring-4 focus:ring-blue-500/20 outline-none text-sm sm:text-base transition-all group-hover:bg-slate-800 shadow-2xl"
            />
            <button className="mt-4 sm:mt-0 sm:absolute sm:right-3 sm:top-3 sm:bottom-3 w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 sm:px-12 py-4 sm:py-0 rounded-2xl sm:rounded-4xl font-bold text-sm transition active:scale-95 shadow-xl shadow-blue-600/30">
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-col lg:flex-row gap-16">
          <aside className="lg:w-80 shrink-0 space-y-12">
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-8 flex items-center justify-between cursor-pointer group">Category</h3>
              <ul className="space-y-5">
                {['STEM', 'Languages', 'Arts & Design', 'Humanities', 'Test Prep'].map(cat => (
                  <li key={cat}>
                    <label className="flex items-center gap-4 cursor-pointer group">
                      <div className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 group-hover:border-blue-500 transition shadow-inner"></div>
                      <span className="text-sm text-slate-400 group-hover:text-slate-100 transition font-medium">{cat}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <main className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
              {courses.map((course, idx) => (
                <div key={idx} className="bg-slate-800/50 backdrop-blur-md rounded-[2.5rem] overflow-hidden border border-slate-700/50 shadow-2xl group hover:border-blue-500/40 transition-all flex flex-col">
                  <div className="relative aspect-video overflow-hidden">
                    <img src={course.image} className="w-full h-full object-cover group-hover:scale-110 transition duration-700 opacity-80 group-hover:opacity-100" alt={course.title} />
                  </div>
                  <div className="p-8 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold font-poppins mb-4 leading-tight group-hover:text-blue-400 transition cursor-pointer min-h-12">{course.title}</h3>
                    <div className="flex items-center gap-4 mb-8">
                      <img src={course.instructorImg} className="w-9 h-9 rounded-full border border-slate-700 shadow-md" alt={course.instructor} />
                      <span className="text-xs text-slate-400 font-bold group-hover:text-slate-200 transition">{course.instructor}</span>
                    </div>
                    <button className="w-full mt-auto py-4 bg-slate-900 border border-blue-600/30 text-blue-500 font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-600 hover:text-white transition-all active:scale-95">Enroll Now</button>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </section>
  );
};

export default Marketplace;
