import { supabase } from '@/integrations/supabase/client';
import { Workout, AppSettings, WeightUnit, Exercise, ExerciseBlock } from '@/types/workout';

export const supabaseStorage = {
  // Workouts
  getWorkouts: async (): Promise<Workout[]> => {
    try {
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .select(`
          id,
          name,
          date,
          notes,
          created_at,
          updated_at,
          exercise_blocks (
            id,
            type,
            order_index,
            exercises (
              id,
              name,
              weight_unit,
              order_index,
              sets (
                id,
                reps,
                weight,
                order_index
              )
            )
          )
        `)
        .order('date', { ascending: false })
        .order('order_index', { foreignTable: 'exercise_blocks' })
        .order('order_index', { foreignTable: 'exercise_blocks.exercises' })
        .order('order_index', { foreignTable: 'exercise_blocks.exercises.sets' });

      if (workoutError) {
        console.error('Error fetching workouts:', workoutError);
        return [];
      }

      // Transform the data to match our frontend types
      return workoutData?.map((workout: any) => ({
        id: workout.id,
        name: workout.name,
        date: workout.date,
        notes: workout.notes,
        createdAt: workout.created_at,
        updatedAt: workout.updated_at,
        blocks: workout.exercise_blocks.map((block: any) => ({
          id: block.id,
          type: block.type,
          exercises: block.exercises.map((exercise: any) => ({
            id: exercise.id,
            name: exercise.name,
            weightUnit: exercise.weight_unit,
            sets: exercise.sets.map((set: any) => ({
              id: set.id,
              reps: set.reps,
              weight: set.weight
            }))
          }))
        }))
      })) || [];
    } catch (error) {
      console.error('Error in getWorkouts:', error);
      return [];
    }
  },

  addWorkout: async (workout: Workout): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Insert workout
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          id: workout.id,
          name: workout.name,
          date: workout.date,
          notes: workout.notes,
          user_id: user.id
        })
        .select()
        .single();

      if (workoutError) throw workoutError;

      // Insert exercise blocks
      for (let blockIndex = 0; blockIndex < workout.blocks.length; blockIndex++) {
        const block = workout.blocks[blockIndex];
        
        const { data: blockData, error: blockError } = await supabase
          .from('exercise_blocks')
          .insert({
            id: block.id,
            workout_id: workout.id,
            type: block.type,
            order_index: blockIndex
          })
          .select()
          .single();

        if (blockError) throw blockError;

        // Insert exercises
        for (let exerciseIndex = 0; exerciseIndex < block.exercises.length; exerciseIndex++) {
          const exercise = block.exercises[exerciseIndex];
          
          const { data: exerciseData, error: exerciseError } = await supabase
            .from('exercises')
            .insert({
              id: exercise.id,
              exercise_block_id: block.id,
              name: exercise.name,
              weight_unit: exercise.weightUnit,
              order_index: exerciseIndex
            })
            .select()
            .single();

          if (exerciseError) throw exerciseError;

          // Insert sets
          for (let setIndex = 0; setIndex < exercise.sets.length; setIndex++) {
            const set = exercise.sets[setIndex];
            
            const { error: setError } = await supabase
              .from('sets')
              .insert({
                id: set.id,
                exercise_id: exercise.id,
                reps: set.reps,
                weight: set.weight,
                order_index: setIndex
              });

            if (setError) throw setError;
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Error adding workout:', error);
      return false;
    }
  },

  updateWorkout: async (workout: Workout): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Update workout
      const { error: workoutError } = await supabase
        .from('workouts')
        .update({
          name: workout.name,
          date: workout.date,
          notes: workout.notes
        })
        .eq('id', workout.id)
        .eq('user_id', user.id);

      if (workoutError) throw workoutError;

      // Delete existing blocks, exercises, and sets
      const { error: deleteError } = await supabase
        .from('exercise_blocks')
        .delete()
        .eq('workout_id', workout.id);

      if (deleteError) throw deleteError;

      // Re-insert all blocks, exercises, and sets
      for (let blockIndex = 0; blockIndex < workout.blocks.length; blockIndex++) {
        const block = workout.blocks[blockIndex];
        
        const { error: blockError } = await supabase
          .from('exercise_blocks')
          .insert({
            id: block.id,
            workout_id: workout.id,
            type: block.type,
            order_index: blockIndex
          });

        if (blockError) throw blockError;

        for (let exerciseIndex = 0; exerciseIndex < block.exercises.length; exerciseIndex++) {
          const exercise = block.exercises[exerciseIndex];
          
          const { error: exerciseError } = await supabase
            .from('exercises')
            .insert({
              id: exercise.id,
              exercise_block_id: block.id,
              name: exercise.name,
              weight_unit: exercise.weightUnit,
              order_index: exerciseIndex
            });

          if (exerciseError) throw exerciseError;

          for (let setIndex = 0; setIndex < exercise.sets.length; setIndex++) {
            const set = exercise.sets[setIndex];
            
            const { error: setError } = await supabase
              .from('sets')
              .insert({
                id: set.id,
                exercise_id: exercise.id,
                reps: set.reps,
                weight: set.weight,
                order_index: setIndex
              });

            if (setError) throw setError;
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Error updating workout:', error);
      return false;
    }
  },

  deleteWorkout: async (id: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting workout:', error);
      return false;
    }
  },

  // Settings
  getSettings: async (): Promise<AppSettings> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { weightUnit: 'kg' as WeightUnit };

      const { data, error } = await supabase
        .from('profiles')
        .select('weight_unit')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching settings:', error);
        return { weightUnit: 'kg' as WeightUnit };
      }

      // If no profile exists, create one
      if (!data) {
        await supabase
          .from('profiles')
          .insert({ user_id: user.id, weight_unit: 'kg' });
        return { weightUnit: 'kg' as WeightUnit };
      }

      return { weightUnit: data.weight_unit as WeightUnit };
    } catch (error) {
      console.error('Error in getSettings:', error);
      return { weightUnit: 'kg' as WeightUnit };
    }
  },

  saveSettings: async (settings: AppSettings): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({ weight_unit: settings.weightUnit })
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  }
};