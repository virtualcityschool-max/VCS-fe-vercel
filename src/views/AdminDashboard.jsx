import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setView } from '../store/slices/uiSlice';
import { AppView } from '../types';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const handleSetView = (view) => dispatch(setView(view));
  const [activeTab, setActiveTab] = useState('overview');
  const [activeModal, setActiveModal] = useState(null);
  const [showToast, setShowToast] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const scheduleData = [
    { day: 'Monday', start: 9, end: 11, title: 'Physics 101', teacher: 'Dr. Samuel', color: 'bg-blue-600' },
    { day: 'Monday', start: 13, end: 15, title: 'Calculus', teacher: 'Dr. Okoro', color: 'bg-indigo-600' },
    { day: 'Tuesday', start: 14, end: 15.5, title: 'Urdu Lit', teacher: 'Mr. Iqbal', color: 'bg-emerald-600' },
    { day: 'Wednesday', start: 10, end: 12, title: 'Bio Science', teacher: 'Dr. Sarah', color: 'bg-teal-600' },
    { day: 'Friday', start: 20, end: 22, title: 'AI Ethics', teacher: 'Lab TA', color: 'bg-rose-600' },
  ];

  const triggerToast = (msg) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  const renderScheduler = () => {
    const hours = Array.from({ length: 13 }, (_, i) => i * 2);
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-fadeIn">
        <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">24h VirtualCity Master Scheduler</h3>
          <button onClick={() => setActiveModal('schedule-class')} className="bg-blue-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition">
            + Place New Class
          </button>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <div className="w-[2000px] p-10 relative">
            <div className="flex border-b border-slate-800/50 pb-6 mb-10 sticky left-0 z-20">
              <div className="w-48 shrink-0 text-[10px] font-black uppercase text-slate-600">Timeline</div>
              <div className="flex-1 flex justify-between px-4">
                {hours.map(h => <div key={h} className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{h}:00</div>)}
              </div>
            </div>
            <div className="space-y-6">
              {days.map(day => (
                <div key={day} className="flex items-center h-20 group">
                  <div className="w-48 shrink-0 font-black text-slate-500 uppercase tracking-widest text-xs group-hover:text-white transition sticky left-0 z-10 bg-slate-900 pr-4">{day}</div>
                  <div className="flex-1 h-16 bg-slate-950/50 rounded-2xl relative border border-slate-800/30">
                    {scheduleData.filter(i => i.day === day).map((cls, idx) => (
                      <div key={idx} style={{ left: `${(cls.start/24)*100}%`, width: `${((cls.end-cls.start)/24)*100}%` }} className={`absolute top-2 bottom-2 ${cls.color} rounded-xl p-3 shadow-xl hover:scale-[1.03] transition-transform cursor-pointer overflow-hidden`}>
                        <p className="text-[9px] font-black text-white uppercase truncate">{cls.title}</p>
                        <p className="text-[7px] text-white/60 font-black uppercase truncate">{cls.teacher}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section id="admin-view" className="min-h-screen bg-slate-950 text-white flex font-inter">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-950 border-b border-slate-800 z-100 flex items-center justify-between px-6">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-black text-white text-xs">V</div>
          <span className="text-[10px] sm:text-sm font-black font-poppins tracking-tighter whitespace-nowrap">VirtualCitySchool</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-400 hover:text-white transition">
          <i className={`fas ${isSidebarOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`w-72 bg-slate-950 border-r border-slate-800 flex flex-col fixed h-full z-50 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-10">
          <div className="flex items-center gap-3 mb-16 shrink-0 cursor-pointer" onClick={() => handleSetView(AppView.PUBLIC_HOME)}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white">V</div>
            <span className="text-xl font-black font-poppins tracking-tighter whitespace-nowrap">VirtualCitySchool</span>
          </div>
          <nav className="space-y-2">
            {['overview', 'users', 'academics', 'financials'].map((tab) => (
              <button key={tab} onClick={() => { setActiveTab(tab); setIsSidebarOpen(false); }} className={`w-full text-left px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition ${activeTab === tab ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-0 lg:ml-72 p-6 md:p-12 pt-24 lg:pt-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <h2 className="text-3xl md:text-4xl font-black font-poppins text-white uppercase">{activeTab}</h2>
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
              <i className="far fa-bell"></i>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-black">AD</div>
          </div>
        </header>

        {showToast && (
          <div className="fixed top-10 left-1/2 -translate-x-1/2 z-200 bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl font-bold text-sm animate-slideDown flex items-center gap-4">
            <i className="fas fa-check-circle"></i> {showToast}
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-fadeIn">
            {[
              { label: 'Total Learners', value: '12,842', trend: '+12%', icon: 'fa-users', color: 'text-blue-500' },
              { label: 'Active Sessions', value: '458', trend: 'Live Now', icon: 'fa-broadcast-tower', color: 'text-emerald-500' },
              { label: 'Platform Revenue', value: '$240.5k', trend: '+8.4%', icon: 'fa-wallet', color: 'text-indigo-500' },
              { label: 'System Uptime', value: '99.98%', trend: 'Stable', icon: 'fa-server', color: 'text-purple-500' },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-900/50 border border-slate-800 p-8 rounded-4xl hover:border-slate-700 transition group shadow-xl">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center text-xl ${stat.color} shadow-inner`}>
                    <i className={`fas ${stat.icon}`}></i>
                  </div>
                  <span className="text-[10px] font-black bg-slate-950 px-3 py-1 rounded-full text-slate-500 uppercase tracking-widest">{stat.trend}</span>
                </div>
                <h4 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</h4>
                <p className="text-3xl font-black group-hover:text-indigo-400 transition">{stat.value}</p>
              </div>
            ))}
            <div className="lg:col-span-4 bg-slate-900/50 border border-slate-800 p-10 rounded-[2.5rem] mt-4">
               <div className="flex justify-between items-center mb-10">
                 <div>
                   <h3 className="text-xl font-bold font-poppins">System Performance</h3>
                   <p className="text-slate-500 text-sm">Real-time platform throughput and latency</p>
                 </div>
                 <div className="flex gap-2">
                   <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Node Cluster: Online</span>
                 </div>
               </div>
               <div className="h-48 flex items-end gap-2 px-4">
                 {[40, 70, 45, 90, 65, 80, 50, 95, 75, 85, 60, 100].map((h, i) => (
                   <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-indigo-600/20 rounded-t-lg group relative">
                     <div className="absolute inset-0 bg-indigo-500 rounded-t-lg opacity-0 group-hover:opacity-100 transition duration-300"></div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}
        
        {activeTab === 'academics' && renderScheduler()}
        
        {activeTab === 'users' && (
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl animate-fadeIn">
            <table className="w-full text-left">
              <thead className="bg-slate-950/60 border-b border-slate-800">
                <tr>
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500">Student Identity</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {['Ali Khan', 'Zayn Malik', 'Sarah Ahmed'].map((name, i) => (
                  <tr key={i} className="hover:bg-slate-800/30 transition group">
                    <td className="px-8 py-6 flex items-center gap-4">
                      <img src={`https://i.pravatar.cc/150?u=${i}`} className="w-10 h-10 rounded-xl" />
                      <div><p className="font-bold text-white group-hover:text-indigo-400 transition">{name}</p><p className="text-[9px] text-slate-500 uppercase">#STU-88{i}</p></div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-[8px] font-black uppercase border border-emerald-500/20">Active</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button onClick={() => setActiveModal('assign-course')} className="bg-indigo-600/10 text-indigo-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition">Assign Course</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modals Overlay */}
        {activeModal && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-fadeIn">
              <h3 className="text-2xl font-black font-poppins mb-6">{activeModal === 'assign-course' ? 'Manage Enrollment' : 'Timeline Logic'}</h3>
              <div className="space-y-4">
                 <div>
                   <label className="text-[10px] font-black uppercase text-slate-500 block mb-2">Target Item</label>
                   <select className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white outline-none">
                     <option>Select Option...</option>
                     <option>Physics Honors</option>
                     <option>Computer Science I</option>
                   </select>
                 </div>
                 <div className="flex gap-4 pt-4">
                   <button onClick={() => setActiveModal(null)} className="flex-1 py-4 bg-slate-800 rounded-2xl font-bold">Cancel</button>
                   <button onClick={() => { setActiveModal(null); triggerToast('Success: Transaction Confirmed'); }} className="flex-1 py-4 bg-indigo-600 rounded-2xl font-bold shadow-lg">Confirm</button>
                 </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </section>
  );
};

export default AdminDashboard;
