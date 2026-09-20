import React, { useEffect, useState } from 'react';
import { playLightsOutChime } from '../utils/audioAlerts';

interface F1IntroScreenProps {
  onComplete: () => void;
}

export const F1IntroScreen: React.FC<F1IntroScreenProps> = ({ onComplete }) => {
  // Phase 1 (0.0s - 1.5s): White logo, black screen
  // Phase 2 (1.5s - 2.5s): Red logo, black screen
  // Phase 3 (2.5s - 3.0s): Smooth background gradient (Red -> Yellow -> Cyan)
  // Phase 4 (3.0s): Transition to Dashboard
  const [logoColor, setLogoColor] = useState<'white' | 'red'>('white');
  const [showGradient, setShowGradient] = useState<boolean>(false);

  useEffect(() => {
    // Attempt audio chime synchronized with lights out
    try {
      playLightsOutChime();
    } catch {
      // Audio might be blocked by browser autoplay policy
    }

    // At 1.5s: Logo turns RED
    const redTimer = setTimeout(() => {
      setLogoColor('red');
    }, 1500);

    // At 2.5s: Smooth background gradient effect (Red -> Yellow -> Cyan)
    const gradientTimer = setTimeout(() => {
      setShowGradient(true);
    }, 2500);

    // At 3.0s: Automatically transition to Dashboard
    const finishTimer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(redTimer);
      clearTimeout(gradientTimer);
      clearTimeout(finishTimer);
    };
  }, [onComplete]);

  return (
    <div 
      id="f1-intro-screen"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black overflow-hidden select-none transition-all duration-700"
    >
      {/* Dynamic Smooth Background Gradient Effect (Red -> Yellow -> Cyan) at 2.5s */}
      <div 
        className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${
          showGradient ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: 'radial-gradient(circle at center, rgba(255, 30, 39, 0.4) 0%, rgba(255, 215, 0, 0.3) 45%, rgba(0, 240, 255, 0.35) 85%, #000000 100%), linear-gradient(135deg, #ff1801 0%, #eab308 50%, #06b6d4 100%)',
          backgroundBlendMode: 'screen',
        }}
      />

      {/* Subtle Carbon Mesh and Speed Lines */}
      <div className="absolute inset-0 race-grid-lines opacity-10 pointer-events-none" />

      {/* Central F1 Logo Container */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Authentic High-Precision Formula 1 Vector Logo */}
        <div 
          className={`transition-all duration-500 transform ${
            logoColor === 'red' ? 'scale-105' : 'scale-100'
          }`}
          style={{
            filter: logoColor === 'red' 
              ? 'drop-shadow(0 0 35px rgba(225, 6, 0, 0.9)) drop-shadow(0 0 70px rgba(225, 6, 0, 0.5))' 
              : 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.4))',
          }}
        >
          <svg 
            className="w-56 sm:w-72 md:w-96 h-auto" 
            viewBox="0 0 160 40" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Stylized Formula 1 mark */}
            <g 
              className="transition-colors duration-300" 
              fill={logoColor === 'white' ? '#FFFFFF' : '#E10600'}
            >
              {/* Slanted forward 'F' top loop and curve */}
              <path d="M 64.0 1.0 L 115.0 1.0 L 103.5 12.0 L 52.5 12.0 C 42.0 12.0 34.5 19.5 28.0 27.5 C 22.0 34.5 14.5 39.0 2.0 39.0 L 0.0 39.0 C 13.0 39.0 21.0 34.0 27.0 26.5 C 33.5 18.5 41.5 1.0 64.0 1.0 Z" />
              {/* Slanted forward 'F' middle crossbar */}
              <path d="M 68.0 16.0 L 109.0 16.0 L 97.5 27.0 L 56.5 27.0 C 47.0 27.0 40.5 32.5 35.5 39.0 L 23.5 39.0 C 29.5 32.0 37.0 16.0 68.0 16.0 Z" />
              {/* Slanted forward '1' stroke */}
              <path d="M 124.0 1.0 L 140.0 1.0 L 102.0 39.0 L 86.0 39.0 Z" />
              {/* Triangular accent cut of '1' */}
              <path d="M 144.0 1.0 L 160.0 1.0 L 150.0 11.0 L 134.0 11.0 Z" />
            </g>
          </svg>
        </div>

        {/* Dynamic telemetry status tag */}
        <div className="mt-8 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
          <span className="text-[11px] font-mono tracking-[0.25em] text-slate-400 uppercase">
            {logoColor === 'white' ? 'INITIALIZING APEX TELEMETRY...' : 'LIGHTS OUT // 2026 WORLD CHAMPIONSHIP'}
          </span>
        </div>

        {/* 5-Red-Lights Sequence Display Bar */}
        <div className="mt-4 flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/60 border border-slate-800">
          {[1, 2, 3, 4, 5].map((light) => (
            <div 
              key={light}
              className={`w-3 h-3 rounded-full border transition-all duration-300 ${
                logoColor === 'red'
                  ? 'bg-red-600 border-red-500 shadow-[0_0_12px_rgba(225,6,0,0.9)]'
                  : 'bg-slate-800 border-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Skip Button in bottom corner for instant access */}
      <button
        onClick={onComplete}
        className="absolute bottom-6 right-6 text-xs font-mono text-slate-500 hover:text-white transition px-3 py-1.5 rounded-lg border border-slate-800/80 bg-slate-950/60 backdrop-blur-sm"
      >
        Skip Intro &gt;&gt;
      </button>
    </div>
  );
};
