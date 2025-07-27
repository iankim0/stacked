import { Workout, AppSettings, WeightUnit, Exercise, ExerciseBlock } from '@/types/workout';

const WORKOUTS_KEY = 'stacked_workouts';
const SETTINGS_KEY = 'stacked_settings';

export const storage = {
  // Workouts
  getWorkouts: (): Workout[] => {
    try {
      const data = localStorage.getItem(WORKOUTS_KEY);
      if (!data) return [];
      
      const workouts = JSON.parse(data);
      // Convert legacy workouts to new format
      return workouts.map((workout: any) => {
        if ('exercises' in workout && !('blocks' in workout)) {
          // Legacy format - convert to blocks
          const blocks: ExerciseBlock[] = workout.exercises.map((exercise: Exercise) => ({
            id: `${exercise.id}_block`,
            type: 'single' as const,
            exercises: [exercise]
          }));
          return {
            ...workout,
            blocks,
            exercises: undefined // Remove old property
          };
        }
        return workout;
      });
    } catch {
      return [];
    }
  },

  saveWorkouts: (workouts: Workout[]): void => {
    localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
  },

  addWorkout: (workout: Workout): void => {
    const workouts = storage.getWorkouts();
    workouts.push(workout);
    storage.saveWorkouts(workouts);
  },

  updateWorkout: (updatedWorkout: Workout): void => {
    const workouts = storage.getWorkouts();
    const index = workouts.findIndex(w => w.id === updatedWorkout.id);
    if (index !== -1) {
      workouts[index] = updatedWorkout;
      storage.saveWorkouts(workouts);
    }
  },

  deleteWorkout: (id: string): void => {
    const workouts = storage.getWorkouts();
    const filtered = workouts.filter(w => w.id !== id);
    storage.saveWorkouts(filtered);
  },

  // Settings
  getSettings: (): AppSettings => {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      return data ? JSON.parse(data) : { weightUnit: 'kg' as WeightUnit };
    } catch {
      return { weightUnit: 'kg' as WeightUnit };
    }
  },

  saveSettings: (settings: AppSettings): void => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
};