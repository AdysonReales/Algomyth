import { useState } from 'react';
import { Volume2, VolumeX, Music, Mic2, Save } from 'lucide-react';
import { updateBGMVolume, playSFX } from '../utils/AudioManager';

export const AudioSettings = ({ settings, onUpdate }: { settings: any, onUpdate: () => void }) => {
  // Use 'settings' as the initial values if they exist!
  const [master, setMaster] = useState(settings?.masterVolume ?? Number(localStorage.getItem('masterVol') || 80));
  const [sfx, setSfx] = useState(settings?.sfxVolume ?? Number(localStorage.getItem('sfxVol') || 50));
  const [music, setMusic] = useState(settings?.bgmVolume ?? Number(localStorage.getItem('bgmVol') || 50));
  const [sfxMuted, setSfxMuted] = useState(localStorage.getItem('sfxMuted') === 'true');
  const [musicMuted, setMusicMuted] = useState(localStorage.getItem('bgmMuted') === 'true');

  const handleApplyMix = () => {
    // 1. Persist to LocalStorage so AudioManager can see it
    localStorage.setItem('masterVol', master.toString());
    localStorage.setItem('sfxVol', sfx.toString());
    localStorage.setItem('bgmVol', music.toString());
    localStorage.setItem('sfxMuted', sfxMuted.toString());
    localStorage.setItem('bgmMuted', musicMuted.toString());

    // 2. Sync the Global BGM Player immediately
    const bgm = document.getElementById('global-bgm') as HTMLAudioElement;
    updateBGMVolume(bgm);

    // 3. Play a test sound so the user hears the new SFX level
    playSFX('sfx_click.mp3');

    alert("AUDIO MIX APPLIED!");
    onUpdate(); // Refresh user settings if needed by parent
  };

  return (
    <div className="p-8 flex flex-col items-center font-mono" style={{ fontFamily: "'VT323', monospace" }}>
      <div className="w-full max-w-xl bg-[#f4e4bc] border-8 border-[#5d3a1a] p-8 shadow-2xl relative">
        <h2 className="text-5xl font-bold text-[#5d3a1a] uppercase mb-8 border-b-4 border-[#5d3a1a] pb-2 flex items-center gap-4">
          <Volume2 size={40} /> Audio Mixer
        </h2>

        <div className="space-y-10">
          {/* MASTER VOLUME */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-end">
              <label className="text-3xl font-bold text-[#5d3a1a] uppercase">Overall Volume</label>
              <span className="text-3xl font-bold text-[#8b5a2b]">{master}%</span>
            </div>
            <input 
              type="range" min="0" max="100" value={master} 
              onChange={(e) => setMaster(Number(e.target.value))}
              className="w-full h-8 cursor-pointer accent-[#5d3a1a] bg-[#d4c5a9] border-4 border-[#5d3a1a]"
            />
          </div>

          {/* MUSIC VOLUME */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setMusicMuted(!musicMuted)}
                  className={`p-2 border-4 border-[#3e2723] ${musicMuted ? 'bg-red-500 text-white' : 'bg-[#76c442] text-white'}`}
                >
                  {musicMuted ? <VolumeX size={24} /> : <Music size={24} />}
                </button>
                <label className="text-3xl font-bold text-[#5d3a1a] uppercase">Music Volume</label>
              </div>
              <span className="text-3xl font-bold text-[#8b5a2b]">{music}%</span>
            </div>
            <input 
              type="range" min="0" max="100" value={music} disabled={musicMuted}
              onChange={(e) => setMusic(Number(e.target.value))}
              className={`w-full h-8 cursor-pointer accent-[#5d3a1a] bg-[#d4c5a9] border-4 border-[#5d3a1a] ${musicMuted ? 'opacity-30' : ''}`}
            />
          </div>

          {/* SFX VOLUME */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSfxMuted(!sfxMuted)}
                  className={`p-2 border-4 border-[#3e2723] ${sfxMuted ? 'bg-red-500 text-white' : 'bg-[#76c442] text-white'}`}
                >
                  {sfxMuted ? <VolumeX size={24} /> : <Mic2 size={24} />}
                </button>
                <label className="text-3xl font-bold text-[#5d3a1a] uppercase">Sound Volume</label>
              </div>
              <span className="text-3xl font-bold text-[#8b5a2b]">{sfx}%</span>
            </div>
            <input 
              type="range" min="0" max="100" value={sfx} disabled={sfxMuted}
              onChange={(e) => setSfx(Number(e.target.value))}
              className={`w-full h-8 cursor-pointer accent-[#5d3a1a] bg-[#d4c5a9] border-4 border-[#5d3a1a] ${sfxMuted ? 'opacity-30' : ''}`}
            />
          </div>
        </div>

        {/* APPLY BUTTON */}
        <button 
          onClick={handleApplyMix}
          className="w-full mt-10 bg-[#76c442] text-white border-4 border-[#3e2723] p-4 text-3xl font-bold uppercase shadow-[0_6px_0_#3e2723] hover:translate-y-1 active:translate-y-2 active:shadow-none transition-all flex items-center justify-center gap-4"
        >
          <Save size={32} /> Apply Mix
        </button>
      </div>
    </div>
  );
};