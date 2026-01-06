import { GameInterface } from '@/components/GameInterface';
import gameBackground from '@/assets/game-background.jpg';

const Index = () => {
  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: `url(${gameBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Subtle overlay for readability */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px]" />
      
      {/* Game Interface */}
      <div className="relative z-10">
        <GameInterface />
      </div>
    </div>
  );
};

export default Index;
