import { useState } from 'react';
import { BookOpen, Code, Lock } from 'lucide-react';

// --- Reusable Pixel Components (Matches other files) ---
const PixelPanel = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`relative bg-[#f4e4bc] border-4 border-[#5d3a1a] p-4 shadow-lg flex flex-col w-full ${className}`}>
    <div className="absolute top-2 left-2 w-2 h-2 bg-[#8b5a2b] border-2 border-[#5d3a1a]"></div>
    <div className="absolute top-2 right-2 w-2 h-2 bg-[#8b5a2b] border-2 border-[#5d3a1a]"></div>
    <div className="absolute bottom-2 left-2 w-2 h-2 bg-[#8b5a2b] border-2 border-[#5d3a1a]"></div>
    <div className="absolute bottom-2 right-2 w-2 h-2 bg-[#8b5a2b] border-2 border-[#5d3a1a]"></div>
    {children}
  </div>
);

// --- Library Specific Components ---

const LoreCard = ({ title, description, unlocked }: { title: string, description: string, unlocked?: boolean }) => (
  <div className={`
    p-4 border-4 border-[#5d3a1a] flex flex-col gap-2 transition-transform hover:-translate-y-1 group relative
    ${unlocked ? 'bg-[#f4d0a3]' : 'bg-[#e3d5ca] grayscale opacity-70'}
  `}>
    <div className="flex items-center gap-2 border-b-2 border-[#8b5a2b] pb-2 mb-1">
      <div className="bg-[#5d3a1a] text-[#f4d0a3] p-1 rounded-sm">
        {unlocked ? <BookOpen size={16} /> : <Lock size={16} />}
      </div>
      <h3 className="font-bold text-[#5d3a1a] text-lg uppercase" style={{ fontFamily: "'VT323', monospace" }}>{title}</h3>
    </div>
    <p className="text-[#3e2723] text-sm leading-tight" style={{ fontFamily: "'VT323', monospace" }}>
      {unlocked ? description : "This ancient text is faded and unreadable. Continue your journey to decipher it."}
    </p>
  </div>
);

const SyntaxCard = ({ title, code }: { title: string, code: string }) => (
  <div className="bg-[#3e2723] p-4 border-4 border-[#5d3a1a] rounded-sm shadow-md">
    <div className="flex items-center gap-2 mb-2 text-[#f4d0a3]">
      <Code size={16} />
      <span className="font-bold uppercase tracking-wider" style={{ fontFamily: "'VT323', monospace" }}>{title}</span>
    </div>
    <div className="bg-[#2d1b15] p-3 rounded border border-[#8b5a2b] font-mono text-xs text-[#76c442] overflow-x-auto">
      <pre>{code}</pre>
    </div>
  </div>
);

const LockedQuestRow = ({ title, requirement }: { title: string, requirement: string }) => (
  <div className="flex items-center justify-between bg-[#e3d5ca] border-4 border-[#8b5a2b] p-3 shadow-sm hover:bg-[#d4c5a9]">
    <div className="flex items-center gap-3">
      <div className="text-[#5d3a1a] opacity-50"><Lock size={20} /></div>
      <span className="font-bold text-[#5d3a1a] text-lg uppercase" style={{ fontFamily: "'VT323', monospace" }}>{title}</span>
    </div>
    <div className="text-[#8b5a2b] text-sm font-bold bg-[#f4e4bc] px-2 py-1 rounded border-2 border-[#d4c5a9]" style={{ fontFamily: "'VT323', monospace" }}>
      REQ: {requirement}
    </div>
  </div>
);

const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center mb-4 mt-2">
    <div className="bg-[#f4d0a3] px-6 py-1 border-4 border-[#5d3a1a] shadow-sm transform -rotate-1">
      <h2 className="text-2xl font-bold text-[#5d3a1a] uppercase tracking-widest" style={{ fontFamily: "'VT323', monospace" }}>{title}</h2>
    </div>
  </div>
);

// --- Data ---
const LORE_ENTRIES = [
  { id: 1, title: "The Architect", description: "The mysterious creator of the 2nd World who wrote the source code of reality.", unlocked: true },
  { id: 2, title: "The Glitch", description: "A corruption spreading through the Array Vaults.", unlocked: true },
  { id: 3, title: "Syntax Sentinels", description: "Guardians of the Caverns who test travelers on basic logic.", unlocked: false },
  { id: 4, title: "Loop of Ouroboros", description: "A time loop created by an infinite while loop.", unlocked: false },
];

const SYNTAX_GUIDES = [
  { id: 1, title: "Python Loop", code: "for i in range(5):\n  print(i)" },
  { id: 2, title: "If Statement", code: "if health <= 0:\n  print('Game Over')" },
];

const LOCKED_QUESTS = [
  { id: 1, title: "The Infinite Loop", requirement: "Complete 'Loop Forest'" },
  { id: 2, title: "Array Sorting", requirement: "Reach Lvl 10" },
  { id: 3, title: "Boss: Glitch King", requirement: "Collect 3 Key Fragments" },
];

export const Library = () => {
  return (
    <div className="h-full flex flex-col pt-4 items-center">
      <div className="w-full max-w-6xl bg-[#fdf6e3] p-8 flex justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
          
          {/* Left Page: Lore & Syntax */}
          <div className="flex flex-col gap-6">
            <PixelPanel className="min-h-[400px]">
              <SectionHeader title="Lore Archive" />
              <div className="grid grid-cols-2 gap-4">
                {LORE_ENTRIES.map(entry => (
                  <LoreCard key={entry.id} {...entry} />
                ))}
              </div>
            </PixelPanel>

            <PixelPanel>
              <SectionHeader title="Syntax Guide" />
              <div className="flex flex-col gap-3">
                {SYNTAX_GUIDES.map(guide => (
                  <SyntaxCard key={guide.id} {...guide} />
                ))}
              </div>
            </PixelPanel>
          </div>

          {/* Right Page: Locked Quests */}
          <div className="flex flex-col h-full">
            <PixelPanel className="h-full">
              <SectionHeader title="Locked Quests" />
              <div className="flex flex-col gap-4 mt-2">
                {LOCKED_QUESTS.map(quest => (
                  <LockedQuestRow key={quest.id} {...quest} />
                ))}
                {/* Filler lines to look like a list */}
                {[...Array(3)].map((_, i) => (
                   <div key={i} className="h-12 border-b-4 border-[#d4c5a9] border-dashed w-full opacity-30"></div>
                ))}
              </div>
            </PixelPanel>
          </div>

        </div>
      </div>
    </div>
  );
};