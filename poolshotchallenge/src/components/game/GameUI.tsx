import React from 'react';
import { Course, GameState } from '@/types/game';
import { RotateCcw, RefreshCw } from 'lucide-react';

interface GameUIProps {
  course: Course;
  gameState: GameState;
  onRestart: () => void;
  onRestartHole: () => void;
}

export const GameUI: React.FC<GameUIProps> = ({ course, gameState, onRestart, onRestartHole }) => {
  const strokeDiff = gameState.strokes - course.par;
  
  const getScoreLabel = () => {
    if (gameState.strokes === 0) return '';
    if (strokeDiff === -2) return 'Eagle!';
    if (strokeDiff === -1) return 'Birdie!';
    if (strokeDiff === 0) return 'Par';
    if (strokeDiff === 1) return 'Bogey';
    if (strokeDiff === 2) return 'Double Bogey';
    return `+${strokeDiff}`;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full max-w-[600px]">
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center">
          <span className="text-muted-foreground text-sm uppercase tracking-wider">Hole</span>
          <span className="text-3xl font-bold text-accent">{course.id}</span>
        </div>
        
        <div className="flex flex-col items-center">
          <span className="text-muted-foreground text-sm uppercase tracking-wider">Par</span>
          <span className="text-3xl font-bold text-primary">{course.par}</span>
        </div>
        
        <div className="flex flex-col items-center">
          <span className="text-muted-foreground text-sm uppercase tracking-wider">Strokes</span>
          <span className="text-3xl font-bold text-foreground">{gameState.strokes}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex flex-col items-center px-4 py-2 bg-card rounded-lg">
          <span className="text-muted-foreground text-xs uppercase tracking-wider">Total</span>
          <span className="text-xl font-semibold text-foreground">{gameState.totalStrokes}</span>
        </div>
        
        <button
          onClick={onRestartHole}
          className="p-3 bg-card hover:bg-muted rounded-lg transition-colors group"
          title="Restart Hole"
        >
          <RefreshCw className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
        </button>
        
        <button
          onClick={onRestart}
          className="p-3 bg-card hover:bg-muted rounded-lg transition-colors group"
          title="Restart Game"
        >
          <RotateCcw className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
      </div>

      {gameState.strokes > 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2">
          <span className={`text-lg font-medium ${
            strokeDiff < 0 ? 'text-primary' : 
            strokeDiff === 0 ? 'text-foreground' : 
            'text-destructive'
          }`}>
            {getScoreLabel()}
          </span>
        </div>
      )}
    </div>
  );
};
