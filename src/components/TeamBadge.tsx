import React from 'react';
import { getTeamKey } from '../data/driverMedia';

interface TeamBadgeProps {
  teamName: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showName?: boolean;
}

export const TeamBadge: React.FC<TeamBadgeProps> = ({
  teamName,
  className = '',
  size = 'sm',
  showName = false,
}) => {
  const teamKey = getTeamKey(teamName);

  const sizeClasses = {
    xs: 'w-4 h-4 text-[9px]',
    sm: 'w-5 h-5 text-[10px]',
    md: 'w-7 h-7 text-xs',
    lg: 'w-9 h-9 text-sm',
  }[size];

  // Vector Logo for each of the 10 constructors
  const renderLogo = () => {
    switch (teamKey) {
      case 'mercedes':
        // Mercedes three-pointed star in teal / silver circle
        return (
          <div 
            className={`${sizeClasses} rounded-full flex items-center justify-center bg-[#00A19B]/20 border border-[#27F4D2]/60 p-0.5 shrink-0 shadow-sm`}
            title="Mercedes-AMG PETRONAS"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
              <circle cx="50" cy="50" r="45" stroke="#27F4D2" strokeWidth="6" />
              <path d="M50 8 L50 50 L15 72 Z" fill="#E2E8F0" />
              <path d="M50 8 L50 50 L85 72 Z" fill="#94A3B8" />
              <path d="M50 50 L15 72 L50 63 Z" fill="#CBD5E1" />
              <path d="M50 50 L85 72 L50 63 Z" fill="#64748B" />
            </svg>
          </div>
        );

      case 'ferrari':
        // Scuderia Ferrari Yellow Shield with prancing horse & tricolore
        return (
          <div 
            className={`${sizeClasses} rounded flex items-center justify-center bg-[#FFF200] border border-[#E8002D] p-0.5 shrink-0 shadow-sm`}
            title="Scuderia Ferrari"
          >
            <svg viewBox="0 0 100 120" className="w-full h-full" fill="none">
              {/* Italian tricolore top */}
              <rect x="10" y="5" width="26" height="8" fill="#009246" />
              <rect x="36" y="5" width="28" height="8" fill="#FFFFFF" />
              <rect x="64" y="5" width="26" height="8" fill="#CE2B37" />
              {/* Prancing Horse silhouette */}
              <path 
                d="M50 25 C53 22 58 20 62 25 C58 28 55 32 58 38 C62 42 66 40 70 38 C68 45 62 48 58 52 C56 56 60 62 64 68 C58 66 52 64 48 68 C44 74 46 82 42 90 C40 82 38 75 35 70 C32 66 26 65 22 62 C28 58 35 55 38 48 C40 42 38 35 44 28 Z" 
                fill="#111827" 
              />
              <text x="50" y="112" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#111827" fontFamily="sans-serif">SF</text>
            </svg>
          </div>
        );

      case 'mclaren':
        // McLaren Papaya Speedmark / Swoosh
        return (
          <div 
            className={`${sizeClasses} rounded-full flex items-center justify-center bg-black border border-[#FF8000] p-0.5 shrink-0 shadow-sm`}
            title="McLaren Formula 1"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
              <path 
                d="M15 65 C40 25 75 25 85 45 C65 38 42 45 28 72 C22 75 16 72 15 65 Z" 
                fill="#FF8000" 
              />
            </svg>
          </div>
        );

      case 'redbull':
        // Red Bull Racing emblem
        return (
          <div 
            className={`${sizeClasses} rounded flex items-center justify-center bg-[#001A30] border border-[#3671C6] p-0.5 shrink-0 shadow-sm`}
            title="Oracle Red Bull Racing"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
              <circle cx="50" cy="50" r="28" fill="#FACC15" />
              {/* Charging Bull silhouette */}
              <path 
                d="M20 52 C32 38 48 44 54 48 C48 54 36 58 20 52 Z" 
                fill="#DC2626" 
              />
              <path 
                d="M80 52 C68 38 52 44 46 48 C52 54 64 58 80 52 Z" 
                fill="#DC2626" 
              />
              <text x="50" y="85" textAnchor="middle" fontSize="16" fontWeight="900" fill="#FFFFFF" fontFamily="sans-serif">RBR</text>
            </svg>
          </div>
        );

      case 'astonmartin':
        // Aston Martin British Racing Green winged badge
        return (
          <div 
            className={`${sizeClasses} rounded flex items-center justify-center bg-[#00352F] border border-[#229971] p-0.5 shrink-0 shadow-sm`}
            title="Aston Martin Aramco"
          >
            <svg viewBox="0 0 100 60" className="w-full h-full" fill="none">
              <path 
                d="M5 25 Q30 5 50 25 Q70 5 95 25 Q75 45 50 32 Q25 45 5 25 Z" 
                fill="#CEDC00" 
                stroke="#FFFFFF" 
                strokeWidth="2" 
              />
              <rect x="36" y="22" width="28" height="10" rx="2" fill="#00352F" stroke="#CEDC00" strokeWidth="1" />
              <text x="50" y="30" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#CEDC00" fontFamily="sans-serif">AMR</text>
            </svg>
          </div>
        );

      case 'williams':
        // Williams Racing W Crest in Oxford Blue & Cyan
        return (
          <div 
            className={`${sizeClasses} rounded flex items-center justify-center bg-[#000F2E] border border-[#64C4FF] p-0.5 shrink-0 shadow-sm`}
            title="Williams Racing"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
              <path 
                d="M15 25 L35 75 L50 42 L65 75 L85 25 L72 25 L58 60 L50 40 L42 60 L28 25 Z" 
                fill="#64C4FF" 
              />
            </svg>
          </div>
        );

      case 'alpine':
        // Alpine French Blue & Pink A
        return (
          <div 
            className={`${sizeClasses} rounded flex items-center justify-center bg-[#002447] border border-[#FF87BC] p-0.5 shrink-0 shadow-sm`}
            title="BWT Alpine F1 Team"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
              <path 
                d="M20 78 L50 18 L80 78 L65 78 L50 45 L35 78 Z" 
                fill="#0090FF" 
              />
              <path 
                d="M40 58 L60 58 L55 68 L35 68 Z" 
                fill="#FF87BC" 
              />
            </svg>
          </div>
        );

      case 'sauber':
        // Stake / KICK Sauber Neon Green Hexagon
        return (
          <div 
            className={`${sizeClasses} rounded flex items-center justify-center bg-black border border-[#52E252] p-0.5 shrink-0 shadow-sm`}
            title="Stake F1 Team Kick Sauber"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
              <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" stroke="#52E252" strokeWidth="8" fill="#000000" />
              <text x="50" y="60" textAnchor="middle" fontSize="32" fontWeight="900" fill="#52E252" fontFamily="sans-serif">K</text>
            </svg>
          </div>
        );

      case 'rb':
        // Visa Cash App Racing Bulls (VCARB)
        return (
          <div 
            className={`${sizeClasses} rounded flex items-center justify-center bg-[#0C1F4A] border border-[#6692FF] p-0.5 shrink-0 shadow-sm`}
            title="Visa Cash App RB"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
              <circle cx="50" cy="50" r="42" fill="#0C1F4A" stroke="#FFFFFF" strokeWidth="4" />
              <text x="50" y="62" textAnchor="middle" fontSize="30" fontWeight="900" fill="#FF2800" fontFamily="sans-serif">RB</text>
            </svg>
          </div>
        );

      case 'haas':
        // MoneyGram Haas F1 Team
        return (
          <div 
            className={`${sizeClasses} rounded-full flex items-center justify-center bg-white border border-[#E10600] p-0.5 shrink-0 shadow-sm`}
            title="MoneyGram Haas F1 Team"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
              <circle cx="50" cy="50" r="44" fill="#E10600" />
              <circle cx="50" cy="50" r="34" fill="#FFFFFF" />
              <path d="M35 30 L35 70 M65 30 L65 70 M35 50 L65 50" stroke="#E10600" strokeWidth="12" strokeLinecap="square" />
            </svg>
          </div>
        );

      default:
        return (
          <div className={`${sizeClasses} rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-300`}>
            F1
          </div>
        );
    }
  };

  if (!showName) {
    return <span className={`inline-flex ${className}`}>{renderLogo()}</span>;
  }

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {renderLogo()}
      <span className="truncate">{teamName}</span>
    </div>
  );
};
