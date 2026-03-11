import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, Shield, Copy, PlusCircle, BookOpen, ArrowBigDown, 
  Trash2, ShieldCheck, UserMinus, Scroll, Clock, Megaphone, AlertOctagon 
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

// --- PIXEL ART COMPONENTS ---
const PixelPanel = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`relative bg-[#f4e4bc] border-4 border-[#5d3a1a] p-4 shadow-lg flex flex-col w-full ${className}`}>
    <div className="absolute top-2 left-2 w-2 h-2 bg-[#8b5a2b] border-2 border-[#5d3a1a]"></div>
    <div className="absolute top-2 right-2 w-2 h-2 bg-[#8b5a2b] border-2 border-[#5d3a1a]"></div>
    <div className="absolute bottom-2 left-2 w-2 h-2 bg-[#8b5a2b] border-2 border-[#5d3a1a]"></div>
    <div className="absolute bottom-2 right-2 w-2 h-2 bg-[#8b5a2b] border-2 border-[#5d3a1a]"></div>
    {children}
  </div>
);

const SectionHeader = ({ title, icon: Icon }: { title: string, icon?: any }) => (
  <div className="flex items-center justify-center mb-6">
    <div className="bg-[#f4d0a3] px-8 py-2 border-4 border-[#5d3a1a] shadow-sm transform -rotate-1 flex items-center gap-3">
      {Icon && <Icon size={24} className="text-[#5d3a1a]" />}
      <h2 className="text-3xl font-bold text-[#5d3a1a] uppercase tracking-widest" style={{ fontFamily: "'VT323', monospace" }}>{title}</h2>
    </div>
  </div>
);

