import React, { useState } from 'react';
import { ItemCard, GameItem, RarityTier } from './ItemCard';
import { RarityShowcase } from './RarityShowcase';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Package, Trophy, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

import mysticAcorn from '@/assets/mystic-acorn.jpg';
import singingCrystal from '@/assets/crystal-item.jpg';
import phoenixFeather from '@/assets/phoenix-feather.jpg';
import stardustPotion from '@/assets/stardust-potion.jpg';

const sampleItems: GameItem[] = [
  {
    id: '1',
    name: 'Mystic Acorn',
    description: 'A humble acorn that glows with forest magic',
    rarity: 'common',
    imageUrl: mysticAcorn,
    clovers: 0,
    category: 'Nature'
  },
  {
    id: '2', 
    name: 'Singing Crystal',
    description: 'Emits beautiful melodies when touched by moonlight',
    rarity: 'rare',
    imageUrl: singingCrystal,
    clovers: 1,
    category: 'Crystal'
  },
  {
    id: '3',
    name: 'Phoenix Feather',
    description: 'Burns eternal with the fire of rebirth',
    rarity: 'legendary',
    imageUrl: phoenixFeather,
    clovers: 3,
    category: 'Mythical'
  },
  {
    id: '4',
    name: 'Stardust Potion',
    description: 'Contains the essence of fallen stars',
    rarity: 'magical',
    imageUrl: stardustPotion,
    clovers: 2,
    category: 'Alchemy'
  }
];

const rarityChances = {
  common: 40,
  uncommon: 25,
  rare: 15,
  epic: 8,
  'really-rare': 5,
  'super-rare': 3,
  legendary: 2,
  mythical: 1.5,
  magical: 0.4,
  ethereal: 0.09,
  diamond: 0.01
};

export const GameInterface: React.FC = () => {
  const [currentItem, setCurrentItem] = useState<GameItem | null>(null);
  const [inventory, setInventory] = useState<GameItem[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [turns, setTurns] = useState(0);
  const [totalClovers, setTotalClovers] = useState(0);

  const drawRandomItem = () => {
    setIsDrawing(true);
    
    // Simple random selection for demo
    const randomItem = sampleItems[Math.floor(Math.random() * sampleItems.length)];
    const newItem = {
      ...randomItem,
      id: `${randomItem.id}-${Date.now()}`,
      clovers: Math.floor(Math.random() * 4) // Random clovers 0-3
    };
    
    setTimeout(() => {
      setCurrentItem(newItem);
      setInventory(prev => [newItem, ...prev]);
      setTurns(prev => prev + 1);
      setTotalClovers(prev => prev + newItem.clovers);
      setIsDrawing(false);
    }, 800);
  };

  const getRarityColor = (rarity: RarityTier) => {
    const colorMap: Record<RarityTier, string> = {
      common: 'bg-common text-white',
      uncommon: 'bg-uncommon text-white',
      rare: 'bg-rare text-white',
      epic: 'bg-epic text-white',
      'really-rare': 'bg-really-rare text-white',
      'super-rare': 'bg-super-rare text-white',
      legendary: 'bg-legendary text-white',
      mythical: 'bg-mythical text-white',
      magical: 'bg-magical text-white',
      ethereal: 'bg-ethereal text-black',
      diamond: 'bg-diamond text-black'
    };
    return colorMap[rarity];
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            ✨ Whimsical Treasures ✨
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover magical items with every turn in this cozy collectible adventure
          </p>
        </div>

        {/* Stats Bar */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Items Collected</p>
                <p className="text-2xl font-bold">{inventory.length}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Turns Taken</p>
                <p className="text-2xl font-bold">{turns}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-clover-glow" />
              <div>
                <p className="text-sm text-muted-foreground">Total Clovers</p>
                <p className="text-2xl font-bold">{totalClovers}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-sparkle" />
              <div>
                <p className="text-sm text-muted-foreground">Luck Bonus</p>
                <p className="text-2xl font-bold">+{Math.min(totalClovers * 2, 50)}%</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Draw Section */}
        <div className="flex flex-col items-center space-y-6">
          <Button
            size="lg"
            onClick={drawRandomItem}
            disabled={isDrawing}
            className={cn(
              "px-8 py-4 text-lg font-bold rounded-2xl",
              "bg-primary hover:bg-primary/90 transition-all duration-300",
              "hover:scale-105 hover:shadow-magical",
              isDrawing && "animate-pulse"
            )}
          >
            {isDrawing ? (
              <>
                <Sparkles className="w-6 h-6 mr-2 animate-spin" />
                Drawing Magic...
              </>
            ) : (
              <>
                <Package className="w-6 h-6 mr-2" />
                Draw New Item
              </>
            )}
          </Button>

          {/* Current Item Display */}
          {currentItem && (
            <div className="flex flex-col items-center space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Latest Discovery</h2>
              <ItemCard 
                item={currentItem} 
                isRevealing={isDrawing}
                className="animate-draw-reveal"
              />
            </div>
          )}
        </div>

        {/* Rarity Guide */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4 text-center">Rarity Guide</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {Object.entries(rarityChances).map(([rarity, chance]) => (
              <div key={rarity} className="text-center">
                <Badge 
                  className={cn(
                    "mb-1 text-xs px-2 py-1",
                    getRarityColor(rarity as RarityTier)
                  )}
                >
                  {rarity.replace('-', ' ')}
                </Badge>
                <p className="text-xs text-muted-foreground">{chance}%</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Rarity Showcase */}
        <RarityShowcase />

        {/* Inventory */}
        {inventory.length > 0 && (
          <Card className="p-6 bg-card/80 backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-4">Your Collection</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {inventory.slice(0, 8).map((item) => (
                <ItemCard 
                  key={item.id} 
                  item={item}
                  className="scale-75 origin-center"
                />
              ))}
            </div>
            {inventory.length > 8 && (
              <p className="text-center text-muted-foreground mt-4">
                And {inventory.length - 8} more items...
              </p>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};