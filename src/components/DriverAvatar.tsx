import React, { useState } from 'react';
import { DRIVER_PORTRAITS } from '../data/driverMedia';

interface DriverAvatarProps {
  driverId: string;
  driverCode: string;
  firstName?: string;
  lastName?: string;
  number?: number;
  teamColor?: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const DriverAvatar: React.FC<DriverAvatarProps> = ({
  driverId,
  driverCode,
  firstName = '',
  lastName = '',
  number,
  teamColor = '#E10600',
  avatarUrl,
  size = 'md',
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);
  const imageUrl = avatarUrl || DRIVER_PORTRAITS[driverId.toLowerCase()];

  const sizeClasses = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-12 h-12 text-sm',
    xl: 'w-16 h-16 text-base',
  }[size];

  const initials = `${firstName[0] || ''}${lastName[0] || driverCode[0] || ''}`.toUpperCase();

  return (
    <div 
      className={`relative rounded-full shrink-0 overflow-hidden border transition-transform duration-200 group-hover:scale-105 shadow-sm ${sizeClasses} ${className}`}
      style={{ borderColor: `${teamColor}99` }}
      title={`${firstName} ${lastName} (${driverCode})`}
    >
      {/* Background team color accent glow */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{ backgroundColor: teamColor }} 
      />

      {imageUrl && !hasError ? (
        <img
          src={imageUrl}
          alt={`${firstName} ${lastName}`}
          onError={() => setHasError(true)}
          loading="lazy"
          className="w-full h-full object-cover object-top"
          referrerPolicy="no-referrer"
        />
      ) : (
        /* Fallback: Stylized driver initials & racing number with team gradient */
        <div 
          className="w-full h-full flex flex-col items-center justify-center font-racing font-bold text-white shadow-inner select-none"
          style={{ 
            background: `linear-gradient(135deg, ${teamColor}dd 0%, #1e293b 100%)` 
          }}
        >
          <span>{initials || driverCode}</span>
        </div>
      )}

      {/* Subtle outer ring */}
      <div 
        className="absolute inset-0 rounded-full pointer-events-none ring-1 ring-inset ring-white/10" 
      />
    </div>
  );
};
