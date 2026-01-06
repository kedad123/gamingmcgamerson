import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GolfCourse } from './GolfCourse';
import { GameUI } from './GameUI';
import { HoleComplete } from './HoleComplete';
import { courses } from '@/data/courses';
import { GameState, Point, Obstacle } from '@/types/game';
import { playPopSound, playVictorySound, playSplashSound, playBounceSound } from '@/lib/sounds';

const BALL_RADIUS = 10;
const HOLE_RADIUS = 14;
const FRICTION = 0.98;
const SAND_FRICTION = 0.92;
const MIN_VELOCITY = 0.1;

const initialGameState: GameState = {
  currentCourse: 0,
  strokes: 0,
  totalStrokes: 0,
  ballPosition: { ...courses[0].ball },
  ballVelocity: { x: 0, y: 0 },
  isMoving: false,
  isComplete: false,
  courseScores: [],
};

export const GolfGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [showComplete, setShowComplete] = useState(false);
  const animationRef = useRef<number>();

  const currentCourse = courses[gameState.currentCourse];

  const checkObstacleCollision = useCallback((
    pos: Point,
    vel: Point,
    obstacles: Obstacle[]
  ): { newPos: Point; newVel: Point; inSand: boolean; inWater: boolean; hitWall: boolean } => {
    let newPos = { ...pos };
    let newVel = { ...vel };
    let inSand = false;
    let inWater = false;
    let hitWall = false;

    for (const obstacle of obstacles) {
      const ballLeft = newPos.x - BALL_RADIUS;
      const ballRight = newPos.x + BALL_RADIUS;
      const ballTop = newPos.y - BALL_RADIUS;
      const ballBottom = newPos.y + BALL_RADIUS;

      const obsLeft = obstacle.x;
      const obsRight = obstacle.x + obstacle.width;
      const obsTop = obstacle.y;
      const obsBottom = obstacle.y + obstacle.height;

      if (ballRight > obsLeft && ballLeft < obsRight &&
          ballBottom > obsTop && ballTop < obsBottom) {
        
        if (obstacle.type === 'wall') {
          hitWall = true;
          // Calculate overlap on each side
          const overlapLeft = ballRight - obsLeft;
          const overlapRight = obsRight - ballLeft;
          const overlapTop = ballBottom - obsTop;
          const overlapBottom = obsBottom - ballTop;

          const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

          if (minOverlap === overlapLeft || minOverlap === overlapRight) {
            newVel.x = -newVel.x * 0.7;
            if (minOverlap === overlapLeft) {
              newPos.x = obsLeft - BALL_RADIUS;
            } else {
              newPos.x = obsRight + BALL_RADIUS;
            }
          } else {
            newVel.y = -newVel.y * 0.7;
            if (minOverlap === overlapTop) {
              newPos.y = obsTop - BALL_RADIUS;
            } else {
              newPos.y = obsBottom + BALL_RADIUS;
            }
          }
        } else if (obstacle.type === 'sand') {
          inSand = true;
        } else if (obstacle.type === 'water') {
          inWater = true;
        }
      }
    }

    return { newPos, newVel, inSand, inWater, hitWall };
  }, []);

  const lastSandStateRef = useRef(false);
  const lastBounceTimeRef = useRef(0);

  const updatePhysics = useCallback(() => {
    setGameState(prev => {
      if (!prev.isMoving) return prev;

      let newVel = { ...prev.ballVelocity };
      let newPos = {
        x: prev.ballPosition.x + newVel.x,
        y: prev.ballPosition.y + newVel.y,
      };

      // Check obstacle collisions
      const collision = checkObstacleCollision(newPos, newVel, currentCourse.obstacles);
      newPos = collision.newPos;
      newVel = collision.newVel;

      // Play bounce sound for wall hits (with cooldown to avoid spam)
      const now = Date.now();
      if (collision.hitWall && now - lastBounceTimeRef.current > 100) {
        lastBounceTimeRef.current = now;
        playBounceSound();
      }

      // Play sound when entering sand
      if (collision.inSand && !lastSandStateRef.current) {
        playBounceSound();
      }
      lastSandStateRef.current = collision.inSand;

      // Apply friction
      const friction = collision.inSand ? SAND_FRICTION : FRICTION;
      newVel.x *= friction;
      newVel.y *= friction;

      // Handle water hazard
      if (collision.inWater) {
        playSplashSound();
        return {
          ...prev,
          ballPosition: { ...currentCourse.ball },
          ballVelocity: { x: 0, y: 0 },
          isMoving: false,
          strokes: prev.strokes + 1, // Penalty stroke
        };
      }

      // Wall bounces (boundary walls)
      let hitBoundary = false;
      if (newPos.x < BALL_RADIUS) {
        newPos.x = BALL_RADIUS;
        newVel.x = -newVel.x * 0.7;
        hitBoundary = true;
      }
      if (newPos.x > currentCourse.bounds.width - BALL_RADIUS) {
        newPos.x = currentCourse.bounds.width - BALL_RADIUS;
        newVel.x = -newVel.x * 0.7;
        hitBoundary = true;
      }
      if (newPos.y < BALL_RADIUS) {
        newPos.y = BALL_RADIUS;
        newVel.y = -newVel.y * 0.7;
        hitBoundary = true;
      }
      if (newPos.y > currentCourse.bounds.height - BALL_RADIUS) {
        newPos.y = currentCourse.bounds.height - BALL_RADIUS;
        newVel.y = -newVel.y * 0.7;
        hitBoundary = true;
      }

      // Play sound for boundary wall hits
      if (hitBoundary && now - lastBounceTimeRef.current > 100) {
        lastBounceTimeRef.current = now;
        playBounceSound();
      }

      // Check if ball is in hole
      const distanceToHole = Math.hypot(
        newPos.x - currentCourse.hole.x,
        newPos.y - currentCourse.hole.y
      );
      
      const speed = Math.hypot(newVel.x, newVel.y);
      
      if (distanceToHole < HOLE_RADIUS - BALL_RADIUS / 2 && speed < 8) {
        playVictorySound();
        return {
          ...prev,
          ballPosition: { ...currentCourse.hole },
          ballVelocity: { x: 0, y: 0 },
          isMoving: false,
          isComplete: true,
        };
      }

      // Stop if velocity is very low
      if (speed < MIN_VELOCITY) {
        return {
          ...prev,
          ballPosition: newPos,
          ballVelocity: { x: 0, y: 0 },
          isMoving: false,
        };
      }

      return {
        ...prev,
        ballPosition: newPos,
        ballVelocity: newVel,
      };
    });
  }, [currentCourse, checkObstacleCollision]);

  useEffect(() => {
    if (gameState.isMoving) {
      animationRef.current = requestAnimationFrame(function animate() {
        updatePhysics();
        animationRef.current = requestAnimationFrame(animate);
      });
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState.isMoving, updatePhysics]);

  useEffect(() => {
    if (gameState.isComplete && !showComplete) {
      setTimeout(() => setShowComplete(true), 500);
    }
  }, [gameState.isComplete, showComplete]);

  const handleStroke = useCallback((velocity: Point) => {
    playPopSound();
    setGameState(prev => ({
      ...prev,
      ballVelocity: velocity,
      isMoving: true,
      strokes: prev.strokes + 1,
    }));
  }, []);

  const handleNextHole = useCallback(() => {
    const nextCourseIndex = gameState.currentCourse + 1;
    if (nextCourseIndex < courses.length) {
      setGameState(prev => ({
        ...prev,
        currentCourse: nextCourseIndex,
        strokes: 0,
        totalStrokes: prev.totalStrokes + prev.strokes,
        ballPosition: { ...courses[nextCourseIndex].ball },
        ballVelocity: { x: 0, y: 0 },
        isMoving: false,
        isComplete: false,
        courseScores: [...prev.courseScores, prev.strokes],
      }));
      setShowComplete(false);
    }
  }, [gameState.currentCourse]);

  const handleRestart = useCallback(() => {
    setGameState({
      ...initialGameState,
      ballPosition: { ...courses[0].ball },
    });
    setShowComplete(false);
  }, []);

  const handleRestartHole = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      strokes: 0,
      ballPosition: { ...currentCourse.ball },
      ballVelocity: { x: 0, y: 0 },
      isMoving: false,
      isComplete: false,
    }));
    setShowComplete(false);
  }, [currentCourse]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 gap-6">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          ⛳ Pool Golf
        </h1>
        <p className="text-muted-foreground">
          {currentCourse.name}
        </p>
      </header>

      <GameUI
        course={currentCourse}
        gameState={gameState}
        onRestart={handleRestart}
        onRestartHole={handleRestartHole}
      />

      <div className="relative">
        <GolfCourse
          course={currentCourse}
          gameState={gameState}
          onStroke={handleStroke}
        />
        
        {!gameState.isMoving && !gameState.isComplete && gameState.strokes === 0 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-sm px-4 py-2 rounded-lg text-sm text-muted-foreground">
            Drag from ball to aim, release to shoot
          </div>
        )}
      </div>

      <div className="flex gap-2 flex-wrap justify-center">
        {courses.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full transition-all ${
              index === gameState.currentCourse
                ? 'bg-accent scale-125'
                : index < gameState.currentCourse
                ? 'bg-primary'
                : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {showComplete && (
        <HoleComplete
          course={currentCourse}
          gameState={gameState}
          onNextHole={handleNextHole}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
};
