// src/utils/audioManager.ts

export const playSFX = (fileName: string) => {
  // 1. Get volumes, but default to 100% (1.0) if they don't exist yet
  const masterValue = localStorage.getItem('masterVol');
  const sfxValue = localStorage.getItem('sfxVol');
  
  const master = masterValue ? Number(masterValue) / 100 : 0.8; 
  const sfxVol = sfxValue ? Number(sfxValue) / 100 : 0.5;
  const isMuted = localStorage.getItem('sfxMuted') === 'true';

  if (isMuted) return;

  // 2. Use the path that worked in your browser test
  const audio = new Audio(`/assets/audio/${fileName}`);
  
  // 3. Apply volume and play
  audio.volume = master * sfxVol;
  
  // Catch block is required because browsers block audio until the first click
  audio.play().catch(err => {
    console.warn("Playback prevented. Click the screen once to enable audio!", err);
  });
};

export const updateBGMVolume = (player: HTMLAudioElement | null) => {
  if (!player) return;
  
  const masterValue = localStorage.getItem('masterVol');
  const bgmValue = localStorage.getItem('bgmVol');
  
  const master = masterValue ? Number(masterValue) / 100 : 0.8;
  const bgmVol = bgmValue ? Number(bgmValue) / 100 : 0.5;
  const isMuted = localStorage.getItem('bgmMuted') === 'true';

  player.volume = isMuted ? 0 : (master * bgmVol);
};