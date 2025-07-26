import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Calendar, Dumbbell, Target, Weight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BottomNav } from '@/components/ui/bottom-nav';
import { storage } from '@/lib/storage';
import { Workout, WeightUnit } from '@/types/workout';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { convertToKg, convertFromKg } from '@/lib/utils';

export default function WorkoutDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg');

  useEffect(() => {
    const settings = storage.getSettings();
    setWeightUnit(settings.weightUnit);

    if (id) {
      const workouts = storage.getWorkouts();
      const found = workouts.find(w => w.id === id);
      if (found) {
        setWorkout(found);
      } else {
        navigate('/');
      }
    }
  }, [id, navigate]);

  const handleDelete = () => {
    if (!workout) return;
    
    if (confirm(`Are you sure you want to delete "${workout.name}"?`)) {
      storage.deleteWorkout(workout.id);
      toast({
        title: "Workout deleted",
        description: `"${workout.name}" has been removed.`,
      });
      navigate('/');
    }
  };

  const handleEdit = () => {
    if (!workout) return;
    navigate(`/edit/${workout.id}`);
  };

  if (!workout) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading workout...</p>
        </div>
      </div>
    );
  }

  const totalSets = workout.exercises.reduce((acc, exercise) => acc + exercise.sets.length, 0);
  const totalVolume = workout.exercises.reduce((acc, exercise) => 
    acc + exercise.sets.reduce((setAcc, set) => {
      const weightInKg = convertToKg(set.weight, exercise.weightUnit);
      return setAcc + (weightInKg * set.reps);
    }, 0), 0
  );
  const displayVolume = convertFromKg(totalVolume, weightUnit);

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
                <h1 className="text-xl font-bold text-foreground">{workout.name}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar size={14} />
                  <span>{format(new Date(workout.date + 'T00:00:00'), 'EEEE, MMM dd, yyyy')}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="text-primary hover:text-primary hover:bg-primary/10"
              >
                <Edit size={16} />
              </Button>
              <Button 
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Workout Stats */}
        <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-primary/20 rounded-full mx-auto mb-2">
                <Dumbbell size={18} className="text-primary" />
              </div>
              <div className="text-lg font-bold text-foreground">{workout.exercises.length}</div>
              <div className="text-xs text-muted-foreground">Exercise{workout.exercises.length !== 1 ? 's' : ''}</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-primary/20 rounded-full mx-auto mb-2">
                <Target size={18} className="text-primary" />
              </div>
              <div className="text-lg font-bold text-foreground">{totalSets}</div>
              <div className="text-xs text-muted-foreground">Total Sets</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-primary/20 rounded-full mx-auto mb-2">
                <Weight size={18} className="text-primary" />
              </div>
              <div className="text-lg font-bold text-foreground">{Math.round(displayVolume).toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Volume ({weightUnit})</div>
            </div>
          </div>
        </Card>

        {/* Exercises */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Exercises</h2>
          
          {workout.exercises.map((exercise, exerciseIndex) => (
            <Card key={exercise.id} className="p-4 bg-surface border-border/50">
              <div className="space-y-4">
                {/* Exercise Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{exercise.name}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        Sets: {exercise.sets.length}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Volume: {Math.round(convertFromKg(
                          exercise.sets.reduce((acc, set) => acc + (convertToKg(set.weight, exercise.weightUnit) * set.reps), 0),
                          weightUnit
                        ))} {weightUnit}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sets */}
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-4 text-xs font-medium text-muted-foreground px-3">
                    <div>Set</div>
                    <div>Reps</div>
                    <div>Weight ({weightUnit})</div>
                    <div>Volume</div>
                  </div>
                  
                  {exercise.sets.map((set, setIndex) => (
                    <div key={set.id} className="grid grid-cols-4 gap-4 p-3 bg-background rounded-lg border border-border/30">
                      <div className="text-sm font-medium text-muted-foreground">
                        {setIndex + 1}
                      </div>
                      <div className="text-sm text-foreground font-medium">
                        {set.reps}
                      </div>
                      <div className="text-sm text-foreground font-medium">
                        {set.weight}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {Math.round(convertFromKg(convertToKg(set.weight, exercise.weightUnit) * set.reps, weightUnit))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Notes */}
        {workout.notes && (
          <Card className="p-4 bg-surface border-border/50">
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Notes</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {workout.notes}
              </p>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline"
            onClick={handleEdit}
            className="h-12 border-primary/50 text-primary hover:bg-primary/10 hover:border-primary"
          >
            <Edit size={18} className="mr-2" />
            Edit Workout
          </Button>
          <Button 
            variant="outline"
            onClick={handleDelete}
            className="h-12 border-destructive/50 text-destructive hover:bg-destructive/10 hover:border-destructive"
          >
            <Trash2 size={18} className="mr-2" />
            Delete Workout
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}