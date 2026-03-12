import { useState, useEffect } from 'react';
import axios from 'axios';
import { updateBGMVolume, playSFX } from './utils/AudioManager';
import { MapuaIcon, AlgomythLogo } from './components/Icons';

import { CodingIDE } from './CodingIDE';
import { TaskDashboard } from './TaskDashboard';
import { Inventory } from './Inventory';
import { Shop } from './Shop';
import { Guilds } from './Guilds';
import { Library } from './Library';
import { Help } from './Help';
import { PreLogin } from './PreLogin'; 
import { Auth } from './Auth';    

//components from src/components for dropdown
import { MessagesPanel } from './components/MessagesPanel';
import { AccountSettings } from './components/AccountSettings';
import { AudioSettings } from './components/AudioSettings';

// --- AXIOS INTERCEPTOR ---
axios.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- EMOJI LOOKUP MAP ---
const achievementEmojis: Record<string, string> = {
  SHOP_BUY: "💰", EQUIP_ARMOR: "🛡️", FIRST_DAILY: "📅", BEAT_MEDIUM: "⚔️",
  LVL_5: "🌟", JOIN_GUILD: "🤝", ADD_GFRIEND: "💖", BEAT_HARD: "💀",
  OBTAIN_5_ITEMS: "🎒", REARRANGE_50: "🧹", EQUIP_ALL: "👑", LVL_10: "🔥",
  BUY_ALL_SCROLLS: "📚", COMPLETE_SOLO: "🏆", COMPLETE_ALL_SCROLLS: "✍️",
};

const getAssetUrl = (folder: string, prefix: string, index: number) => {
  // FORCE UPDATE: 1:15 PM FIX
  return `/assets/${folder}/${prefix}_${index}.png`;
};


