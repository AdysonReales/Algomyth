import { useState } from 'react';
import { User, Lock, ArrowRight } from 'lucide-react';

export const Auth = ({ onLogin }: { onLogin: () => void }) => {
  const [isRegistering, setIsRegistering] = useState(false);

  return (
    <div className="min-h-screen bg-[#2d1b15] flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>

      <div className="relative z-10 w-full max-w-md bg-[#f4e4bc] border-4 border-[#5d3a1a] p-8 shadow-2xl rounded-xl">
        {/* Header Tabs */}
        <div className="flex justify-center mb-8 border-b-4 border-[#d4c5a9] pb-4">
          <button 
            onClick={() => setIsRegistering(false)}
            className={`text-2xl font-bold uppercase px-4 ${!isRegistering ? 'text-[#5d3a1a] underline decoration-4' : 'text-[#8b5a2b] hover:text-[#5d3a1a]'}`}
            style={{ fontFamily: "'VT323', monospace" }}
          >
            Login
          </button>
          <span className="text-[#d4c5a9] text-2xl">|</span>
          <button 
            onClick={() => setIsRegistering(true)}
            className={`text-2xl font-bold uppercase px-4 ${isRegistering ? 'text-[#5d3a1a] underline decoration-4' : 'text-[#8b5a2b] hover:text-[#5d3a1a]'}`}
            style={{ fontFamily: "'VT323', monospace" }}
          >
            Register
          </button>
        </div>

        {/* Form Fields */}
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <label className="text-[#5d3a1a] font-bold text-lg uppercase" style={{ fontFamily: "'VT323', monospace" }}>Username</label>
            <div className="flex items-center bg-[#fdf6e3] border-4 border-[#8b5a2b] p-3 rounded">
              <User className="text-[#8b5a2b] mr-3" size={20} />
              <input type="text" placeholder="CodeMaster99" className="bg-transparent w-full outline-none text-[#3e2723] font-mono" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[#5d3a1a] font-bold text-lg uppercase" style={{ fontFamily: "'VT323', monospace" }}>Password</label>
            <div className="flex items-center bg-[#fdf6e3] border-4 border-[#8b5a2b] p-3 rounded">
              <Lock className="text-[#8b5a2b] mr-3" size={20} />
              <input type="password" placeholder="••••••••" className="bg-transparent w-full outline-none text-[#3e2723] font-mono" />
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={onLogin} // This simulates a successful login for now
            className="mt-4 bg-[#76c442] border-4 border-[#3e2723] text-white py-3 text-2xl font-bold uppercase hover:bg-[#5da035] shadow-lg active:translate-y-1 transition-all flex items-center justify-center gap-2"
            style={{ fontFamily: "'VT323', monospace" }}
          >
            {isRegistering ? 'Create Account' : 'Enter World'} <ArrowRight size={24} />
          </button>

          {/* OAuth Mock */}
          <div className="flex flex-col gap-2 mt-4 text-center">
            <span className="text-[#8b5a2b] text-sm font-mono uppercase">- OR CONTINUE WITH -</span>
            <div className="flex gap-4 justify-center">
              <button className="bg-white border-2 border-[#5d3a1a] p-2 rounded hover:bg-gray-100 font-bold text-[#5d3a1a] text-xs">GOOGLE</button>
              <button className="bg-[#333] border-2 border-[#5d3a1a] p-2 rounded hover:bg-black text-white font-bold text-xs">GITHUB</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};