// --- 1. STUDENT PROGRESS TRACKER (The Roster) ---
const StudentProgressTracker = ({ guild, onUpdate }: { guild: any, onUpdate: () => void }) => {
  const [report, setReport] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/guilds/${guild._id}/progress-report`);
      setReport(res.data);
      setLoading(false);
    } catch (err) { setLoading(false); }
  };

  useEffect(() => { fetchReport(); }, [guild._id]);

  const handleRemoveStudent = async (studentId: string, username: string) => {
    if (!window.confirm(`Are you sure you want to exile @${username}?`)) return;
    try {
      await axios.post(`${API_URL}/api/guilds/${guild._id}/remove-student`, { studentId });
      alert("Student exiled.");
      fetchReport(); onUpdate(); 
    } catch (err) { alert("Failed to remove student."); }
  };

  if (loading) return <p className="text-center p-10 text-2xl animate-pulse">RETRIEVING ROSTER DATA...</p>;

  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold uppercase text-[#5d3a1a]">Guild Roster & Progress</h2>
        <button onClick={fetchReport} className="bg-[#4a90e2] text-white px-6 py-2 border-4 border-[#3e2723] uppercase font-bold text-lg shadow-[0_4px_0_#214a7a] active:translate-y-1 active:shadow-none">Refresh Data</button>
      </div>
      <div className="overflow-x-auto border-4 border-[#5d3a1a] shadow-xl">
        <table className="w-full text-left bg-[#f4e4bc] font-bold border-collapse">
          <thead className="bg-[#5d3a1a] text-[#f4d0a3] uppercase text-xl">
            <tr>
              <th className="p-4 border-b-4 border-[#3e2723]">Student</th>
              <th className="p-4 border-b-4 border-[#3e2723]">Level</th>
              <th className="p-4 border-b-4 border-[#3e2723]">Quests</th>
              <th className="p-4 border-b-4 border-[#3e2723]">Action</th>
            </tr>
          </thead>
          <tbody className="text-lg">
            {report.filter(s => s._id !== (guild.instructor?._id || guild.instructor)).map((student) => (
              <tr key={student._id} className="border-b-2 border-[#5d3a1a]/20 hover:bg-[#d4a373]/30">
                <td className="p-4 text-[#3e2723]">@{student.username}</td>
                <td className="p-4 text-blue-700">LVL {student.stats?.level || 1}</td>
                <td className="p-4">
                  <span className="bg-[#5d3a1a] text-[#f4d0a3] px-3 py-1 rounded text-sm">
                    {student.completedTasks?.length || 0} CLEARED
                  </span>
                </td>
                <td className="p-4">
                  <button onClick={() => handleRemoveStudent(student._id, student.username)} className="text-red-600 hover:underline flex items-center gap-1">
                    <UserMinus size={14}/> Exile
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- 2. STUDENT HALL VIEW ---
export const StudentHallView = ({ guild, userData, onClose, onEnterChallenge, onRefresh }: any) => {
  const handleLeaveGuild = async () => {
    if (window.confirm(`Exile yourself from ${guild.name}?`)) {
      try {
        await axios.post(`${API_URL}/api/guilds/${guild._id}/leave`);
        onRefresh(); onClose();   
      } catch (err) { alert("Departure failed."); }
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-[#fdf6e3] p-4 md:p-8 flex flex-col items-center overflow-y-auto" style={{ fontFamily: "'VT323', monospace" }}>
      <div className="w-full max-w-4xl flex justify-between items-center mb-6 border-b-8 border-[#5d3a1a] pb-4">
        <div>
          <h1 className="text-5xl font-bold text-[#5d3a1a] uppercase">{guild.name} Hall</h1>
          <p className="text-[#8b5a2b] text-xl font-bold uppercase flex items-center gap-2"><ShieldCheck size={20} /> Master: {guild.instructor?.username}</p>
        </div>
        <div className="flex gap-4">
          <button onClick={handleLeaveGuild} className="bg-orange-700 border-4 border-black px-4 py-2 text-white font-bold uppercase shadow-[0_4px_0_#000] active:translate-y-1"><UserMinus size={20}/> Leave</button>
          <button onClick={onClose} className="bg-red-500 border-4 border-black px-6 py-2 text-white font-bold uppercase shadow-[0_4px_0_#000] active:translate-y-1">Close</button>
        </div>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
        <div className="lg:col-span-1">
          <PixelPanel>
            <h3 className="text-2xl font-bold text-[#5d3a1a] uppercase mb-4 flex items-center gap-2 border-b-2 border-[#5d3a1a]"><Scroll size={24} /> Notice Board</h3>
            <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {guild.announcements?.length > 0 ? guild.announcements.map((ann: any, i: number) => (
                <div key={i} className="bg-[#fff3cd] border-2 border-[#856404] p-3">
                  <p className="text-[#5d3a1a] font-bold text-lg">"{ann.content}"</p>
                  <div className="flex items-center gap-1 text-[10px] text-[#856404] font-bold uppercase"><Clock size={12} /> {new Date(ann.timestamp).toLocaleString()}</div>
                </div>
              )) : <p className="opacity-40 italic">No notices yet...</p>}
            </div>
          </PixelPanel>
        </div>

        <div className="lg:col-span-2 flex flex-col items-center gap-2">
          <SectionHeader title="Guild Bounties" />
          {guild.problems?.map((p: any, idx: number) => {
            const isCleared = userData?.completedTasks?.includes(p.problemId);
            const isLocked = idx > 0 && !userData?.completedTasks?.includes(guild.problems[idx-1].problemId);
            return (
              <div key={idx} className="w-full max-w-md flex flex-col items-center">
                <button 
                  disabled={isLocked}
                  onClick={() => onEnterChallenge(p.problemType === 'custom' ? p.customProblem : p.problemId, p.problemType === 'custom' ? 'custom' : 'standard', isCleared, guild._id)}
                  className={`w-full border-4 border-black p-6 text-white transition-all ${isLocked ? 'bg-gray-500 grayscale' : isCleared ? 'bg-[#4a90e2]' : 'bg-[#76c442]'} shadow-[0_8px_0_#3e2723] active:translate-y-1 active:shadow-none`}
                >
                  <span className="text-3xl font-black uppercase">{isLocked ? 'LOCKED' : p.displayTitle}</span>
                </button>
                {idx < guild.problems.length - 1 && <ArrowBigDown size={32} className="my-2 text-[#5d3a1a]" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- 3. INSTRUCTOR HALL EDITOR (Architect Mode) ---
const GuildHallEditor = ({ guild, onClose, onRefresh }: any) => {
  const [problemPool, setProblemPool] = useState<any[]>([]);
  const [activePath, setActivePath] = useState<any[]>(guild.problems || []);
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [activeTab, setActiveTab] = useState<'roadmap' | 'progress' | 'notices'>('roadmap');
  const [customForm, setCustomForm] = useState({ title: '', description: '', output: '', constraints: '' });
  const [newNotice, setNewNotice] = useState('');
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(true);

  useEffect(() => {
  const loadLibrary = async () => {
    try {
      // We call /api/tasks (which we just fixed in Step 1)
      const res = await axios.get(`${API_URL}/api/tasks`);
      console.log("ARCHITECT DATA:", res.data); // CHECK YOUR BROWSER CONSOLE (F12)
      setProblemPool(res.data);
    } catch (err) { 
      console.error("Library failed", err); 
    } finally { 
      setIsLoadingLibrary(false); 
    }
  };
  loadLibrary();
}, []);

// 2. Updated Render Logic (inside the return)
{['solo', 'daily', 'shop'].map(st => {
  const filtered = problemPool.filter(p => {
    const taskSource = (p.source || 'solo').toLowerCase();
    return taskSource === st;
  });

  return (
    <div key={st} className="mt-4">
      <h3 className="bg-[#5d3a1a] text-[#f4d0a3] p-2 uppercase text-sm font-black flex justify-between items-center">
        <span>{st} Nodes</span>
        <span className="bg-black/20 px-2 rounded-full">{filtered.length}</span>
      </h3>
      <div className="flex flex-col gap-2 mt-2">
        {filtered.length > 0 ? filtered.map(p => (
          <div key={p._id} className="bg-[#fdf6e3] border-2 border-black p-2 flex justify-between items-center shadow-sm">
            <span className="truncate max-w-[150px] font-bold uppercase text-xs">{p.nodeTitle}</span>
            <button onClick={() => addToPath(p, st)} className="bg-[#76c442] border-2 border-black px-2 text-[10px] font-bold text-white uppercase">Add</button>
          </div>
        )) : (
          <p className="text-[10px] italic opacity-40 text-center py-2 border border-dashed border-black/20">Empty Archives</p>
        )}
      </div>
    </div>
  );
})}

  const handlePostNotice = async () => {
    if (!newNotice) return;
    try {
      await axios.post(`${API_URL}/api/guilds/${guild._id}/announcement`, { content: newNotice });
      alert("Notice broadcasted!"); setNewNotice(''); onRefresh();
    } catch (err) { alert("Broadcast failed."); }
  };

  const handleAbolishClass = async () => {
    if (!window.confirm("CRITICAL: Abolish this hall?")) return;
    try {
      await axios.delete(`${API_URL}/api/guilds/${guild._id}`);
      onClose(); onRefresh();
    } catch (err) { alert("Abolish failed."); }
  };

  const addToPath = (item: any, type: string) => {
    const newItem = {
      problemType: type === 'custom' ? 'custom' : 'solo',
      problemId: type !== 'custom' ? item._id : `custom_${Date.now()}`,
      customProblem: type === 'custom' ? { ...item, difficulty: 'Medium' } : null,
      displayTitle: item.nodeTitle || item.title || "New Challenge"
    };
    setActivePath([...activePath, newItem]);
  };

  const savePath = async () => {
    try {
      await axios.put(`${API_URL}/api/guilds/${guild._id}/path`, { problems: activePath });
      alert("Roadmap saved!"); onRefresh();
    } catch (err) { alert("Save failed."); }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-[#fdf6e3] p-8 flex flex-col font-mono" style={{ fontFamily: "'VT323', monospace" }}>
      <div className="flex justify-between items-end mb-6 border-b-8 border-[#5d3a1a] pb-4">
        <div>
          <h1 className="text-5xl font-bold text-[#5d3a1a] uppercase">Grandmaster: {guild.name}</h1>
          <div className="flex gap-2 mt-4">
            {['roadmap', 'progress', 'notices'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-6 py-2 text-xl font-bold border-4 border-black uppercase ${activeTab === tab ? 'bg-[#5d3a1a] text-white' : 'bg-[#d4a373]'}`}>
                {tab === 'roadmap' ? 'Architect' : tab === 'progress' ? 'Roster' : 'Notices'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={handleAbolishClass} className="bg-red-900 text-white px-4 py-2 border-4 border-black flex items-center gap-2"><AlertOctagon size={18}/> Abolish</button>
          <button onClick={savePath} className="bg-[#76c442] text-white px-6 py-2 border-4 border-black font-bold">SAVE PATH</button>
          <button onClick={onClose} className="bg-red-500 text-white px-6 py-2 border-4 border-black font-bold">EXIT</button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'roadmap' ? (
          <div className="flex h-full gap-8">
            <div className="w-96 bg-[#d4a373] p-6 border-4 border-[#5d3a1a] overflow-y-auto">
              <h2 className="text-3xl font-bold uppercase mb-4 flex items-center gap-2"><BookOpen size={24}/> Library</h2>
              <button onClick={() => setIsCreatingCustom(true)} className="w-full bg-[#4a90e2] border-4 border-black p-3 text-white font-bold">+ FORGE CUSTOM</button>
              {isLoadingLibrary ? <p>Loading archives...</p> : ['solo', 'daily', 'shop'].map(st => (
                <div key={st} className="mt-4">
                  <h3 className="bg-black/20 p-1 px-2 uppercase text-sm font-bold">{st} Nodes</h3>
                  {problemPool.filter(p => (p.source || 'solo').toLowerCase() === st).map(p => (
                    <div key={p._id} className="bg-[#fdf6e3] border-2 border-black p-2 mt-2 flex justify-between items-center shadow-sm">
                      <span className="truncate max-w-[150px] font-bold">{p.nodeTitle}</span>
                      <button onClick={() => addToPath(p, st)} className="bg-[#76c442] border-2 border-black px-2 text-xs">ADD</button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="flex-1 border-8 border-dashed border-black/10 p-8 overflow-y-auto flex flex-col items-center gap-4">
              {activePath.map((p, idx) => (
                <div key={idx} className="w-full max-w-sm flex flex-col items-center">
                  <div className="w-full bg-[#fdf6e3] border-4 border-black p-4 flex justify-between items-center shadow-[4px_4px_0_#000]">
                    <span className="font-bold uppercase">{p.displayTitle}</span>
                    <button onClick={() => setActivePath(activePath.filter((_, i) => i !== idx))} className="bg-red-500 text-white p-1 border-2 border-black"><Trash2 size={16}/></button>
                  </div>
                  {idx < activePath.length - 1 && <ArrowBigDown className="opacity-30" />}
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'progress' ? (
          <StudentProgressTracker guild={guild} onUpdate={onRefresh} />
        ) : (
          <div className="max-w-2xl mx-auto flex flex-col gap-6">
            <h2 className="text-4xl font-bold uppercase text-center flex items-center justify-center gap-3"><Megaphone size={32}/> Broadcast Notice</h2>
            <textarea value={newNotice} onChange={e => setNewNotice(e.target.value)} className="w-full h-48 p-4 border-4 border-black text-xl font-bold" placeholder="Write to your students..." />
            <button onClick={handlePostNotice} className="bg-[#76c442] py-4 text-2xl font-black uppercase text-white border-4 border-black flex items-center justify-center gap-2">
              Send Message
            </button>
          </div>
        )}
      </div>

      {isCreatingCustom && (
        <div className="fixed inset-0 z-[250] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#fdf6e3] border-8 border-black p-10 w-full max-w-2xl flex flex-col gap-4">
            <h2 className="text-4xl font-bold uppercase border-b-4 border-black pb-2">Forge Challenge</h2>
            <input placeholder="Title" className="border-4 border-black p-3 font-bold" value={customForm.title} onChange={e => setCustomForm({...customForm, title: e.target.value})} />
            <textarea placeholder="Instruction" className="border-4 border-black p-3 h-32 font-bold" value={customForm.description} onChange={e => setCustomForm({...customForm, description: e.target.value})} />
            <div className="flex gap-4">
              <button onClick={() => { addToPath(customForm, 'custom'); setIsCreatingCustom(false); }} className="flex-1 bg-[#76c442] p-4 font-bold border-4 border-black">FORGE</button>
              <button onClick={() => setIsCreatingCustom(false)} className="flex-1 bg-red-500 p-4 font-bold border-4 border-black">CANCEL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- MAIN GUILDS COMPONENT ---
export const Guilds = ({ userData, onEnterChallenge }: any) => {
  const [guilds, setGuilds] = useState<any[]>([]);
  const [classCode, setClassCode] = useState('');
  const [newGuildName, setNewGuildName] = useState('');
  const [newGuildDesc, setNewGuildDesc] = useState('');
  const [editingHall, setEditingHall] = useState<any>(null);
  const [viewingHall, setViewingHall] = useState<any>(null);
  
  const isInstructor = userData?.role === 'instructor' || userData?.role === 'admin';

  const fetchGuilds = async () => { 
    try { 
      const res = await axios.get(`${API_URL}/api/guilds`); 
      setGuilds(res.data); 
    } catch (err) { console.error(err); } 
  };
  
  useEffect(() => { fetchGuilds(); }, []);

  const handleJoinGuild = async () => {
    try { 
      const res = await axios.post(`${API_URL}/api/guilds/join`, { code: classCode.toUpperCase() }); 
      alert(res.data.message); setClassCode(''); fetchGuilds(); 
    } catch (err: any) { alert(err.response?.data?.message || "Failed to join"); }
  };

  const handleCreateGuild = async () => {
    try { 
      const res = await axios.post(`${API_URL}/api/guilds/create`, { name: newGuildName, description: newGuildDesc }); 
      alert(`Code: ${res.data.joinCode}`); setNewGuildName(''); setNewGuildDesc(''); fetchGuilds(); 
    } catch (err) { alert("Creation failed"); }
  };

  return (
    <div className="h-full flex flex-col pt-4 items-center font-mono">
      {editingHall && <GuildHallEditor guild={editingHall} onClose={() => setEditingHall(null)} onRefresh={fetchGuilds} />}
      {viewingHall && <StudentHallView guild={viewingHall} userData={userData} onClose={() => setViewingHall(null)} onEnterChallenge={onEnterChallenge} onRefresh={fetchGuilds} />}
      
      <div className="w-full max-w-5xl bg-[#fdf6e3] p-8">
        <PixelPanel className="min-h-[500px]">
          <SectionHeader title={isInstructor ? "Establish Guild" : "Join Guild"} icon={PlusCircle} />
          <div className="flex flex-col items-center gap-4 mb-10">
            {isInstructor ? (
              <div className="flex flex-col gap-3 w-full max-w-md">
                <input type="text" value={newGuildName} onChange={e => setNewGuildName(e.target.value)} placeholder="GUILD NAME" className="border-4 border-[#8b5a2b] p-3 text-xl font-bold text-center uppercase" />
                <button onClick={handleCreateGuild} className="bg-[#76c442] border-4 border-[#3e2723] p-4 text-white font-bold uppercase shadow-[0_6px_0_#3e2723] active:translate-y-1">Establish Hall</button>
              </div>
            ) : (
              <div className="flex gap-3">
                <input type="text" value={classCode} onChange={e => setClassCode(e.target.value.toUpperCase())} placeholder="CLASS CODE" className="border-4 border-[#8b5a2b] p-3 text-xl font-bold text-center uppercase" maxLength={6} />
                <button onClick={handleJoinGuild} className="bg-[#76c442] border-4 border-black px-8 text-white font-bold uppercase shadow-[0_4px_0_#000]">Enter Code</button>
              </div>
            )}
          </div>

          <SectionHeader title="Your Active Guilds" icon={Users} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto">
            {guilds.filter(g => {
              const userId = userData?._id?.toString();
              const isMem = g.members?.some((m:any) => (m?._id || m) === userId);
              const isInstr = (g.instructor?._id || g.instructor) === userId;
              return isInstructor ? isInstr : isMem;
            }).map(g => (
              <div key={g._id} className="p-6 border-4 border-black bg-[#e3d5ca] flex flex-col items-center gap-4 shadow-md">
                <Shield size={48} className="text-[#5d3a1a]" />
                <h3 className="text-2xl font-bold uppercase truncate max-w-full">{g.name}</h3>
                {isInstructor && (
                  <div className="bg-[#76c442] px-3 py-1 border-2 border-black font-bold flex items-center gap-2">
                    <span>CODE: {g.joinCode}</span>
                    <button 
                      onClick={() => {navigator.clipboard.writeText(g.joinCode); alert("Copied!");}}
                      className="hover:scale-110"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                )}
                <button 
                  onClick={() => isInstructor ? setEditingHall(g) : setViewingHall(g)} 
                  className="bg-[#5d3a1a] text-[#f4e4bc] px-6 py-2 w-full font-bold uppercase shadow-[0_4px_0_#000] active:translate-y-1 hover:bg-[#3e2723]"
                >
                  Enter Hall
                </button>
              </div>
            ))}
          </div>
        </PixelPanel>
      </div>
    </div>
  );
};