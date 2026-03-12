import { Scroll, Shield, Code } from 'lucide-react';

const PixelButton = ({ label, primary, onClick }: { label: string, primary?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={`px-8 py-3 text-2xl font-bold uppercase border-4 border-[#5d3a1a] shadow-lg transition-transform hover:-translate-y-1 active:translate-y-0
      ${primary 
        ? 'bg-[#76c442] text-white' 
        : 'bg-[#f4d0a3] text-[#5d3a1a]'
      }`}
    style={{ fontFamily: "'VT323', monospace" }}
  >
    {label}
  </button>
);

export const PreLogin = ({ onGetStarted }: { onGetStarted: () => void }) => {
  return (
    <div className="min-h-screen bg-[#2d1b15] flex flex-col items-center justify-center p-4 relative overflow-hidden font-serif">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,#3e2723_25%,transparent_25%,transparent_75%,#3e2723_75%,#3e2723),repeating-linear-gradient(45deg,#3e2723_25%,#2d1b15_25%,#2d1b15_75%,#3e2723_75%,#3e2723)] bg-[length:20px_20px]"></div>

      {/* Main Container */}
      <div className="relative z-10 max-w-4xl w-full flex flex-col items-center gap-12">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center gap-4 animate-bounce-slow">
          <div className="bg-[#f4d0a3] border-8 border-[#5d3a1a] p-8 rounded-2xl shadow-2xl transform rotate-2">
            <h1 className="text-8xl md:text-9xl font-bold text-[#5d3a1a] tracking-widest drop-shadow-md" style={{ fontFamily: "'VT323', monospace" }}>
              ALGOMYTH
            </h1>
          </div>
          <p className="text-[#d4a373] text-2xl md:text-3xl font-bold tracking-wide mt-4 text-center" style={{ fontFamily: "'VT323', monospace" }}>
            The Code Chronicles
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <FeatureCard icon={<Code size={40} />} title="Learn" desc="C++ logic through RPG battles." />
          <FeatureCard icon={<Shield size={40} />} title="Battle" desc="Defeat bugs and bosses with syntax." />
          <FeatureCard icon={<Scroll size={40} />} title="Collect" desc="Earn loot and customize your avatar." />
        </div>

        {/* CTA Button */}
        <div className="mt-8">
          <PixelButton label="Get Started / Login" primary onClick={onGetStarted} />
        </div>

      </div>

      {/* Footer */}
      <div className="absolute bottom-4 text-[#8b5a2b] text-sm font-mono">
        © 2026 Mapúa University • Group 5
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="bg-[#e3d5ca] border-4 border-[#5d3a1a] p-6 flex flex-col items-center text-center gap-2 shadow-lg rounded-lg hover:scale-105 transition-transform">
    <div className="text-[#5d3a1a] mb-2">{icon}</div>
    <h3 className="text-2xl font-bold text-[#3e2723] uppercase" style={{ fontFamily: "'VT323', monospace" }}>{title}</h3>
    <p className="text-[#5d3a1a] leading-tight font-mono text-sm">{desc}</p>
  </div>
);