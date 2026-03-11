import Editor from '@monaco-editor/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { XCircle, Sparkles, Skull } from 'lucide-react';

export const CodingIDE = ({ task, onComplete, onExit }: any) => {
  const [currentPhase, setCurrentPhase] = useState(task.currentStreak || 0);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState('SYSTEM: READY FOR COMPILATION...');
  const [isVictory, setIsVictory] = useState(false);

  const activeQuestion = task.phases[currentPhase];
  const hpPercentage = activeQuestion ? ((task.requiredStreak - currentPhase) / task.requiredStreak) * 100 : 0;

  useEffect(() => {
    if (activeQuestion) {
      setCode(activeQuestion.starterCode.replace(/\\n/g, '\n'));
      setOutput(`SYSTEM: LOADED PHASE ${currentPhase + 1} OF ${task.requiredStreak}...`);
    } else if (currentPhase >= task.requiredStreak) {
      setIsVictory(true);
    }
  }, [currentPhase, activeQuestion, task.requiredStreak]);

  const handleSubmit = async () => {
    setOutput("SYSTEM: ANALYZING C++ ALGORITHM...");
    try {
      const res = await axios.post('http://localhost:5000/api/tasks/submit', { 
        taskId: task._id, 
        phaseIndex: currentPhase,
        code 
      });

      if (res.data.success) {
        setOutput(`SUCCESS: MASSIVE DAMAGE DEALT!`);
        setCurrentPhase((prev: number) => prev + 1);
      } else {
        setCurrentPhase(0); // Reset gauntlet on failure
        setOutput("FAILURE: COMPILER ERROR OR MISSING KEYWORD.\nBOSS FULLY HEALED. STREAK RESET.");
      }
    } catch (err: any) {
      setOutput(`ERROR: ${err.response?.data?.message || "COMPILER TIMEOUT"}`);
    }
  };

  if (!activeQuestion && !isVictory) return null;

  return (
    <div className="h-full bg-[#3e2723] p-4 flex flex-col gap-4 overflow-hidden relative">
      {/* Victory Overlay logic remains same */}
      {isVictory && (
        <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm">
           <div className="bg-[#f4e4bc] border-8 border-[#76c442] p-8 flex flex-col items-center animate-bounce shadow-[0_0_50px_rgba(118,196,66,0.5)] max-w-lg text-center">
              <Sparkles size={64} className="text-[#76c442] mb-4" />
              <h1 className="text-5xl font-bold text-[#5d3a1a] mb-2 uppercase" style={{ fontFamily: "'VT323', monospace" }}>
                {task.difficulty === 'Boss' ? 'Boss Defeated!' : 'Node Cleared!'}
              </h1>
              <div className="flex gap-4 mb-4 text-2xl font-bold text-[#3e2723]" style={{ fontFamily: "'VT323', monospace" }}>
                 <span className="bg-[#d4a373] border-4 border-[#5d3a1a] px-4 py-2">💰 +{task.isCleared ? 0 : task.reward.gold}</span>
                 <span className="bg-[#d4a373] border-4 border-[#5d3a1a] px-4 py-2">⭐ +{task.isCleared ? 0 : task.reward.xp}</span>
              </div>
              <button onClick={onComplete} className="bg-[#76c442] text-white border-4 border-[#3e2723] text-2xl px-8 py-2 uppercase">Exit</button>
           </div>
        </div>
      )}

      {/* Header, Health Bar, and Workspace follow below... */}
      <div className="flex flex-col gap-2 bg-[#5d3a1a] p-3 border-4 border-[#8b5a2b]">
        <div className="flex justify-between items-center text-[#f4d0a3]" style={{ fontFamily: "'VT323', monospace" }}>
           <div className="flex items-center gap-4">
              <button onClick={onExit} className="bg-[#ef4444] border-2 border-[#3e2723] p-1 text-white hover:scale-110">
                <XCircle size={24} />
              </button>
              <h2 className="text-2xl font-bold uppercase tracking-widest flex items-center gap-2">
                {task.difficulty === 'Boss' && <Skull size={24} className="text-[#ef4444]" />}
                {task.nodeTitle} {task.isCleared && <span className="text-xs ml-2 opacity-70">(REPLAY)</span>}
              </h2>
           </div>
           <div className="text-xl">Phase {currentPhase + 1} / {task.requiredStreak}</div>
        </div>
        
        {/* Boss HP Bar */}
        <div className="w-full h-6 bg-[#2b1b17] border-4 border-[#3e2723] relative">
           <div className="h-full bg-[#ef4444] transition-all duration-500" style={{ width: `${hpPercentage}%` }} />
           {[...Array(task.requiredStreak - 1)].map((_, i) => (
             <div key={i} className="absolute top-0 bottom-0 w-1 bg-[#3e2723]" style={{ left: `${((i + 1) / task.requiredStreak) * 100}%` }} />
           ))}
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Instructions and Monaco Editor sections... */}
        <div className="w-1/3 bg-[#f4e4bc] border-4 border-[#5d3a1a] p-4 flex flex-col">
          <h3 className="text-xl font-bold text-[#5d3a1a] mb-2 uppercase" style={{ fontFamily: "'VT323', monospace" }}>
            {activeQuestion?.questionTitle}
          </h3>
          <p className="text-[#3e2723] font-bold text-lg mb-4">{activeQuestion?.description}</p>
        </div>
        <div className="flex-1 flex flex-col gap-4">
           <div className="flex-1 border-4 border-[#5d3a1a]">
             <Editor height="100%" theme="vs-dark" defaultLanguage="cpp" value={code} onChange={(v) => setCode(v || '')} />
           </div>
           <div className="h-1/3 bg-[#2b1b17] border-4 border-[#5d3a1a] p-4">
              <button onClick={handleSubmit} className="bg-[#ef4444] text-white px-6 py-2 font-bold uppercase mb-2">Execute</button>
              <pre className="text-[#76c442] font-mono whitespace-pre-wrap">{`> ${output}`}</pre>
           </div>
        </div>
      </div>
    </div>
  );
};