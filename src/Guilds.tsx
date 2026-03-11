import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Shield, Copy, PlusCircle, BookOpen, ArrowBigDown, Trash2, PenTool } from 'lucide-react';



// --- Reusable Pixel Components ---
const PixelPanel = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`relative bg-[#f4e4bc] border-4 border-[#5d3a1a] p-4 shadow-lg flex flex-col w-full ${className}`}>
    <div className="absolute top-2 left-2 w-2 h-2 bg-[#8b5a2b] border-2 border-[#5d3a1a]"></div>
    <div className="absolute top-2 right-2 w-2 h-2 bg-[#8b5a2b] border-2 border-[#5d3a1a]"></div>
    <div className="absolute bottom-2 left-2 w-2 h-2 bg-[#8b5a2b] border-2 border-[#5d3a1a]"></div>
    <div className="absolute bottom-2 right-2 w-2 h-2 bg-[#8b5a2b] border-2 border-[#5d3a1a]"></div>
    {children}
  </div>
);

const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center mb-6">
    <div className="bg-[#f4d0a3] px-8 py-2 border-4 border-[#5d3a1a] shadow-sm transform -rotate-1">
      <h2 className="text-3xl font-bold text-[#5d3a1a] uppercase tracking-widest" style={{ fontFamily: "'VT323', monospace" }}>{title}</h2>
    </div>
  </div>
);

