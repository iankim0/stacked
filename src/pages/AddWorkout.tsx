import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BottomNav } from '@/components/ui/bottom-nav';
import { storage } from '@/lib/storage';
import { Workout, Exercise, Set, WeightUnit } from '@/types/workout';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function AddWorkout() {
  const navigate = useNavigate();
  const { id: workoutId } = useParams();
  const [searchParams] = useSearchParams();
  const isEditing = !!workoutId;

  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg');
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDate, setWorkoutDate] = useState(() => {
    const dateParam = searchParams.get('date');
    return dateParam || format(new Date(), 'yyyy-MM-dd');
  });
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const settings = storage.getSettings();
    setWeightUnit(settings.weightUnit);

    if (isEditing) {
      const workouts = storage.getWorkouts();
      const workout = workouts.find(w => w.id === workoutId);
      if (workout) {
        setWorkoutName(workout.name);
        // Parse date properly to avoid timezone issues
        setWorkoutDate(workout.date.split('T')[0]);
        setExercises(workout.exercises);
        setNotes(workout.notes || '');
      } else {
        navigate('/');
      }
    }
  }, [isEditing, workoutId, navigate]);

  const addExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: '',
      weightUnit: weightUnit,
      sets: [{ id: Date.now().toString(), reps: 0, weight: 0 }]
    };
    setExercises([...exercises, newExercise]);
  };

  const updateExercise = (exerciseId: string, name: string) => {
    setExercises(exercises.map(ex => 
      ex.id === exerciseId ? { ...ex, name } : ex
    ));
  };

  const updateExerciseWeightUnit = (exerciseId: string, weightUnit: WeightUnit) => {
    setExercises(exercises.map(ex => 
      ex.id === exerciseId ? { ...ex, weightUnit } : ex
    ));
  };

  const removeExercise = (exerciseId: string) => {
    setExercises(exercises.filter(ex => ex.id !== exerciseId));
  };

  const addSet = (exerciseId: string) => {
    setExercises(exercises.map(ex => 
      ex.id === exerciseId 
        ? { 
            ...ex, 
            sets: [...ex.sets, { id: Date.now().toString(), reps: 0, weight: 0 }] 
          }
        : ex
    ));
  };

  const updateSet = (exerciseId: string, setId: string, field: 'reps' | 'weight', value: number) => {
    setExercises(exercises.map(ex => 
      ex.id === exerciseId 
        ? {
            ...ex,
            sets: ex.sets.map(set => 
              set.id === setId ? { ...set, [field]: value } : set
            )
          }
        : ex
    ));
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setExercises(exercises.map(ex => 
      ex.id === exerciseId 
        ? { ...ex, sets: ex.sets.filter(set => set.id !== setId) }
        : ex
    ));
  };

  const saveWorkout = () => {
    if (!workoutName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a workout name.",
        variant: "destructive"
      });
      return;
    }

    if (exercises.length === 0) {
      toast({
        title: "Validation Error", 
        description: "Please add at least one exercise.",
        variant: "destructive"
      });
      return;
    }

    const hasEmptyExerciseNames = exercises.some(ex => !ex.name.trim());
    if (hasEmptyExerciseNames) {
      toast({
        title: "Validation Error",
        description: "Please name all exercises.",
        variant: "destructive"
      });
      return;
    }

    const workout: Workout = {
      id: isEditing ? workoutId! : Date.now().toString(),
      name: workoutName.trim(),
      date: workoutDate,
      exercises: exercises.filter(ex => ex.name.trim()),
      notes: notes.trim()
    };

    if (isEditing) {
      storage.updateWorkout(workout);
      toast({
        title: "Workout Updated",
        description: `"${workout.name}" has been updated.`
      });
    } else {
      storage.addWorkout(workout);
      toast({
        title: "Workout Saved",
        description: `"${workout.name}" has been saved.`
      });
    }

    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
                className="p-2"
              >
                <ArrowLeft size={18} />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {isEditing ? 'Edit Workout' : 'Add Workout'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Track your training session
                </p>
              </div>
            </div>
            <Button 
              onClick={saveWorkout}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Save size={16} className="mr-2" />
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-4 space-y-6">
        {/* Basic Info */}
        <Card className="p-4 bg-surface border-border/50">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workout-name" className="text-sm font-medium text-foreground">
                Workout Name
              </Label>
              <Input
                id="workout-name"
                placeholder="e.g., Push Day, Leg Day..."
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                className="bg-background border-border/50 focus:border-primary/50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="workout-date" className="text-sm font-medium text-foreground">
                Date
              </Label>
              <Input
                id="workout-date"
                type="date"
                value={workoutDate}
                onChange={(e) => setWorkoutDate(e.target.value)}
                className="bg-background border-border/50 focus:border-primary/50"
              />
            </div>
          </div>
        </Card>

        {/* Weight Unit Display */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Exercises</h2>
          <Badge variant="secondary" className="text-xs">
            Weights in {weightUnit}
          </Badge>
        </div>

        {/* Exercises */}
        <div className="space-y-4">
          {exercises.map((exercise, exerciseIndex) => (
            <Card key={exercise.id} className="p-4 bg-surface border-border/50">
              <div className="space-y-4">
                {/* Exercise Header */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Input
                        placeholder="Exercise name (e.g., Bench Press)"
                        value={exercise.name}
                        onChange={(e) => updateExercise(exercise.id, e.target.value)}
                        className="bg-background border-border/50 focus:border-primary/50"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExercise(exercise.id)}
                      className="p-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  
                  {/* Weight Unit Selector */}
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-muted-foreground">Weight Unit:</Label>
                    <Select
                      value={exercise.weightUnit || weightUnit}
                      onValueChange={(value: WeightUnit) => updateExerciseWeightUnit(exercise.id, value)}
                    >
                      <SelectTrigger className="w-20 h-8 bg-background border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="lbs">lbs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Sets */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-muted-foreground">Sets</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addSet(exercise.id)}
                      className="text-primary hover:text-primary hover:bg-primary/10"
                    >
                      <Plus size={14} className="mr-1" />
                      Add Set
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {exercise.sets.map((set, setIndex) => (
                      <div key={set.id} className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border/30">
                        <span className="text-sm font-medium text-muted-foreground w-8">
                          {setIndex + 1}
                        </span>
                        
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor={`reps-${set.id}`} className="text-xs text-muted-foreground">
                              Reps
                            </Label>
                            <Input
                              id={`reps-${set.id}`}
                              type="number"
                              min="0"
                              value={set.reps || ''}
                              onChange={(e) => updateSet(exercise.id, set.id, 'reps', Number(e.target.value))}
                              className="h-9 bg-surface border-border/50 focus:border-primary/50"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`weight-${set.id}`} className="text-xs text-muted-foreground">
                              Weight ({exercise.weightUnit || weightUnit})
                            </Label>
                            <Input
                              id={`weight-${set.id}`}
                              type="number"
                              min="0"
                              step="0.5"
                              value={set.weight || ''}
                              onChange={(e) => updateSet(exercise.id, set.id, 'weight', Number(e.target.value))}
                              className="h-9 bg-surface border-border/50 focus:border-primary/50"
                            />
                          </div>
                        </div>

                        {exercise.sets.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSet(exercise.id, set.id)}
                            className="p-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 size={14} />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}

          <Button
            variant="outline"
            onClick={addExercise}
            className="w-full h-12 border-dashed border-primary/50 text-primary hover:bg-primary/10 hover:border-primary"
          >
            <Plus size={18} className="mr-2" />
            Add Exercise
          </Button>
        </div>

        {/* Notes */}
        <Card className="p-4 bg-surface border-border/50">
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium text-foreground">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="How did the workout feel? Any observations?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px] bg-background border-border/50 focus:border-primary/50 resize-none"
            />
          </div>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}