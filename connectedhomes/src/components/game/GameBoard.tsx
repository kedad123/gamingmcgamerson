import React, { useState, useCallback, useEffect, useRef } from 'react';
import { House, Position } from '@/types/game';
import { HouseCube } from './HouseCube';

const CUBE_COLORS = [
  'hsl(var(--cube-red))',
  'hsl(var(--cube-orange))',
  'hsl(var(--cube-yellow))',
  'hsl(var(--cube-green))',
  'hsl(var(--cube-blue))',
  'hsl(var(--cube-purple))',
  'hsl(var(--cube-pink))',
  'hsl(var(--cube-teal))',
];

const PERSON_COLORS = [
  'hsl(var(--foreground))',
  'hsl(var(--primary))',
  'hsl(var(--cube-red))',
  'hsl(var(--cube-blue))',
  'hsl(var(--cube-green))',
  'hsl(var(--cube-purple))',
  'hsl(var(--cube-orange))',
  'hsl(var(--cube-teal))',
];

const ACTIVITIES = ['idle', 'waving', 'sitting', 'jumping'] as const;
const GRID_COLS = 10;
const GRID_ROWS = 10;
const CELL_SIZE = 90;


const getRandomEmptyPosition = (houses: House[]): Position | null => {
  const occupied = new Set(houses.map(h => `${h.gridPosition.x},${h.gridPosition.y}`));
  const empty: Position[] = [];
  
  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLS; x++) {
      if (!occupied.has(`${x},${y}`)) {
        empty.push({ x, y });
      }
    }
  }
  
  if (empty.length === 0) return null;
  return empty[Math.floor(Math.random() * empty.length)];
};

const createHouse = (id: number, position: Position): House => {
  const ownerId = `person-${id}`;
  return {
    id: `house-${id}`,
    gridPosition: position,
    color: CUBE_COLORS[id % CUBE_COLORS.length],
    activity: ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)],
    ownerId,
    occupants: [ownerId], // Owner starts at home
  };
};