// --- Student View Component ---
const StudentHallView = ({ guild, userData, onClose, onEnterChallenge }: { 
  guild: any, 
  userData: any,
  onClose: () => void,
  onEnterChallenge: (data: any, type: 'standard' | 'custom', isRepeat: boolean) => void 
}) => {
  return (
    <div className="fixed inset-0 z-[150] bg-[#fdf6e3] p-8 flex flex-col items-center overflow-y-auto font-mono" style={{ fontFamily: "'VT323', monospace" }}>
      <div className="w-full max-w-4xl flex justify-between items-center mb-10 border-b-8 border-[#5d3a1a] pb-4">
        <h1 className="text-5xl font-bold text-[#5d3a1a] uppercase">{guild.name} Hall</h1>
        <button onClick={onClose} className="bg-red-500 border-4 border-black px-6 py-2 text-white font-bold text-2xl uppercase shadow-[0_4px_0_#000] active:translate-y-1 active:shadow-none">Close</button>
      </div>

      <div className="flex flex-col items-center gap-2 w-full max-w-md pb-20">
        {(!guild.problems || guild.problems.length === 0) ? (
          <p className="text-3xl italic opacity-50 text-center mt-20">The Guild Master has not forged any challenges yet...</p>
        ) : (
          guild.problems.map((p: any, idx: number) => {
            // 1. Bulletproof Title logic 
            const challengeTitle = p.displayTitle || p.nodeTitle || p.customProblem?.title || "Quest";

            // 2. Progression Logic: Is the current node cleared?
            // We check the user's progress for the problemId
            const isCleared = userData?.completedTasks?.includes(p.problemId);

            // 3. Locking Logic: Node is locked if it's NOT the first node AND the previous one isn't cleared
            // This forces order-by-order play
            const isLocked = idx > 0 && !userData?.completedTasks?.includes(guild.problems[idx-1].problemId);

            return (
              <div key={idx} className="flex flex-col items-center w-full">
                <button 
                  disabled={isLocked}
                  className={`w-full border-4 border-[#3e2723] p-8 text-white relative transition-all 
                    ${isLocked 
                      ? 'bg-gray-500 grayscale opacity-50 cursor-not-allowed shadow-none' 
                      : isCleared 
                        ? 'bg-[#4a90e2] shadow-[0_8px_0_#214a7a] hover:translate-y-1 hover:shadow-[0_4px_0_#214a7a]' // Blue for cleared
                        : 'bg-[#76c442] shadow-[0_8px_0_#3e2723] hover:translate-y-1 hover:shadow-[0_4px_0_#3e2723]' // Green for active
                    }`}
                  onClick={() => {
                    const targetData = p.problemType === 'custom' ? p.customProblem : p.problemId;
                    // We pass 'isCleared' as a third argument so the IDE knows NOT to give rewards
                    onEnterChallenge(targetData, p.problemType === 'custom' ? 'custom' : 'standard', isCleared);
                  }}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs uppercase bg-black/20 px-2 py-0.5 font-bold">
                      {isLocked ? 'Locked' : isCleared ? 'Cleared' : (p.source || 'Quest')}
                    </span>
                    <span className="text-4xl font-black uppercase text-center leading-tight">
                      {isLocked ? '???' : challengeTitle}
                    </span>
                    {isCleared && <span className="absolute top-2 right-2 text-2xl">✅</span>}
                  </div>
                </button>

                {idx < guild.problems.length - 1 && (
                  <div className="flex flex-col items-center my-2">
                    <div className="w-2 h-10 bg-[#5d3a1a]"></div>
                    <ArrowBigDown size={32} className={`text-[#5d3a1a] -mt-2 ${isLocked ? 'opacity-20' : 'animate-bounce'}`} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// --- Instructor Hall Editor Component ---
const GuildHallEditor = ({ guild, onClose, onRefresh }: { 
  guild: any, 
  onClose: () => void, 
  onRefresh: () => void 
}) => {
  const [problemPool, setProblemPool] = useState<any[]>([]);
  const [activePath, setActivePath] = useState<any[]>(guild.problems || []);
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customForm, setCustomForm] = useState({ 
    title: '', 
    description: '', 
    output: '', 
    constraints: '' 
  });

  // Load the library from the TaskPool
  useEffect(() => {
    axios.get('http://localhost:5000/api/problems')
      .then(res => setProblemPool(res.data))
      .catch(err => console.error("Library load failed", err));
  }, []);

const addToPath = (item: any, type: 'solo' | 'custom' | 'daily' | 'shop') => {
  // We explicitly create the displayTitle HERE so it's never undefined
  const newItem = {
    problemType: type === 'custom' ? 'custom' : 'solo',
    source: item.source || type, 
    problemId: type !== 'custom' ? item._id : null,
    customProblem: type === 'custom' ? { ...item, difficulty: 'Medium' } : null,
    // FORCE CAPTURE: Look at every possible name field in the library item
    displayTitle: item.nodeTitle || item.title || "New Challenge" 
  };
  console.log("Adding to path with title:", newItem.displayTitle); // Check console!
  setActivePath([...activePath, newItem]);
};

const savePath = async () => {
  if (!activePath.length) return alert("Roadmap cannot be empty!");
  
  try {
    const pathWithTitles = activePath.map((p, index) => ({
      ...p,
      order: index,
      // DOUBLE CHECK: If for some reason it's missing, grab it from the problem object
      displayTitle: p.displayTitle || p.nodeTitle || p.customProblem?.title || "Untitled Quest"
    }));

    console.log("SAVING PATH TO DB:", pathWithTitles);

    await axios.put(`http://localhost:5000/api/guilds/${guild._id}/path`, { 
      problems: pathWithTitles 
    });

    alert("Roadmap Forged Successfully!");
    onRefresh(); 
  } catch (err) {
    alert("Failed to save. Check terminal for DB errors.");
  }
};

  return (
    <div className="fixed inset-0 z-[150] bg-[#fdf6e3] p-8 flex flex-col font-mono" style={{ fontFamily: "'VT323', monospace" }}>
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-6 border-b-4 border-[#5d3a1a] pb-4">
        <h1 className="text-5xl font-bold text-[#5d3a1a] uppercase tracking-tighter">
          GUILD ARCHITECT: <span className="text-[#8b5a2b]">{guild.name}</span>
        </h1>
        <div className="flex gap-4">
          <button onClick={savePath} className="bg-[#76c442] text-white px-8 py-3 border-4 border-[#3e2723] text-2xl uppercase font-bold shadow-[0_6px_0_#3e2723] hover:translate-y-1 active:translate-y-2 active:shadow-none transition-all">
            Save Hall
          </button>
          <button onClick={onClose} className="bg-red-500 text-white px-8 py-3 border-4 border-[#3e2723] text-2xl uppercase font-bold shadow-[0_6px_0_#3e2723] hover:translate-y-1 active:translate-y-2 active:shadow-none transition-all">
            Exit
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-8 overflow-hidden">
        {/* LEFT: LIBRARY DRAWER */}
        <div className="w-96 flex flex-col gap-4 bg-[#d4a373] p-6 border-4 border-[#5d3a1a] overflow-y-auto shadow-inner">
          <h2 className="text-3xl font-bold flex items-center gap-2 uppercase tracking-tighter mb-2 border-b-2 border-[#5d3a1a]/30 pb-2">
            <BookOpen /> Library
          </h2>
          
          <button 
            onClick={() => setIsCreatingCustom(true)}
            className="w-full bg-[#4a90e2] border-4 border-[#3e2723] p-4 text-white text-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-[0_4px_0_#214a7a] mb-4"
          >
            + FORGE CUSTOM
          </button>

          {['solo', 'daily', 'shop'].map((sourceType) => (
            <div key={sourceType} className="mb-6">
              <h3 className="text-xl font-bold uppercase p-2 bg-[#5d3a1a] text-[#f4d0a3] mb-3">
                 {sourceType === 'solo' ? '🚩 Solo Nodes' : sourceType === 'daily' ? '🕒 Daily Quests' : '💰 Shop Quests'}
              </h3>
              <div className="flex flex-col gap-2">
                {problemPool
                  .filter(p => p.source?.toLowerCase() === sourceType.toLowerCase())
                  .map(p => (
                    <div key={p._id} className="bg-[#fdf6e3] border-4 border-[#5d3a1a] p-3 flex justify-between items-center hover:bg-[#fff] transition-colors">
                      <div className="flex flex-col leading-tight">
                        <span className="text-lg font-bold uppercase truncate max-w-[180px]">{p.nodeTitle}</span>
                        <span className="text-[10px] opacity-60 font-black uppercase tracking-widest">{p.difficulty}</span>
                      </div>
                      <button 
                        onClick={() => addToPath(p, sourceType as any)} 
                        className="bg-[#76c442] border-2 border-black text-white px-3 py-1 text-sm font-bold shadow-[0_2px_0_#000] active:translate-y-0.5 active:shadow-none"
                      >
                        ADD
                      </button>
                    </div>
                  ))
                }
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT: ROADMAP VIEW */}
        <div className="flex-1 bg-[#d4c5a9]/20 border-8 border-dashed border-[#5d3a1a]/30 p-8 overflow-y-auto shadow-inner rounded-3xl">
          <h2 className="text-4xl font-bold mb-8 flex items-center gap-3 text-[#5d3a1a] uppercase tracking-tighter">
            <PenTool size={36} /> Current Roadmap
          </h2>
          
          <div className="flex flex-col items-center gap-2 py-10">
            {activePath.length === 0 ? (
              <div className="flex flex-col items-center opacity-30 mt-20">
                <PlusCircle size={64} />
                <p className="text-3xl font-bold mt-4">Forge a path for your students...</p>
              </div>
            ) : (
              activePath.map((p, idx) => {
                const title = p.displayTitle || p.nodeTitle || p.customProblem?.title || "Unknown Challenge";
                const source = p.source || 'custom';

                return (
                  <div key={idx} className="flex flex-col items-center w-full max-w-md">
                    <div className="w-full bg-[#fdf6e3] border-4 border-[#3e2723] p-5 relative shadow-[0_6px_0_#3e2723]">
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className={`text-[10px] uppercase px-1 self-start font-bold mb-1 text-white ${
                            source === 'daily' ? 'bg-blue-600' : source === 'shop' ? 'bg-yellow-600' : 'bg-black/40'
                          }`}>
                            {source} node
                          </span>
                          <span className="text-3xl font-bold uppercase truncate max-w-[280px] text-[#5d3a1a]">{title}</span>
                        </div>
                        <button 
                          onClick={() => {
                            const newPath = activePath.filter((_, i) => i !== idx);
                            setActivePath(newPath);
                          }}
                          className="bg-red-500 border-4 border-black p-2 hover:bg-red-600 shadow-[0_3px_0_#000] active:translate-y-1 active:shadow-none transition-all"
                        >
                          <Trash2 size={24} className="text-white" />
                        </button>
                      </div>
                    </div>
                    {idx < activePath.length - 1 && (
                      <div className="flex flex-col items-center my-2">
                        <div className="w-2 h-10 bg-[#5d3a1a]"></div>
                        <ArrowBigDown size={40} className="text-[#5d3a1a] -mt-3" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* FORGE CUSTOM MODAL */}
      {isCreatingCustom && (
        <div className="fixed inset-0 z-[250] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#fdf6e3] border-8 border-[#5d3a1a] p-10 w-full max-w-2xl flex flex-col gap-5 shadow-2xl">
            <h2 className="text-5xl font-bold uppercase border-b-8 border-[#5d3a1a] pb-4 text-[#5d3a1a] tracking-tighter">Forge Custom Challenge</h2>
            
            <div className="space-y-4 mt-4">
              <div className="flex flex-col gap-1">
                <label className="text-xl font-bold uppercase text-[#5d3a1a]/60 ml-1">Quest Title</label>
                <input placeholder="E.G. 'THE WHISPERING LOOP'" className="w-full p-4 border-4 border-[#5d3a1a] text-2xl outline-none bg-white uppercase font-bold" value={customForm.title} onChange={e => setCustomForm({...customForm, title: e.target.value})} />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xl font-bold uppercase text-[#5d3a1a]/60 ml-1">Description / Question</label>
                <textarea placeholder="Describe the task for your students..." className="w-full p-4 border-4 border-[#5d3a1a] text-xl h-40 outline-none bg-white resize-none font-bold" value={customForm.description} onChange={e => setCustomForm({...customForm, description: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xl font-bold uppercase text-[#5d3a1a]/60 ml-1">Target Output</label>
                  <input placeholder="E.G. 'HELLO WORLD'" className="w-full p-4 border-4 border-[#5d3a1a] text-xl outline-none bg-white font-bold" value={customForm.output} onChange={e => setCustomForm({...customForm, output: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xl font-bold uppercase text-[#5d3a1a]/60 ml-1">Constraints</label>
                  <input placeholder="E.G. 'PRINT, OP:+ '" className="w-full p-4 border-4 border-[#5d3a1a] text-xl outline-none bg-white font-bold" value={customForm.constraints} onChange={e => setCustomForm({...customForm, constraints: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => { 
                  if (!customForm.title) return alert("A quest needs a name!");
                  addToPath(customForm, 'custom'); 
                  setIsCreatingCustom(false); 
                  setCustomForm({title:'', description:'', output:'', constraints:''});
                }}
                className="flex-1 bg-[#76c442] text-white p-5 text-3xl font-bold border-4 border-[#3e2723] uppercase shadow-[0_8px_0_#3e2723] hover:translate-y-1 active:translate-y-2 active:shadow-none"
              >Forging Complete</button>
              <button onClick={() => setIsCreatingCustom(false)} className="bg-red-500 text-white p-5 text-3xl font-bold border-4 border-[#3e2723] uppercase shadow-[0_8px_0_#3e2723] hover:translate-y-1 active:translate-y-2 active:shadow-none">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Updated Guild Card ---
const GuildCard = ({ guild, isInstructor, onEnterHall }: { guild: any, isInstructor: boolean, onEnterHall: (g: any) => void }) => {
  const handleCopyCode = () => {
    navigator.clipboard.writeText(guild.joinCode);
    alert(`Class Code ${guild.joinCode} copied to clipboard!`);
  };

  return (
    <div className="p-6 border-4 border-[#5d3a1a] flex flex-col items-center gap-4 bg-[#e3d5ca] transition-transform hover:-translate-y-1 group relative">
      {isInstructor && (
        <div 
          onClick={handleCopyCode}
          className="absolute -top-4 -right-4 bg-[#76c442] text-white font-bold px-3 py-1 border-4 border-[#3e2723] cursor-pointer hover:scale-110 flex items-center gap-2 z-10"
          style={{ fontFamily: "'VT323', monospace" }}
        >
          {guild.joinCode} <Copy size={14} />
        </div>
      )}

      <div className="w-24 h-24 bg-[#5d3a1a] rounded-full flex items-center justify-center border-4 border-[#8b5a2b] shadow-inner group-hover:scale-105 transition-transform">
          <Shield size={48} className="text-[#f4d0a3]" />
      </div>
      
      <div className="text-center w-full">
        <h3 className="text-2xl font-bold text-[#5d3a1a] uppercase tracking-wide truncate" style={{ fontFamily: "'VT323', monospace" }} title={guild.name}>
          {guild.name}
        </h3>
        <p className="text-[#8b5a2b] text-sm truncate px-2" style={{ fontFamily: "'VT323', monospace" }}>{guild.description || 'No description'}</p>
        <div className="flex items-center justify-center gap-2 text-[#8b5a2b] font-bold mt-2" style={{ fontFamily: "'VT323', monospace" }}>
          <Users size={16} />
          <span>{guild.members?.length || 0} Members</span>
        </div>
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); onEnterHall(guild); }}
        className="bg-[#5d3a1a] text-[#f4d0a3] px-6 py-2 text-lg font-bold uppercase hover:bg-[#3e2723] w-full mt-2 transition-colors active:scale-95 shadow-[0_4px_0_rgb(62,39,35)] active:translate-y-1 active:shadow-none" 
        style={{ fontFamily: "'VT323', monospace" }}
      >
        Enter Hall
      </button>
    </div>
  );
};

export const Guilds = ({ userData, onEnterChallenge }: { 
  userData: any, 
  onEnterChallenge: (data: any, type: 'standard' | 'custom', isRepeat: boolean) => void 
}) => {
  const [guilds, setGuilds] = useState<any[]>([]);
  const [classCode, setClassCode] = useState('');
  const [newGuildName, setNewGuildName] = useState('');
  const [newGuildDesc, setNewGuildDesc] = useState('');
  const [editingHall, setEditingHall] = useState<any>(null);
  const [viewingHall, setViewingHall] = useState<any>(null);
  
  const isInstructor = userData?.role === 'instructor' || userData?.role === 'admin';

  // FIX: This function is now defined here
const fetchGuilds = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/guilds');
    console.log("Guilds fetched from DB:", res.data); // DEBUG: Check your console (F12)
    setGuilds(res.data);
  } catch (err) {
    console.error("Failed to fetch guilds. Check if Backend is running!", err);
  }
};

  useEffect(() => { fetchGuilds(); }, []);

  const handleJoinGuild = async () => {
    if (!classCode) return;
    try {
      const res = await axios.post('http://localhost:5000/api/guilds/join', { code: classCode });
      alert(res.data.message); setClassCode(''); fetchGuilds();
    } catch (err: any) { alert(err.response?.data?.message || "Failed to join guild"); }
  };

  const handleCreateGuild = async () => {
    if (!newGuildName) return alert("Guild needs a name!");
    try {
      const res = await axios.post('http://localhost:5000/api/guilds/create', { name: newGuildName, description: newGuildDesc });
      alert(`Guild Created! Code: ${res.data.joinCode}`); setNewGuildName(''); setNewGuildDesc(''); fetchGuilds();
    } catch (err: any) { alert(err.response?.data?.message || "Failed to create guild"); }
  };

  return (
    <div className="h-full flex flex-col pt-4 items-center">
      {/* --- INSTRUCTOR VIEW --- */}
      {editingHall && isInstructor && (
        <GuildHallEditor 
          guild={editingHall} 
          onClose={() => { setEditingHall(null); fetchGuilds(); }} 
          onRefresh={fetchGuilds} // Pass the refresh function as a prop
        />
      )}
      
      {/* --- STUDENT VIEW --- */}
      {viewingHall && !isInstructor && (
        <StudentHallView 
          guild={viewingHall} 
          userData={userData} // FIX: Now passing userData correctly
          onClose={() => setViewingHall(null)} 
          onEnterChallenge={onEnterChallenge} // Matches the 3-arg signature
        />
      )}
      <div className="w-full max-w-5xl bg-[#fdf6e3] p-8 flex justify-center">
        <PixelPanel className="min-h-[600px] gap-8">
          <div className="flex flex-col items-center gap-4 border-b-4 border-[#d4c5a9] pb-8 border-dashed">
            {isInstructor ? (
              <>
                <SectionHeader title="Establish Guild" />
                <div className="flex flex-col gap-4 w-full max-w-2xl items-center">
                  <input type="text" value={newGuildName} onChange={(e) => setNewGuildName(e.target.value)} placeholder="GUILD/CLASS NAME" className="w-full bg-[#fdf6e3] border-4 border-[#8b5a2b] p-4 text-2xl text-[#5d3a1a] placeholder-[#d4c5a9] font-bold text-center focus:border-[#5d3a1a] outline-none shadow-inner" style={{ fontFamily: "'VT323', monospace" }} />
                  <input type="text" value={newGuildDesc} onChange={(e) => setNewGuildDesc(e.target.value)} placeholder="SHORT DESCRIPTION (OPTIONAL)" className="w-full bg-[#fdf6e3] border-4 border-[#8b5a2b] p-3 text-xl text-[#5d3a1a] placeholder-[#d4c5a9] font-bold text-center focus:border-[#5d3a1a] outline-none shadow-inner" style={{ fontFamily: "'VT323', monospace" }} />
                  <button onClick={handleCreateGuild} className="flex items-center gap-2 bg-[#76c442] border-4 border-[#3e2723] text-white px-8 py-4 text-2xl font-bold uppercase hover:bg-[#5da035] shadow-[0_6px_0_rgb(62,39,35)] active:translate-y-1 active:shadow-none transition-all" style={{ fontFamily: "'VT323', monospace" }}>
                    <PlusCircle size={24} /> Create Guild
                  </button>
                </div>
              </>
            ) : (
              <>
                <SectionHeader title="Join Guild" />
                <div className="flex flex-col md:flex-row gap-4 w-full max-w-2xl items-center">
                  <input type="text" value={classCode} onChange={(e) => setClassCode(e.target.value.toUpperCase())} placeholder="ENTER CLASS CODE" className="w-full bg-[#fdf6e3] border-4 border-[#8b5a2b] p-4 text-2xl text-[#5d3a1a] placeholder-[#d4c5a9] font-bold text-center focus:border-[#5d3a1a] outline-none shadow-inner" style={{ fontFamily: "'VT323', monospace" }} maxLength={6} />
                  <button onClick={handleJoinGuild} className="bg-[#76c442] border-4 border-[#3e2723] text-white px-8 py-4 text-2xl font-bold uppercase hover:bg-[#5da035] shadow-[0_6px_0_rgb(62,39,35)] active:translate-y-1 active:shadow-none transition-all" style={{ fontFamily: "'VT323', monospace" }}>Join</button>
                </div>
              </>
            )}
          </div>

       <div className="flex-1 flex flex-col items-center">
  <SectionHeader title="Your Guilds" />
  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-4xl px-8 pb-8">
  {guilds.length === 0 ? (
    <p className="col-span-2 text-center opacity-50">Waiting for Guild data...</p>
  ) : (
    <>
      {/* DEBUG LOG */}
      {console.log("Current User ID:", userData?._id)}
      {console.log("All Guilds in State:", guilds)}

      {guilds
        .filter(guild => {
          const userId = userData?._id?.toString();
          
          // 1. Instructor Check: Did they create it?
          const instructorId = (guild.instructor?._id || guild.instructor)?.toString();
          if (isInstructor) return instructorId === userId;

          // 2. Student Check: Are they in the members array?
          // We map members to strings to ensure the comparison works
          const memberIds = guild.members?.map((m: any) => (m?._id || m)?.toString()) || [];
          return memberIds.includes(userId);
        })
        .map((guild) => (
          <GuildCard 
            key={guild._id} 
            guild={guild} 
            isInstructor={isInstructor} 
            onEnterHall={(g) => isInstructor ? setEditingHall(g) : setViewingHall(g)} 
          />
        ))}
      
      {/* If the array is empty after filtering, show a helpful message */}
      {guilds.length > 0 && guilds.filter(g => {
          const userId = userData?._id?.toString();
          const instructorId = (g.instructor?._id || g.instructor)?.toString();
          if (isInstructor) return instructorId === userId;
          const memberIds = g.members?.map((m: any) => (m?._id || m)?.toString()) || [];
          return memberIds.includes(userId);
      }).length === 0 && (
        <p className="col-span-2 text-center text-[#8b5a2b] font-bold">
          Found {guilds.length} guilds, but your ID ({userData?._id}) isn't linked to any.
        </p>
      )}
    </>
  )}
</div>
</div>
        </PixelPanel>
      </div>
    </div>
  );
};