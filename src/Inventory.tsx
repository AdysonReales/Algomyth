import { useState } from 'react';
import { Trash2 } from 'lucide-react';

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
    const unequipId = e.dataTransfer.getData('unequipId'); 
    const moveId = e.dataTransfer.getData('itemId');      
    if (unequipId) onUnequipToSlot(unequipId, index); 
    else if (moveId) onMoveItem(moveId, index);
  };
  return (
    <div 
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="w-24 h-24 border-4 border-dashed bg-[#e3d5ca]/30 border-[#d4c5a9] opacity-50 flex items-center justify-center text-[10px] font-bold text-[#5d3a1a]/20"
    >
      {index}
    </div>
  );
};

// --- 2. Grid Item ---
const GridItem = ({ invSlot, onSellItem }: any) => {
  const item = invSlot?.item;
  if (!item) return null;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('itemId', invSlot._id);
    e.dataTransfer.effectAllowed = "move";
  };

  const itemPath = item?.category?.toLowerCase() === 'body' 
    ? `/assets/body/${item?.image}` 
    : `/assets/items/${item?.image}`;

  return (
    <div draggable onDragStart={handleDragStart} className="flex flex-col items-center gap-1 group w-24 cursor-grab active:cursor-grabbing relative z-10">
      <div className={`w-20 h-20 bg-[#f4d0a3] border-4 ${getSlotColor(item?.category)} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform relative`}>
          <img src={itemPath} className="w-12 h-12 object-contain" style={{ imageRendering: 'pixelated' }} alt={item?.name} />
          <button onClick={(e) => { e.stopPropagation(); onSellItem(invSlot._id); }} className="absolute -top-2 -right-2 bg-red-600 border-2 border-black p-1 hidden group-hover:block hover:bg-red-700 shadow-md">
            <Trash2 size={12} color="white" />
          </button>
      </div>
      <span className="font-bold text-[#5d3a1a] text-sm leading-none text-center truncate w-full px-1" style={{ fontFamily: "'VT323', monospace" }}>
        {item?.name || "Unknown"}
      </span>
    </div>
  );
};

// --- 3. Equipment Slot ---
const ItemSlot = ({ label, slotId, equippedItem, onEquipDrop }: any) => {
  const itemPath = equippedItem?.item?.category?.toLowerCase() === 'body' 
    ? `/assets/body/${equippedItem.item.image}` 
    : `/assets/items/${equippedItem.item.image}`;

  return (
    <div className="flex flex-col items-center gap-2">
      <div 
        onDragOver={(e) => e.preventDefault()} 
        onDrop={(e) => {
          e.preventDefault();
          const id = e.dataTransfer.getData('itemId');
          if (id) onEquipDrop(id, slotId);
        }} 
        draggable={!!equippedItem}
        onDragStart={(e) => { if (equippedItem) e.dataTransfer.setData('unequipId', equippedItem._id); }}
        className={`w-24 h-24 border-4 flex items-center justify-center shadow-inner relative transition-all 
          ${equippedItem ? `bg-[#fdf6e3] ${getSlotColor(slotId)} cursor-grab scale-105 shadow-lg` : `bg-[#d4a373] ${getSlotColor(slotId)} opacity-40`}`}
      >
        {equippedItem?.item ? (
          <img src={itemPath} className="w-16 h-16 object-contain" style={{ imageRendering: 'pixelated' }} alt={equippedItem.item.name} />
        ) : (
          <div className="text-[#5d3a1a] opacity-30 text-xl font-bold uppercase" style={{ fontFamily: "'VT323', monospace" }}>{label}</div>
        )}
      </div>
      <span className="font-bold text-[#5d3a1a] text-xl uppercase tracking-tighter text-center leading-none" style={{ fontFamily: "'VT323', monospace" }}>
        {equippedItem?.item ? equippedItem.item.name : label}
      </span>
    </div>
  );
};

// --- MAIN INVENTORY ---
export const Inventory = ({ inventory = [], onEquipItem, onUnequipItem, onMoveItem, onSellItem }: any) => {
  const [activeTab, setActiveTab] = useState<'items' | 'equipment' | 'pets'>('equipment');
  const safeInventory = Array.isArray(inventory) ? inventory : [];
  
  const equippedHead = safeInventory.find(i => i?.isEquipped && i?.equippedSlot === 'Head');
  const equippedBody = safeInventory.find(i => i?.isEquipped && i?.equippedSlot === 'Body');
  const equippedAccessory = safeInventory.find(i => i?.isEquipped && i?.equippedSlot === 'Accessory');

  const renderFixedGrid = () => {
    const filteredBag = safeInventory.filter(inv => {
        if (!inv || inv.isEquipped) return false;
        const cat = inv.item?.category;
        if (activeTab === 'equipment') return cat === 'Head' || cat === 'Body';
        if (activeTab === 'pets') return cat === 'Pet' || cat === 'Accessory';
        if (activeTab === 'items') return cat === 'Consumable' || cat === 'Quest' || cat === 'Scroll';
        return true;
    });
    const grid = [];
    for (let i = 0; i < 20; i++) {
      const itemInSlot = filteredBag.find(inv => inv.gridIndex === i);
      if (itemInSlot) grid.push(<GridItem key={itemInSlot._id} invSlot={itemInSlot} onSellItem={onSellItem} />);
      else grid.push(<EmptyGridSlot key={`empty-${i}`} index={i} onUnequipToSlot={onUnequipItem} onMoveItem={onMoveItem} />);
    }
    return grid;
  };

  return (
    <div className="h-full flex flex-col pt-4">
      <div className="flex gap-2 px-8 border-b-4 border-[#5d3a1a] bg-[#3e2723]/20">
        <TabButton label="Equipment" active={activeTab === 'equipment'} onClick={() => setActiveTab('equipment')} />
        <TabButton label="Pets / Misc" active={activeTab === 'pets'} onClick={() => setActiveTab('pets')} />
        <TabButton label="Scrolls/Items" active={activeTab === 'items'} onClick={() => setActiveTab('items')} />
      </div>
      <div className="flex-1 bg-[#fdf6e3] p-8 flex flex-col lg:flex-row gap-12 min-h-0">
        <div className="w-full lg:w-1/4 flex flex-row lg:flex-col gap-8 items-center justify-center border-b-4 lg:border-b-0 lg:border-r-4 border-[#d4c5a9] pb-8 lg:pb-0 lg:pr-12 border-dashed shrink-0">
           <ItemSlot label="Head" slotId="Head" equippedItem={equippedHead} onEquipDrop={onEquipItem} />
           <ItemSlot label="Body" slotId="Body" equippedItem={equippedBody} onEquipDrop={onEquipItem} />
           <ItemSlot label="Accessory" slotId="Accessory" equippedItem={equippedAccessory} onEquipDrop={onEquipItem} />
        </div>
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-8 justify-items-center auto-rows-max overflow-y-auto pr-4">
           {renderFixedGrid()}
        </div>
      </div>
    </div>
  );
};