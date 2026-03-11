import { useState } from 'react';

// --- Tab Button ---
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

// Safety helper for colors
const getSlotColor = (category: string | undefined) => {
    const cat = category?.toLowerCase() || '';
    if (cat === 'head') return 'border-red-500';      
    if (cat === 'body') return 'border-blue-500';      
    if (cat === 'accessory' || cat === 'pet') return 'border-gray-500'; 
    return 'border-[#8b5a2b]'; 
};

// --- 1. Empty Slot ---
const EmptyGridSlot = ({ index, onUnequipToSlot, onMoveItem }: any) => {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const unequipId = e.dataTransfer.getData('unequipId'); // Coming from Equipment Slot
    const moveId = e.dataTransfer.getData('itemId');      // Coming from another Grid Slot

    if (unequipId) {
      onUnequipToSlot(unequipId, index); // This calls handleUnequipItem in App.tsx
    } else if (moveId) {
      onMoveItem(moveId, index);
    }
  };

  return (
    <div 
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="w-20 h-20 border-4 border-dashed bg-[#e3d5ca]/30 border-[#d4c5a9] opacity-50"
    />
  );
};

// --- 2. Grid Item ---
const GridItem = ({ invSlot, onSellItem }: any) => {
  const item = invSlot?.item;
  if (!item) return null;

  const handleDragStart = (e: React.DragEvent) => {
    // This tells the app: "I am moving an item from the bag"
    e.dataTransfer.setData('itemId', invSlot._id);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div 
      draggable 
      onDragStart={handleDragStart}
      className="flex flex-col items-center gap-2 group w-24 cursor-grab active:cursor-grabbing relative z-10"
    >
      <div className={`w-20 h-20 bg-[#f4d0a3] border-4 ${getSlotColor(item.category)} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform relative`}>
         <img src={item.image} className="w-12 h-12 object-contain" style={{ imageRendering: 'pixelated' }} alt={item.name} />
      </div>
      <span className="font-bold text-[#5d3a1a] text-lg leading-none text-center truncate w-full" style={{ fontFamily: "'VT323', monospace" }}>
        {item.name}
      </span>
    </div>
  );
};

// --- 3. Equipment Slot ---
const ItemSlot = ({ label, slotId, equippedItem, onEquipDrop }: any) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <div 
        onDragOver={(e) => e.preventDefault()} 
        onDrop={(e) => {
          e.preventDefault();
          const id = e.dataTransfer.getData('itemId');
          if (id) onEquipDrop(id, slotId);
        }} 
        // THIS ALLOWS YOU TO PULL IT OUT
        draggable={!!equippedItem}
        onDragStart={(e) => {
          if (equippedItem) e.dataTransfer.setData('unequipId', equippedItem._id);
        }}
        className={`w-24 h-24 border-4 flex items-center justify-center shadow-inner relative transition-colors 
          ${equippedItem ? `bg-[#f4e4bc] ${getSlotColor(slotId)} cursor-grab` : `bg-[#d4a373] ${getSlotColor(slotId)} opacity-40`}`}
      >
        {equippedItem ? (
          <img src={equippedItem.item.image} className="w-16 h-16 object-contain" style={{ imageRendering: 'pixelated' }} />
        ) : (
          <div className="text-[#5d3a1a] opacity-30 text-xl font-bold uppercase" style={{ fontFamily: "'VT323', monospace" }}>{label}</div>
        )}
      </div>
      <span className="font-bold text-[#5d3a1a] text-xl uppercase" style={{ fontFamily: "'VT323', monospace" }}>{label}</span>
    </div>
  );
};
// --- MAIN INVENTORY ---
export const Inventory = ({ 
  inventory = [], 
  onEquipItem, 
  onUnequipItem, 
  onMoveItem, 
  onSellItem 
}: any) => {
  const [activeTab, setActiveTab] = useState<'items' | 'equipment' | 'pets'>('equipment');

  // Defensive: Ensure we have an array
  const safeInventory = Array.isArray(inventory) ? inventory : [];
  
  // Safety checks for equipped items
  const equippedHead = safeInventory.find(i => i?.isEquipped && i?.equippedSlot === 'Head');
  const equippedBody = safeInventory.find(i => i?.isEquipped && i?.equippedSlot === 'Body');
  const equippedAccessory = safeInventory.find(i => i?.isEquipped && i?.equippedSlot === 'Accessory');

  const renderFixedGrid = () => {
    const filteredBag = safeInventory.filter(inv => {
        if (!inv || inv.isEquipped) return false;
        const cat = inv.item?.category;
        if (activeTab === 'equipment') return cat === 'Head' || cat === 'Body';
        if (activeTab === 'pets') return cat === 'Pet' || cat === 'Accessory';
        if (activeTab === 'items') return cat === 'Consumable' || cat === 'Quest';
        return true;
    });

    const grid = [];
    for (let i = 0; i < 15; i++) {
      const itemInSlot = filteredBag.find(inv => inv.gridIndex === i);
      if (itemInSlot) {
        grid.push(<GridItem key={itemInSlot._id || i} invSlot={itemInSlot} onSellItem={onSellItem} />);
      } else {
        grid.push(<EmptyGridSlot key={`empty-${i}`} index={i} onUnequipToSlot={onUnequipItem} onMoveItem={onMoveItem} />);
      }
    }
    return grid;
  };

  return (
    <div className="h-full flex flex-col pt-4">
      <div className="flex gap-2 px-8 border-b-4 border-[#5d3a1a] bg-[#3e2723]/20">
        <TabButton label="Items" active={activeTab === 'items'} onClick={() => setActiveTab('items')} />
        <TabButton label="Equipment" active={activeTab === 'equipment'} onClick={() => setActiveTab('equipment')} />
        <TabButton label="Pets" active={activeTab === 'pets'} onClick={() => setActiveTab('pets')} />
      </div>

      <div className="flex-1 bg-[#fdf6e3] p-8 flex gap-8 min-h-0">
        <div className="w-1/4 flex flex-col gap-6 items-center border-r-4 border-[#d4c5a9] pr-8 border-dashed shrink-0">
           <ItemSlot label="Head" slotId="Head" equippedItem={equippedHead} onEquipDrop={onEquipItem} />
           <ItemSlot label="Body" slotId="Body" equippedItem={equippedBody} onEquipDrop={onEquipItem} />
           <ItemSlot label="Accessory" slotId="Accessory" equippedItem={equippedAccessory} onEquipDrop={onEquipItem} />
        </div>

        <div className="flex-1 grid grid-cols-5 gap-6 justify-items-center auto-rows-max overflow-y-auto pr-2 custom-scrollbar">
           {renderFixedGrid()}
        </div>
      </div>
    </div>
  );
};