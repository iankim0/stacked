export interface Exercise {
  id: string;
  name: string;
  sets: Set[];
  weightUnit: WeightUnit;
}

export interface Set {
  id: string;
  reps: number;
  weight: number;
}

export interface ExerciseBlock {
  id: string;
  type: 'single' | 'superset';
  exercises: Exercise[];
}

export interface Workout {
  id: string;
  name: string;
  date: string;
  blocks: ExerciseBlock[];
  notes?: string;
}

export type WeightUnit = 'kg' | 'lbs';

export interface AppSettings {
  weightUnit: WeightUnit;
}