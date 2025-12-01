import { useEffect, useRef, useState } from "react";
import { DrawingModal } from "./DrawingModal";
import { playBounceSound, playPopSound } from "@/lib/soundEffects";

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  shape: string;
  sides?: number; // Number of sides for polygon shapes
  customShape?: string; // Data URL for custom drawn shape
  hasSword?: boolean; // Whether this ball has a sword
  swordAngle?: number; // Current angle of the sword rotation
  rainbowTint?: string; // For rainbow balls that have absorbed colors
  tintStrength?: number; // How strong the tint is (0-1)
  trail?: { x: number; y: number }[]; // Trail history for visual effects
}

interface SimulationCanvasProps {
  gravity: number;
  elasticity: number;
  ballCount: number;
  ballSize: number;
  ballShape: string;
  containerShape: string;
  collisionEnabled: boolean;
  growOnBounce: boolean;
  lavaRise: boolean;
  containerShrink: boolean;
  addSidesOnBounce: boolean;
  containerAddSidesOnBounce: boolean;
  addBallOnBounce: boolean;
  blackHoleMode: boolean;
  swordMode: boolean;
  dualLaunchMode: boolean;
  mergeBalls: boolean;
  splitOnBounce: boolean;
  rpsMode: boolean;
  resetTrigger: number;
  isPaused: boolean;
  trailsEnabled: boolean;
  trailOpacity: number;
}