export const GameBoard: React.FC = () => {
  const [houses, setHouses] = useState<House[]>(() => {
    return [
      createHouse(0, { x: 1, y: 1 }),
      createHouse(1, { x: 4, y: 2 }),
    ];
  });
  const [nextId, setNextId] = useState(2);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [dragPos, setDragPos] = useState<Position>({ x: 0, y: 0 });
  const [isNight, setIsNight] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  
  // Day/night cycle every 24 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setIsNight(prev => !prev);
    }, 24 * 60 * 1000); // 24 minutes in milliseconds
    
    return () => clearInterval(interval);
  }, []);
  
  // Spawn new house every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setHouses(prev => {
        const newPos = getRandomEmptyPosition(prev);
        if (!newPos) return prev;
        
        const newHouse = createHouse(nextId, newPos);
        setNextId(n => n + 1);
        return [...prev, newHouse];
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, [nextId]);
  
  // Helper to get all adjacent houses
  const getAdjacentHouses = useCallback((house: House, allHouses: House[]): House[] => {
    const { x, y } = house.gridPosition;
    return allHouses.filter(h => {
      if (h.id === house.id) return false;
      const dx = Math.abs(h.gridPosition.x - x);
      const dy = Math.abs(h.gridPosition.y - y);
      return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
    });
  }, []);
  
  // Visiting logic every 10 seconds - only to connected (adjacent) houses
  useEffect(() => {
    const interval = setInterval(() => {
      setHouses(prev => {
        const newHouses = [...prev];
        
        // For each person, 50% chance to visit or leave
        prev.forEach(house => {
          const ownerId = house.ownerId;
          const ownerHouse = newHouses.find(h => h.id === house.id)!;
          const isOwnerHome = ownerHouse.occupants.includes(ownerId);
          
          if (Math.random() < 0.5) {
            if (isOwnerHome) {
              // Try to visit an adjacent house that is occupied
              const adjacentHouses = getAdjacentHouses(ownerHouse, newHouses);
              const occupiedAdjacent = adjacentHouses.filter(h => h.occupants.length > 0);
              
              if (occupiedAdjacent.length > 0) {
                const targetHouse = occupiedAdjacent[Math.floor(Math.random() * occupiedAdjacent.length)];
                
                // Remove from home
                const homeIdx = newHouses.findIndex(h => h.id === house.id);
                newHouses[homeIdx] = {
                  ...newHouses[homeIdx],
                  occupants: newHouses[homeIdx].occupants.filter(id => id !== ownerId)
                };
                
                // Add to target
                const targetIdx = newHouses.findIndex(h => h.id === targetHouse.id);
                newHouses[targetIdx] = {
                  ...newHouses[targetIdx],
                  occupants: [...newHouses[targetIdx].occupants, ownerId]
                };
              }
            } else {
              // Owner is visiting elsewhere, 50% chance to return home
              // Find where they are
              const visitingHouse = newHouses.find(h => 
                h.id !== house.id && h.occupants.includes(ownerId)
              );
              
              if (visitingHouse) {
                // Can only return if the visiting house is still adjacent to home
                const homeHouse = newHouses.find(h => h.id === house.id)!;
                const adjacentToHome = getAdjacentHouses(homeHouse, newHouses);
                const canReturn = adjacentToHome.some(h => h.id === visitingHouse.id);
                
                if (canReturn) {
                  // Remove from visiting house
                  const visitIdx = newHouses.findIndex(h => h.id === visitingHouse.id);
                  newHouses[visitIdx] = {
                    ...newHouses[visitIdx],
                    occupants: newHouses[visitIdx].occupants.filter(id => id !== ownerId)
                  };
                  
                  // Return home
                  const homeIdx = newHouses.findIndex(h => h.id === house.id);
                  newHouses[homeIdx] = {
                    ...newHouses[homeIdx],
                    occupants: [...newHouses[homeIdx].occupants, ownerId]
                  };
                }
              }
            }
          }
        });
        
        return newHouses;
      });
    }, 10000);
    
    return () => clearInterval(interval);
  }, [getAdjacentHouses]);
  
  // Get person color by their ID
  const getPersonColor = useCallback((personId: string): string => {
    const num = parseInt(personId.replace('person-', ''));
    return PERSON_COLORS[num % PERSON_COLORS.length];
  }, []);
  
  const getNeighbor = useCallback((house: House): { direction: 'left' | 'right' | 'top' | 'bottom', neighbor: House } | null => {
    const { x, y } = house.gridPosition;
    
    for (const other of houses) {
      if (other.id === house.id) continue;
      const dx = other.gridPosition.x - x;
      const dy = other.gridPosition.y - y;
      
      if (dx === 1 && dy === 0) return { direction: 'right', neighbor: other };
      if (dx === -1 && dy === 0) return { direction: 'left', neighbor: other };
      if (dx === 0 && dy === 1) return { direction: 'bottom', neighbor: other };
      if (dx === 0 && dy === -1) return { direction: 'top', neighbor: other };
    }
    
    return null;
  }, [houses]);
  
  const handleDragStart = useCallback((houseId: string, e: React.MouseEvent) => {
    e.preventDefault();
    const house = houses.find(h => h.id === houseId);
    if (!house || !boardRef.current) return;
    
    const rect = boardRef.current.getBoundingClientRect();
    const houseX = house.gridPosition.x * CELL_SIZE;
    const houseY = house.gridPosition.y * CELL_SIZE;
    
    setDraggingId(houseId);
    setDragOffset({
      x: e.clientX - rect.left - houseX,
      y: e.clientY - rect.top - houseY,
    });
    setDragPos({ x: houseX, y: houseY });
  }, [houses]);
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggingId || !boardRef.current) return;
    
    const rect = boardRef.current.getBoundingClientRect();
    setDragPos({
      x: e.clientX - rect.left - dragOffset.x,
      y: e.clientY - rect.top - dragOffset.y,
    });
  }, [draggingId, dragOffset]);
  
  const handleMouseUp = useCallback(() => {
    if (!draggingId) return;
    
    const newGridX = Math.round(dragPos.x / CELL_SIZE);
    const newGridY = Math.round(dragPos.y / CELL_SIZE);
    
    const clampedX = Math.max(0, Math.min(GRID_COLS - 1, newGridX));
    const clampedY = Math.max(0, Math.min(GRID_ROWS - 1, newGridY));
    
    const isOccupied = houses.some(
      h => h.id !== draggingId && h.gridPosition.x === clampedX && h.gridPosition.y === clampedY
    );
    
    if (!isOccupied) {
      setHouses(prev =>
        prev.map(h =>
          h.id === draggingId
            ? { ...h, gridPosition: { x: clampedX, y: clampedY } }
            : h
        )
      );
    }
    
    setDraggingId(null);
  }, [draggingId, dragPos, houses]);
  
  const boardWidth = GRID_COLS * CELL_SIZE;
  const boardHeight = GRID_ROWS * CELL_SIZE;
  
  return (
    <div
      ref={boardRef}
      className={`relative rounded-3xl shadow-soft overflow-hidden transition-all duration-1000 ${
        isNight 
          ? 'bg-slate-900/80' 
          : 'bg-muted/30'
      }`}
      style={{ width: boardWidth, height: boardHeight }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Night sky overlay with stars */}
      {isNight && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: 0.3 + Math.random() * 0.7,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
          {/* Moon */}
          <div 
            className="absolute w-12 h-12 bg-yellow-100 rounded-full shadow-lg"
            style={{ 
              top: '5%', 
              right: '10%',
              boxShadow: '0 0 20px 5px rgba(255, 255, 200, 0.3)'
            }}
          />
        </div>
      )}
      {/* Grid lines */}
      <svg className="absolute inset-0 pointer-events-none opacity-20" width={boardWidth} height={boardHeight}>
        {Array.from({ length: GRID_COLS + 1 }).map((_, i) => (
          <line
            key={`v-${i}`}
            x1={i * CELL_SIZE}
            y1={0}
            x2={i * CELL_SIZE}
            y2={boardHeight}
            stroke="hsl(var(--foreground))"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}
        {Array.from({ length: GRID_ROWS + 1 }).map((_, i) => (
          <line
            key={`h-${i}`}
            x1={0}
            y1={i * CELL_SIZE}
            x2={boardWidth}
            y2={i * CELL_SIZE}
            stroke="hsl(var(--foreground))"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}
      </svg>
      
      {/* Houses */}
      {houses.map((house) => {
        const isDragging = draggingId === house.id;
        const neighborInfo = getNeighbor(house);
        
        const x = isDragging ? dragPos.x : house.gridPosition.x * CELL_SIZE;
        const y = isDragging ? dragPos.y : house.gridPosition.y * CELL_SIZE;
        
        return (
          <div
            key={house.id}
            className={`absolute transition-all ${isDragging ? 'duration-0' : 'duration-300'}`}
            style={{
              left: x + (CELL_SIZE - 100) / 2,
              top: y + (CELL_SIZE - 100) / 2,
              zIndex: isDragging ? 100 : 1,
            }}
          >
            <HouseCube
              house={house}
              isDragging={isDragging}
              hasNeighbor={neighborInfo?.direction ?? null}
              getPersonColor={getPersonColor}
              onDragStart={(e) => handleDragStart(house.id, e)}
            />
          </div>
        );
      })}
      
      {/* Drop zone indicator when dragging */}
      {draggingId && (
        <div
          className="absolute border-4 border-dashed border-primary/40 rounded-2xl pointer-events-none transition-all duration-150"
          style={{
            left: Math.max(0, Math.min(GRID_COLS - 1, Math.round(dragPos.x / CELL_SIZE))) * CELL_SIZE + 5,
            top: Math.max(0, Math.min(GRID_ROWS - 1, Math.round(dragPos.y / CELL_SIZE))) * CELL_SIZE + 5,
            width: CELL_SIZE - 10,
            height: CELL_SIZE - 10,
          }}
        />
      )}
    </div>
  );
};
