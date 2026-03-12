import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, Lock, Palette, ShieldCheck } from 'lucide-react';

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

const ShopItemCard = ({ name, price, icon, category, classReq, onBuy, isOwned, userClass }: { 
  name: string, price: number, icon: string, category: string, classReq: string, onBuy: () => void, isOwned: boolean, userClass: string 
}) => {
  // STRICT LOGIC: Ensure both are lowercase and trimmed for perfect comparison
  const normalizedClassReq = classReq.toLowerCase().trim();
  const normalizedUserClass = userClass.toLowerCase().trim();
  
  const isWrongClass = normalizedClassReq !== 'all' && normalizedClassReq !== normalizedUserClass;

  const getBorderColor = () => {
    if (category === 'Head') return 'border-red-500';
    if (category === 'Body') return 'border-blue-500';
    if (category === 'Accessory' || category === 'Pet') return 'border-gray-500';
    return 'border-[#8b5a2b]';
  };

  const handleBuyClick = () => {
    if (isOwned) return;

    if (isWrongClass) {
      alert(`❌ RESTRICTED: This gear is for the ${classReq.toUpperCase()} class. You are a ${userClass.toUpperCase()}!`);
      return;
    }
    
    const confirmPurchase = window.confirm(`Forge transaction? Buy ${name} for ${price} Gold?`);
    if (confirmPurchase) {
      onBuy();
    }
  };

  return (
    <div 
      className={`flex flex-col items-center gap-2 group transition-all relative ${
        isOwned ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
      }`} 
      onClick={handleBuyClick}
    >
      {/* CLASS MISMATCH BADGE */}
      {isWrongClass && !isOwned && (
        <div className="absolute -top-1 -right-1 bg-black text-yellow-400 border-2 border-yellow-400 px-2 py-0.5 text-[8px] font-black z-30 rotate-12 shadow-md uppercase">
          NOT FOR {userClass}
        </div>
      )}

      <div className={`w-24 h-24 border-4 flex items-center justify-center shadow-md relative transition-transform
        ${isOwned 
          ? 'bg-[#3e2723]/40 border-[#5d3a1a] grayscale' 
          : `bg-[#f4d0a3] ${getBorderColor()} group-hover:-translate-y-1`
        }`}
      >
          <img 
            src={icon} 
            alt={name} 
            className={`w-16 h-16 object-contain ${isWrongClass && !isOwned ? 'opacity-30 grayscale' : ''}`} 
            style={{ imageRendering: 'pixelated' }} 
            onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/64?text=📦')}
          />
          
          {isOwned && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#3e2723]/60 z-20">
               <span className="text-white text-[10px] font-bold uppercase tracking-widest bg-[#ef4444] px-1 border border-white">
                 OWNED
               </span>
            </div>
          )}
          <div className="absolute bottom-1 right-1 text-[10px] text-[#5d3a1a] opacity-50 font-bold uppercase">
            {category}
          </div>
      </div>
      
      <div 
        className={`border-2 px-3 py-0.5 font-bold text-lg shadow-sm transition-colors
          ${isOwned ? 'bg-[#5d3a1a] text-[#f4e4bc]' : 'bg-[#d4a373] text-[#3e2723] border-[#5d3a1a]'}`} 
        style={{ fontFamily: "'VT323', monospace" }}
      >
        {isOwned ? "LOCKED" : `${price} G`}
      </div>

      <div className="text-[#5d3a1a] font-bold text-sm uppercase text-center leading-none mt-1" style={{ fontFamily: "'VT323', monospace" }}>
        {name}
      </div>
    </div>
  );
};

export const Shop = ({ onBuyItem, userInventory = [], userData }: { onBuyItem: (item: any) => void, userInventory: any[], userData?: any }) => {
  const [activeTab, setActiveTab] = useState<'market' | 'quest' | 'customize'>('market');
  const [shopItems, setShopItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/shop/items`);
        setShopItems(res.data);
      } catch (err) { console.error(err); }
    };
    fetchItems();
  }, []);

  const isAlreadyOwned = (itemId: string) => userInventory.some(inv => inv.item?._id === itemId || inv.item === itemId);

  // --- REVISED USER CLASS MAPPING (With String-to-Number fix) ---
  const getClassFromIndex = (index: any): string => {
    const idx = Number(index); // CRITICAL: Convert to number to handle database strings
    const mapping: Record<number, string> = {
      1: 'knight', 2: 'mage', 3: 'rogue',
      4: 'knight', 5: 'mage', 6: 'rogue',
    };
    return mapping[idx] || 'knight';
  };

  const userClass = getClassFromIndex(userData?.characterIndex || 1);

const filteredItems = shopItems.filter(item => {
    const cat = item.category?.toLowerCase();
    const imageName = item.image?.toLowerCase() || "";

    // 1. THE TRASH LIST: Only hide V6 or clearly broken files
    if (imageName.includes('v6')) {
      return false;
    }

    // 2. THE ALLOW LIST: Show Knight, Mage, and Rogue
    // (This ensures the "Market" tab actually finds all three)
    const isMarketItem = cat === 'head' || cat === 'body' || cat === 'consumable';
    const isCustomizeItem = cat === 'pet' || cat === 'accessory' || cat === 'customization';
    const isQuestItem = cat === 'quest';

    if (activeTab === 'market' && isMarketItem) return true;
    if (activeTab === 'customize' && isCustomizeItem) return true;
    if (activeTab === 'quest' && isQuestItem) return true;
    
    return false;
  });

  return (
    <div className="h-full flex flex-col pt-4">
      <div className="flex justify-between items-center px-8 border-b-4 border-[#5d3a1a] bg-[#3e2723]/20">
        <div className="flex gap-2">
          <TabButton label="Market" active={activeTab === 'market'} onClick={() => setActiveTab('market')} />
          <TabButton label="Quest" active={activeTab === 'quest'} onClick={() => setActiveTab('quest')} />
          <TabButton label="Customize" active={activeTab === 'customize'} onClick={() => setActiveTab('customize')} />
        </div>
        
        {/* DEBUG BADGE: Tells you exactly what the system thinks your class is */}
        <div className="bg-[#5d3a1a] px-4 py-1 border-2 border-white flex items-center gap-2 mb-1">
          <ShieldCheck size={16} className="text-[#76c442]" />
          <span className="text-white font-bold uppercase text-sm" style={{ fontFamily: "'VT323', monospace" }}>
            Class: {userClass}
          </span>
        </div>
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
                  classReq={item.classReq || 'all'}
                  userClass={userClass}
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