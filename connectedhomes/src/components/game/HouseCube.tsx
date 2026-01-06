import React from 'react';
import { StickFigure } from './StickFigure';
import { House } from '@/types/game';

interface HouseCubeProps {
  house: House;
  isDragging: boolean;
  hasNeighbor: 'left' | 'right' | 'top' | 'bottom' | null;
  getPersonColor: (personId: string) => string;
  onDragStart: (e: React.MouseEvent) => void;
}

export const HouseCube: React.FC<HouseCubeProps> = ({
  house,
  isDragging,
  hasNeighbor,
  getPersonColor,
  onDragStart,
}) => {
  const cubeSize = 100;
  const isEmpty = house.occupants.length === 0;
  const hasMultipleOccupants = house.occupants.length > 1;
  const isOwnerHome = house.occupants.includes(house.ownerId);
  
  return (
    <div
      className={`
        relative cursor-grab select-none transition-all duration-200 ease-out
        ${isDragging ? 'cursor-grabbing scale-110 z-50 opacity-90' : 'hover:scale-105'}
        ${hasMultipleOccupants ? 'animate-pulse-glow' : ''}
      `}
      style={{
        width: cubeSize,
        height: cubeSize,
      }}
      onMouseDown={onDragStart}
    >
      {/* Cube base */}
      <div
        className={`
          absolute inset-0 rounded-2xl shadow-cube transition-all duration-300 overflow-hidden
          ${isDragging ? 'ring-4 ring-primary ring-offset-2 ring-offset-background' : ''}
          ${isEmpty ? 'opacity-60' : ''}
        `}
        style={{
          backgroundColor: house.color,
        }}
      >
        {/* House interior background */}
        <div className="absolute inset-2 rounded-xl bg-card/90 overflow-hidden">
          {/* Room interior */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
            {/* Floor */}
            <rect x="0" y="70" width="100" height="30" fill="hsl(var(--muted))" />
            
            {/* Back wall */}
            <rect x="0" y="0" width="100" height="70" fill="hsl(var(--card))" />
            
            {/* Window */}
            <rect x="10" y="12" width="20" height="20" fill="hsl(var(--secondary))" rx="2" />
            <line x1="20" y1="12" x2="20" y2="32" stroke="hsl(var(--foreground) / 0.3)" strokeWidth="1.5" />
            <line x1="10" y1="22" x2="30" y2="22" stroke="hsl(var(--foreground) / 0.3)" strokeWidth="1.5" />
            
            {/* Door on the side where neighbor is */}
            {hasNeighbor === 'right' && (
              <rect x="85" y="40" width="15" height="35" fill="hsl(var(--primary) / 0.6)" rx="2" />
            )}
            {hasNeighbor === 'left' && (
              <rect x="0" y="40" width="15" height="35" fill="hsl(var(--primary) / 0.6)" rx="2" />
            )}
            
            {/* Empty house indicator */}
            {isEmpty && (
              <text x="50" y="50" textAnchor="middle" fontSize="20" fill="hsl(var(--muted-foreground))">
                🏠
              </text>
            )}
          </svg>
          
          {/* Animated stick figures */}
          {!isEmpty && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-end gap-0.5 flex-wrap justify-center" style={{ maxWidth: '80px' }}>
              {house.occupants.map((personId, index) => {
                const isOwner = personId === house.ownerId;
                const activity = hasMultipleOccupants ? 'waving' : (isOwner ? house.activity : 'idle');
                const size = Math.max(16, 28 - (house.occupants.length - 1) * 4);
                
                return (
                  <div 
                    key={personId}
                    className={hasMultipleOccupants && !isOwner ? 'animate-bounce-in' : ''}
                    style={{ 
                      animationDelay: `${index * 0.1}s`,
                    }}
                  >
                    <StickFigure 
                      size={size} 
                      color={getPersonColor(personId)} 
                      activity={activity}
                    />
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Chat bubbles when multiple occupants */}
          {hasMultipleOccupants && (
            <>
              <div className="absolute top-4 left-6 animate-float">
                <div className="bg-foreground/10 rounded-full px-2 py-1 text-[8px]">
                  👋
                </div>
              </div>
              <div className="absolute top-8 right-6 animate-float" style={{ animationDelay: '0.5s' }}>
                <div className="bg-foreground/10 rounded-full px-2 py-1 text-[8px]">
                  😊
                </div>
              </div>
            </>
          )}
          
          {/* Owner away indicator */}
          {!isOwnerHome && !isEmpty && (
            <div className="absolute top-2 right-2">
              <div className="bg-primary/20 rounded-full px-1.5 py-0.5 text-[6px] text-primary">
                Guest
              </div>
            </div>
          )}
        </div>
        
        {/* Roof trim */}
        <div 
          className="absolute top-0 left-0 right-0 h-2 rounded-t-2xl"
          style={{ backgroundColor: 'hsl(var(--foreground) / 0.2)' }}
        />
      </div>
    </div>
  );
};
