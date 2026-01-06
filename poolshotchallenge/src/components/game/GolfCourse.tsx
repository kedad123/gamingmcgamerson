import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Course, Point, GameState } from '@/types/game';

interface GolfCourseProps {
  course: Course;
  gameState: GameState;
  onStroke: (velocity: Point) => void;
}

const BALL_RADIUS = 10;
const HOLE_RADIUS = 14;
const MAX_POWER = 15;

export const GolfCourse: React.FC<GolfCourseProps> = ({ course, gameState, onStroke }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [dragEnd, setDragEnd] = useState<Point | null>(null);

  const getCanvasPoint = useCallback((e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    if ('touches' in e && e.touches.length > 0) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    
    if ('clientX' in e) {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
    
    return { x: 0, y: 0 };
  }, []);

  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (gameState.isMoving || gameState.isComplete) return;
    
    const point = getCanvasPoint(e);
    const distance = Math.hypot(
      point.x - gameState.ballPosition.x,
      point.y - gameState.ballPosition.y
    );
    
    if (distance < BALL_RADIUS * 3) {
      setIsDragging(true);
      setDragStart(gameState.ballPosition);
      setDragEnd(point);
    }
  }, [gameState, getCanvasPoint]);

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    setDragEnd(getCanvasPoint(e));
  }, [isDragging, getCanvasPoint]);

  const executeStroke = useCallback(() => {
    if (!isDragging || !dragStart || !dragEnd) {
      setIsDragging(false);
      return;
    }
    
    const dx = dragStart.x - dragEnd.x;
    const dy = dragStart.y - dragEnd.y;
    const distance = Math.hypot(dx, dy);
    
    if (distance > 10) {
      const power = Math.min(distance / 20, MAX_POWER);
      const angle = Math.atan2(dy, dx);
      
      onStroke({
        x: Math.cos(angle) * power,
        y: Math.sin(angle) * power,
      });
    }
    
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  }, [isDragging, dragStart, dragEnd, onStroke]);

  // Global mouse/touch events to handle release outside canvas
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMove = (e: MouseEvent) => {
      setDragEnd(getCanvasPoint(e));
    };

    const handleGlobalUp = () => {
      executeStroke();
    };

    window.addEventListener('mousemove', handleGlobalMove);
    window.addEventListener('mouseup', handleGlobalUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('mouseup', handleGlobalUp);
    };
  }, [isDragging, getCanvasPoint, executeStroke]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grass background
    const grassGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grassGradient.addColorStop(0, 'hsl(142, 55%, 38%)');
    grassGradient.addColorStop(1, 'hsl(142, 55%, 32%)');
    ctx.fillStyle = grassGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grass texture (subtle lines)
    ctx.strokeStyle = 'hsla(142, 60%, 40%, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.height; i += 8) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Draw obstacles
    course.obstacles.forEach(obstacle => {
      if (obstacle.type === 'wall') {
        const wallGradient = ctx.createLinearGradient(
          obstacle.x, obstacle.y,
          obstacle.x + obstacle.width, obstacle.y + obstacle.height
        );
        wallGradient.addColorStop(0, 'hsl(25, 30%, 35%)');
        wallGradient.addColorStop(1, 'hsl(25, 30%, 25%)');
        ctx.fillStyle = wallGradient;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        // Wall border
        ctx.strokeStyle = 'hsl(25, 20%, 20%)';
        ctx.lineWidth = 2;
        ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      } else if (obstacle.type === 'sand') {
        ctx.fillStyle = 'hsl(40, 50%, 65%)';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        // Sand texture
        ctx.fillStyle = 'hsla(40, 40%, 55%, 0.5)';
        for (let i = 0; i < 20; i++) {
          const px = obstacle.x + Math.random() * obstacle.width;
          const py = obstacle.y + Math.random() * obstacle.height;
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (obstacle.type === 'water') {
        const waterGradient = ctx.createRadialGradient(
          obstacle.x + obstacle.width / 2,
          obstacle.y + obstacle.height / 2,
          0,
          obstacle.x + obstacle.width / 2,
          obstacle.y + obstacle.height / 2,
          Math.max(obstacle.width, obstacle.height) / 2
        );
        waterGradient.addColorStop(0, 'hsl(200, 70%, 50%)');
        waterGradient.addColorStop(1, 'hsl(200, 70%, 35%)');
        ctx.fillStyle = waterGradient;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        // Water ripple effect
        ctx.strokeStyle = 'hsla(200, 80%, 70%, 0.4)';
        ctx.lineWidth = 1;
        const centerX = obstacle.x + obstacle.width / 2;
        const centerY = obstacle.y + obstacle.height / 2;
        for (let r = 10; r < Math.min(obstacle.width, obstacle.height) / 2; r += 15) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    });

    // Draw hole
    ctx.fillStyle = 'hsl(0, 0%, 8%)';
    ctx.beginPath();
    ctx.arc(course.hole.x, course.hole.y, HOLE_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    
    // Hole inner ring
    ctx.strokeStyle = 'hsl(0, 0%, 15%)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(course.hole.x, course.hole.y, HOLE_RADIUS - 3, 0, Math.PI * 2);
    ctx.stroke();

    // Draw flag
    ctx.fillStyle = 'hsl(0, 70%, 55%)';
    ctx.beginPath();
    ctx.moveTo(course.hole.x + 2, course.hole.y - 40);
    ctx.lineTo(course.hole.x + 25, course.hole.y - 30);
    ctx.lineTo(course.hole.x + 2, course.hole.y - 20);
    ctx.closePath();
    ctx.fill();
    
    // Flag pole
    ctx.strokeStyle = 'hsl(0, 0%, 90%)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(course.hole.x + 2, course.hole.y);
    ctx.lineTo(course.hole.x + 2, course.hole.y - 45);
    ctx.stroke();

    // Draw aim line when dragging
    if (isDragging && dragStart && dragEnd) {
      const dx = dragStart.x - dragEnd.x;
      const dy = dragStart.y - dragEnd.y;
      const distance = Math.hypot(dx, dy);
      const power = Math.min(distance / 20, MAX_POWER);
      const normalizedPower = power / MAX_POWER;
      
      // Power indicator color
      let powerColor: string;
      if (normalizedPower < 0.33) {
        powerColor = 'hsl(142, 60%, 50%)';
      } else if (normalizedPower < 0.66) {
        powerColor = 'hsl(45, 80%, 55%)';
      } else {
        powerColor = 'hsl(0, 70%, 55%)';
      }
      
      // Draw dotted aim line
      ctx.strokeStyle = powerColor;
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(dragStart.x, dragStart.y);
      ctx.lineTo(dragEnd.x, dragEnd.y);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw power indicator circle
      ctx.strokeStyle = powerColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(dragEnd.x, dragEnd.y, 8, 0, Math.PI * 2);
      ctx.stroke();
      
      // Draw direction arrow at ball
      const angle = Math.atan2(dy, dx);
      const arrowLength = 30 + power * 3;
      const arrowX = dragStart.x + Math.cos(angle) * arrowLength;
      const arrowY = dragStart.y + Math.sin(angle) * arrowLength;
      
      ctx.strokeStyle = powerColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(dragStart.x, dragStart.y);
      ctx.lineTo(arrowX, arrowY);
      ctx.stroke();
      
      // Arrow head
      const headLength = 12;
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(
        arrowX - headLength * Math.cos(angle - Math.PI / 6),
        arrowY - headLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(
        arrowX - headLength * Math.cos(angle + Math.PI / 6),
        arrowY - headLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.stroke();
    }

    // Draw ball
    if (!gameState.isComplete) {
      // Ball shadow
      ctx.fillStyle = 'hsla(0, 0%, 0%, 0.3)';
      ctx.beginPath();
      ctx.ellipse(
        gameState.ballPosition.x + 3,
        gameState.ballPosition.y + 4,
        BALL_RADIUS,
        BALL_RADIUS * 0.5,
        0, 0, Math.PI * 2
      );
      ctx.fill();
      
      // Ball
      const ballGradient = ctx.createRadialGradient(
        gameState.ballPosition.x - 3,
        gameState.ballPosition.y - 3,
        0,
        gameState.ballPosition.x,
        gameState.ballPosition.y,
        BALL_RADIUS
      );
      ballGradient.addColorStop(0, 'hsl(0, 0%, 100%)');
      ballGradient.addColorStop(1, 'hsl(0, 0%, 85%)');
      ctx.fillStyle = ballGradient;
      ctx.beginPath();
      ctx.arc(gameState.ballPosition.x, gameState.ballPosition.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      
      // Ball dimples (subtle)
      ctx.fillStyle = 'hsla(0, 0%, 80%, 0.5)';
      ctx.beginPath();
      ctx.arc(gameState.ballPosition.x - 2, gameState.ballPosition.y - 2, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(gameState.ballPosition.x + 3, gameState.ballPosition.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

  }, [course, gameState, isDragging, dragStart, dragEnd]);

  return (
    <canvas
      ref={canvasRef}
      width={course.bounds.width}
      height={course.bounds.height}
      className="rounded-xl game-shadow cursor-crosshair touch-none max-w-full"
      style={{ aspectRatio: `${course.bounds.width}/${course.bounds.height}` }}
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={executeStroke}
    />
  );
};
