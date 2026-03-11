// src/components/Icons.tsx
// Removed unused React import to fix TS6133

export const MapuaIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated' }}>
    <path d="M50 5 L90 20 L90 60 C90 80 50 95 50 95 C50 95 10 80 10 60 L10 20 L50 5Z" fill="#dc2626" stroke="#fcd34d" strokeWidth="6" />
    <text x="50" y="65" fontFamily="'VT323', monospace" fontSize="45" fontWeight="900" fill="#fcd34d" textAnchor="middle">MU</text>
  </svg>
);

export const AlgomythLogo = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="40" y="20" width="20" height="10" fill="#76c442" />
    <rect x="30" y="30" width="10" height="50" fill="#76c442" />
    <rect x="60" y="30" width="10" height="50" fill="#76c442" />
    <rect x="40" y="50" width="20" height="10" fill="#76c442" />
    <rect x="45" y="10" width="10" height="80" fill="#d4c5a9" />
    <rect x="35" y="70" width="30" height="10" fill="#5d3a1a" />
    <rect x="45" y="80" width="10" height="15" fill="#8b5a2b" />
  </svg>
);