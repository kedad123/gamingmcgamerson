import { GameBoard } from '@/components/game/GameBoard';
import { Home, Sparkles } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      {/* Header */}
      <div className="text-center mb-8 animate-bounce-in">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Home className="w-10 h-10 text-primary" />
          <h1 className="text-5xl font-bold text-foreground tracking-tight">
            Cube Village
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-md">
          Drag houses next to each other so neighbors can meet! 
          New houses appear every 5 seconds.
        </p>
      </div>
      
      {/* Game Board */}
      <div className="mb-6">
        <GameBoard />
      </div>
      
      {/* Instructions */}
      <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <span>New house every 5s</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-xs">↔</div>
          <span>Drag to move</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1">
            <div className="w-4 h-4 rounded bg-cube-red" />
            <div className="w-4 h-4 rounded bg-cube-blue" />
          </div>
          <span>Place adjacent to connect</span>
        </div>
      </div>
    </div>
  );
};

export default Index;
