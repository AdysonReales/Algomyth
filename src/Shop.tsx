import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, Lock, Palette } from 'lucide-react';

const PixelPanel = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`relative bg-[#f4e4bc] border-4 border-[#5d3a1a] p-4 shadow-lg flex flex-col w-full ${className}`}>
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
      ${active ? 'bg-[#f4e4bc] text-[#5d3a1a] border-b-0 -mb-1 z-10' : 'bg-[#b88a5f] text-[#3e2723] hover:bg-[#cbb092]'}`}
    style={{ fontFamily: "'VT323', monospace" }}
  >
    {label}
  </button>
);

const ShopItemCard = ({ name, price, icon, category, onBuy, isOwned }: { 
  name: string, price: number, icon: string, category: string, onBuy: () => void, isOwned: boolean 
}) => {
  // Logic for color-coded outlines
  const getBorderColor = () => {
    if (category === 'Head') return 'border-red-500';
    if (category === 'Body') return 'border-blue-500';
    if (category === 'Accessory' || category === 'Pet') return 'border-gray-500';
    return 'border-[#8b5a2b]';
  };

  return (
    <div 
      className={`flex flex-col items-center gap-2 group transition-all ${isOwned ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`} 
      onClick={isOwned ? undefined : onBuy}
    >
      <div className={`w-24 h-24 border-4 flex items-center justify-center shadow-md relative transition-transform
        ${isOwned ? 'bg-[#3e2723]/40 border-[#5d3a1a] grayscale' : `bg-[#f4d0a3] ${getBorderColor()} group-hover:-translate-y-1`}`}
      >
          <img 
            src={icon} 
            alt={name} 
            className="w-16 h-16 object-contain" 
            style={{ imageRendering: 'pixelated' }} 
            onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/64?text=📦')}
          />
          
          {isOwned && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#3e2723]/60 z-20">
               <span className="text-white text-[10px] font-bold uppercase tracking-widest bg-[#ef4444] px-1 border border-white">OWNED</span>
            </div>
          )}
          <div className="absolute bottom-1 right-1 text-[10px] text-[#5d3a1a] opacity-50 font-bold uppercase">{category}</div>
      </div>
      
      <div className={`border-2 px-3 py-0.5 font-bold text-lg shadow-sm ${isOwned ? 'bg-[#5d3a1a] text-[#f4e4bc]' : 'bg-[#d4a373] text-[#3e2723] border-[#5d3a1a]'}`} style={{ fontFamily: "'VT323', monospace" }}>
        {isOwned ? "LOCKED" : `${price} G`}
      </div>
      <div className="text-[#5d3a1a] font-bold text-sm uppercase text-center leading-none mt-1" style={{ fontFamily: "'VT323', monospace" }}>{name}</div>
    </div>
  );
};

export const Shop = ({ onBuyItem, userInventory = [], userData }: { onBuyItem: (item: any) => void, userInventory: any[], userData?: any }) => {
  const [activeTab, setActiveTab] = useState<'market' | 'quest' | 'customize'>('market');
  const [shopItems, setShopItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/shop/items');
        setShopItems(res.data);
      } catch (err) { console.error(err); }
    };
    fetchItems();
  }, []);

  const isAlreadyOwned = (itemId: string) => userInventory.some(inv => inv.item?._id === itemId || inv.item === itemId);

  // Determine User Class for filtering
  const userIndex = userData?.characterIndex || 1;
  const userClass = userIndex % 3 === 1 ? 'knight' : userIndex % 3 === 2 ? 'mage' : 'rogue';

  // --- REVISED FILTERING LOGIC ---
  const filteredItems = shopItems.filter(item => {
    const cat = item.category?.toLowerCase();
    
    // Class Filter for Market Items
    if (activeTab === 'market') {
      const isClassItem = item.name.toLowerCase().includes('knight') || item.name.toLowerCase().includes('mage') || item.name.toLowerCase().includes('rogue');
      if (isClassItem && !item.name.toLowerCase().includes(userClass)) return false;
      return cat === 'head' || cat === 'body' || cat === 'consumable';
    }
    
    if (activeTab === 'customize') return cat === 'pet' || cat === 'accessory' || cat === 'customization';
    if (activeTab === 'quest') return cat === 'quest';
    return false;
  });

  return (
    <div className="h-full flex flex-col pt-4">
      <div className="flex gap-2 px-8 border-b-4 border-[#5d3a1a] bg-[#3e2723]/20">
        <TabButton label="Market" active={activeTab === 'market'} onClick={() => setActiveTab('market')} />
        <TabButton label="Quest" active={activeTab === 'quest'} onClick={() => setActiveTab('quest')} />
        <TabButton label="Customize" active={activeTab === 'customize'} onClick={() => setActiveTab('customize')} />
      </div>

      <div className="flex-1 bg-[#fdf6e3] p-8 flex justify-center overflow-y-auto">
        <PixelPanel className="max-w-5xl h-fit min-h-full">
          <div className="animate-fadeIn">
            <div className="flex items-center gap-2 mb-4 border-b-4 border-[#d4c5a9] pb-2 border-dashed">
               {activeTab === 'market' ? <ShoppingBag className="text-[#5d3a1a]" /> : activeTab === 'customize' ? <Palette className="text-[#5d3a1a]" /> : <Lock className="text-[#5d3a1a]" />}
               <h2 className="text-3xl font-bold text-[#5d3a1a] uppercase" style={{ fontFamily: "'VT323', monospace" }}>
                 {activeTab === 'market' ? 'General Goods' : activeTab === 'customize' ? 'Pets & Salon' : 'Quest Unlocks'}
               </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
              {filteredItems.map(item => (
                <ShopItemCard 
                  key={item._id} 
                  name={item.name}
                  price={item.price}
                  icon={item.image}
                  category={item.category}
                  isOwned={isAlreadyOwned(item._id)}
                  onBuy={() => onBuyItem(item)}
                />
              ))}
            </div>
          </div>
        </PixelPanel>
      </div>
    </div>
  );
};