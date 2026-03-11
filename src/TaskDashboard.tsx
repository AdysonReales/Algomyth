import { useState, useEffect } from 'react';
import axios from 'axios';

// --- Types ---
interface Task {
  _id: string;
  nodeTitle: string;
  difficulty: 'Easy' | 'Medium' | 'Boss';
  isCleared: boolean;
  requiredStreak: number;
  reward?: { gold: number; xp: number };
}

export const TaskDashboard = ({ 
  onSelectTask, 
  userData, 
  setUserData,        // Add this!
  achievementEmojis   // Add this!
}: { 
  onSelectTask: (task: any) => void, 
  userData: any,
  setUserData: (data: any) => void,
  achievementEmojis: Record<string, string>
}) => {
  const [soloNodes, setSoloNodes] = useState<Task[]>([]);
  const [dailyData, setDailyData] = useState({ mainDailies: [], boughtQuests: [] });
  const [achievements, setAchievements] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // 1. Fetch everything in parallel to avoid multiple re-renders
        const [soloRes, dailyRes, achRes] = await Promise.all([
          axios.get('http://localhost:5000/api/tasks/solo-pool'),
          axios.get('http://localhost:5000/api/tasks/dailies'),
          axios.get('http://localhost:5000/api/achievements') 
        ]);

        setSoloNodes(soloRes.data.sort((a: any, b: any) => a.requiredStreak - b.requiredStreak));
        setDailyData(dailyRes.data);
        setAchievements(achRes.data); 
      } catch (err) {
        console.error("Dashboard Sync Failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // --- COLUMN 1: SOLO ADVENTURE ---
  const renderSoloColumn = () => {
    let highestClearedIndex = -1;
    soloNodes.forEach((node, idx) => { if (node.isCleared) highestClearedIndex = idx; });
    const currentActiveIndex = Math.max(0, highestClearedIndex + 1);

    return (
      <TaskListWrapper title="Solo Area">
        <div className="flex flex-col gap-4 mt-4 overflow-y-auto custom-scrollbar h-full max-h-[500px] pr-2">
          {soloNodes.map((node, index) => {
            const isUnlocked = index <= currentActiveIndex;
            return isUnlocked ? (
              <TaskNode key={node._id} node={node} index={index} onClick={() => onSelectTask(node)} />
            ) : (
              <LockedSoloNode key={node._id} index={index} />
            );
          })}
        </div>
      </TaskListWrapper>
    );
  };

  // --- COLUMN 2: DAILIES (Main + Bought) ---
  const renderDailiesColumn = () => {
    return (
      <TaskListWrapper title="Dailies">
        <div className="flex flex-col gap-4 mt-4 overflow-y-auto custom-scrollbar h-full max-h-[500px] pr-2">
            <div className="mb-4">
              <div className="text-[#3e2723] text-xs font-bold mb-2 border-b-2 border-[#5d3a1a]/20 pb-1 uppercase">Cycle Bounties</div>
              <div className="flex flex-col gap-3">
                {dailyData.mainDailies.map((quest: any, i) => (
                  <TaskNode key={quest._id} node={quest} index={i} isDaily onClick={() => onSelectTask(quest)} />
                ))}
              </div>
            </div>

            <div>
              <div className="text-[#3e2723] text-xs font-bold mb-2 border-b-2 border-[#5d3a1a]/20 pb-1 uppercase">Bought Quests</div>
              <div className="flex flex-col gap-3">
                {dailyData.boughtQuests.length > 0 ? (
                  dailyData.boughtQuests.map((inv: any, i) => (
                    <TaskNode key={inv._id} node={inv.item} index={i} isBought onClick={() => onSelectTask(inv.item)} />
                  ))
                ) : (
                  <div className="p-4 border-2 border-dashed border-[#5d3a1a]/20 text-center text-[#5d3a1a]/40 text-xs italic">
                    No active scrolls... Check the Shop!
                  </div>
                )}
              </div>
            </div>
        </div>
      </TaskListWrapper>
    );
  };

  // --- COLUMN 3: ACHIEVEMENTS & BADGES ---
const renderAchievementsColumn = () => {
  // Debug log to ensure data is flowing correctly
  console.log("👀 MY ACHIEVEMENTS:", userData?.achievements);

  // Function to handle pinning an achievement to a display slot
  const handleAchievementClick = async (achKey: string) => {
  const isUnlocked = userData?.achievements?.includes(achKey);
  
  // 1. Safety check for lock status
  if (!isUnlocked) {
    alert("Quest not yet complete!");
    return;
  }

  // 2. DUPLICATE CHECK: Check if the key is already in the pinnedAchievements array
  const isAlreadyPinned = userData?.pinnedAchievements?.some((key: string) => key === achKey);
  
  if (isAlreadyPinned) {
    alert("This badge is already on your display! Remove it first if you want to move slots.");
    return;
  }

  const slot = prompt("Which display slot? (Enter 1-5)");
  const slotIndex = parseInt(slot || "0") - 1;

  if (slotIndex >= 0 && slotIndex < 5) {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/pin-achievement', { 
        achKey, 
        slotIndex 
      });
      
      setUserData({ 
        ...userData, 
        pinnedAchievements: res.data.pinnedAchievements 
      });
    } catch (err) {
      alert("Failed to update display.");
    }
  }
};

  return (
    <TaskListWrapper title="Achievements">
      <div className="flex flex-col gap-4 mt-4 overflow-y-auto custom-scrollbar max-h-[480px] pr-2">
        {achievements.length > 0 ? (
          achievements.map((ach) => {
            // Check if the achievement is unlocked
            const isUnlocked = userData?.achievements?.includes(ach.key);
            // Get the specific emoji for this achievement key
            const displayEmoji = achievementEmojis[ach.key] || '🏆';

            return (
              <div 
                key={ach.key} 
                onClick={() => handleAchievementClick(ach.key)}
                className={`relative border-4 p-3 flex flex-col shadow-md transition-all cursor-pointer group
                  ${isUnlocked 
                    ? 'bg-[#f4e4bc] border-[#5d3a1a] opacity-100 hover:scale-[1.02] active:scale-95' 
                    : 'bg-[#3e2723]/10 border-[#5d3a1a]/20 opacity-80 grayscale pointer-events-none' 
                  }`}
              >
                <div className="flex items-center gap-3">
                  {/* DYNAMIC ICON: Uses the specific emoji from the map */}
                  <div className={`w-12 h-12 border-2 border-[#5d3a1a] flex items-center justify-center text-2xl shrink-0 transition-all
                    ${isUnlocked ? 'bg-[#f59e0b]' : 'bg-[#2b1b17]'}`}
                  >
                    {isUnlocked ? displayEmoji : '🛡️'}
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <div className="font-bold text-[#3e2723] text-lg uppercase leading-tight truncate" style={{ fontFamily: "'VT323', monospace" }}>
                      {ach.title}
                    </div>
                    
                    <div className={`text-[10px] font-bold uppercase italic 
                      ${isUnlocked ? 'text-green-700' : 'text-[#5d3a1a] opacity-70'}`}>
                      {isUnlocked ? '★ Click to Pin!' : 'Locked'}
                    </div>
                  </div>
                </div>

                <div className="mt-2 p-2 bg-[#fdf6e3] border-2 border-dashed border-[#d4c5a9] text-[#5d3a1a] text-xs leading-tight">
                  <span className="font-bold uppercase text-[9px] block mb-1 text-[#8b5a2b]">How to unlock:</span>
                  {ach.description}
                </div>

                {!isUnlocked && (
                  <div className="absolute top-2 right-2 bg-[#5d3a1a] text-white text-[8px] px-1 font-bold uppercase">
                    Locked
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center text-[#5d3a1a] opacity-50 italic mt-10">No achievements found in database.</div>
        )}
      </div>
    </TaskListWrapper>
  );
};

  if (loading) return <div className="h-full flex items-center justify-center text-2xl font-bold text-[#5d3a1a]">SYNCING ALGOMYTH...</div>;

  return (
    <div className="bg-[#fdf6e3] h-full font-serif flex overflow-hidden">
      <div className="w-8 bg-[#5d3a1a] border-x-4 border-[#3e2723] hidden xl:block shrink-0"></div>
      <div className="flex-1 flex flex-row gap-6 p-6 overflow-hidden items-stretch">
        {renderSoloColumn()}
        {renderDailiesColumn()}
        {renderAchievementsColumn()}
      </div>
      <div className="w-8 bg-[#5d3a1a] border-x-4 border-[#3e2723] hidden xl:block shrink-0"></div>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const TaskListWrapper = ({ title, children }: any) => (
  <div className="flex-1 flex flex-col relative pt-8 min-w-0">
    <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#f4e4bc] px-6 py-1 border-x-4 border-t-4 border-[#5d3a1a] text-[#5d3a1a] font-bold text-lg uppercase z-30" style={{ fontFamily: "'VT323', monospace", whiteSpace: 'nowrap' }}>
        {title}
    </div>
    <div className="flex-1 bg-[#f4e4bc] border-4 border-[#5d3a1a] p-4 shadow-lg flex flex-col overflow-hidden">
      <div className="flex-1 border-2 border-[#d4c5a9] border-dashed p-4 bg-[#fdf6e3]/50 overflow-hidden">
        {children}
      </div>
    </div>
  </div>
);

const TaskNode = ({ node, index, isDaily, isBought, onClick }: any) => {
  const diffColor = node.difficulty === 'Boss' ? 'bg-[#ef4444]' : node.difficulty === 'Medium' ? 'bg-[#f59e0b]' : 'bg-[#76c442]';
  return (
    <div 
      onClick={onClick}
      className={`relative border-4 p-3 h-24 flex items-center shadow-md transition-all cursor-pointer group shrink-0
        ${node.isCleared ? 'bg-[#e3d5ca] border-[#a89f91] opacity-50' : 'bg-[#d4a373] border-[#8b5a2b] hover:-translate-y-1'}`}
    >
      <div className={`w-10 h-10 border-2 border-[#5d3a1a] flex items-center justify-center text-xl z-10 font-bold text-white shrink-0 ${diffColor}`}>
        {isBought ? '📜' : index + 1}
      </div>
      <div className="ml-3 overflow-hidden">
        <div className="font-bold text-[#3e2723] text-sm md:text-md uppercase truncate" style={{ fontFamily: "'VT323', monospace" }}>{node.nodeTitle}</div>
        <div className="text-[#5d3a1a] text-[10px] font-bold uppercase">
          {isDaily ? 'Daily Bounty' : isBought ? 'Bought Quest' : node.isCleared ? '✓ Cleared' : '★ Current'}
        </div>
      </div>
    </div>
  );
};

const LockedSoloNode = ({ index }: { index: number }) => (
  <div className="bg-[#3e2723] border-4 border-[#5d3a1a] p-3 h-24 flex items-center opacity-60 grayscale shrink-0">
    <div className="w-10 h-10 border-2 border-[#5d3a1a] bg-[#2b1b17] flex items-center justify-center text-xl font-bold text-[#8b5a2b]">🔒</div>
    <div className="ml-3 overflow-hidden">
        <div className="font-bold text-[#8b5a2b] text-sm uppercase truncate" style={{ fontFamily: "'VT323', monospace" }}>LOCKED</div>
        <div className="text-[#a89f91] text-[10px] font-bold uppercase">Unlock Node {index + 1}...</div>
    </div>
  </div>
);