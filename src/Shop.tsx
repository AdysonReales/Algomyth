import { useState } from 'react';
import { ShoppingBag, Lock, Palette } from 'lucide-react';

// --- Reusable Pixel Components (Matches Inventory.tsx) ---
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

// --- Shop Specific Components ---

const ShopItemCard = ({ name, price, icon, type }: { name: string, price: number, icon: string, type: string }) => (
  <div className="flex flex-col items-center gap-2 group cursor-pointer">
    {/* Item Box */}
    <div className="w-24 h-24 bg-[#f4d0a3] border-4 border-[#8b5a2b] flex items-center justify-center shadow-md group-hover:-translate-y-1 transition-transform relative">
       <div className="text-4xl">{icon}</div>
       <div className="absolute bottom-1 right-1 text-[10px] text-[#5d3a1a] opacity-50 font-bold uppercase">{type}</div>
    </div>
    
    {/* Price Tag */}
    <div className="bg-[#d4a373] border-2 border-[#5d3a1a] px-3 py-0.5 text-[#3e2723] font-bold text-lg shadow-sm" style={{ fontFamily: "'VT323', monospace" }}>
      {price} G
    </div>
  </div>
);

const SectionHeader = ({ title, icon: Icon }: { title: string, icon: any }) => (
  <div className="flex items-center gap-2 mb-4 border-b-4 border-[#d4c5a9] pb-2 border-dashed">
    <Icon className="text-[#5d3a1a]" size={24} />
    <h2 className="text-3xl font-bold text-[#5d3a1a] uppercase" style={{ fontFamily: "'VT323', monospace" }}>{title}</h2>
  </div>
);

// --- Data ---
const MARKET_ITEMS = [
  { id: 1, name: "Potion", price: 50, icon: "🧪", type: "Item" },
  { id: 2, name: "Scroll", price: 120, icon: "📜", type: "Item" },
  { id: 3, name: "Shield", price: 500, icon: "🛡️", type: "Equip" },
  { id: 4, name: "Sword", price: 750, icon: "⚔️", type: "Equip" },
];

const QUEST_ITEMS = [
  { id: 1, name: "Cave Key", price: 1000, icon: "🗝️", type: "Key" },
  { id: 2, name: "Map Fragment", price: 2500, icon: "🗺️", type: "Map" },
  { id: 3, name: "Boss Summon", price: 5000, icon: "💀", type: "Summon" },
];

const COSMETIC_ITEMS = [
  { id: 1, name: "Blue Hair", price: 300, icon: "💇‍♂️", type: "Hair" },
  { id: 2, name: "Green Skin", price: 800, icon: "🧟", type: "Skin" },
  { id: 3, name: "Golden Aura", price: 5000, icon: "✨", type: "Aura" },
];

export const Shop = () => {
  const [activeTab, setActiveTab] = useState<'market' | 'quest' | 'customize'>('market');

  return (
    <div className="h-full flex flex-col pt-4">
      {/* 1. Sub-Navigation Tabs */}
      <div className="flex gap-2 px-8 border-b-4 border-[#5d3a1a] bg-[#3e2723]/20">
        <TabButton label="Market" active={activeTab === 'market'} onClick={() => setActiveTab('market')} />
        <TabButton label="Quest" active={activeTab === 'quest'} onClick={() => setActiveTab('quest')} />
        <TabButton label="Customize" active={activeTab === 'customize'} onClick={() => setActiveTab('customize')} />
      </div>

      {/* 2. Main Shop Area */}
      <div className="flex-1 bg-[#fdf6e3] p-8 flex justify-center">
        <PixelPanel className="max-w-5xl h-full">
          
          {/* Market View */}
          {activeTab === 'market' && (
            <div className="animate-fadeIn">
              <SectionHeader title="General Goods" icon={ShoppingBag} />
              
              <div className="flex flex-col gap-8">
                {/* Consumables Section */}
                <div>
                  <h3 className="text-xl font-bold text-[#8b5a2b] mb-4" style={{ fontFamily: "'VT323', monospace" }}>Consumables & Gear</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                    {MARKET_ITEMS.map(item => (
                      <ShopItemCard key={item.id} {...item} />
                    ))}
                    {/* Fillers */}
                    {[...Array(2)].map((_, i) => (
                       <div key={i} className="w-24 h-24 border-4 border-[#d4c5a9] border-dashed opacity-30 rounded-lg"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quest View */}
          {activeTab === 'quest' && (
            <div className="animate-fadeIn">
              <SectionHeader title="Quest Unlocks" icon={Lock} />
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                {QUEST_ITEMS.map(item => (
                  <ShopItemCard key={item.id} {...item} />
                ))}
              </div>
            </div>
          )}

          {/* Customize View */}
          {activeTab === 'customize' && (
            <div className="animate-fadeIn">
              <SectionHeader title="Salon & Skins" icon={Palette} />
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                {COSMETIC_ITEMS.map(item => (
                  <ShopItemCard key={item.id} {...item} />
                ))}
              </div>
            </div>
          )}

        </PixelPanel>
      </div>
    </div>
  );
};