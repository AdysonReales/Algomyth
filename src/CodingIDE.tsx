import Editor from '@monaco-editor/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { XCircle, Sparkles, Skull, Sun, Moon, Lightbulb, Terminal, Zap } from 'lucide-react';
import { playSFX } from './utils/AudioManager';

export const CodingIDE = ({ task, onComplete, onExit }: any) => {
  // Use currentStreak from task or default to 0
  const [currentPhase, setCurrentPhase] = useState(task.currentStreak || 0);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState('SYSTEM: READY FOR COMPILATION...');
  const [isVictory, setIsVictory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  const [hint, setHint] = useState<string | null>(null);

  const activeQuestion = task.phases[currentPhase];
  // HP Bar calculation based on phases
  const hpPercentage = activeQuestion ? ((task.phases.length - currentPhase) / task.phases.length) * 100 : 0;

  // --- 1. CODE PERSISTENCE & INITIALIZATION ---
  useEffect(() => {
    const saved = localStorage.getItem(`algomyth_progress_${task._id}`);
    if (saved) {
      setCode(saved);
      setOutput("SYSTEM: RESTORED PREVIOUS SESSION CODE.");
    } else if (activeQuestion) {
      // Normalize starter code (handle stringified newlines)
      const formattedCode = activeQuestion.starterCode.replace(/\\n/g, '\n');
      setCode(formattedCode);
      setOutput(`SYSTEM: LOADED PHASE ${currentPhase + 1} OF ${task.phases.length}...`);
    }
  }, [currentPhase, activeQuestion, task._id]);

  // Save code locally for session recovery
  useEffect(() => {
    if (code && !isVictory) {
      localStorage.setItem(`algomyth_progress_${task._id}`, code);
    }
  }, [code, task._id, isVictory]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setOutput("SYSTEM: ANALYZING C++ ALGORITHM...");
    setHint(null);

    // --- 2. INFINITE LOOP PROTECTION ---
    const forbiddenPatterns = ['while(true)', 'while (true)', 'for(;;)', 'while(1)', 'while (1)'];
    if (forbiddenPatterns.some(pattern => code.includes(pattern))) {
      playSFX('sfx_fail.ogg');
      setOutput("CRITICAL ERROR: INFINITE LOOP DETECTED.\nEXECUTION ABORTED TO PREVENT SYSTEM CRASH.");
      setHint("Strategy: Ensure your loop condition eventually becomes false!");
      setIsSubmitting(false);
      return;
    }

    try {
      // Determine correct Task ID (Solo task._id vs Guild problemId)
      const actualTaskId = task._id || task.problemId;

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/tasks/submit`, { 
        taskId: actualTaskId, 
        phaseIndex: currentPhase,
        code,
        guildId: task.guildId || null // Ensure guild progress is recorded if applicable
      });

      if (res.data.success) {
        playSFX('sfx_success.ogg');
        setOutput(`>>> SUCCESS: PHASE ${currentPhase + 1} CLEARED!\n${res.data.message || ""}`);
        
        // --- 3. PROGRESSION LOGIC ---
        setTimeout(() => {
          if (currentPhase + 1 >= task.phases.length) {
            setIsVictory(true);
            // Cleanup persistence on victory
            localStorage.removeItem(`algomyth_progress_${task._id}`);
          } else {
            setCurrentPhase((prev: number) => prev + 1);
          }
        }, 1000);
      } else {
        playSFX('sfx_fail.ogg');
        // If the backend sends an error field or message
        const errMsg = res.data.message || res.data.error || "LOGIC MISMATCH";
        setOutput(`FAILURE: ${errMsg}\n\n❌ BOSS HEALED. STREAK RESET.`);
        setHint(res.data.hint || "Try checking your syntax (semicolons, quotes) or required keywords.");
        setCurrentPhase(0); // Reset progress on failure (Hardcore mode)
      }
    } catch (err: any) {
      console.error("Judge Error:", err);
      setOutput(`ERROR: ${err.response?.data?.message || "MOCK JUDGE UNREACHABLE"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!activeQuestion && !isVictory) return null;

  return (
    <div className={`fixed inset-0 z-[200] ${theme === 'light' ? 'bg-[#fdf6e3]' : 'bg-[#1a1a1a]'} flex flex-col font-mono transition-colors duration-300`}>
      
      {/* --- VICTORY OVERLAY --- */}
      {isVictory && (
        <div className="absolute inset-0 bg-black/90 z-[300] flex items-center justify-center backdrop-blur-md animate-in fade-in duration-500">
           <div className="bg-[#f4e4bc] border-8 border-[#76c442] p-10 flex flex-col items-center shadow-[0_0_60px_rgba(118,196,66,0.4)] max-w-lg text-center">
              <Sparkles size={80} className="text-[#76c442] mb-4 animate-pulse" />
              <h1 className="text-6xl font-black text-[#5d3a1a] mb-4 uppercase" style={{ fontFamily: "'VT323', monospace" }}>
                {task.difficulty === 'Boss' ? 'Boss Slain!' : 'Quest Complete!'}
              </h1>
              <div className="flex gap-6 mb-8 text-3xl font-bold text-[#3e2723]" style={{ fontFamily: "'VT323', monospace" }}>
                 <div className="bg-[#d4a373] border-4 border-[#5d3a1a] px-6 py-3 shadow-md">💰 +{task.reward?.gold || 50}</div>
                 <div className="bg-[#d4a373] border-4 border-[#5d3a1a] px-6 py-3 shadow-md">⭐ +{task.reward?.xp || 100}</div>
              </div>
              <button 
                onClick={onComplete} 
                className="bg-[#76c442] text-white border-4 border-[#3e2723] text-3xl px-12 py-4 uppercase font-black hover:scale-105 active:translate-y-1 transition-transform shadow-[0_8px_0_#3e2723]"
                style={{ fontFamily: "'VT323', monospace" }}
              >
                Claim Rewards
              </button>
           </div>
        </div>
      )}

      {/* --- HEADER BAR --- */}
      <div className={`p-4 border-b-8 border-[#3e2723] ${theme === 'light' ? 'bg-[#d4a373]' : 'bg-[#3e2723]'} flex flex-col gap-3`}>
        <div className="flex justify-between items-center text-[#f4d0a3]" style={{ fontFamily: "'VT323', monospace" }}>
           <div className="flex items-center gap-6">
              <button onClick={onExit} className="bg-[#ef4444] border-4 border-black p-1 text-white hover:scale-110 shadow-[2px_2px_0_#000]">
                <XCircle size={28} />
              </button>
              <h2 className="text-3xl font-bold uppercase tracking-tighter flex items-center gap-3">
                {task.difficulty === 'Boss' ? <Skull size={32} className="text-[#ef4444] animate-bounce" /> : <Zap size={32} className="text-yellow-400" />}
                {task.nodeTitle}
              </h2>
           </div>

           <div className="flex items-center gap-6">
             <button 
                onClick={() => setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark')}
                className="flex items-center gap-2 bg-[#5d3a1a] px-4 py-2 border-4 border-[#f4d0a3] hover:bg-[#8b5a2b] shadow-[4px_4px_0_#000] active:translate-y-1 active:shadow-none"
             >
                {theme === 'vs-dark' ? <Sun size={20} /> : <Moon size={20} />}
                <span className="text-lg uppercase">Visuals</span>
             </button>
             <div className="text-2xl bg-black/40 px-4 py-1 border-2 border-white/20">Trial {currentPhase + 1} / {task.phases.length}</div>
           </div>
        </div>
        
        {/* Boss HP Bar (Visual Progression) */}
        <div className="w-full h-8 bg-[#1a1a1a] border-4 border-black relative shadow-inner">
           <div 
             className="h-full bg-gradient-to-r from-red-800 to-red-500 transition-all duration-700 ease-out" 
             style={{ width: `${hpPercentage}%` }} 
           />
           <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-white uppercase tracking-widest mix-blend-difference">Boss Integrity</span>
        </div>
      </div>

      {/* --- MAIN INTERFACE --- */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        
        {/* Left: Scroll of Instructions */}
        <div className="w-full lg:w-1/3 bg-[#f4e4bc] border-r-8 border-[#3e2723] p-6 flex flex-col gap-6 overflow-y-auto shadow-inner">
          <div className="border-b-4 border-[#5d3a1a] pb-2">
            <h3 className="text-2xl font-black text-[#5d3a1a] uppercase" style={{ fontFamily: "'VT323', monospace" }}>
                📜 Quest: {activeQuestion?.questionTitle}
            </h3>
          </div>
          <p className="text-[#3e2723] font-bold text-xl leading-relaxed whitespace-pre-wrap">
            {activeQuestion?.description}
          </p>

          {hint && (
            <div className="mt-auto bg-[#fff3cd] border-4 border-[#ffc107] p-4 animate-in slide-in-from-left-4">
                <div className="flex items-center gap-2 text-[#856404] font-black uppercase text-lg mb-2">
                    <Lightbulb size={24} className="animate-pulse" /> Grandmaster's Advice
                </div>
                <p className="text-[#856404] text-md italic font-bold leading-tight">{hint}</p>
            </div>
          )}
        </div>

        {/* Right: The Arcane Forge (Editor) */}
        <div className="flex-1 flex flex-col min-h-0">
           <div className="flex-1 border-b-8 border-[#3e2723] relative">
             <Editor 
                height="100%" 
                theme={theme} 
                defaultLanguage="cpp" 
                value={code} 
                onChange={(v) => setCode(v || '')}
                options={{ 
                  fontSize: 18, 
                  minimap: { enabled: false },
                  fontFamily: "'Fira Code', monospace",
                  cursorStyle: 'block',
                  lineNumbers: 'on',
                  padding: { top: 20 }
                }}
             />
             <div className="absolute top-2 right-4 text-[10px] text-gray-500 uppercase font-black pointer-events-none opacity-30">Monaco Compiler v1.0</div>
           </div>
           
           {/* Console Log Area */}
           <div className="h-1/3 bg-black p-6 flex flex-col shadow-2xl">
              <div className="flex justify-between items-center mb-4 border-b border-[#76c442]/30 pb-2">
                <div className="flex items-center gap-2 text-[#76c442]">
                  <Terminal size={18} />
                  <span className="text-sm font-black uppercase tracking-widest">Compiler Output</span>
                </div>
                <button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className={`bg-[#ef4444] text-white px-8 py-3 border-4 border-black font-black uppercase text-xl transition-all shadow-[0_4px_0_#000] active:translate-y-1 active:shadow-none hover:bg-red-600 ${isSubmitting ? 'opacity-50 grayscale cursor-wait' : ''}`}
                  style={{ fontFamily: "'VT323', monospace" }}
                >
                    {isSubmitting ? "Compiling..." : "Execute Script"}
                </button>
              </div>
              <pre className="flex-1 text-[#76c442] font-mono whitespace-pre-wrap overflow-y-auto text-lg leading-tight selection:bg-[#76c442] selection:text-black">
                {`> ${output}`}
              </pre>
           </div>
        </div>
      </div>
    </div>
  );
};