export const SimulationCanvas = ({
  gravity,
  elasticity,
  ballCount,
  ballSize,
  ballShape,
  containerShape,
  collisionEnabled,
  growOnBounce,
  lavaRise,
  containerShrink,
  addSidesOnBounce,
  containerAddSidesOnBounce,
  addBallOnBounce,
  blackHoleMode,
  swordMode,
  dualLaunchMode,
  mergeBalls,
  splitOnBounce,
  rpsMode,
  resetTrigger,
  isPaused,
  trailsEnabled,
  trailOpacity,
}: SimulationCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ballsRef = useRef<Ball[]>([]);
  const animationFrameRef = useRef<number>();
  const lavaHeightRef = useRef(0);
  const containerSizeRef = useRef(1);
  const containerSidesRef = useRef(3); // Start at triangle (3 sides)
  const [selectedBallIndex, setSelectedBallIndex] = useState<number | null>(null);
  const [isDrawingModalOpen, setIsDrawingModalOpen] = useState(false);
  const customShapeImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());

  const ballColors = [
    "#FF0000", // red
    "#FFA500", // orange
    "#FFFF00", // yellow
    "#00CC00", // green (darker)
    "#0000FF", // blue
    "#800080", // purple
    "#AAFF00", // lime (more yellow)
    "#00FFFF", // cyan
    "#FF00FF", // magenta
    "#000000", // black
    "#808080", // grey
    "#FFFFFF", // white
    "#FFC0CB", // pink
    "#805300", // brown (50% darker than orange)
  ];


  const initializeBalls = (canvas: HTMLCanvasElement) => {
    ballsRef.current = [];
    
    // Dual Launch Mode - spawn exactly 2 balls
    if (dualLaunchMode) {
      const leftX = canvas.width / 4;
      const rightX = (3 * canvas.width) / 4;
      const centerY = canvas.height / 2;
      const boost = 6;
      const cornerBoost = 4;
      
      // Random corner selection for each ball
      const leftCorner = Math.random() > 0.5 ? -1 : 1; // -1 for top, 1 for bottom
      const rightCorner = Math.random() > 0.5 ? -1 : 1;
      
      // Left ball - boost to the left and random corner
      ballsRef.current.push({
        x: leftX,
        y: centerY,
        vx: -boost,
        vy: leftCorner * cornerBoost,
        radius: ballSize,
        color: ballColors[0],
        shape: ballShape,
        sides: addSidesOnBounce ? 3 : undefined,
      });
      
      // Right ball - boost to the right and random corner
      ballsRef.current.push({
        x: rightX,
        y: centerY,
        vx: boost,
        vy: rightCorner * cornerBoost,
        radius: ballSize,
        color: ballColors[1],
        shape: ballShape,
        sides: addSidesOnBounce ? 3 : undefined,
      });
      
      lavaHeightRef.current = 0;
      containerSizeRef.current = 1;
      containerSidesRef.current = 3;
      return;
    }
    
    // Add black hole ball if mode is enabled
    if (blackHoleMode) {
      ballsRef.current.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        radius: ballSize,
        color: "#000000",
        shape: ballShape,
        sides: addSidesOnBounce ? 3 : undefined,
      });
    }
    
    // Add regular balls
    const startIndex = blackHoleMode ? 1 : 0;
    for (let i = startIndex; i < ballCount; i++) {
      // Skip rainbow balls if merge mode is enabled
      const maxColorIndex = mergeBalls ? ballColors.length - 1 : ballColors.length;
      const colorIndex = i % (maxColorIndex + 1);
      const color = colorIndex === maxColorIndex && !mergeBalls ? "rainbow" : ballColors[colorIndex % ballColors.length];
      
      // First ball (or second if black hole mode) gets the sword if sword mode is enabled
      const hasSword = swordMode && i === startIndex;
      
      ballsRef.current.push({
        x: containerAddSidesOnBounce ? canvas.width / 2 : Math.random() * (canvas.width - ballSize * 2) + ballSize,
        y: containerAddSidesOnBounce ? canvas.height / 2 : Math.random() * (canvas.height - ballSize * 2) + ballSize,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        radius: ballSize,
        color: color,
        shape: ballShape,
        sides: addSidesOnBounce ? 3 : undefined, // Start at triangle
        hasSword: hasSword,
        swordAngle: hasSword ? 0 : undefined,
      });
    }
    lavaHeightRef.current = 0;
    containerSizeRef.current = 1;
    containerSidesRef.current = 3;
  };

  const drawTrails = (ctx: CanvasRenderingContext2D, ball: Ball) => {
    if (!ball.trail || ball.trail.length < 1) return;

    ctx.save();

    // Parse the ball's color to get RGB values
    let r = 255, g = 255, b = 255;
    if (ball.color !== "rainbow") {
      // Convert hex to RGB
      const hex = ball.color.replace('#', '');
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }

    // Draw permanent circles at each trail point (same size as ball)
    ball.trail.forEach((point, i) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, ball.radius, 0, Math.PI * 2);

      if (ball.color === "rainbow") {
        // For rainbow balls, create a radial gradient
        const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, ball.radius);
        gradient.addColorStop(0, `rgba(255, 0, 0, ${trailOpacity})`);
        gradient.addColorStop(0.33, `rgba(0, 255, 0, ${trailOpacity})`);
        gradient.addColorStop(0.66, `rgba(0, 0, 255, ${trailOpacity})`);
        gradient.addColorStop(1, `rgba(255, 0, 255, ${trailOpacity})`);
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${trailOpacity})`;
      }

      ctx.fill();
    });

    ctx.restore();
  };

  const drawBall = (ctx: CanvasRenderingContext2D, ball: Ball) => {
    ctx.save();
    ctx.translate(ball.x, ball.y);

    // Draw custom shape if available
    if (ball.customShape) {
      const img = customShapeImagesRef.current.get(ball.customShape);
      if (img && img.complete) {
        ctx.drawImage(img, -ball.radius, -ball.radius, ball.radius * 2, ball.radius * 2);
        ctx.restore();
        return;
      }
    }

    // Create rainbow gradient if needed
    let fillStyle: string | CanvasGradient = ball.color;
    if (ball.color === "rainbow") {
      const gradient = ctx.createLinearGradient(-ball.radius, -ball.radius, ball.radius, ball.radius);
      gradient.addColorStop(0, "#FF0000");    // red
      gradient.addColorStop(0.2, "#FF7F00");  // orange
      gradient.addColorStop(0.4, "#FFFF00");  // yellow
      gradient.addColorStop(0.6, "#00FF00");  // green
      gradient.addColorStop(0.8, "#0000FF");  // blue
      gradient.addColorStop(1, "#8B00FF");    // purple
      fillStyle = gradient;
      
      // Apply tint overlay if present
      if (ball.rainbowTint && ball.tintStrength) {
        ctx.globalCompositeOperation = "source-over";
      }
    }

    // Draw polygon shapes (including dynamic sided shapes)
    if (ball.sides && ball.sides >= 3) {
      ctx.beginPath();
      for (let i = 0; i < ball.sides; i++) {
        const angle = (i * 2 * Math.PI) / ball.sides - Math.PI / 2;
        const x = ball.radius * Math.cos(angle);
        const y = ball.radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = fillStyle;
      ctx.fill();
    } else if (ball.shape === "circle") {
      ctx.beginPath();
      ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = fillStyle;
      ctx.fill();
    } else if (ball.shape === "square") {
      ctx.fillStyle = fillStyle;
      ctx.fillRect(-ball.radius, -ball.radius, ball.radius * 2, ball.radius * 2);
    } else if (ball.shape === "triangle") {
      ctx.beginPath();
      ctx.moveTo(0, -ball.radius);
      ctx.lineTo(ball.radius, ball.radius);
      ctx.lineTo(-ball.radius, ball.radius);
      ctx.closePath();
      ctx.fillStyle = fillStyle;
      ctx.fill();
    } else if (ball.shape === "pentagon") {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        const x = ball.radius * Math.cos(angle);
        const y = ball.radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = fillStyle;
      ctx.fill();
    }

    // Apply tint overlay for rainbow balls
    if (ball.color === "rainbow" && ball.rainbowTint && ball.tintStrength) {
      // Parse the tint color and apply with opacity based on strength
      ctx.fillStyle = ball.rainbowTint;
      ctx.globalAlpha = ball.tintStrength * 0.4; // Max 40% opacity
      
      if (ball.sides && ball.sides >= 3) {
        ctx.beginPath();
        for (let i = 0; i < ball.sides; i++) {
          const angle = (i * 2 * Math.PI) / ball.sides - Math.PI / 2;
          const x = ball.radius * Math.cos(angle);
          const y = ball.radius * Math.sin(angle);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      } else if (ball.shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (ball.shape === "square") {
        ctx.fillRect(-ball.radius, -ball.radius, ball.radius * 2, ball.radius * 2);
      } else if (ball.shape === "triangle") {
        ctx.beginPath();
        ctx.moveTo(0, -ball.radius);
        ctx.lineTo(ball.radius, ball.radius);
        ctx.lineTo(-ball.radius, ball.radius);
        ctx.closePath();
        ctx.fill();
      } else if (ball.shape === "pentagon") {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          const x = ball.radius * Math.cos(angle);
          const y = ball.radius * Math.sin(angle);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      }
      
      ctx.globalAlpha = 1.0; // Reset alpha
    }

    // Add glow effect (skip for rainbow to keep gradient clean)
    if (!ball.customShape && ball.color !== "rainbow") {
      const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, ball.radius * 1.5);
      glowGradient.addColorStop(0, ball.color);
      glowGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glowGradient;
      if (ball.shape === "circle" || (ball.sides && ball.sides >= 3)) {
        ctx.beginPath();
        ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw sword if this ball has one
    if (ball.hasSword && ball.swordAngle !== undefined) {
      const swordLength = ball.radius * 2.5;
      const swordWidth = ball.radius * 0.3;
      const swordDistance = ball.radius * 1.2;
      
      ctx.save();
      ctx.rotate(ball.swordAngle);
      
      // Sword blade position
      const bladeX = swordDistance;
      const bladeY = 0;
      
      // Draw sword blade
      ctx.fillStyle = "#C0C0C0"; // Silver
      ctx.beginPath();
      ctx.moveTo(bladeX, bladeY - swordWidth / 2);
      ctx.lineTo(bladeX + swordLength, bladeY);
      ctx.lineTo(bladeX, bladeY + swordWidth / 2);
      ctx.closePath();
      ctx.fill();
      
      // Draw sword hilt
      ctx.fillStyle = "#8B4513"; // Brown
      ctx.fillRect(bladeX - swordWidth, bladeY - swordWidth * 1.5, swordWidth, swordWidth * 3);
      
      // Draw sword crossguard
      ctx.fillStyle = "#FFD700"; // Gold
      ctx.fillRect(bladeX - swordWidth * 0.5, bladeY - swordWidth * 2, swordWidth * 3, swordWidth * 0.5);
      
      ctx.restore();
    }

    ctx.restore();
  };

  const mixColors = (color1: string, color2: string, tint1?: string, strength1?: number, tint2?: string, strength2?: number): { color: string, tint?: string, strength?: number } => {
    // If both are rainbow, merge their tints
    if (color1 === "rainbow" && color2 === "rainbow") {
      if (tint1 && tint2) {
        // Mix the two tints
        const r1 = parseInt(tint1.slice(1, 3), 16);
        const g1 = parseInt(tint1.slice(3, 5), 16);
        const b1 = parseInt(tint1.slice(5, 7), 16);
        
        const r2 = parseInt(tint2.slice(1, 3), 16);
        const g2 = parseInt(tint2.slice(3, 5), 16);
        const b2 = parseInt(tint2.slice(5, 7), 16);
        
        const r = Math.round((r1 + r2) / 2);
        const g = Math.round((g1 + g2) / 2);
        const b = Math.round((b1 + b2) / 2);
        
        const newTint = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        const newStrength = Math.min(((strength1 || 0) + (strength2 || 0)) / 2 + 0.1, 1);
        return { color: "rainbow", tint: newTint, strength: newStrength };
      } else if (tint1) {
        return { color: "rainbow", tint: tint1, strength: Math.min((strength1 || 0) + 0.05, 1) };
      } else if (tint2) {
        return { color: "rainbow", tint: tint2, strength: Math.min((strength2 || 0) + 0.05, 1) };
      }
      return { color: "rainbow" };
    }
    
    // If one is rainbow, apply tint from the other color
    if (color1 === "rainbow") {
      const newStrength = Math.min((strength1 || 0) + 0.15, 1);
      return { color: "rainbow", tint: color2, strength: newStrength };
    }
    if (color2 === "rainbow") {
      const newStrength = Math.min((strength2 || 0) + 0.15, 1);
      return { color: "rainbow", tint: color1, strength: newStrength };
    }
    
    // Parse hex colors for regular mixing
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);
    
    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);
    
    // Average the colors
    const r = Math.round((r1 + r2) / 2);
    const g = Math.round((g1 + g2) / 2);
    const b = Math.round((b1 + b2) / 2);
    
    return { color: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}` };
  };

  const checkBallCollision = (ball1: Ball, ball2: Ball, shouldMerge: boolean): boolean => {
    const dx = ball2.x - ball1.x;
    const dy = ball2.y - ball1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = ball1.radius + ball2.radius;

    if (distance < minDistance) {
      if (shouldMerge) {
        // Merge balls - return true to signal removal needed
        return true;
      } else {
        // Collision detected - resolve it
        const angle = Math.atan2(dy, dx);
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);

        // Rotate velocities
        const vx1 = ball1.vx * cos + ball1.vy * sin;
        const vy1 = ball1.vy * cos - ball1.vx * sin;
        const vx2 = ball2.vx * cos + ball2.vy * sin;
        const vy2 = ball2.vy * cos - ball2.vx * sin;

        // Swap velocities
        const temp = vx1;
        const newVx1 = vx2;
        const newVx2 = temp;

        // Rotate back
        ball1.vx = newVx1 * cos - vy1 * sin;
        ball1.vy = vy1 * cos + newVx1 * sin;
        ball2.vx = newVx2 * cos - vy2 * sin;
        ball2.vy = vy2 * cos + newVx2 * sin;

        // Separate balls
        const overlap = minDistance - distance;
        const separateX = (overlap / 2) * cos;
        const separateY = (overlap / 2) * sin;
        ball1.x -= separateX;
        ball1.y -= separateY;
        ball2.x += separateX;
        ball2.y += separateY;
      }
    }
    return false;
  };

  const handleContainerCollision = (
    ball: Ball,
    canvas: HTMLCanvasElement,
    shouldTeleport: boolean
  ): boolean => {
    let bounced = false;
    const scaledWidth = canvas.width * containerSizeRef.current;
    const scaledHeight = canvas.height * containerSizeRef.current;
    const offsetX = (canvas.width - scaledWidth) / 2;
    const offsetY = (canvas.height - scaledHeight) / 2;

    // Handle dynamic polygon container
    if (containerAddSidesOnBounce && containerSidesRef.current >= 3) {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = (Math.min(canvas.width, canvas.height) / 2 - 50) * containerSizeRef.current;

      // Generate vertices for the polygon
      const vertices = [];
      for (let i = 0; i < containerSidesRef.current; i++) {
        const angle = (i * 2 * Math.PI) / containerSidesRef.current - Math.PI / 2;
        vertices.push({
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle)
        });
      }

      // Check collision with each edge
      for (let i = 0; i < containerSidesRef.current; i++) {
        const p1 = vertices[i];
        const p2 = vertices[(i + 1) % containerSidesRef.current];
        const edgeX = p2.x - p1.x;
        const edgeY = p2.y - p1.y;
        const length = Math.sqrt(edgeX * edgeX + edgeY * edgeY);
        const normalX = -edgeY / length;
        const normalY = edgeX / length;

        const toBallX = ball.x - p1.x;
        const toBallY = ball.y - p1.y;
        const distance = toBallX * normalX + toBallY * normalY;

        if (distance < ball.radius) {
          const projection = (toBallX * edgeX + toBallY * edgeY) / (length * length);
          
          if (projection >= 0 && projection <= 1) {
            if (shouldTeleport) {
              // Calculate bounce velocity
              const dotProduct = ball.vx * normalX + ball.vy * normalY;
              const newVx = (ball.vx - 2 * dotProduct * normalX) * elasticity;
              const newVy = (ball.vy - 2 * dotProduct * normalY) * elasticity;
              
              // Teleport to center with reflected velocity
              ball.x = centerX;
              ball.y = centerY;
              ball.vx = newVx;
              ball.vy = newVy;
            } else {
              // Normal bounce
              ball.x += normalX * (ball.radius - distance);
              ball.y += normalY * (ball.radius - distance);

              const dotProduct = ball.vx * normalX + ball.vy * normalY;
              ball.vx = (ball.vx - 2 * dotProduct * normalX) * elasticity;
              ball.vy = (ball.vy - 2 * dotProduct * normalY) * elasticity;
            }
            bounced = true;
            break;
          }
        }
      }

      return bounced;
    }

    if (containerShape === "circle") {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = (Math.min(canvas.width, canvas.height) / 2 - 2) * containerSizeRef.current;

      const dx = ball.x - centerX;
      const dy = ball.y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance + ball.radius > radius) {
        if (shouldTeleport) {
          // Calculate bounce velocity
          const angle = Math.atan2(dy, dx);
          const normalX = Math.cos(angle);
          const normalY = Math.sin(angle);
          const dotProduct = ball.vx * normalX + ball.vy * normalY;
          
          // Reflect velocity
          const newVx = (ball.vx - 2 * dotProduct * normalX) * elasticity;
          const newVy = (ball.vy - 2 * dotProduct * normalY) * elasticity;
          
          // Teleport to center with reflected velocity
          ball.x = centerX;
          ball.y = centerY;
          ball.vx = newVx;
          ball.vy = newVy;
        } else {
          // Normal bounce
          const angle = Math.atan2(dy, dx);
          ball.x = centerX + (radius - ball.radius) * Math.cos(angle);
          ball.y = centerY + (radius - ball.radius) * Math.sin(angle);

          const normalX = Math.cos(angle);
          const normalY = Math.sin(angle);
          const dotProduct = ball.vx * normalX + ball.vy * normalY;

          ball.vx = (ball.vx - 2 * dotProduct * normalX) * elasticity;
          ball.vy = (ball.vy - 2 * dotProduct * normalY) * elasticity;
        }
        bounced = true;
      }
    } else if (containerShape === "triangle") {
      const centerX = canvas.width / 2;
      const topY = 50 + offsetY;
      const bottomY = canvas.height - 50 - offsetY;
      const leftX = 50 + offsetX;
      const rightX = canvas.width - 50 - offsetX;

      // Triangle vertices
      const v1 = { x: centerX, y: topY };
      const v2 = { x: leftX, y: bottomY };
      const v3 = { x: rightX, y: bottomY };

      // Check collision with each edge
      const edges = [
        { p1: v1, p2: v2 }, // left edge
        { p1: v2, p2: v3 }, // bottom edge
        { p1: v3, p2: v1 }, // right edge
      ];

      edges.forEach((edge) => {
        const { p1, p2 } = edge;
        const edgeX = p2.x - p1.x;
        const edgeY = p2.y - p1.y;
        const length = Math.sqrt(edgeX * edgeX + edgeY * edgeY);
        const normalX = -edgeY / length;
        const normalY = edgeX / length;

        const toBallX = ball.x - p1.x;
        const toBallY = ball.y - p1.y;
          const distance = toBallX * normalX + toBallY * normalY;

          if (distance < ball.radius) {
            const projection = (toBallX * edgeX + toBallY * edgeY) / (length * length);
            
            if (projection >= 0 && projection <= 1) {
              if (shouldTeleport) {
                // Calculate bounce velocity
                const dotProduct = ball.vx * normalX + ball.vy * normalY;
                const newVx = (ball.vx - 2 * dotProduct * normalX) * elasticity;
                const newVy = (ball.vy - 2 * dotProduct * normalY) * elasticity;
                
                // Teleport to center with reflected velocity
                ball.x = centerX;
                ball.y = (topY + bottomY) / 2;
                ball.vx = newVx;
                ball.vy = newVy;
              } else {
                // Normal bounce
                ball.x += normalX * (ball.radius - distance);
                ball.y += normalY * (ball.radius - distance);

                const dotProduct = ball.vx * normalX + ball.vy * normalY;
                ball.vx = (ball.vx - 2 * dotProduct * normalX) * elasticity;
                ball.vy = (ball.vy - 2 * dotProduct * normalY) * elasticity;
              }
              bounced = true;
            }
          }
      });
    } else if (containerShape === "pentagon") {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = (Math.min(canvas.width, canvas.height) / 2 - 50) * containerSizeRef.current;

      // Pentagon vertices
      const vertices = [];
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        vertices.push({
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle)
        });
      }

      // Check collision with each edge
      for (let i = 0; i < 5; i++) {
        const p1 = vertices[i];
        const p2 = vertices[(i + 1) % 5];
        const edgeX = p2.x - p1.x;
        const edgeY = p2.y - p1.y;
        const length = Math.sqrt(edgeX * edgeX + edgeY * edgeY);
        const normalX = -edgeY / length;
        const normalY = edgeX / length;

        const toBallX = ball.x - p1.x;
        const toBallY = ball.y - p1.y;
        const distance = toBallX * normalX + toBallY * normalY;

          if (distance < ball.radius) {
            const projection = (toBallX * edgeX + toBallY * edgeY) / (length * length);
            
            if (projection >= 0 && projection <= 1) {
              if (shouldTeleport) {
                // Calculate bounce velocity
                const dotProduct = ball.vx * normalX + ball.vy * normalY;
                const newVx = (ball.vx - 2 * dotProduct * normalX) * elasticity;
                const newVy = (ball.vy - 2 * dotProduct * normalY) * elasticity;
                
                // Teleport to center with reflected velocity
                ball.x = centerX;
                ball.y = centerY;
                ball.vx = newVx;
                ball.vy = newVy;
              } else {
                // Normal bounce
                ball.x += normalX * (ball.radius - distance);
                ball.y += normalY * (ball.radius - distance);

                const dotProduct = ball.vx * normalX + ball.vy * normalY;
                ball.vx = (ball.vx - 2 * dotProduct * normalX) * elasticity;
                ball.vy = (ball.vy - 2 * dotProduct * normalY) * elasticity;
              }
              bounced = true;
            }
          }
      }
    } else {
      // Square container
      if (ball.x - ball.radius < offsetX) {
        if (shouldTeleport) {
          ball.vx *= -elasticity;
          ball.x = canvas.width / 2;
          ball.y = canvas.height / 2;
        } else {
          ball.x = offsetX + ball.radius;
          ball.vx *= -elasticity;
        }
        bounced = true;
      } else if (ball.x + ball.radius > scaledWidth + offsetX) {
        if (shouldTeleport) {
          ball.vx *= -elasticity;
          ball.x = canvas.width / 2;
          ball.y = canvas.height / 2;
        } else {
          ball.x = scaledWidth + offsetX - ball.radius;
          ball.vx *= -elasticity;
        }
        bounced = true;
      }

      if (ball.y - ball.radius < offsetY) {
        if (shouldTeleport) {
          ball.vy *= -elasticity;
          ball.x = canvas.width / 2;
          ball.y = canvas.height / 2;
        } else {
          ball.y = offsetY + ball.radius;
          ball.vy *= -elasticity;
        }
        bounced = true;
      } else if (ball.y + ball.radius > scaledHeight + offsetY) {
        if (shouldTeleport) {
          ball.vy *= -elasticity;
          ball.x = canvas.width / 2;
          ball.y = canvas.height / 2;
        } else {
          ball.y = scaledHeight + offsetY - ball.radius;
          ball.vy *= -elasticity;
        }
        bounced = true;
      }
    }

    return bounced;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        initializeBalls(canvas);
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const animate = () => {
      // When trails are enabled, fully clear canvas (we redraw all trail points each frame)
      // When trails are disabled, use semi-transparent clear to create motion blur
      if (trailsEnabled) {
        ctx.fillStyle = "rgb(17, 24, 39)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = "rgba(17, 24, 39, 0.3)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Skip physics updates if paused, but keep drawing
      if (!isPaused) {
        // Update lava height
        if (lavaRise) {
          lavaHeightRef.current += 0.5;
          if (lavaHeightRef.current > canvas.height) {
            lavaHeightRef.current = 0;
          }
        } else {
          lavaHeightRef.current = 0;
        }

        // Update balls

      ballsRef.current.forEach((ball, index) => {
        // Update sword angle if ball has sword
        if (ball.hasSword && ball.swordAngle !== undefined) {
          ball.swordAngle += 0.1; // Rotate sword
        }
        
        // Apply gravity and update position
        ball.vy += gravity;
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Record trail position if trails are enabled
        if (trailsEnabled) {
          if (!ball.trail) {
            ball.trail = [];
          }
          ball.trail.push({ x: ball.x, y: ball.y });
          // For permanent trails, keep all points (limit to 5000 for memory safety)
          if (ball.trail.length > 5000) {
            ball.trail.shift();
          }
        } else if (ball.trail) {
          // Clear trail if trails are disabled
          ball.trail = [];
        }

        // Check if ball touches lava
        if (lavaRise && ball.y + ball.radius >= canvas.height - lavaHeightRef.current) {
          // Play pop sound when ball disappears
          playPopSound();
          
          // Respawn ball at top with same properties
          ball.x = Math.random() * (canvas.width - ballSize * 2) + ballSize;
          ball.y = ballSize;
          ball.vx = (Math.random() - 0.5) * 8;
          ball.vy = (Math.random() - 0.5) * 8;
          // Keep all other properties (color, shape, sides, customShape, etc.)
          return;
        }

        // Handle container collision
        const bounced = handleContainerCollision(ball, canvas, containerShrink);
        
        // Play bounce sound when ball bounces (but not if it's stuck/resting)
        if (bounced) {
          // Check if ball has significant velocity (not stuck on ground)
          const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
          if (speed > 0.5) {
            playBounceSound();
          }
        }
        
        // Split on bounce if enabled
        if (bounced && splitOnBounce && ball.radius > 5) {
          // Calculate new radius (divide area by 2, so radius = original / sqrt(2))
          const newRadius = ball.radius / Math.sqrt(2);
          
          // Remove the original ball
          ballsRef.current.splice(index, 1);
          
          // Create two new balls with slightly different velocities
          const angle = Math.random() * Math.PI * 2;
          const splitSpeed = 2;
          
          for (let i = 0; i < 2; i++) {
            const angleOffset = i === 0 ? angle : angle + Math.PI;
            ballsRef.current.push({
              x: ball.x + Math.cos(angleOffset) * newRadius,
              y: ball.y + Math.sin(angleOffset) * newRadius,
              vx: ball.vx + Math.cos(angleOffset) * splitSpeed,
              vy: ball.vy + Math.sin(angleOffset) * splitSpeed,
              radius: newRadius,
              color: ball.color,
              shape: ball.shape,
              sides: ball.sides,
              customShape: ball.customShape,
              hasSword: ball.hasSword,
              swordAngle: ball.swordAngle,
              rainbowTint: ball.rainbowTint,
              tintStrength: ball.tintStrength,
            });
          }
          return; // Skip other bounce effects for this ball
        }
        
        // Grow on bounce if enabled
        if (bounced && growOnBounce) {
          ball.radius = ball.radius * 1.05;
        }
        
        // Add sides on bounce if enabled
        if (bounced && addSidesOnBounce) {
          if (!ball.sides) {
            ball.sides = 3; // Start at triangle
          } else {
            ball.sides += 1; // Add one side
          }
        }
        
        // Add sides to container on bounce if enabled
        if (bounced && containerAddSidesOnBounce) {
          containerSidesRef.current += 1;
        }
        
        // Shrink container on bounce if enabled
        if (bounced && containerShrink) {
          containerSizeRef.current = Math.max(containerSizeRef.current * 0.98, 0.1);
        }
        
        // Add ball on bounce if enabled
        if (bounced && addBallOnBounce) {
          const maxColorIndex = mergeBalls ? ballColors.length - 1 : ballColors.length;
          const colorIndex = ballsRef.current.length % (maxColorIndex + 1);
          const color = colorIndex === maxColorIndex && !mergeBalls ? "rainbow" : ballColors[colorIndex % ballColors.length];
          
          ballsRef.current.push({
            x: Math.random() * (canvas.width - ballSize * 2) + ballSize,
            y: Math.random() * (canvas.height - ballSize * 2) + ballSize,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            radius: ballSize,
            color: color,
            shape: ballShape,
            sides: addSidesOnBounce ? 3 : undefined,
          });
        }
      });

        // Check ball-to-ball collisions if enabled
        if (collisionEnabled) {
          const ballsToMerge: Array<{i: number, j: number}> = [];
          const ballsToRemove: number[] = [];
          
          for (let i = 0; i < ballsRef.current.length; i++) {
            for (let j = i + 1; j < ballsRef.current.length; j++) {
              // RPS Mode collision logic
              if (rpsMode) {
                const dx = ballsRef.current[j].x - ballsRef.current[i].x;
                const dy = ballsRef.current[j].y - ballsRef.current[i].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = ballsRef.current[i].radius + ballsRef.current[j].radius;
                
                if (distance < minDistance) {
                  // Each ball picks 1, 2, or 3
                  const ball1Choice = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3
                  const ball2Choice = Math.floor(Math.random() * 3) + 1;
                  
                  // Determine winner: 3 beats 2, 2 beats 1, 1 beats 3
                  let loserIndex = -1;
                  if (ball1Choice === ball2Choice) {
                    // Tie - no one loses
                  } else if (
                    (ball1Choice === 3 && ball2Choice === 2) ||
                    (ball1Choice === 2 && ball2Choice === 1) ||
                    (ball1Choice === 1 && ball2Choice === 3)
                  ) {
                    loserIndex = j; // Ball 2 loses
                  } else {
                    loserIndex = i; // Ball 1 loses
                  }
                  
                  if (loserIndex !== -1 && !ballsToRemove.includes(loserIndex)) {
                    ballsToRemove.push(loserIndex);
                    playPopSound();
                  }
                  
                  // Still apply collision physics
                  const angle = Math.atan2(dy, dx);
                  const sin = Math.sin(angle);
                  const cos = Math.cos(angle);
                  
                  const vx1 = ballsRef.current[i].vx * cos + ballsRef.current[i].vy * sin;
                  const vy1 = ballsRef.current[i].vy * cos - ballsRef.current[i].vx * sin;
                  const vx2 = ballsRef.current[j].vx * cos + ballsRef.current[j].vy * sin;
                  const vy2 = ballsRef.current[j].vy * cos - ballsRef.current[j].vx * sin;
                  
                  const temp = vx1;
                  const newVx1 = vx2;
                  const newVx2 = temp;
                  
                  ballsRef.current[i].vx = newVx1 * cos - vy1 * sin;
                  ballsRef.current[i].vy = vy1 * cos + newVx1 * sin;
                  ballsRef.current[j].vx = newVx2 * cos - vy2 * sin;
                  ballsRef.current[j].vy = vy2 * cos + newVx2 * sin;
                  
                  const overlap = minDistance - distance;
                  const separateX = (overlap / 2) * cos;
                  const separateY = (overlap / 2) * sin;
                  ballsRef.current[i].x -= separateX;
                  ballsRef.current[i].y -= separateY;
                  ballsRef.current[j].x += separateX;
                  ballsRef.current[j].y += separateY;
                }
              } else {
                // Normal collision or merge logic
                const shouldMerge = checkBallCollision(ballsRef.current[i], ballsRef.current[j], mergeBalls);
                if (shouldMerge && mergeBalls) {
                  ballsToMerge.push({i, j});
                }
              }
            }
          }
          
          // Remove losing balls in RPS mode (in reverse order)
          if (rpsMode && ballsToRemove.length > 0) {
            ballsToRemove.sort((a, b) => b - a);
            for (const index of ballsToRemove) {
              ballsRef.current.splice(index, 1);
            }
          }
          
          // Process merges (in reverse order to maintain indices)
          if (mergeBalls && ballsToMerge.length > 0) {
            // Sort by larger index first to avoid index shifting issues
            ballsToMerge.sort((a, b) => b.j - a.j);
            
            for (const {i, j} of ballsToMerge) {
              const ball1 = ballsRef.current[i];
              const ball2 = ballsRef.current[j];
              
              // Calculate merged ball properties
              const area1 = Math.PI * ball1.radius * ball1.radius;
              const area2 = Math.PI * ball2.radius * ball2.radius;
              const totalArea = area1 + area2;
              const newRadius = Math.sqrt(totalArea / Math.PI);
              
              // Conservation of momentum
              const mass1 = area1; // Using area as mass
              const mass2 = area2;
              const totalMass = mass1 + mass2;
              const newVx = (ball1.vx * mass1 + ball2.vx * mass2) / totalMass;
              const newVy = (ball1.vy * mass1 + ball2.vy * mass2) / totalMass;
              
              // Mix colors
              const colorResult = mixColors(
                ball1.color, 
                ball2.color, 
                ball1.rainbowTint, 
                ball1.tintStrength, 
                ball2.rainbowTint, 
                ball2.tintStrength
              );
              
              // Check if either ball has a sword
              const hasSword = ball1.hasSword || ball2.hasSword;
              const swordAngle = ball1.hasSword ? ball1.swordAngle : ball2.swordAngle;
              
              // Create merged ball at midpoint
              const mergedBall: Ball = {
                x: (ball1.x + ball2.x) / 2,
                y: (ball1.y + ball2.y) / 2,
                vx: newVx,
                vy: newVy,
                radius: newRadius,
                color: colorResult.color,
                rainbowTint: colorResult.tint,
                tintStrength: colorResult.strength,
                shape: ball1.shape,
                sides: ball1.sides,
                hasSword: hasSword,
                swordAngle: hasSword ? swordAngle : undefined,
              };
              
              // Remove the two balls and add the merged one
              ballsRef.current.splice(j, 1); // Remove higher index first
              ballsRef.current.splice(i, 1);
              ballsRef.current.push(mergedBall);
              
              playPopSound();
            }
          }
        }
        
        // Black hole collision detection
        if (blackHoleMode && ballsRef.current.length > 0) {
          const blackHole = ballsRef.current[0]; // Black hole is always first
          const ballsToRemove: number[] = [];
          
          for (let i = 1; i < ballsRef.current.length; i++) {
            const ball = ballsRef.current[i];
            const dx = ball.x - blackHole.x;
            const dy = ball.y - blackHole.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Check if ball touches black hole
            if (distance < blackHole.radius + ball.radius) {
              ballsToRemove.push(i);
              playPopSound();
            }
          }
          
          // Remove absorbed balls (in reverse order to maintain indices)
          for (let i = ballsToRemove.length - 1; i >= 0; i--) {
            ballsRef.current.splice(ballsToRemove[i], 1);
          }
        }
        
        // Sword collision detection
        const swordBallIndex = ballsRef.current.findIndex(b => b.hasSword);
        if (swordBallIndex !== -1) {
          const swordBall = ballsRef.current[swordBallIndex];
          if (swordBall.swordAngle !== undefined) {
            const ballsToRemove: number[] = [];
            const swordLength = swordBall.radius * 2.5;
            const swordDistance = swordBall.radius * 1.2;
            
            // Calculate sword tip position
            const swordTipX = swordBall.x + Math.cos(swordBall.swordAngle) * (swordDistance + swordLength);
            const swordTipY = swordBall.y + Math.sin(swordBall.swordAngle) * (swordDistance + swordLength);
            
            // Check collision with other balls
            for (let i = 0; i < ballsRef.current.length; i++) {
              if (i === swordBallIndex) continue;
              
              const ball = ballsRef.current[i];
              
              // Check if sword blade intersects with ball
              // Simple check: distance from ball center to sword tip
              const dx = ball.x - swordTipX;
              const dy = ball.y - swordTipY;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              if (distance < ball.radius) {
                ballsToRemove.push(i);
                playPopSound();
              }
            }
            
            // Remove destroyed balls (in reverse order to maintain indices)
            for (let i = ballsToRemove.length - 1; i >= 0; i--) {
              ballsRef.current.splice(ballsToRemove[i], 1);
            }
          }
        }
      }

      // Draw container
      ctx.save();
      
      ctx.strokeStyle = "rgba(6, 182, 212, 0.5)";
      ctx.lineWidth = 2;
      
      const scaledWidth = canvas.width * containerSizeRef.current;
      const scaledHeight = canvas.height * containerSizeRef.current;
      const offsetX = (canvas.width - scaledWidth) / 2;
      const offsetY = (canvas.height - scaledHeight) / 2;
      
      // Draw container based on containerAddSidesOnBounce or original shape
      if (containerAddSidesOnBounce && containerSidesRef.current >= 3) {
        // Draw polygon container with dynamic sides
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = (Math.min(canvas.width, canvas.height) / 2 - 50) * containerSizeRef.current;
        
        ctx.beginPath();
        for (let i = 0; i < containerSidesRef.current; i++) {
          const angle = (i * 2 * Math.PI) / containerSidesRef.current - Math.PI / 2;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      } else if (containerShape === "circle") {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = (Math.min(canvas.width, canvas.height) / 2 - 2) * containerSizeRef.current;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (containerShape === "triangle") {
        const centerX = canvas.width / 2;
        const topY = 50 + offsetY;
        const bottomY = canvas.height - 50 - offsetY;
        const leftX = 50 + offsetX;
        const rightX = canvas.width - 50 - offsetX;

        ctx.beginPath();
        ctx.moveTo(centerX, topY);
        ctx.lineTo(leftX, bottomY);
        ctx.lineTo(rightX, bottomY);
        ctx.closePath();
        ctx.stroke();
      } else if (containerShape === "pentagon") {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = (Math.min(canvas.width, canvas.height) / 2 - 50) * containerSizeRef.current;
        
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      } else {
        ctx.strokeRect(offsetX + 1, offsetY + 1, scaledWidth - 2, scaledHeight - 2);
      }
      
      ctx.restore();

      // Draw lava
      if (lavaRise && lavaHeightRef.current > 0) {
        const gradient = ctx.createLinearGradient(0, canvas.height - lavaHeightRef.current, 0, canvas.height);
        gradient.addColorStop(0, "rgba(255, 69, 0, 0.8)");
        gradient.addColorStop(0.5, "rgba(255, 140, 0, 0.9)");
        gradient.addColorStop(1, "rgba(255, 0, 0, 1)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, canvas.height - lavaHeightRef.current, canvas.width, lavaHeightRef.current);
      }

      // Draw trails (before balls so they appear behind)
      if (trailsEnabled) {
        ballsRef.current.forEach((ball) => {
          drawTrails(ctx, ball);
        });
      }

      // Draw balls
      ballsRef.current.forEach((ball) => {
        drawBall(ctx, ball);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

      return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gravity, elasticity, containerShape, collisionEnabled, growOnBounce, lavaRise, containerShrink, addSidesOnBounce, containerAddSidesOnBounce, addBallOnBounce, ballSize, ballShape, ballColors, blackHoleMode, isPaused, trailsEnabled, trailOpacity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Update ball count
    const currentCount = ballsRef.current.length;
    if (currentCount < ballCount) {
      // Add balls
      for (let i = currentCount; i < ballCount; i++) {
        const maxColorIndex = mergeBalls ? ballColors.length - 1 : ballColors.length;
        const colorIndex = i % (maxColorIndex + 1);
        const color = colorIndex === maxColorIndex && !mergeBalls ? "rainbow" : ballColors[colorIndex % ballColors.length];
        
        ballsRef.current.push({
          x: Math.random() * (canvas.width - ballSize * 2) + ballSize,
          y: Math.random() * (canvas.height - ballSize * 2) + ballSize,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          radius: ballSize,
          color: color,
          shape: ballShape,
          sides: addSidesOnBounce ? 3 : undefined,
        });
      }
    } else if (currentCount > ballCount) {
      // Remove balls
      ballsRef.current = ballsRef.current.slice(0, ballCount);
    }
    
    // Update ball sizes and shapes
    ballsRef.current.forEach((ball) => {
      ball.radius = ballSize;
      ball.shape = ballShape;
      if (!addSidesOnBounce) {
        ball.sides = undefined;
      } else if (!ball.sides) {
        ball.sides = 3;
      }
    });
  }, [ballCount, ballSize, ballShape, addSidesOnBounce]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    initializeBalls(canvas);
  }, [resetTrigger, containerAddSidesOnBounce, blackHoleMode]);

  const handleCanvasClick = (event: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find clicked ball
    for (let i = ballsRef.current.length - 1; i >= 0; i--) {
      const ball = ballsRef.current[i];
      const dx = x - ball.x;
      const dy = y - ball.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= ball.radius) {
        setSelectedBallIndex(i);
        setIsDrawingModalOpen(true);
        break;
      }
    }
  };

  const handleSaveCustomShape = (shapeData: string) => {
    if (selectedBallIndex === null) return;

    const ball = ballsRef.current[selectedBallIndex];
    if (ball) {
      ball.customShape = shapeData;
      
      // Load the image
      const img = new Image();
      img.src = shapeData;
      img.onload = () => {
        customShapeImagesRef.current.set(shapeData, img);
      };
    }
    
    setSelectedBallIndex(null);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('click', handleCanvasClick);
    
    return () => {
      canvas.removeEventListener('click', handleCanvasClick);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-lg border-2 border-primary/30 glow-effect bg-gray-900 cursor-pointer"
      />
      
      <DrawingModal
        isOpen={isDrawingModalOpen}
        onClose={() => {
          setIsDrawingModalOpen(false);
          setSelectedBallIndex(null);
        }}
        onSave={handleSaveCustomShape}
      />
    </>
  );
};
