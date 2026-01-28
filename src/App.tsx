import { useState } from 'react';
import { 
  Scroll, 
  ShoppingBag, 
  Users, 
  BookOpen, 
  HelpCircle, 
  User, 
  Leaf, 
} from 'lucide-react';


import { Inventory } from './Inventory';
import { Shop } from './Shop';
import { Guilds } from './Guilds';
import { Library } from './Library';
import { Help } from './Help';
import { PreLogin } from './PreLogin'; // Import new
import { Auth } from './Auth';         // Import new

// --- Types ---
interface DailyTask {
  id: number;
  title: string;
  type: 'gather' | 'combat' | 'explore';
  reward: string;
  icon: string;
  color: string;
}

// --- Mock Data ---
const DAILIES: DailyTask[] = [
  { id: 1, title: "BREW POTION", type: 'gather', reward: "50 XP", icon: "🧪", color: "bg-[#d4a373]" },
  { id: 2, title: "GATHER HERBS", type: 'explore', reward: "100 XP", icon: "🌿", color: "bg-[#d4a373]" },
  { id: 3, title: "QUESTION NODE", type: 'combat', reward: "Potion", icon: "🔮", color: "bg-[#d4a373]" },
  { id: 4, title: "QUESTION NODE", type: 'combat', reward: "Potion", icon: "🍵", color: "bg-[#d4a373]" },
];

const SOLO_NODES = [
  { id: 1, title: "BREW POTION", icon: "🧪" },
  { id: 2, title: "GATHER HERBS", icon: "🌿" },
  { id: 3, title: "QUESTION NODE", icon: "🔮" },
];

const ACHIEVEMENT_NODES = [
  { id: 1, title: "QUESTION NODE", icon: "" },
];

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

const PixelPanel = ({ children, title, className = "" }: { children: React.ReactNode, title?: string, className?: string }) => (
  // Removed 'rounded-xl' to make it boxy
  <div className={`relative bg-[#f4e4bc] border-4 border-[#5d3a1a] p-4 shadow-lg flex flex-col w-full ${className}`}>
    {/* Decorative Nails - Adjusted position slightly for boxy corners */}
    <div className="absolute top-2 left-2 w-3 h-3 bg-[#8b5a2b] border-2 border-[#5d3a1a] shadow-sm"></div>
    <div className="absolute top-2 right-2 w-3 h-3 bg-[#8b5a2b] border-2 border-[#5d3a1a] shadow-sm"></div>
    <div className="absolute bottom-2 left-2 w-3 h-3 bg-[#8b5a2b] border-2 border-[#5d3a1a] shadow-sm"></div>
    <div className="absolute bottom-2 right-2 w-3 h-3 bg-[#8b5a2b] border-2 border-[#5d3a1a] shadow-sm"></div>

    {title && (
      // Title tab remains slightly rounded on top for style, or could be boxy too. Kept rounded-t-lg for visual hierarchy as it's a label.
      <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-[#f4e4bc] px-8 py-1 border-x-4 border-t-4 border-[#5d3a1a] text-[#5d3a1a] font-bold text-2xl uppercase rounded-t-lg shadow-sm whitespace-nowrap z-20" style={{ fontFamily: "'VT323', monospace" }}>
        {title}
      </div>
    )}
    
    {/* Inner border removed rounded-lg */}
    <div className="flex-1 w-full border-2 border-[#d4c5a9] border-dashed p-4 bg-[#fdf6e3]/50 overflow-y-auto">
      {children}
    </div>
  </div>
);

const HeaderBar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
  const navItems = [
    { id: 'tasks', label: 'Task' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'shop', label: 'Shop' },
    { id: 'guilds', label: 'Guilds' },
    { id: 'library', label: 'Library' },
    { id: 'help', label: 'Help' },
  ];

  return (
    <div className="bg-[#5d3a1a] px-4 lg:px-8 pt-6 pb-0 flex items-end justify-between border-b-8 border-[#3e2723] relative z-20 shadow-xl">
      <div className="flex items-center gap-4 mb-2 shrink-0">
        {/* Logo - Kept slightly rounded for logo distinction, can make square if preferred */}
        <div className="bg-[#f4d0a3] border-4 border-[#3e2723] px-4 py-2 rounded-lg shadow-md transform -rotate-2">
          <span className="text-2xl lg:text-3xl font-bold text-[#5d3a1a] tracking-widest" style={{ fontFamily: "'VT323', monospace" }}>ALGOMYTH</span>
        </div>
      </div>

      {/* Tabs - Centered with flex-wrap prevention and justified spacing */}
      <div className="flex gap-1 lg:gap-2 items-end justify-center flex-1 px-4 h-full relative z-30">
        {navItems.map((item) => (
          <PixelButton 
            key={item.id} 
            label={item.label} 
            active={activeTab === item.id} 
            onClick={() => setActiveTab(item.id)}
          />
        ))}
      </div>

      {/* Utilities */}
      <div className="flex gap-2 lg:gap-3 pb-4 ml-4 shrink-0">
        {/* Made utility buttons boxy/circular combo or just boxy? Keeping round for buttons is common, but let's make them boxy-ish squares for consistency if desired. Kept round for now as "buttons". */}
        <button className="bg-[#d4a373] border-4 border-[#3e2723] w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center text-[#3e2723] font-bold text-lg lg:text-xl hover:scale-110 transition-transform shadow-lg">M</button>
        <button className="bg-[#d4a373] border-4 border-[#3e2723] w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center text-[#3e2723] font-bold text-lg lg:text-xl hover:scale-110 transition-transform shadow-lg">U</button>
      </div>
    </div>
  );
};

