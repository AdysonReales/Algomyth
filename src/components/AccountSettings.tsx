import { useState } from 'react';
import axios from 'axios';
import { User, Mail, ShieldCheck, Save, Coins, RefreshCw, Lock, KeyRound } from 'lucide-react';
import { playSFX } from '../utils/AudioManager';

// --- CUSTOMIZATION MAPS (Synced with Auth.tsx) ---
const SKIN_COLORS = [
  { id: 'default', hex: '#7b482d', label: 'Default' },
  { id: 'skinV1', hex: '#d5aa9e', label: 'V1' },
  { id: 'skinV2', hex: '#c8927d', label: 'V2' },
  { id: 'skinV3', hex: '#a86850', label: 'V3' },
  { id: 'skinV4', hex: '#7a482c', label: 'V4' },
  { id: 'skinV5', hex: '#381c15', label: 'V5' },
];

const ARMOR_COLORS = [
  { id: 'default', hex: '#981f25', label: 'Default' },
  { id: 'bluepink', hex: '#d46c87', label: 'Blue/Pink' },
  { id: 'green', hex: '#3c7a47', label: 'Green' },
  { id: 'purple', hex: '#511d4b', label: 'Purple' },
  { id: 'red', hex: '#991f25', label: 'Red' },
  { id: 'yellow', hex: '#ffae4d', label: 'Yellow' },
];

