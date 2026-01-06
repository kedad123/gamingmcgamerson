import React from 'react';
import { cn } from '@/lib/utils';
import { Sparkles, Clover } from 'lucide-react';

export type RarityTier = 
  | 'common' 
  | 'uncommon' 
  | 'rare' 
  | 'epic' 
  | 'really-rare' 
  | 'super-rare' 
  | 'legendary' 
  | 'mythical' 
  | 'magical' 
  | 'ethereal' 
  | 'diamond';

export interface GameItem {
  id: string;
  name: string;
  description: string;
  rarity: RarityTier;
  imageUrl?: string;
  clovers: number;
  category: string;
}

interface ItemCardProps {
  item: GameItem;
  isRevealing?: boolean;
  onClick?: () => void;
  className?: string;
}

const rarityConfig: Record<RarityTier, { 
  bg: string;
  glow: string;
  border: string;
  sparkles: boolean;
  floats: boolean;
}> = {
  common: { 
    bg: 'bg-gradient-common', 
    glow: 'text-common-glow', 
    border: 'border-common',
    sparkles: false,
    floats: false
  },
  uncommon: { 
    bg: 'bg-gradient-uncommon', 
    glow: 'text-uncommon-glow', 
    border: 'border-uncommon',
    sparkles: false,
    floats: false
  },
  rare: { 
    bg: 'bg-gradient-rare', 
    glow: 'text-rare-glow', 
    border: 'border-rare',
    sparkles: true,
    floats: false
  },
  epic: { 
    bg: 'bg-gradient-epic', 
    glow: 'text-epic-glow', 
    border: 'border-epic',
    sparkles: true,
    floats: false
  },
  'really-rare': { 
    bg: 'bg-gradient-really-rare', 
    glow: 'text-really-rare-glow', 
    border: 'border-really-rare',
    sparkles: true,
    floats: true
  },
  'super-rare': { 
    bg: 'bg-gradient-super-rare', 
    glow: 'text-super-rare-glow', 
    border: 'border-super-rare',
    sparkles: true,
    floats: true
  },
  legendary: { 
    bg: 'bg-gradient-legendary', 
    glow: 'text-legendary-glow', 
    border: 'border-legendary',
    sparkles: true,
    floats: true
  },
  mythical: { 
    bg: 'bg-gradient-mythical', 
    glow: 'text-mythical-glow', 
    border: 'border-mythical',
    sparkles: true,
    floats: true
  },
  magical: { 
    bg: 'bg-gradient-magical', 
    glow: 'text-magical-glow', 
    border: 'border-magical',
    sparkles: true,
    floats: true
  },
  ethereal: { 
    bg: 'bg-gradient-ethereal', 
    glow: 'text-ethereal-glow', 
    border: 'border-ethereal',
    sparkles: true,
    floats: true
  },
  diamond: { 
    bg: 'bg-gradient-diamond', 
    glow: 'text-diamond-glow', 
    border: 'border-diamond',
    sparkles: true,
    floats: true
  }
};

export const ItemCard: React.FC<ItemCardProps> = ({ 
  item, 
  isRevealing = false, 
  onClick,
  className 
}) => {
  const config = rarityConfig[item.rarity];
  
  return (
    <div
      className={cn(
        "relative w-64 h-80 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300",
        "hover:scale-105 hover:shadow-magical",
        config.bg,
        config.floats && "animate-float",
        isRevealing && "animate-draw-reveal",
        className
      )}
      onClick={onClick}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-gradient-to-br from-white/20 to-transparent" />
      </div>
      
      {/* Sparkle Effects for Higher Rarities */}
      {config.sparkles && (
        <>
          <div className="absolute top-4 right-4 text-sparkle animate-sparkle">
            <Sparkles size={16} />
          </div>
          <div className="absolute bottom-8 left-6 text-sparkle animate-sparkle delay-75">
            <Sparkles size={12} />
          </div>
          <div className="absolute top-1/2 left-4 text-sparkle animate-sparkle delay-150">
            <Sparkles size={14} />
          </div>
        </>
      )}
      
      {/* Item Image Area */}
      <div className="flex items-center justify-center h-48 p-6">
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.name}
            className="max-w-full max-h-full object-contain rounded-lg shadow-soft"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles size={48} className={config.glow} />
          </div>
        )}
      </div>
      
      {/* Item Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/30 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-bold text-lg">{item.name}</h3>
          <div className="flex items-center gap-1">
            {Array.from({ length: item.clovers }).map((_, i) => (
              <Clover 
                key={i} 
                size={16} 
                className="text-clover-glow animate-clover-bounce" 
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
        
        <p className="text-white/80 text-sm mb-2">{item.description}</p>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/60 uppercase tracking-wide">
            {item.category}
          </span>
          <span className={cn(
            "text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-full",
            "bg-white/20 backdrop-blur-sm",
            config.glow
          )}>
            {item.rarity.replace('-', ' ')}
          </span>
        </div>
      </div>
      
      {/* Glow Border */}
      <div className={cn(
        "absolute inset-0 rounded-2xl border-2 pointer-events-none",
        config.border,
        (item.rarity === 'legendary' || item.rarity === 'mythical' || 
         item.rarity === 'magical' || item.rarity === 'ethereal' || 
         item.rarity === 'diamond') && "animate-glow-pulse"
      )} />
    </div>
  );
};