const AvatarSection = () => {
  return (
    <div className="p-8 bg-[#a67c52] border-b-8 border-[#5d3a1a] relative shadow-inner z-10">
      {/* Wood Texture Lines */}
      <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(90deg,transparent,transparent_40px,#3e2723_40px,#3e2723_44px)] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-10 relative z-10 items-start">
        
        {/* BIGGER Avatar Card with Equipment Slots - Removed rounded-xl */}
        <div className="flex gap-8 items-start bg-[#d4a373] p-6 border-4 border-[#5d3a1a] shadow-xl min-w-[450px]">
          
          {/* Left Col: Full Body Avatar + 3 Slots */}
          <div className="flex flex-col gap-4 items-center">
             {/* Full Body Frame - Removed rounded-lg */}
             <div className="w-48 h-72 bg-[#f4e4bc] border-4 border-[#5d3a1a] flex items-center justify-center overflow-hidden shadow-inner relative">
                {/* Placeholder Character Sprite */}
                <User size={140} className="text-[#5d3a1a] opacity-20 relative z-0" />
                <span className="absolute bottom-2 text-xs font-bold text-[#5d3a1a] opacity-50 uppercase tracking-widest">Full Body</span>
             </div>

             {/* 3 Armor Slots Below - Removed rounded-lg */}
             <div className="flex gap-3 w-full justify-between">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="w-14 h-14 bg-[#b88a5f] border-4 border-[#5d3a1a] flex items-center justify-center shadow-inner hover:bg-[#cbb092] cursor-pointer" title="Equipment Slot">
                    <div className="w-8 h-8 bg-[#5d3a1a] opacity-10"></div>
                  </div>
                ))}
             </div>
          </div>

          {/* Right Col: Stats */}
          <div className="flex-1 space-y-4 pt-2" style={{ fontFamily: "'VT323', monospace" }}>
            <div>
               <h2 className="text-4xl font-bold text-[#3e2723] leading-none">@Username</h2>
               <div className="text-[#3e2723] text-2xl font-bold mt-1">LVL: 15</div>
            </div>
            
            {/* Health Bar */}
            <div className="w-full">
               <div className="flex justify-between text-sm font-bold text-[#3e2723] mb-1">
                 <span>HP</span>
                 <span>80/100</span>
               </div>
               {/* Boxy Bar */}
               <div className="w-full h-6 bg-[#3e2723] p-1">
                 <div className="h-full bg-[#ef4444] w-4/5 relative"></div>
               </div>
            </div>

            {/* XP Bar */}
            <div className="w-full">
               <div className="flex justify-between text-sm font-bold text-[#3e2723] mb-1">
                 <span>XP</span>
                 <span>450/1000</span>
               </div>
               {/* Boxy Bar */}
               <div className="w-full h-6 bg-[#3e2723] p-1">
                 <div className="h-full bg-[#76c442] w-2/5 relative"></div>
               </div>
            </div>
            
            <div className="bg-[#f4e4bc] border-2 border-[#5d3a1a] p-2 text-center mt-2">
               <div className="text-[#3e2723] font-bold text-2xl">💰 1,250</div>
            </div>
          </div>
        </div>

        {/* Badge Display - Removed rounded-xl */}
        <div className="flex-1 bg-[#d4a373] p-6 border-4 border-[#5d3a1a] flex flex-col justify-center items-center shadow-xl h-full min-h-[360px]">
           <h3 className="text-[#3e2723] text-3xl mb-6 uppercase tracking-widest border-b-4 border-[#5d3a1a] pb-2 px-8" style={{ fontFamily: "'VT323', monospace" }}>Badge Display</h3>
           <div className="flex gap-4 flex-wrap justify-center">
             {['🧪', '💀', '🔥', '⚙️', '⏳'].map((icon, i) => (
               // Removed rounded-lg
               <div key={i} className="w-20 h-20 bg-[#f4e4bc] border-4 border-[#5d3a1a] flex items-center justify-center text-4xl shadow-md hover:bg-[#fff8e1] hover:scale-105 transition-transform cursor-pointer">
                 {icon}
               </div>
             ))}
           </div>
        </div>

      </div>
    </div>
  );
};

