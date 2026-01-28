import { useState } from 'react';
import { Users, Shield, Scroll } from 'lucide-react';

// --- Reusable Pixel Components (Matches Inventory.tsx & Shop.tsx) ---
const PixelPanel = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`relative bg-[#f4e4bc] border-4 border-[#5d3a1a] p-4 shadow-lg flex flex-col w-full ${className}`}>
    {/* Nails */}
    <div className="absolute top-2 left-2 w-2 h-2 bg-[#8b5a2b] border-2 border-[#5d3a1a]"></div>
    <div className="absolute top-2 right-2 w-2 h-2 bg-[#8b5a2b] border-2 border-[#5d3a1a]"></div>
    <div className="absolute bottom-2 left-2 w-2 h-2 bg-[#8b5a2b] border-2 border-[#5d3a1a]"></div>
    <div className="absolute bottom-2 right-2 w-2 h-2 bg-[#8b5a2b] border-2 border-[#5d3a1a]"></div>
    {children}
  </div>
);

// --- Guild Specific Components ---

const GuildCard = ({ name, members, active }: { name: string, members: number, active?: boolean }) => (
  <div className={`
    p-6 border-4 border-[#5d3a1a] flex flex-col items-center gap-4 cursor-pointer transition-transform hover:-translate-y-1 group
    ${active ? 'bg-[#f4d0a3]' : 'bg-[#e3d5ca]'}
  `}>
    {/* Guild Banner/Icon Placeholder */}
    <div className="w-24 h-24 bg-[#5d3a1a] rounded-full flex items-center justify-center border-4 border-[#8b5a2b] shadow-inner group-hover:scale-105 transition-transform">
       <Shield size={48} className="text-[#f4d0a3]" />
    </div>
    
    <div className="text-center">
      <h3 className="text-2xl font-bold text-[#5d3a1a] uppercase tracking-wide" style={{ fontFamily: "'VT323', monospace" }}>{name}</h3>
      <div className="flex items-center justify-center gap-2 text-[#8b5a2b] font-bold mt-1" style={{ fontFamily: "'VT323', monospace" }}>
        <Users size={16} />
        <span>{members} Members</span>
      </div>
    </div>

    <button className="bg-[#5d3a1a] text-[#f4d0a3] px-6 py-2 text-lg font-bold uppercase hover:bg-[#3e2723] w-full mt-2" style={{ fontFamily: "'VT323', monospace" }}>
      View Hall
    </button>
  </div>
);

const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center mb-6">
    <div className="bg-[#f4d0a3] px-8 py-2 border-4 border-[#5d3a1a] shadow-sm transform -rotate-1">
      <h2 className="text-3xl font-bold text-[#5d3a1a] uppercase tracking-widest" style={{ fontFamily: "'VT323', monospace" }}>{title}</h2>
    </div>
  </div>
);

export const Guilds = () => {
  const [classCode, setClassCode] = useState('');

  return (
    <div className="h-full flex flex-col pt-4 items-center">
      <div className="w-full max-w-5xl bg-[#fdf6e3] p-8 flex justify-center">
        <PixelPanel className="min-h-[600px] gap-8">
          
          {/* 1. Join Guild Section */}
          <div className="flex flex-col items-center gap-4 border-b-4 border-[#d4c5a9] pb-8 border-dashed">
            <SectionHeader title="Join Guild" />
            
            <div className="flex flex-col md:flex-row gap-4 w-full max-w-2xl items-center">
              <div className="flex-1 w-full">
                <input 
                  type="text" 
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                  placeholder="ENTER CLASS CODE"
                  className="w-full bg-[#fdf6e3] border-4 border-[#8b5a2b] p-4 text-2xl text-[#5d3a1a] placeholder-[#d4c5a9] font-bold text-center focus:outline-none focus:border-[#5d3a1a]"
                  style={{ fontFamily: "'VT323', monospace" }}
                />
              </div>
              <button className="bg-[#76c442] border-4 border-[#3e2723] text-white px-8 py-4 text-2xl font-bold uppercase hover:bg-[#5da035] shadow-md active:translate-y-1 transition-all" style={{ fontFamily: "'VT323', monospace" }}>
                Join
              </button>
            </div>
            <p className="text-[#8b5a2b] text-lg" style={{ fontFamily: "'VT323', monospace" }}>
              Ask your Instructor (Guild Master) for the unique code.
            </p>
          </div>

          {/* 2. Your Guilds Section */}
          <div className="flex-1 flex flex-col items-center">
            <SectionHeader title="Your Guilds" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-4xl px-8">
              {/* Guild 1 */}
              <GuildCard name="Section A - CS101" members={24} active />
              
              {/* Guild 2 */}
              <GuildCard name="Section B - Algo" members={18} />
              
              {/* Empty State / Add New Placeholder if needed */}
              {/* <div className="border-4 border-dashed border-[#d4c5a9] flex items-center justify-center p-8 opacity-50">
                 <span className="text-[#8b5a2b] text-xl font-bold uppercase" style={{ fontFamily: "'VT323', monospace" }}>Empty Slot</span>
              </div> */}
            </div>
          </div>

        </PixelPanel>
      </div>
    </div>
  );
};