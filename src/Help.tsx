import { useState } from 'react';
import { HelpCircle, Bug, ChevronDown, ChevronUp, Users, Palette, Code } from 'lucide-react';

const PixelPanel = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`relative bg-[#f4e4bc] border-4 border-[#5d3a1a] p-4 shadow-lg flex flex-col w-full ${className}`}>
    <div className="absolute top-2 left-2 w-2 h-2 bg-[#8b5a2b] border-2 border-[#5d3a1a]"></div>
    <div className="absolute top-2 right-2 w-2 h-2 bg-[#8b5a2b] border-2 border-[#5d3a1a]"></div>
    <div className="absolute bottom-2 left-2 w-2 h-2 bg-[#8b5a2b] border-2 border-[#5d3a1a]"></div>
    <div className="absolute bottom-2 right-2 w-2 h-2 bg-[#8b5a2b] border-2 border-[#5d3a1a]"></div>
    {children}
  </div>
);

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-4 border-[#5d3a1a] bg-[#e3d5ca] transition-all">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-3 text-left hover:bg-[#d4c5a9]">
        <span className="font-bold text-[#5d3a1a] text-xl uppercase" style={{ fontFamily: "'VT323', monospace" }}>{question}</span>
        {isOpen ? <ChevronUp size={24} className="text-[#5d3a1a]" /> : <ChevronDown size={24} className="text-[#5d3a1a]" />}
      </button>
      {isOpen && (
        <div className="p-4 bg-[#fdf6e3] border-t-4 border-[#5d3a1a] text-[#3e2723] text-lg font-bold border-dashed" style={{ fontFamily: "'VT323', monospace" }}>
          {answer}
        </div>
      )}
    </div>
  );
};

const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center mb-6">
    <div className="bg-[#f4d0a3] px-8 py-2 border-4 border-[#5d3a1a] shadow-sm transform -rotate-1">
      <h2 className="text-3xl font-bold text-[#5d3a1a] uppercase tracking-widest" style={{ fontFamily: "'VT323', monospace" }}>{title}</h2>
    </div>
  </div>
);

const FAQS = [
  { question: "How do I unlock new layers?", answer: "Complete the 'Boss Node' of your current layer. Boss nodes usually require a streak of correct answers without failing." },
  { question: "My code is correct but fails?", answer: "Check the compiler constraints in the left panel. The Mock Judge requires specific variable names or output formats." },
  { question: "How do I join a Guild?", answer: "Go to the Guilds tab and enter the Class Code provided by your instructor." },
];

export const Help = () => {
  const [showTeam, setShowTeam] = useState(false);

  return (
    <div className="h-full flex flex-col pt-4 items-center overflow-y-auto">
      <div className="flex items-center gap-4 mb-4">
        <HelpCircle size={40} className="text-[#5d3a1a]" />
        <h1 className="text-5xl font-bold text-[#3e2723] uppercase" style={{ fontFamily: "'VT323', monospace" }}>Help Center</h1>
      </div>

      <div className="w-full max-w-5xl bg-[#fdf6e3] p-4 md:p-8 flex justify-center mb-10">
        <PixelPanel className="min-h-[500px] gap-8">
          
          <div className="flex justify-center border-b-4 border-[#d4c5a9] pb-8 border-dashed">
             <button 
               onClick={() => setShowTeam(!showTeam)}
               className={`flex items-center gap-3 border-4 border-black px-8 py-4 text-white font-bold uppercase shadow-[0_6px_0_#000] active:translate-y-1 transition-all text-2xl
               ${showTeam ? 'bg-orange-600' : 'bg-[#ef4444] hover:bg-red-600'}`} 
               style={{ fontFamily: "'VT323', monospace" }}
             >
                {showTeam ? <Users size={28} /> : <Bug size={28} />}
                {showTeam ? "Hide Creators" : "Report a Bug / Creators"}
             </button>
          </div>

          {showTeam && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 mb-8">
              <div className="bg-[#e3d5ca] border-4 border-[#5d3a1a] p-6 shadow-inner">
                <h3 className="text-2xl font-black uppercase text-[#5d3a1a] flex items-center gap-2 mb-4 border-b-4 border-[#5d3a1a] pb-2" style={{ fontFamily: "'VT323', monospace" }}><Code /> Developers</h3>
                <ul className="space-y-4 font-bold text-[#3e2723]" style={{ fontFamily: "'VT323', monospace" }}>
                  <li><span className="text-xl block text-black">ADYSON M. REALES</span> <a href="mailto:amreales@mymail.mapua.edu.ph" className="text-blue-700 hover:underline text-lg">amreales@mymail.mapua.edu.ph</a></li>
                  <li><span className="text-xl block text-black">ROLANDO C. ZAGALA JR</span> <a href="mailto:rczagala@mymail.mapua.edu.ph" className="text-blue-700 hover:underline text-lg">rczagala@mymail.mapua.edu.ph</a></li>
                </ul>
              </div>
              <div className="bg-[#e3d5ca] border-4 border-[#5d3a1a] p-6 shadow-inner">
                <h3 className="text-2xl font-black uppercase text-[#5d3a1a] flex items-center gap-2 mb-4 border-b-4 border-[#5d3a1a] pb-2" style={{ fontFamily: "'VT323', monospace" }}><Palette /> Artists</h3>
                <ul className="space-y-4 font-bold text-[#3e2723]" style={{ fontFamily: "'VT323', monospace" }}>
                  <li><span className="text-xl block text-black">ERIN FAYE D. FERNANDEZ</span> <a href="mailto:efdfernandez@mymail.mapua.edu.ph" className="text-blue-700 hover:underline text-lg">efdfernandez@mymail.mapua.edu.ph</a></li>
                  <li><span className="text-xl block text-black">JESSICA CHRISTINE MARIE D. SENO</span> <a href="mailto:jcmdseno@mymail.mapua.edu.ph" className="text-blue-700 hover:underline text-lg">jcmdseno@mymail.mapua.edu.ph</a></li>
                </ul>
              </div>
            </div>
          )}

          <div className="flex-1 flex flex-col w-full max-w-3xl mx-auto">
            <SectionHeader title="Frequently Asked Questions" />
            <div className="flex flex-col gap-4">
              {FAQS.map((faq, index) => <FAQItem key={index} question={faq.question} answer={faq.answer} />)}
            </div>
          </div>
        </PixelPanel>
      </div>
    </div>
  );
};