const TaskList = ({ title, items, className="" }: { title: string, items: any[], className?: string }) => (
  <div className={`pt-6 w-full flex-1 flex flex-col ${className}`}> 
    <PixelPanel title={title} className="h-full min-h-[500px] lg:min-h-[700px]">
      <div className="flex flex-col gap-4 mt-4">
        {items.map((item) => (
          // Removed rounded-lg
          <div key={item.id} className="relative bg-[#d4a373] border-4 border-[#8b5a2b] p-3 h-24 flex items-center shadow-md hover:-translate-y-1 transition-transform cursor-pointer group shrink-0">
            {/* Icon Box - Removed rounded */}
            <div className="w-16 h-16 bg-[#3e2723] border-2 border-[#5d3a1a] flex items-center justify-center text-4xl z-10 ml-2 shadow-inner">
              {item.icon}
            </div>
            
            {/* Label */}
            <div className="flex-1 text-center font-bold text-[#3e2723] text-3xl uppercase tracking-wide group-hover:text-[#5d3a1a]" style={{ fontFamily: "'VT323', monospace" }}>
              {item.title}
            </div>

            {/* Inner Shadow Line */}
            <div className="absolute bottom-1 left-1 right-1 h-2 bg-[#8b5a2b] opacity-30 pointer-events-none"></div>
          </div>
        ))}
      </div>
    </PixelPanel>
  </div>
);

const TaskDashboard = () => {
  return (
    <div className="bg-[#fdf6e3] min-h-screen relative font-serif flex">
      {/* 3-Column Grid Layout with Dividers */}
      
      {/* Far Left Pillar */}
      <div className="w-12 bg-[#5d3a1a] border-x-4 border-[#3e2723] hidden lg:block shrink-0"></div>

      {/* COLUMN 1: Solo Area (Moved to 1st Position) */}
      <div className="flex-1 flex flex-col items-center justify-start h-full py-8 px-8">
          <div className="w-full h-full flex flex-col">
            <TaskList title="Solo Area" items={SOLO_NODES} className="h-full" />
          </div>
      </div>

      {/* Middle Pillar 1 */}
      <div className="w-12 bg-[#5d3a1a] border-x-4 border-[#3e2723] hidden lg:block shrink-0"></div>

      {/* COLUMN 2: Dailies (Moved to 2nd Position) */}
      <div className="flex-1 flex flex-col items-center justify-start h-full py-8 px-8">
          <div className="w-full h-full flex flex-col">
            <TaskList title="Dailies" items={DAILIES} className="h-full" />
          </div>
      </div>

      {/* Middle Pillar 2 */}
      <div className="w-12 bg-[#5d3a1a] border-x-4 border-[#3e2723] hidden lg:block shrink-0"></div>

      {/* COLUMN 3: Achievements (Moved to Last Position) */}
      <div className="flex-1 flex flex-col items-center justify-start h-full py-8 px-8">
          <div className="w-full h-full flex flex-col">
            <TaskList title="Achievements" items={ACHIEVEMENT_NODES} className="h-full" />
          </div>
      </div>

      {/* Far Right Pillar */}
      <div className="w-12 bg-[#5d3a1a] border-x-4 border-[#3e2723] hidden lg:block shrink-0"></div>

    </div>
  );
};

const Footer = () => (
  <footer className="bg-[#3e2723] text-[#d4a373] py-6 text-center border-t-8 border-[#5d3a1a]" style={{ fontFamily: "'VT323', monospace" }}>
    <p className="text-lg">© 2026 ALGOMYTH. Mapúa University.</p>
    <div className="flex justify-center gap-6 mt-2 text-xl">
      <a href="#" className="hover:text-white">Privacy</a>
      <span>•</span>
      <a href="#" className="hover:text-white">Terms</a>
      <span>•</span>
      <a href="#" className="hover:text-white">Contact</a>
    </div>
  </footer>
);

// --- MAIN APP COMPONENT ---
const App = () => {
  // 1. Authentication State (This replaces the hardcoded entry)
  const [view, setView] = useState<'landing' | 'auth' | 'game'>('landing');
  const [activeTab, setActiveTab] = useState('tasks');

  // Logic to render the main game content
  const renderGameContent = () => {
    switch (activeTab) {
      case 'tasks': return <TaskDashboard />;
      case 'inventory': return <Inventory />;
      case 'shop': return <Shop />;
      case 'guilds': return <Guilds />;
      case 'library': return <Library />;
      case 'help': return <Help />;
      default: return <TaskDashboard />;
    }
  };

  // 2. The Big Switch: Decides which "Screen" to show
  if (view === 'landing') {
    return <PreLogin onGetStarted={() => setView('auth')} />;
  }

  if (view === 'auth') {
    return <Auth onLogin={() => setView('game')} />;
  }

  // 3. The Game View (Your original 303 lines wrap into this)
  return (
    <div className="min-h-screen bg-[#3e2723] flex flex-col overflow-x-hidden">
      <HeaderBar activeTab={activeTab} setActiveTab={setActiveTab} />
      <AvatarSection />
      <div className="flex-1 bg-[#fdf6e3]">
        {renderGameContent()}
      </div>
      <Footer />
    </div>
  );
};

export default App;