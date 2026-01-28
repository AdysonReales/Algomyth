import { useState } from 'react';
import { Box, Shield, Zap, Sparkles } from 'lucide-react';

// --- Reusable Pixel Components (Local for now) ---
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

const TabButton = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`px-6 py-2 font-bold text-lg uppercase border-4 border-[#5d3a1a] transition-all
      ${active 
        ? 'bg-[#f4e4bc] text-[#5d3a1a] border-b-0 -mb-1 z-10' 
        : 'bg-[#b88a5f] text-[#3e2723] hover:bg-[#cbb092]'
      }`}
    style={{ fontFamily: "'VT323', monospace" }}
  >
    {label}
  </button>
);

const ItemSlot = ({ label, icon }: { label?: string, icon?: any }) => (
  <div className="flex flex-col items-center gap-2">
    <div className="w-24 h-24 bg-[#d4a373] border-4 border-[#8b5a2b] flex items-center justify-center shadow-inner hover:bg-[#e0b080] cursor-pointer group relative">
        <div className="text-[#5d3a1a] opacity-50 group-hover:scale-110 transition-transform text-4xl">
            {icon}
        </div>
    </div>
    {label && <span className="font-bold text-[#5d3a1a] text-xl" style={{ fontFamily: "'VT323', monospace" }}>{label}</span>}
  </div>
);

const GridItem = ({ name }: { name: string }) => (
  <div className="flex flex-col items-center gap-1 p-2">
    <div className="w-20 h-20 bg-[#f4d0a3] border-4 border-[#8b5a2b] flex items-center justify-center shadow-sm hover:scale-105 transition-transform cursor-pointer">
       <Box className="text-[#5d3a1a]" />
    </div>
    <span className="font-bold text-[#5d3a1a] text-lg leading-none" style={{ fontFamily: "'VT323', monospace" }}>{name}</span>
  </div>
);

export const Inventory = () => {
  const [category, setCategory] = useState<'items' | 'equipment' | 'pets'>('items');

  return (
    <div className="h-full flex flex-col pt-4">
      {/* 1. Sub-Navigation Tabs */}
      <div className="flex gap-2 px-8 border-b-4 border-[#5d3a1a] bg-[#3e2723]/20">
        <TabButton label="Items" active={category === 'items'} onClick={() => setCategory('items')} />
        <TabButton label="Equipment" active={category === 'equipment'} onClick={() => setCategory('equipment')} />
        <TabButton label="Pets" active={category === 'pets'} onClick={() => setCategory('pets')} />
      </div>

      {/* 2. Main Inventory Area */}
      <div className="flex-1 bg-[#fdf6e3] p-8 flex gap-8">
        
        {/* Left Column: Equipment Slots (Based on your wireframe) */}
        <div className="w-1/4 flex flex-col gap-6 items-center border-r-4 border-[#d4c5a9] pr-8 border-dashed">
           <ItemSlot label="Head" icon="🧢" />
           <ItemSlot label="Body" icon="👕" />
           <ItemSlot label="Accessory" icon="💍" />
        </div>

        {/* Right Column: Item Grid */}
        <div className="flex-1">
           <div className="grid grid-cols-4 lg:grid-cols-5 gap-6">
              {/* Mock Items */}
              <GridItem name="Potion" />
              <GridItem name="Scroll" />
              <GridItem name="Key" />
              <GridItem name="Herb" />
              <GridItem name="Gem" />
              {[...Array(10)].map((_, i) => (
                 <div key={i} className="w-20 h-20 bg-[#e3d5ca] border-4 border-[#d4c5a9] border-dashed opacity-50"></div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
};