const getAssetUrl = (folder: string, prefix: string, index: number) => {
  return `/assets/${folder.trim()}/${prefix.trim()}_${index}.png`;
};
export const AccountSettings = ({ userData, onUpdate }: { userData: any, onUpdate: () => void }) => {
  // --- IDENTITY STATE ---
  const [username, setUsername] = useState(userData?.username || '');
  const [email, setEmail] = useState(userData?.email || '');
  const [oldPass, setOldPass] = useState(''); // Required for security
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  // --- APPEARANCE STATE ---
  const [gender, setGender] = useState<'female' | 'male'>(
    userData?.characterIndex <= 3 ? 'female' : 'male'
  );
    const [charClass, setCharClass] = useState<'knight' | 'mage' | 'assassin'>(() => {
    const index = (userData?.characterIndex - 1) % 3;
    if (index === 0) return 'knight';
    if (index === 1) return 'mage';
    return 'assassin';
  });

  const [skinVariant, setSkinVariant] = useState(userData?.skinVariant || 'default');
  const [armorVariant, setArmorVariant] = useState(userData?.armorVariant || 'default');
  const [loading, setLoading] = useState(false);

  // Logic to calculate index (Sync with Auth.tsx)
  const getCharacterIndex = () => {
    let base = gender === 'female' ? 0 : 3;
    if (charClass === 'mage') base += 1;
    else if (charClass === 'assassin') base += 2;
    return base + 1;
  };
  const charIndex = getCharacterIndex();

  // Check if appearance is different from DB
  const appearanceChanged = 
    skinVariant !== userData?.skinVariant || 
    armorVariant !== userData?.armorVariant || 
    getCharacterIndex() !== userData?.characterIndex; 

  const handleSave = async () => {
  console.log("🚀 Save button clicked!"); // If this doesn't show in F12, the button is broken

  if (!oldPass) return alert("Enter current password!");

  setLoading(true);
  try {
    const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/auth/update-profile`, { 
    username, 
    email,
    oldPassword: oldPass, 
    newPassword: newPass || undefined,
    skinVariant, 
    armorVariant, 
    characterIndex: charIndex,
    appearanceChanged 
});

    console.log("✅ Server Response:", response.data);
    playSFX('sfx_success.ogg');
    alert(appearanceChanged ? "Appearance Forged! -2500 Gold." : "Identity Updated!");
    onUpdate(); // Refreshes the top avatar bar

    setOldPass(''); 
    setNewPass(''); 
    setConfirmPass('');
  } catch (err: any) {
    console.error("🔥 Frontend Axios Error:", err.response?.data);
    playSFX('sfx_fail.ogg');
    alert(err.response?.data?.message || "Update failed.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="p-4 lg:p-8 flex flex-col items-center gap-8 max-w-6xl mx-auto font-mono" style={{ fontFamily: "'VT323', monospace" }}>
      <div className="flex flex-col lg:flex-row gap-8 w-full">
        
        {/* LEFT SIDE: IDENTITY & SECURITY */}
        <div className="flex-[2] bg-[#f4e4bc] border-8 border-[#5d3a1a] p-8 shadow-2xl space-y-8">
          <h2 className="text-4xl font-bold text-[#5d3a1a] uppercase border-b-4 border-[#5d3a1a] pb-2 flex items-center gap-3">
            <User size={32} /> Identity bureau
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xl font-bold text-[#5d3a1a] uppercase">Display Name</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-3 border-4 border-[#5d3a1a] bg-white font-bold text-[#3e2723] text-lg outline-none focus:border-[#76c442]" />
            </div>
            <div className="space-y-1">
              <label className="text-xl font-bold text-[#5d3a1a] uppercase flex items-center gap-2"><Mail size={18}/> Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border-4 border-[#5d3a1a] bg-white font-bold text-[#3e2723] text-lg outline-none focus:border-[#76c442]" />
            </div>
          </div>

          {/* SECURITY AUTHORIZATION BOX */}
          <div className="bg-[#d4c5a9] p-6 border-4 border-[#5d3a1a] space-y-6">
             <div className="text-2xl font-bold text-[#3e2723] uppercase flex items-center gap-2 border-b-2 border-[#5d3a1a] pb-2">
               <ShieldCheck size={24} /> Security clearance
             </div>
             
             <div className="space-y-2">
                <label className="text-xl font-bold text-red-800 uppercase flex items-center gap-2">
                  <KeyRound size={20}/> Current Password (Required to Save)
                </label>
                <input type="password" placeholder="Verify your identity..." value={oldPass} onChange={e => setOldPass(e.target.value)} className="w-full p-4 border-4 border-red-800 bg-white text-lg outline-none shadow-inner" />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t-2 border-[#5d3a1a]/20">
                <div className="space-y-1">
                  <label className="text-lg font-bold text-[#5d3a1a] uppercase flex items-center gap-2"><Lock size={16}/> New Password</label>
                  <input type="password" placeholder="New secret..." value={newPass} onChange={e => setNewPass(e.target.value)} className="w-full p-3 border-4 border-[#5d3a1a] bg-white text-lg outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-lg font-bold text-[#5d3a1a] uppercase">Confirm New</label>
                  <input type="password" placeholder="Repeat secret..." value={confirmPass} onChange={e => setConfirmPass(e.target.value)} className={`w-full p-3 border-4 bg-white text-lg outline-none ${newPass && newPass !== confirmPass ? 'border-red-500' : 'border-[#5d3a1a]'}`} />
                </div>
             </div>
          </div>

          <button onClick={handleSave} disabled={loading} className="w-full bg-[#76c442] text-white border-4 border-[#3e2723] p-5 text-4xl font-bold uppercase shadow-[0_8px_0_#3e2723] hover:translate-y-1 active:translate-y-2 active:shadow-none transition-all flex items-center justify-center gap-4">
            {loading ? <RefreshCw className="animate-spin" size={36} /> : <Save size={36} />}
            {loading ? 'SYNCING RECORDS...' : 'SAVE ALL CHANGES'}
          </button>
        </div>

        {/* RIGHT SIDE: APPEARANCE (COST 2500) */}
        <div className="flex-1 bg-[#d4a373] border-8 border-[#5d3a1a] p-6 shadow-2xl flex flex-col items-center gap-4 relative">
          
          {appearanceChanged && (
            <div className="absolute -top-6 bg-red-600 text-white border-4 border-[#3e2723] px-6 py-2 font-bold text-xl animate-bounce z-50 flex items-center gap-2 shadow-xl">
              <Coins size={24} /> -2,500 GOLD
            </div>
          )}

          <span className="font-bold text-[#3e2723] uppercase tracking-widest border-b-2 border-[#5d3a1a] pb-1 text-2xl">Appearance</span>

          {/* DYNAMIC SPRITE PREVIEW */}
          <div className="w-48 h-64 border-8 border-[#5d3a1a] bg-[#f4e4bc] relative shadow-inner overflow-hidden flex justify-center items-end pb-4">
            <img src={getAssetUrl('default', 'default', charIndex)} className="absolute inset-0 w-full h-full object-contain" style={{ imageRendering: 'pixelated' }} alt="Base" />
            {skinVariant !== 'default' && <img src={getAssetUrl(skinVariant, skinVariant, charIndex)} className="absolute inset-0 w-full h-full object-contain z-10" style={{ imageRendering: 'pixelated' }} alt="Skin" />}
            {armorVariant !== 'default' && <img src={getAssetUrl(armorVariant, armorVariant, charIndex)} className="absolute inset-0 w-full h-full object-contain z-20" style={{ imageRendering: 'pixelated' }} alt="Armor" />}
          </div>

          <div className="w-full space-y-4">
            <div className="flex gap-2">
              <button onClick={() => setGender('female')} className={`flex-1 p-2 border-4 font-bold uppercase transition-colors ${gender === 'female' ? 'bg-[#5d3a1a] text-white' : 'bg-[#f4e4bc]'}`}>Female</button>
              <button onClick={() => setGender('male')} className={`flex-1 p-2 border-4 font-bold uppercase transition-colors ${gender === 'male' ? 'bg-[#5d3a1a] text-white' : 'bg-[#f4e4bc]'}`}>Male</button>
            </div>

            <div className="flex gap-1">
              {['knight', 'mage', 'assassin'].map(c => (
                <button key={c} onClick={() => setCharClass(c as any)} className={`flex-1 p-1 border-4 font-bold text-[10px] uppercase transition-all ${charClass === c ? 'bg-[#3e2723] text-white scale-105' : 'bg-[#f4e4bc]'}`}>
                  {c}
                </button>
              ))}
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-[#3e2723] uppercase">Skin Tone</span>
              <div className="flex gap-1 flex-wrap">
                {SKIN_COLORS.map(color => (
                  <div key={color.id} onClick={() => setSkinVariant(color.id)} className={`w-7 h-7 border-4 cursor-pointer transition-all ${skinVariant === color.id ? 'scale-125 border-white rotate-6 shadow-lg z-10' : 'border-[#5d3a1a]'}`} style={{ backgroundColor: color.hex }}></div>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-[#3e2723] uppercase">Armor Dye</span>
              <div className="flex gap-1 flex-wrap">
                {ARMOR_COLORS.map(color => (
                  <div key={color.id} onClick={() => setArmorVariant(color.id)} className={`w-7 h-7 border-4 cursor-pointer transition-all ${armorVariant === color.id ? 'scale-125 border-white -rotate-6 shadow-lg z-10' : 'border-[#5d3a1a]'}`} style={{ backgroundColor: color.hex }}></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};