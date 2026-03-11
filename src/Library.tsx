import { BookOpen, Lock, Music, Brush } from 'lucide-react';

const PixelPanel = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`relative bg-[#f4e4bc] border-4 border-[#5d3a1a] p-4 shadow-lg flex flex-col w-full ${className}`}>
    <div className="absolute top-2 left-2 w-2 h-2 bg-[#8b5a2b] border-2 border-[#5d3a1a]"></div>
    <div className="absolute top-2 right-2 w-2 h-2 bg-[#8b5a2b] border-2 border-[#5d3a1a]"></div>
    <div className="absolute bottom-2 left-2 w-2 h-2 bg-[#8b5a2b] border-2 border-[#5d3a1a]"></div>
    <div className="absolute bottom-2 right-2 w-2 h-2 bg-[#8b5a2b] border-2 border-[#5d3a1a]"></div>
    {children}
  </div>
);

const LoreCard = ({ title, description, unlocked }: { title: string, description: string, unlocked?: boolean }) => (
  <div className={`p-4 border-4 border-[#5d3a1a] flex flex-col gap-2 transition-transform hover:-translate-y-1 group relative ${unlocked ? 'bg-[#f4d0a3]' : 'bg-[#e3d5ca] grayscale opacity-70'}`}>
    <div className="flex items-center gap-2 border-b-2 border-[#8b5a2b] pb-2 mb-1">
      <div className="bg-[#5d3a1a] text-[#f4d0a3] p-1 rounded-sm">
        {unlocked ? <BookOpen size={16} /> : <Lock size={16} />}
      </div>
      <h3 className="font-bold text-[#5d3a1a] text-lg uppercase leading-none" style={{ fontFamily: "'VT323', monospace" }}>{title}</h3>
    </div>
    <p className="text-[#3e2723] text-sm leading-tight font-bold" style={{ fontFamily: "'VT323', monospace" }}>
      {unlocked ? description : "This ancient text is faded. Clear more nodes to decipher it."}
    </p>
  </div>
);

const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center mb-4 mt-2">
    <div className="bg-[#f4d0a3] px-6 py-1 border-4 border-[#5d3a1a] shadow-sm transform -rotate-1">
      <h2 className="text-2xl font-bold text-[#5d3a1a] uppercase tracking-widest" style={{ fontFamily: "'VT323', monospace" }}>{title}</h2>
    </div>
  </div>
);

const LORE_ENTRIES = [
  { id: 1, title: "The Architect", description: "The mysterious creator of the 2nd World who wrote the source code of reality. Legends say the Architect left fragments of their power in the 'Task Pool'.", unlocked: true },
  { id: 2, title: "Whispering Gate", description: "The first barrier of the Algorithm. It demands a simple greeting to pass, but many remain trapped in its silent void, unable to speak the 'cout'.", unlocked: true },
  { id: 3, title: "Crystal Arch", description: "A resonant structure that amplifies logical echoes. It teaches travelers that true presence requires a deliberate declaration of existence.", unlocked: true },
  { id: 4, title: "Mossy Door", description: "Ancient and overgrown, this door responds only to the polite traditions of the old syntax.", unlocked: true },
  { id: 5, title: "Iron Keyhole", description: "A rigid lock that expects a specific passphrase. It has no tolerance for typos or misplaced semicolons.", unlocked: false },
  { id: 6, title: "Alchemist Lab", description: "A volatile zone where variables are mixed like potions. Beware combining incompatible types, lest you trigger a Type Error explosion.", unlocked: false },
  { id: 7, title: "Clockwork Tower", description: "A towering spire of moving gears representing mathematical operations. Precision is required to align the cogs of logic.", unlocked: false },
  { id: 8, title: "Syntax Sentinel", description: "The final guardian of the early realm. A ruthless judge of boolean logic and variable overrides.", unlocked: false },
];

export const Library = () => {
  return (
    <div className="h-full flex flex-col pt-4 items-center overflow-y-auto">
      <div className="w-full max-w-6xl bg-[#fdf6e3] p-4 md:p-8 flex justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
          
          <div className="lg:col-span-2 flex flex-col gap-6">
            <PixelPanel className="min-h-[400px]">
              <SectionHeader title="Lore Archive" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {LORE_ENTRIES.map(entry => <LoreCard key={entry.id} {...entry} />)}
              </div>
            </PixelPanel>
          </div>

          <div className="flex flex-col gap-6 h-full">
            <PixelPanel className="h-full">
              <SectionHeader title="Credits" />
              <div className="flex flex-col gap-6 mt-2 font-bold text-[#5d3a1a]" style={{ fontFamily: "'VT323', monospace" }}>
                 <div className="bg-[#e3d5ca] border-4 border-[#8b5a2b] p-4">
                  <div className="flex items-center gap-2 mb-2 border-b-2 border-[#8b5a2b] pb-1">
                    <Brush size={20} /> <span className="text-xl uppercase">Art Assets</span>
                  </div>
                  <ul className="text-sm space-y-2">
                    <li><span className="text-[#8b5a2b]">Main Character Render:</span> Erin Faye D. Fernandez</li>
                    <li><span className="text-[#8b5a2b]">Main Character Sketch:</span> Jessica Christine Marie D. Seno</li>

                    <li><span className="text-[#8b5a2b]"></span> Borrowed Assets:</li>
                    <li><span className="text-[#8b5a2b]">Pet Sprites:</span> Jackalune Lythboth Creatures</li>
                    <li><span className="text-[#8b5a2b]">Wing Assets:</span> Neonna Ch</li>
                  </ul>
                </div>

                <div className="flex flex-col gap-6 mt-2 font-bold text-[#5d3a1a]" style={{ fontFamily: "'VT323', monospace" }}>
                 <div className="bg-[#e3d5ca] border-4 border-[#8b5a2b] p-4">
                  <div className="flex items-center gap-2 mb-2 border-b-2 border-[#8b5a2b] pb-1">
                    <Brush size={20} /> <span className="text-xl uppercase">Developers</span>
                  </div>
                  <ul className="text-sm space-y-2">
                    <li><span className="text-[#8b5a2b]"></span> Adyson M. Reales</li>
                    <li><span className="text-[#8b5a2b]"></span> Rolando C. Zagala JR</li>
                  </ul>
                </div>
                
                <div className="bg-[#e3d5ca] border-4 border-[#8b5a2b] p-4">
                  <div className="flex items-center gap-2 mb-2 border-b-2 border-[#8b5a2b] pb-1">
                    <Music size={20} /> <span className="text-xl uppercase">Audio</span>
                  </div>
                  <ul className="text-sm space-y-2">
                    <li><span className="text-[#8b5a2b]">Main Theme:</span><br/><a href="https://www.youtube.com/watch?v=dm4kGvOxmjE" target="_blank" className="text-blue-600 hover:underline">Youtube Link</a></li>
                    <li><span className="text-[#8b5a2b]">Coding Ambience:</span><br/><a href="https://www.youtube.com/watch?v=tQR6jyfK6Ps" target="_blank" className="text-blue-600 hover:underline">Youtube Link</a></li>
                  </ul>
                </div>

               </div>
              </div>
            </PixelPanel>
          </div>

        </div>
      </div>
    </div>
    
  );
};