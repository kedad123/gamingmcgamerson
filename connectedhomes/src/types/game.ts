export interface Position {
  x: number;
  y: number;
}

export interface House {
  id: string;
  gridPosition: Position;
  color: string;
  activity: 'idle' | 'waving' | 'sitting' | 'jumping';
  ownerId: string; // The person who owns this house
  occupants: string[]; // IDs of people currently in this house (includes owner if home)
}