// --- Pixel Art Components ---
const PixelButton = ({ label, active, onClick }: { label: string, active?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={`relative px-4 lg:px-6 py-3 font-bold text-sm lg:text-lg uppercase transition-all duration-200 flex items-center justify-center rounded-t-xl
      ${active 
        ? 'bg-[#f4d0a3] text-[#5d3a1a] border-t-4 border-x-4 border-[#5d3a1a] border-b-0 -mb-2 z-30 translate-y-[2px] pb-4' 
        : 'bg-[#b88a5f] text-[#3e2723] border-4 border-[#5d3a1a] hover:bg-[#cbb092] mt-2 z-10'
      }`}
    style={{ fontFamily: "'VT323', monospace", letterSpacing: '1px' }} 
  >
    {label}
  </button>
);

const HeaderBar = ({ activeTab, setActiveTab, onLogout }: { activeTab: string, setActiveTab: (t: string) => void, onLogout: () => void }) => {
  const [activeDropdown, setActiveDropdown] = useState<'mail' | 'user' | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/messages/notifications`);
      setAlerts(res.data);
    } catch (err) { console.error(err); }
  };

  const handleClearAlerts = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/messages/clear-alerts`);
      setAlerts([]); 
      playSFX('sfx_click.ogg');
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchNotifications(); 
    const interval = setInterval(() => { fetchNotifications(); }, 10000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const navItems = [
    { id: 'tasks', label: 'Task' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'shop', label: 'Shop' },
    { id: 'guilds', label: 'Guilds' },
    { id: 'library', label: 'Library' },
    { id: 'help', label: 'Help' },
  ];

  return (
    <div className="bg-[#5d3a1a] px-4 lg:px-8 pt-6 pb-0 flex items-end justify-between border-b-8 border-[#3e2723] relative z-50 shadow-xl">
      <div className="flex items-center gap-4 mb-2 shrink-0">
        <div className="bg-[#f4d0a3] border-4 border-[#3e2723] px-4 py-2 rounded-lg shadow-md transform -rotate-2 flex items-center gap-3">
          <AlgomythLogo size={32} /> {/* CUSTOM LOGO ADDED */}
          <span className="text-2xl lg:text-3xl font-bold text-[#5d3a1a] tracking-widest" style={{ fontFamily: "'VT323', monospace" }}>ALGOMYTH</span>
        </div>
      </div>

      <div className="flex gap-1 lg:gap-2 items-end justify-center flex-1 px-4 h-full relative z-30">
        {navItems.map((item) => (
          <PixelButton 
            key={item.id} label={item.label} active={activeTab === item.id} 
            onClick={() => { playSFX('sfx_click.ogg'); setActiveTab(item.id); setActiveDropdown(null); }}
          />
        ))}
      </div>

      <div className="flex gap-2 lg:gap-3 pb-4 ml-4 shrink-0 relative">
        {/* REPLACED "M" BUTTON WITH LOGO */}
        <div className="relative">
          <button 
            onClick={() => { playSFX('sfx_click.ogg'); setActiveDropdown(activeDropdown === 'mail' ? null : 'mail'); }}
            className={`relative bg-[#d4a373] border-4 border-[#3e2723] w-12 h-12 flex items-center justify-center transition-all shadow-lg hover:scale-105 ${activeDropdown === 'mail' ? 'bg-[#f4e4bc]' : ''} ${alerts.length > 0 ? 'animate-pulse border-red-500' : ''}`}
          >
            <AlgomythLogo size={30} /> 
            {alerts.length > 0 && <div className="absolute -top-3 -right-3 bg-red-600 border-4 border-[#3e2723] text-white w-7 h-7 flex items-center justify-center text-xs animate-bounce font-bold">!</div>}
          </button>
          
          {activeDropdown === 'mail' && (
            <div className="absolute right-0 mt-4 w-72 bg-[#fdf6e3] border-4 border-[#5d3a1a] shadow-2xl z-[100] p-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center border-b-2 border-[#5d3a1a] pb-2 mb-3">
                <h4 className="text-[#3e2723] font-bold uppercase text-sm" style={{ fontFamily: "'VT323', monospace" }}>Notifications</h4>
                {alerts.length > 0 && <button onClick={handleClearAlerts} className="text-[10px] text-red-600 hover:underline font-bold uppercase">Clear All</button>}
              </div>
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto custom-scrollbar">
                {alerts.length > 0 ? alerts.map((msg, i) => (
                  <button key={i} onClick={() => { setActiveTab('messages'); setActiveDropdown(null); }} className="text-left bg-[#d4a373] p-2 border-2 border-[#5d3a1a] hover:bg-[#cbb092] transition-colors flex flex-col group">
                    <span className="text-[10px] font-black uppercase text-[#3e2723]/60 group-hover:text-[#3e2723]">From: {msg.sender?.username || 'System'}</span>
                    <span className="text-xs font-bold text-[#3e2723] truncate w-full">{msg.content}</span>
                  </button>
                )) : <div className="text-xs text-[#5d3a1a] italic text-center py-4 uppercase font-bold">Silence in the archives.</div>}
              </div>
            </div>
          )}
        </div>

        {/* REPLACED "U" BUTTON WITH MAPUA ICON */}
        <div className="relative">
          <button 
            onClick={() => { playSFX('sfx_click.ogg'); setActiveDropdown(activeDropdown === 'user' ? null : 'user'); }}
            className={`bg-[#d4a373] border-4 border-[#3e2723] w-12 h-12 flex items-center justify-center hover:scale-110 transition-transform shadow-lg ${activeDropdown === 'user' ? 'bg-[#f4e4bc]' : ''}`}
          >
            <MapuaIcon size={35} />
          </button>
          {activeDropdown === 'user' && (
            <div className="absolute right-0 mt-4 w-56 bg-[#fdf6e3] border-4 border-[#5d3a1a] shadow-2xl z-[100] flex flex-col animate-in fade-in slide-in-from-top-2">
              {[
                { id: 'messages', label: 'Messages', icon: '✉️' },
                { id: 'account', label: 'Account', icon: '⚙️' },
                { id: 'audio', label: 'Audio', icon: '🔊' },
                { id: 'logout', label: 'Logout', icon: '🚪', color: 'text-red-600' }
              ].map((opt) => (
                <button 
                  key={opt.id}
                  onClick={() => { playSFX('sfx_click.ogg'); if (opt.id === 'logout') onLogout(); else { setActiveTab(opt.id); setActiveDropdown(null); } }}
                  className={`w-full text-left p-3 hover:bg-[#d4a373] border-b-2 border-[#5d3a1a] last:border-b-0 flex items-center gap-3 font-bold ${opt.color || 'text-[#3e2723]'}`}
                  style={{ fontFamily: "'VT323', monospace", fontSize: '20px' }}
                >
                  <span>{opt.icon}</span> {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AvatarSection = ({ userData, userGold, inventory = [], onRemoveBadge }: any) => {
  const currentXP = userData?.stats?.xp || 0;
  const currentLevel = userData?.stats?.level || 1;
  const xpRequiredForNextLevel = Math.floor(100 * Math.pow(currentLevel, 1.5));
  const xpPercentage = Math.min(100, (currentXP / xpRequiredForNextLevel) * 100);

  const charIndex = userData?.characterIndex || 1;
  const skinVariant = userData?.skinVariant || 'default';
  const armorVariant = userData?.armorVariant || 'default';

  const headGear = inventory.find((i: any) => i.isEquipped && i.equippedSlot === 'Head')?.item;
  const bodyGear = inventory.find((i: any) => i.isEquipped && i.equippedSlot === 'Body')?.item;
  const accessoryGear = inventory.find((i: any) => i.isEquipped && i.equippedSlot === 'Accessory')?.item;

  return (
    <div className="p-8 bg-[#a67c52] border-b-8 border-[#5d3a1a] relative shadow-inner z-10">
      <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(90deg,transparent,transparent_40px,#3e2723_40px,#3e2723_44px)] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-10 relative z-10 items-start">
        <div className="flex gap-8 items-start bg-[#d4a373] p-6 border-4 border-[#5d3a1a] shadow-xl min-w-[450px]">
          <div className="flex flex-col gap-4 items-center">
             <div className="w-48 h-72 bg-[#f4e4bc] border-4 border-[#5d3a1a] flex flex-col items-center justify-center overflow-hidden shadow-inner relative">
              {bodyGear && <div className="absolute inset-0 flex items-center justify-center z-0"><img src={`/assets/items/${bodyGear.image}`} className="w-full h-full object-contain scale-150 -translate-y-12" style={{ imageRendering: 'pixelated' }} alt="Body Gear" /></div>}
                <div className="absolute inset-0 w-full h-full p-2 flex items-end justify-center z-10">
                  <img src={getAssetUrl(skinVariant, skinVariant, charIndex)} className="absolute w-full h-[90%] object-contain" style={{ imageRendering: 'pixelated' }} />
                  {armorVariant !== 'default' && <img src={getAssetUrl(armorVariant, armorVariant, charIndex)} className="absolute w-full h-[90%] object-contain" style={{ imageRendering: 'pixelated' }} />}
                </div>
                {headGear && <div className="absolute top-8 w-16 h-16 z-20 flex items-center justify-center animate-bounce"><img src={`/assets/items/${headGear.image}`} className="w-full h-full object-contain" style={{ imageRendering: 'pixelated' }} alt="Head Gear" /></div>}
                {accessoryGear && <div className="absolute bottom-6 right-2 w-20 h-20 z-30 drop-shadow-lg"><img src={`/assets/items/${accessoryGear.image}`} className="w-full h-full object-contain" style={{ imageRendering: 'pixelated' }} alt="Accessory Gear" /></div>}
                <span className="absolute bottom-2 text-[10px] font-bold text-[#5d3a1a] opacity-30 uppercase z-50">Algomyth Identity</span>
              </div>

             <div className="flex gap-3 w-full justify-between">
                {[headGear, bodyGear, accessoryGear].map((gear, idx) => (
                  <div key={idx} className="w-14 h-14 bg-[#b88a5f] border-4 border-[#5d3a1a] flex items-center justify-center shadow-inner">
                    {gear ? ( gear.image.includes('.') ? <img src={`/assets/items/${gear.image}`} className="w-8 h-8 object-contain" style={{ imageRendering: 'pixelated' }} alt="Gear Item" /> : <span className="text-2xl">{gear.image}</span>) : <div className="w-8 h-8 bg-[#5d3a1a] opacity-10"></div>}
                  </div>
                ))}
             </div>
          </div>

          <div className="flex-1 space-y-4 pt-2" style={{ fontFamily: "'VT323', monospace" }}>
            <div>
               <h2 className="text-4xl font-bold text-[#3e2723] leading-none">@{userData?.username || 'Username'}</h2>
               <div className="text-[#3e2723] text-2xl font-bold mt-1">LVL: {currentLevel}</div>
            </div>
            <div className="w-full mt-6">
               <div className="flex justify-between text-sm font-bold text-[#3e2723] mb-1"><span>XP</span><span>{currentXP}/{xpRequiredForNextLevel}</span></div>
               <div className="w-full h-6 bg-[#3e2723] p-1"><div className="h-full bg-[#76c442] relative transition-all duration-500 ease-out" style={{ width: `${xpPercentage}%` }}></div></div>
            </div>
            <div className="bg-[#f4e4bc] border-2 border-[#5d3a1a] p-2 text-center mt-6">
               <div className="text-[#3e2723] font-bold text-2xl">💰 {userGold}</div>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-[#d4a373] p-6 border-4 border-[#5d3a1a] flex flex-col justify-center items-center shadow-xl h-full min-h-[360px]">
           <h3 className="text-[#3e2723] text-3xl mb-6 uppercase tracking-widest border-b-4 border-[#5d3a1a] pb-2 px-8" style={{ fontFamily: "'VT323', monospace" }}>Badge Display</h3>
           <div className="flex gap-4 flex-wrap justify-center">
             {[...Array(5)].map((_, i) => {
               const pinnedKey = userData?.pinnedAchievements?.[i];
               const emoji = pinnedKey ? achievementEmojis[pinnedKey] : null;
               return (
                 <div key={i} title={pinnedKey || "Empty Slot"} className={`w-20 h-20 border-4 border-[#5d3a1a] flex items-center justify-center text-4xl shadow-md relative transition-all ${emoji ? 'bg-[#f4e4bc]' : 'bg-[#cbb092] opacity-40 shadow-inner'}`}>
                   {emoji || ''}
                   {emoji && <button onClick={() => onRemoveBadge(i)} className="absolute -top-2 -right-2 w-6 h-6 bg-[#ef4444] border-2 border-[#5d3a1a] text-white text-[10px] flex items-center justify-center font-bold hover:bg-[#b91c1c] transition-colors z-50 shadow-md">X</button>}
                 </div>
               );
             })}
           </div>
        </div>
      </div>
    </div>
  );
};

const Footer = () => (
  <footer className="bg-[#3e2723] text-[#d4a373] py-6 text-center border-t-8 border-[#5d3a1a]" style={{ fontFamily: "'VT323', monospace" }}>
    <p className="text-lg">© 2026 ALGOMYTH. Mapúa University.</p>
    <div className="flex justify-center gap-6 mt-2 text-xl">
      <a href="#" className="hover:text-white">Privacy</a><span>•</span><a href="#" className="hover:text-white">Terms</a><span>•</span><a href="#" className="hover:text-white">Contact</a>
    </div>
  </footer>
);

const App = () => {
  const [view, setView] = useState<'landing' | 'auth' | 'game'>('landing');
  const [activeTab, setActiveTab] = useState('tasks');
  const [activeTask, setActiveTask] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [userGold, setUserGold] = useState(0);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatTarget, setChatTarget] = useState<any>(null);
  const [searchResult, setSearchResult] = useState<any>(null);

  const handleSearchUser = async (query: string) => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/search/${query}`);
    if (!res.data) {
      alert("No explorer found with that name.");
      return;
    }
    // Initialize empty arrays if they don't exist to prevent modal crashes
    const sanitizedUser = {
      ...res.data,
      inventory: res.data.inventory || [],
      pinnedAchievements: res.data.pinnedAchievements || [null, null, null, null, null],
      stats: res.data.stats || { level: 1, xp: 0, gold: 0 }
    };
    setSearchResult(sanitizedUser);
  } catch (err: any) { 
    alert(err.response?.data?.message || "Search failed"); 
  }
};

  const handleLogout = () => { localStorage.removeItem('token'); setView('landing'); setUserData(null); };

  const refreshUserData = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`);
      setUserData(res.data);
      setUserGold(res.data.stats?.gold || 0);
      setInventory(res.data.inventory || []);
      setLoading(false);
    } catch (err) { localStorage.removeItem('token'); setView('landing'); setLoading(false); }
  };

  const handleRemoveBadge = async (slotIndex: number) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/unpin-achievement`, { slotIndex });
      setUserData({ ...userData, pinnedAchievements: res.data.pinnedAchievements });
    } catch (err) { console.error(err); }
  };

  const handleBuyItem = async (item: any) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/shop/buy/${item._id}`);
      playSFX('sfx_buy.ogg');
      alert(res.data.message); 
      if (res.data.user) {
        setUserData(res.data.user); setInventory(res.data.user.inventory); setUserGold(res.data.user.stats.gold); 
      } else { refreshUserData(); }
    } catch (err: any) { playSFX('sfx_fail.ogg'); alert(err.response?.data?.message || "Purchase failed"); }
  };

  const handleUnequipItem = async (inventoryId: string, gridIndex: number) => {
    try { await axios.post(`${import.meta.env.VITE_API_URL}/api/shop/unequip`, { inventoryId, gridIndex }); await refreshUserData(); } 
    catch (err) { console.error(err); }
  };

  const handleEquipItem = async (inventoryId: string, slot: string) => {
    try {
      const invItem = inventory.find(i => i._id === inventoryId);
      if (!invItem) return;
      if (invItem.item.category !== slot) return alert(`❌ Cannot equip in ${slot} slot!`);
      await axios.post(`${import.meta.env.VITE_API_URL}/api/shop/equip`, { inventoryId, slot });
      playSFX('sfx_equip.ogg'); refreshUserData(); 
    } catch (err) { console.error(err); }
  };

  const handleSellItem = async (inventoryId: string) => {
    if (!window.confirm("Sell this item for 50% gold?")) return;
    try { await axios.post(`${import.meta.env.VITE_API_URL}/api/shop/sell`, { inventoryId }); refreshUserData(); } 
    catch (err) { console.error(err); }
  };

  const handleMoveItem = async (inventoryId: string, newIndex: number) => {
    try { await axios.put(`${import.meta.env.VITE_API_URL}/api/shop/move`, { invId: inventoryId, newGridIndex: newIndex }); refreshUserData(); } 
    catch (err) { console.error(err); }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && view !== 'game') { refreshUserData(); setView('game'); } 
    else if (!token) { setLoading(false); }

    const bgmPlayer = document.getElementById('global-bgm') as HTMLAudioElement;
    if (bgmPlayer) {
      const targetTrack = activeTask ? '/assets/audio/bgm_code.mp3' : '/assets/audio/bgm_main.mp3';
      if (!bgmPlayer.src.includes(targetTrack)) {
        bgmPlayer.src = targetTrack;
        bgmPlayer.play().catch(() => console.log("Audio waiting..."));
      }
      updateBGMVolume(bgmPlayer);
    }
  }, [activeTask, view]);

  // --- FIX: ENHANCED ENTRY LOGIC ---
  const handleEnterChallenge = async (data: any, type: 'standard' | 'custom', isRepeat: boolean, guildId?: string) => {
  if (type === 'standard') {
    try {
      // DATA is the problemId string from the Guild model
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/tasks/${data}`);
      
      const taskData = {
        ...res.data,
        nodeTitle: res.data.nodeTitle || res.data.title || "Quest",
        phases: res.data.phases || [],
        isRepeat, 
        guildId // Passed to the IDE so the backend knows this is a Guild session
      };
      
      setActiveTask(taskData);
      setActiveTab('tasks');
    } catch (error) {
      alert("Failed to load standard challenge.");
    }
  } else{
      const formattedCustomTask = {
        ...data,
        nodeTitle: data.title || "Custom Challenge",
        difficulty: data.difficulty || 'Medium',
        source: 'guild',
        isCustom: true,
        isRepeat,
        guildId,
        phases: [{
          questionTitle: data.title,
          description: data.description,
          constraints: Array.isArray(data.constraints) ? data.constraints : [data.constraints],
          output: data.output,
          starterCode: data.starterCode || `#include <iostream>\nusing namespace std;\n\nint main() {\n  // Code here\n  return 0;\n}`
        }],
        reward: { gold: 50, xp: 100 }
      };
      setActiveTask(formattedCustomTask); 
      setActiveTab('tasks');
    }
  };

  const renderGameContent = () => {
    if (loading && view === 'game') return <div className="flex items-center justify-center h-full text-2xl font-bold">CONNECTING TO ALGOMYTH...</div>;

    switch (activeTab) {
      case 'tasks': 
        if (activeTask) {
          return (
            <CodingIDE 
              task={activeTask} 
              onExit={() => setActiveTask(null)}
              onComplete={async () => {
                // --- FIX: STATE RACE CONDITION AVOIDED ---
                const wasGuildTask = activeTask.guildId; // 1. Save the guild context BEFORE clearing it

                if (wasGuildTask || !activeTask.isRepeat) {
                  await refreshUserData(); // 2. Refresh data so the "Lock" status updates
                }

                setActiveTask(null); // 3. Clear IDE

                // 4. Safely redirect back to Guilds tab if we came from a Guild
                if (wasGuildTask) {
                  setActiveTab('guilds');
                }
              }}
            />
          );
        }
        return <TaskDashboard onSelectTask={(task) => setActiveTask(task)} userData={userData} setUserData={setUserData} achievementEmojis={achievementEmojis} />;
      case 'inventory': return <Inventory inventory={inventory} onEquipItem={handleEquipItem} onUnequipItem={handleUnequipItem} onMoveItem={handleMoveItem} onSellItem={handleSellItem} />;
      case 'shop': return <Shop onBuyItem={handleBuyItem} userInventory={inventory} userData={userData} />;
      case 'guilds': 
  return (
    <Guilds 
      userData={userData} 
      onEnterChallenge={(data: any, type: 'standard' | 'custom', isRepeat: boolean, gId?: string) => {
        // If gId is missing, we grab it from the viewingHall state inside Guilds.tsx
        // but passing it directly is safer.
        handleEnterChallenge(data, type, isRepeat, gId);
      }}
    />
  );
      case 'library': return <Library />;
      case 'help': return <Help />;
      case 'messages': 
  return (
    <MessagesPanel 
      userData={userData} 
      onSearch={handleSearchUser} 
      chatTarget={chatTarget} 
      // Important: This clears the target once the chat is opened/closed 
      // to prevent "sticky" white screens on re-entry
      clearChatTarget={() => setChatTarget(null)} 
    />
  );
      case 'account': return <AccountSettings userData={userData} onUpdate={refreshUserData} />;
      case 'audio': return <AudioSettings settings={userData.settings} onUpdate={refreshUserData} />;
      default: return <TaskDashboard onSelectTask={(task) => setActiveTask(task)} userData={userData} setUserData={setUserData} achievementEmojis={achievementEmojis} />;
    }
  };

  if (view === 'landing') return <PreLogin onGetStarted={() => { playSFX('sfx_click.ogg'); setView('auth'); }} />;
  if (view === 'auth') return <Auth onLogin={() => { refreshUserData(); setView('game'); }} />;

  return (
    <div className="min-h-screen bg-[#3e2723] flex flex-col overflow-x-hidden">
      <HeaderBar activeTab={activeTab} setActiveTab={(id) => { playSFX('sfx_click.ogg'); setActiveTab(id); }} onLogout={handleLogout} />
      <AvatarSection userData={userData} userGold={userGold} inventory={inventory} onRemoveBadge={handleRemoveBadge} />
      
      <div className="flex-1 bg-[#fdf6e3]">
        {renderGameContent()}
      </div>

      <audio id="global-bgm" loop />

      {searchResult && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
    <div className="bg-[#fdf6e3] border-8 border-[#5d3a1a] p-8 w-full max-w-3xl relative shadow-2xl overflow-y-auto max-h-[90vh]">
      <button onClick={() => setSearchResult(null)} className="absolute top-2 right-4 text-4xl font-bold text-[#5d3a1a] hover:text-red-600 transition-colors z-[110]">×</button>
      
      <div className="flex flex-col md:flex-row gap-10 items-start">
        {/* AVATAR PREVIEW */}
        <div className="flex flex-col gap-6 items-center bg-[#d4a373] p-6 border-4 border-[#5d3a1a] shadow-xl">
          <div className="flex flex-col items-center justify-center relative min-w-48 min-h-72 bg-[#f4e4bc] border-4 border-[#5d3a1a] shadow-inner overflow-hidden">
            {/* Body Gear Check */}
            {searchResult.inventory?.find((i: any) => i?.isEquipped && i?.equippedSlot === 'Body') && (
              <img 
                src={searchResult.inventory.find((i: any) => i.isEquipped && i.equippedSlot === 'Body').item?.image} 
                className="absolute inset-0 w-full h-full object-contain z-0 scale-150 -translate-y-4 pixelated" 
              />
            )}
            
            <img src={getAssetUrl('default', 'default', searchResult.characterIndex || 1)} className="w-auto h-72 object-contain z-10 pixelated" />
            
            {/* Accessory Check */}
            {searchResult.inventory?.find((i: any) => i?.isEquipped && i?.equippedSlot === 'Accessory') && (
              <img 
                src={searchResult.inventory.find((i: any) => i.isEquipped && i.equippedSlot === 'Accessory').item?.image} 
                className="absolute bottom-4 right-2 w-20 h-20 object-contain z-30 pixelated" 
              />
            )}

            {/* Head Gear Check */}
            {searchResult.inventory?.find((i: any) => i?.isEquipped && i?.equippedSlot === 'Head') && (
              <img 
                src={searchResult.inventory.find((i: any) => i.isEquipped && i.equippedSlot === 'Head').item?.image} 
                className="absolute top-8 w-16 h-16 object-contain z-20 animate-bounce pixelated" 
              />
            )}
          </div>
        </div>

        {/* INFO PANEL */}
        <div className="flex-1 space-y-6" style={{ fontFamily: "'VT323', monospace" }}>
          <div>
            <h2 className="text-6xl font-bold text-[#3e2723] tracking-tighter">@{searchResult.username || 'Ghost'}</h2>
            <div className="text-[#5d3a1a] text-2xl font-bold mt-1 uppercase">Level {searchResult.stats?.level || 1} Explorer</div>
          </div>

          <div className="bg-[#d4a373] p-5 border-4 border-[#5d3a1a] shadow-inner">
            <h3 className="text-[#3e2723] text-2xl font-bold mb-3 border-b-2 border-[#5d3a1a] inline-block pr-4 uppercase">Badge Display</h3>
            <div className="flex gap-2 flex-wrap">
              {[...Array(5)].map((_, i) => {
                const pinnedKey = searchResult.pinnedAchievements?.[i];
                const emoji = pinnedKey ? achievementEmojis[pinnedKey] : null;
                return (
                  <div key={i} className={`w-14 h-14 border-4 border-[#5d3a1a] flex items-center justify-center text-3xl shadow-md ${emoji ? 'bg-[#f4e4bc]' : 'bg-[#cbb092] opacity-50 shadow-inner'}`}>
                    {emoji || ''}
                  </div>
                );
              })}
            </div>
          </div>

          <button 
            disabled={searchResult._id === userData?._id}
            onClick={() => { 
              setChatTarget({ _id: searchResult._id, username: searchResult.username }); 
              setSearchResult(null); 
              setActiveTab('messages'); 
              playSFX('sfx_click.ogg'); 
            }}
            className={`w-full py-4 border-4 border-[#3e2723] text-2xl font-bold uppercase transition-all
              ${searchResult._id === userData?._id 
                ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                : 'bg-[#76c442] text-white hover:bg-[#5da035] shadow-[0_6px_0_#3e2723] active:translate-y-1 active:shadow-none'}`}
          >
            {searchResult._id === userData?._id ? "This is You" : "Send Message"}
          </button>
        </div>
      </div>
    </div>
  </div>
)}
      <Footer />
    </div>
  );
};
export default App;
//Vercel Force Update at 1:11 PM HAHAH
// FORCE RE-SYNC: 1:14 PM FIX again
// Force Push #100