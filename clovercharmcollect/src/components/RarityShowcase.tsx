import React from 'react';
import { ItemCard, GameItem, RarityTier } from './ItemCard';
import { Card } from '@/components/ui/card';
import { CloverToken } from './CloverToken';
import mysticAcorn from '@/assets/mystic-acorn.jpg';
import singingCrystal from '@/assets/crystal-item.jpg';
import phoenixFeather from '@/assets/phoenix-feather.jpg';
import epicCrystalOrb from '@/assets/epic-crystal-orb.jpg';
import diamondPrism from '@/assets/diamond-prism.jpg';

const showcaseItems: GameItem[] = [
  {
    id: 'showcase-1',
    name: 'Mystic Acorn',
    description: 'Common rarity with wood and earth textures',
    rarity: 'common',
    imageUrl: mysticAcorn,
    clovers: 0,
    category: 'Nature'
  },
  {
    id: 'showcase-2',
    name: 'Singing Crystal',
    description: 'Rare tier with gem-like edges and magical glow',
    rarity: 'rare',
    imageUrl: singingCrystal,
    clovers: 1,
    category: 'Crystal'
  },
  {
    id: 'showcase-3',
    name: 'Crystal Orb',
    description: 'Epic power with crystal layers and energy',
    rarity: 'epic',
    imageUrl: epicCrystalOrb,
    clovers: 2,
    category: 'Arcane'
  },
  {
    id: 'showcase-4',
    name: 'Phoenix Feather',
    description: 'Legendary with ancient symbols and gold',
    rarity: 'legendary',
    imageUrl: phoenixFeather,
    clovers: 3,
    category: 'Mythical'
  },
  {
    id: 'showcase-5',
    name: 'Diamond Prism',
    description: 'Ultimate Diamond tier with prism effects',
    rarity: 'diamond',
    imageUrl: diamondPrism,
    clovers: 5,
    category: 'Ultimate'
  }
];

export const RarityShowcase: React.FC = () => {
  return (
    <Card className="p-8 bg-card/80 backdrop-blur-sm">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          🎨 Rarity Tier Showcase
        </h2>
        <p className="text-muted-foreground text-lg">
          Each tier features unique visual themes, materials, and magical effects
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {showcaseItems.map((item) => (
          <div key={item.id} className="flex flex-col items-center space-y-3">
            <ItemCard 
              item={item}
              className="scale-90 hover:scale-95 transition-transform duration-300"
            />
            <div className="text-center">
              <h3 className="font-bold text-sm">{item.rarity.replace('-', ' ').toUpperCase()}</h3>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="text-xl font-bold text-center mb-4">Clover Token System</h3>
        <div className="flex flex-wrap justify-center gap-4">
          {(['common', 'rare', 'epic', 'legendary', 'diamond'] as RarityTier[]).map((rarity) => (
            <div key={rarity} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <CloverToken rarity={rarity} size="lg" />
              <div>
                <p className="text-sm font-medium capitalize">{rarity} Clover</p>
                <p className="text-xs text-muted-foreground">Rarity modifier</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Clovers decrease the chance of getting the same rarity again, encouraging variety in your collection
        </p>
      </div>
    </Card>
  );
};