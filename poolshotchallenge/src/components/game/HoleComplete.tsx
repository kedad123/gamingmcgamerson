import React from 'react';
import { Course, GameState } from '@/types/game';
import { Trophy, ArrowRight, RotateCcw } from 'lucide-react';
import { courses } from '@/data/courses';

interface HoleCompleteProps {
  course: Course;
  gameState: GameState;
  onNextHole: () => void;
  onRestart: () => void;
}

export const HoleComplete: React.FC<HoleCompleteProps> = ({
  course,
  gameState,
  onNextHole,
  onRestart,
}) => {
  const strokeDiff = gameState.strokes - course.par;
  const isLastHole = gameState.currentCourse >= courses.length - 1;
  
  const getScoreMessage = () => {
    if (gameState.strokes === 1) return 'Hole in One!';
    if (strokeDiff <= -2) return 'Eagle!';
    if (strokeDiff === -1) return 'Birdie!';
    if (strokeDiff === 0) return 'Par!';
    if (strokeDiff === 1) return 'Bogey';
    if (strokeDiff === 2) return 'Double Bogey';
    return 'Keep Practicing!';
  };

  const getScoreEmoji = () => {
    if (gameState.strokes === 1) return '🏆';
    if (strokeDiff <= -2) return '🦅';
    if (strokeDiff === -1) return '🐦';
    if (strokeDiff === 0) return '👍';
    return '⛳';
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl p-8 max-w-md w-full text-center animate-celebrate shadow-2xl border border-border">
        <div className="text-6xl mb-4">{getScoreEmoji()}</div>
        
        <h2 className="text-3xl font-bold text-foreground mb-2">
          {isLastHole && gameState.isComplete ? 'Game Complete!' : getScoreMessage()}
        </h2>
        
        <p className="text-muted-foreground mb-6">
          {course.name}
        </p>

        <div className="flex justify-center gap-8 mb-8">
          <div className="flex flex-col items-center">
            <span className="text-muted-foreground text-sm">Strokes</span>
            <span className="text-4xl font-bold text-accent">{gameState.strokes}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-muted-foreground text-sm">Par</span>
            <span className="text-4xl font-bold text-primary">{course.par}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-muted-foreground text-sm">Score</span>
            <span className={`text-4xl font-bold ${
              strokeDiff < 0 ? 'text-primary' : 
              strokeDiff === 0 ? 'text-foreground' : 
              'text-destructive'
            }`}>
              {strokeDiff === 0 ? 'E' : strokeDiff > 0 ? `+${strokeDiff}` : strokeDiff}
            </span>
          </div>
        </div>

        {isLastHole ? (
          <div className="space-y-4">
            <div className="bg-muted rounded-xl p-4 mb-4">
              <span className="text-muted-foreground text-sm block mb-1">Final Score</span>
              <span className="text-3xl font-bold text-accent">{gameState.totalStrokes + gameState.strokes}</span>
              <span className="text-muted-foreground text-sm block mt-1">
                Total Par: {courses.reduce((sum, c) => sum + c.par, 0)}
              </span>
            </div>
            <button
              onClick={onRestart}
              className="w-full py-4 px-6 bg-primary text-primary-foreground rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Play Again
            </button>
          </div>
        ) : (
          <button
            onClick={onNextHole}
            className="w-full py-4 px-6 bg-primary text-primary-foreground rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 glow-accent"
          >
            Next Hole
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
