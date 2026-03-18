
import React from 'react';

const CommunityFeed = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Sidebar */}
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-slate-800 rounded-2xl overflow-hidden glass border border-slate-700">
          <div className="h-20 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
          <div className="px-6 pb-6 text-center">
            <img src="https://i.pravatar.cc/150?u=me" className="w-20 h-20 rounded-full border-4 border-slate-800 -mt-10 mx-auto mb-4" />
            <h3 className="text-lg font-bold">Alex Johnson</h3>
            <p className="text-slate-400 text-xs mb-4">Senior Student, UI/UX Design</p>
            <div className="flex justify-between border-t border-slate-700 pt-4 text-xs font-semibold">
              <div className="text-left">
                <p className="text-slate-500">Connections</p>
                <p className="text-indigo-400">1,204</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500">Courses</p>
                <p className="text-indigo-400">8</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 glass border border-slate-700">
          <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-slate-500">Navigation</h4>
          <nav className="space-y-4">
            <a href="#" className="flex items-center gap-3 text-indigo-400 font-medium"><i className="fas fa-home"></i> Feed</a>
            <a href="#" className="flex items-center gap-3 text-slate-400 hover:text-white transition"><i className="fas fa-bookmark"></i> Saved Items</a>
            <a href="#" className="flex items-center gap-3 text-slate-400 hover:text-white transition"><i className="fas fa-users"></i> Study Groups</a>
            <a href="#" className="flex items-center gap-3 text-slate-400 hover:text-white transition"><i className="fas fa-calendar"></i> Events</a>
          </nav>
        </div>
      </div>

      {/* Main Feed */}
      <div className="lg:col-span-6 space-y-6">
        <div className="bg-slate-800 rounded-2xl p-4 glass border border-slate-700">
          <div className="flex gap-4 items-center">
            <img src="https://i.pravatar.cc/150?u=me" className="w-10 h-10 rounded-full" />
            <button className="flex-1 text-left bg-slate-900 border border-slate-700 text-slate-500 px-4 py-3 rounded-full hover:bg-slate-700 transition">
              Share a resource or update...
            </button>
          </div>
          <div className="flex justify-between mt-4 px-4 text-slate-400 text-sm font-medium">
            <button className="hover:text-indigo-400"><i className="fas fa-image mr-2 text-indigo-500"></i> Photo</button>
            <button className="hover:text-indigo-400"><i className="fas fa-video mr-2 text-purple-500"></i> Video</button>
            <button className="hover:text-indigo-400"><i className="fas fa-calendar mr-2 text-orange-500"></i> Event</button>
            <button className="hover:text-indigo-400"><i className="fas fa-newspaper mr-2 text-blue-500"></i> Article</button>
          </div>
        </div>

        {[1, 2, 3].map(i => (
          <div key={i} className="bg-slate-800 rounded-2xl glass border border-slate-700 overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={`https://i.pravatar.cc/150?u=user${i}`} className="w-12 h-12 rounded-full" />
                <div>
                  <h4 className="font-bold text-sm">Dr. Sarah Miller <span className="text-slate-500 font-normal">posted an assignment</span></h4>
                  <p className="text-xs text-slate-500">Computer Science Dept • 2h ago</p>
                </div>
              </div>
              <button className="text-slate-500"><i className="fas fa-ellipsis-h"></i></button>
            </div>
            <div className="px-4 pb-4">
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                Excited to announce the new "Quantum Computing 101" module is now live! Check the marketplace for early enrollment. First 50 students get a special badge!
              </p>
              <img src={`https://picsum.photos/seed/post${i}/800/400`} className="rounded-xl w-full" />
            </div>
            <div className="p-4 border-t border-slate-700 flex justify-between text-slate-400 text-sm font-medium">
              <button className="hover:text-indigo-400 flex items-center gap-2"><i className="far fa-thumbs-up"></i> 124</button>
              <button className="hover:text-indigo-400 flex items-center gap-2"><i className="far fa-comment"></i> 43</button>
              <button className="hover:text-indigo-400 flex items-center gap-2"><i className="fas fa-share"></i> Share</button>
              <button className="hover:text-indigo-400 flex items-center gap-2"><i className="far fa-paper-plane"></i> Send</button>
            </div>
          </div>
        ))}
      </div>

      {/* Right Sidebar */}
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-slate-800 rounded-2xl p-6 glass border border-slate-700">
          <h4 className="font-bold text-sm mb-4">Who's Online</h4>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-3">
                <div className="relative">
                  <img src={`https://i.pravatar.cc/150?u=online${i}`} className="w-8 h-8 rounded-full" />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-800 rounded-full"></div>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold">Student Name {i}</p>
                  <p className="text-[10px] text-slate-500">Studying Math...</p>
                </div>
                <button className="text-indigo-400 text-xs"><i className="far fa-comment-dots"></i></button>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 border border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-700 transition">View All</button>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 glass border border-slate-700">
          <h4 className="font-bold text-sm mb-4">Upcoming Micro-Courses</h4>
          <div className="space-y-4">
            <div className="group cursor-pointer">
              <p className="text-xs font-bold group-hover:text-indigo-400"># Python Data Viz</p>
              <p className="text-[10px] text-slate-500">432 students interested</p>
            </div>
            <div className="group cursor-pointer">
              <p className="text-xs font-bold group-hover:text-indigo-400"># AR/VR Design</p>
              <p className="text-[10px] text-slate-500">1.2k students interested</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityFeed;
