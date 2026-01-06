export interface Point {
  x: number;
  y: number;
}

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'wall' | 'sand' | 'water';
}

export interface Course {
  id: number;
  name: string;
  par: number;
  ball: Point;
  hole: Point;
  obstacles: Obstacle[];
  bounds: {
    width: number;
    height: number;
  };
}

export interface GameState {
  currentCourse: number;
  strokes: number;
  totalStrokes: number;
  ballPosition: Point;
  ballVelocity: Point;
  isMoving: boolean;
  isComplete: boolean;
  courseScores: number[];
}
