import { useState } from 'react';
import { HelpCircle, PlayCircle, Bug, ChevronDown, ChevronUp } from 'lucide-react';

// --- Reusable Pixel Components (Matches other files) ---
const PixelPanel = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`relative bg-[#f4e4bc] border-4 border-[#5d3a1a] p-4 shadow-lg flex flex-col w-full ${className}`}>
    <div className="absolute top-2 left-2 w-2 h-2 bg-[#8b5a2b] border-2 border-[#5d3a1a]"></div>
    <div className="absolute top-2 right-2 w-2 h-2 bg-[#8b5a2b] border-2 border-[#5d3a1a]"></div>
    <div className="absolute bottom-2 left-2 w-2 h-2 bg-[#8b5a2b] border-2 border-[#5d3a1a]"></div>
    <div className="absolute bottom-2 right-2 w-2 h-2 bg-[#8b5a2b] border-2 border-[#5d3a1a]"></div>
    {children}
  </div>
);

// --- Help Specific Components ---

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-4 border-[#5d3a1a] bg-[#e3d5ca] transition-all">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-[#d4c5a9] transition-colors"
      >
        <span className="font-bold text-[#5d3a1a] text-lg uppercase" style={{ fontFamily: "'VT323', monospace" }}>{question}</span>
        {isOpen ? <ChevronUp size={20} className="text-[#5d3a1a]" /> : <ChevronDown size={20} className="text-[#5d3a1a]" />}
      </button>
      
      {isOpen && (
        <div className="p-3 bg-[#fdf6e3] border-t-4 border-[#5d3a1a] text-[#3e2723] text-sm leading-relaxed border-dashed" style={{ fontFamily: "'VT323', monospace" }}>
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

// --- Data ---
const FAQS = [
  { 
    question: "How do I unlock new layers?", 
    answer: "You must complete the 'Boss Node' of your current layer. Boss nodes usually require a streak of 3 correct answers." 
  },
  { 
    question: "My code is correct but fails?", 
    answer: "Check for hidden test cases! Sometimes your code works for '1+1' but fails for negative numbers. Try to make your solution more general." 
  },
  { 
    question: "How do I join a Guild?", 
    answer: "Go to the Guilds tab and enter the Class Code provided by your instructor. You can only be in 2 guilds at once." 
  },
];

export const Help = () => {
  return (
    <div className="h-full flex flex-col pt-4 items-center">
      <div className="w-full max-w-5xl bg-[#fdf6e3] p-8 flex justify-center">
        <PixelPanel className="min-h-[600px] gap-8">
          
          {/* Top Section: Actions */}
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center border-b-4 border-[#d4c5a9] pb-8 border-dashed">
             {/* Tutorial Button */}
             <button className="flex items-center gap-3 bg-[#76c442] border-4 border-[#3e2723] px-6 py-3 text-white font-bold uppercase hover:bg-[#5da035] shadow-md active:translate-y-1 transition-all w-full md:w-auto justify-center" style={{ fontFamily: "'VT323', monospace", fontSize: '1.25rem' }}>
                <PlayCircle size={24} />
                Replay Tutorial
             </button>

             {/* Report Bug Button */}
             <button className="flex items-center gap-3 bg-[#ef4444] border-4 border-[#3e2723] px-6 py-3 text-white font-bold uppercase hover:bg-[#dc2626] shadow-md active:translate-y-1 transition-all w-full md:w-auto justify-center" style={{ fontFamily: "'VT323', monospace", fontSize: '1.25rem' }}>
                <Bug size={24} />
                Report a Bug
             </button>
          </div>

          {/* Bottom Section: FAQ */}
          <div className="flex-1 flex flex-col w-full max-w-3xl mx-auto">
            <SectionHeader title="Frequently Asked Questions" />
            
            <div className="flex flex-col gap-4">
              {FAQS.map((faq, index) => (
                <FAQItem key={index} question={faq.question} answer={faq.answer} />
              ))}
            </div>

            {/* Contact Support Footer */}
            <div className="mt-8 text-center text-[#8b5a2b]" style={{ fontFamily: "'VT323', monospace" }}>
              <p className="text-xl">Still stuck? Email us at <span className="font-bold underline cursor-pointer hover:text-[#5d3a1a]">support@algomyth.edu</span></p>
            </div>
          </div>

        </PixelPanel>
      </div>
    </div>
  );
};