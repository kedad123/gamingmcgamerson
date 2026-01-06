import React from 'react';
import { Clover } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RarityTier } from './ItemCard';

interface CloverTokenProps {
  rarity: RarityTier;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

const rarityGlow = {
  common: 'text-common-glow',
  uncommon: 'text-uncommon-glow', 
  rare: 'text-rare-glow',
  epic: 'text-epic-glow',
  'really-rare': 'text-really-rare-glow',
  'super-rare': 'text-super-rare-glow',
  legendary: 'text-legendary-glow',
  mythical: 'text-mythical-glow',
  magical: 'text-magical-glow',
  ethereal: 'text-ethereal-glow',
  diamond: 'text-diamond-glow'
};

const sizeMap = {
  sm: 12,
  md: 16,
  lg: 24
};

export const CloverToken: React.FC<CloverTokenProps> = ({
  rarity,
  size = 'md',
  animated = true,
  className
}) => {
  return (
    <div className={cn(
      "relative inline-flex items-center justify-center",
      "rounded-full bg-clover-glow/20 backdrop-blur-sm",
      animated && "animate-clover-bounce",
      className
    )}>
      <Clover 
        size={sizeMap[size]} 
        className={cn(
          "drop-shadow-sm",
          rarityGlow[rarity]
        )}
      />
      
      {/* Magical sparkle effect for higher rarities */}
      {(['legendary', 'mythical', 'magical', 'ethereal', 'diamond'] as RarityTier[]).includes(rarity) && (
        <div className={cn(
          "absolute inset-0 rounded-full",
          "bg-gradient-to-r from-transparent via-white/20 to-transparent",
          "animate-shimmer"
        )} />
      )}
    </div>
  );
};