export type RunDifficulty =
  | "green"
  | "blue"
  | "black"
  | "doubleBlack"
  | "terrainPark";

export interface WipeoutEntry {
  id: string;
  timestamp: string;
  resort?: string;
  run?: string;
  runDifficulty?: RunDifficulty;
  details: string;
}

export interface WipeoutFormData {
  resort?: string;
  run?: string;
  runDifficulty?: RunDifficulty;
  details: string;
}
