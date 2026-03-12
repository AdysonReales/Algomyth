import { useState } from 'react';
import axios from 'axios';

// Vite helper to dynamically load images from src/assets folder
const getAssetUrl = (folder: string, prefix: string, index: number) => {
  // Vercel looks at the root for anything that was in the 'public' folder
  return `/assets/${folder}/${prefix}_${index}.png`;
};

// Customization Maps
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

export const Auth = ({ onLogin }: { onLogin: () => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'student' });

  // Customization State
  const [gender, setGender] = useState<'female' | 'male'>('female');
  const [charClass, setCharClass] = useState<'knight' | 'mage' | 'assassin'>('knight');
  const [skinVariant, setSkinVariant] = useState('default');
  const [armorVariant, setArmorVariant] = useState('default');

  // Calculate the 1-6 Index based on Gender and Class
  const getCharacterIndex = () => {
    let base = gender === 'female' ? 0 : 3;
    if (charClass === 'mage') base += 1;
    else if (charClass === 'assassin') base += 2;
    return base + 1;
  };
  const charIndex = getCharacterIndex();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { 
          username: formData.username, password: formData.password 
        });
        localStorage.setItem('token', res.data.token);
        onLogin();
      } else {
        // Sending full formData including the selected role
        await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, { 
          ...formData, 
          characterIndex: charIndex,
          skinVariant, 
          armorVariant 
        });
        alert("Hero Forged! Now enter the realm.");
        setIsLogin(true);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Auth failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#3e2723] flex items-center justify-center p-4">
      <div className="bg-[#fdf6e3] border-8 border-[#5d3a1a] p-8 w-full max-w-2xl shadow-2xl flex flex-col md:flex-row gap-8">
        
        {/* LEFT SIDE: FORM */}
        <div className="flex-1 flex flex-col">
          <h2 className="text-4xl font-bold text-[#3e2723] text-center mb-6 uppercase" style={{ fontFamily: "'VT323', monospace" }}>
            {isLogin ? 'Enter Realm' : 'Forge Hero'}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input type="text" placeholder="Username" className="p-3 border-4 border-[#5d3a1a] bg-[#f4e4bc] font-bold outline-none"
              value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} required />
            
            {!isLogin && (
              <>
                <input type="email" placeholder="Email" className="p-3 border-4 border-[#5d3a1a] bg-[#f4e4bc] font-bold outline-none"
                  value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                
                {/* ROLE SELECTION TOGGLE */}
                <div className="flex flex-col gap-1 mt-2">
                  <label className="text-xs font-bold text-[#5d3a1a] uppercase">Identity</label>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, role: 'student'})}
                      className={`flex-1 p-2 border-4 border-[#5d3a1a] font-bold uppercase text-sm transition-colors ${formData.role === 'student' ? 'bg-[#5d3a1a] text-white' : 'bg-[#f4e4bc] text-[#5d3a1a]'}`}
                    >
                      Student
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, role: 'instructor'})}
                      className={`flex-1 p-2 border-4 border-[#5d3a1a] font-bold uppercase text-sm transition-colors ${formData.role === 'instructor' ? 'bg-[#5d3a1a] text-white' : 'bg-[#f4e4bc] text-[#5d3a1a]'}`}
                    >
                      Instructor
                    </button>
                  </div>
                </div>
              </>
            )}

            <input type="password" placeholder="Password" className="p-3 border-4 border-[#5d3a1a] bg-[#f4e4bc] font-bold outline-none"
              value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />

            <button type="submit" className="bg-[#76c442] border-4 border-[#3e2723] p-3 text-white font-bold uppercase hover:scale-105 transition-transform mt-4 shadow-[0_4px_0_rgb(62,39,35)] active:translate-y-1 active:shadow-none">
              {isLogin ? 'Login' : 'Forge Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-[#5d3a1a] font-bold cursor-pointer hover:underline text-sm" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "New hero? Forge account here." : "Returning? Enter realm here."}
          </p>
        </div>

        {/* RIGHT SIDE: CUSTOMIZATION (Registration Only) */}
        {!isLogin && (
          <div className="flex-1 bg-[#d4a373] border-4 border-[#5d3a1a] p-4 flex flex-col items-center gap-4">
            <span className="font-bold text-[#3e2723] uppercase tracking-widest border-b-2 border-[#5d3a1a] pb-1" style={{ fontFamily: "'VT323', monospace", fontSize: '24px' }}>
              Appearance
            </span>
            
            {/* DYNAMIC SPRITE PREVIEW */}
            <div className="w-48 h-64 border-4 border-[#5d3a1a] bg-[#f4e4bc] relative shadow-inner overflow-hidden flex justify-center items-end pb-4">
              {armorVariant === 'default' && (
                <img src={getAssetUrl('default', 'default', charIndex)} alt="Base" className="absolute inset-0 w-full h-full object-contain" style={{ imageRendering: 'pixelated' }} />
              )}
              {skinVariant !== 'default' && (
                <img src={getAssetUrl(skinVariant, skinVariant, charIndex)} alt="Skin" className="absolute inset-0 w-full h-full object-contain z-10" style={{ imageRendering: 'pixelated' }} />
              )}
              {armorVariant !== 'default' && (
                <img src={getAssetUrl(armorVariant, armorVariant, charIndex)} alt="Armor" className="absolute inset-0 w-full h-full object-contain z-20" style={{ imageRendering: 'pixelated' }} />
              )}
            </div>

            {/* SELECTION CONTROLS */}
            <div className="w-full space-y-3 mt-2">
              <div className="flex gap-2">
                <button type="button" onClick={() => setGender('female')} className={`flex-1 p-1 border-2 font-bold text-xs uppercase ${gender === 'female' ? 'bg-[#5d3a1a] text-white border-[#3e2723]' : 'bg-[#f4e4bc] border-[#5d3a1a]'}`}>Female</button>
                <button type="button" onClick={() => setGender('male')} className={`flex-1 p-1 border-2 font-bold text-xs uppercase ${gender === 'male' ? 'bg-[#5d3a1a] text-white border-[#3e2723]' : 'bg-[#f4e4bc] border-[#5d3a1a]'}`}>Male</button>
              </div>

              <div className="flex gap-2">
                {['knight', 'mage', 'assassin'].map(c => (
                  <button type="button" key={c} onClick={() => setCharClass(c as any)} className={`flex-1 p-1 border-2 font-bold text-[10px] uppercase ${charClass === c ? 'bg-[#5d3a1a] text-white border-[#3e2723]' : 'bg-[#f4e4bc] border-[#5d3a1a]'}`}>
                    {c}
                  </button>
                ))}
              </div>

              {/* Skin Tone Picker */}
              <div>
                <span className="text-[10px] font-bold text-[#3e2723] uppercase">Skin Tone</span>
                <div className="flex gap-1 flex-wrap mt-1">
                  {SKIN_COLORS.map(color => (
                    <div key={color.id} onClick={() => setSkinVariant(color.id)} 
                      className={`w-6 h-6 border-2 cursor-pointer transition-transform hover:scale-110 ${skinVariant === color.id ? 'border-white scale-110 shadow-md outline outline-2 outline-[#5d3a1a]' : 'border-[#5d3a1a]'}`}
                      style={{ backgroundColor: color.hex }}
                    ></div>
                  ))}
                </div>
              </div>

              {/* Armor Dye Picker */}
              <div>
                <span className="text-[10px] font-bold text-[#3e2723] uppercase">Armor Dye</span>
                <div className="flex gap-1 flex-wrap mt-1">
                  {ARMOR_COLORS.map(color => (
                    <div key={color.id} onClick={() => setArmorVariant(color.id)} 
                      className={`w-6 h-6 border-2 cursor-pointer transition-transform hover:scale-110 ${armorVariant === color.id ? 'border-white scale-110 shadow-md outline outline-2 outline-[#5d3a1a]' : 'border-[#5d3a1a]'}`}
                      style={{ backgroundColor: color.hex }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};