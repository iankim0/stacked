import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkoutCard } from '@/components/workout/workout-card';
import { storage } from '@/lib/storage';
import { Workout } from '@/types/workout';
import { format } from 'date-fns';

export default function DateWorkouts() {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    if (!date) return;
    
    const allWorkouts = storage.getWorkouts();
    const filteredWorkouts = allWorkouts.filter(workout => {
      // Parse workout date properly to avoid timezone issues
      const workoutDate = workout.date.includes('T') ? workout.date.split('T')[0] : workout.date;
      return workoutDate === date;
    });
    
    setWorkouts(filteredWorkouts);
  }, [date]);

  const handleEdit = (workout: Workout) => {
    navigate(`/edit/${workout.id}`);
  };

  const handleDelete = (id: string) => {
    storage.deleteWorkout(id);
    setWorkouts(prev => prev.filter(w => w.id !== id));
  };

  const handleView = (workout: Workout) => {
    navigate(`/workout/${workout.id}`);
  };

  const handleAddWorkout = () => {
    navigate(`/add?date=${date}`);
  };

  if (!date) {
    return <div>Invalid date</div>;
  }

  const formattedDate = format(new Date(date + 'T00:00:00'), 'EEEE, MMM dd, yyyy');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40">
        <div className="pt-safe p-4">
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/calendar')}
              className="h-8 w-8 p-0 hover:bg-secondary/50"
            >
              <ArrowLeft size={16} />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Workouts</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground ml-11">
            <Calendar size={14} />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {workouts.length === 0 ? (
          <Card className="text-center py-12 bg-surface border-border/50">
            <CardHeader>
              <CardTitle className="text-muted-foreground">No workouts logged</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-6">
                No workouts found for {formattedDate}
              </p>
              <Button onClick={handleAddWorkout} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus size={16} className="mr-2" />
                Add Workout
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {workouts.length} workout{workouts.length === 1 ? '' : 's'} found
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddWorkout}
                className="h-8"
              >
                <Plus size={14} className="mr-1" />
                Add
              </Button>
            </div>

            <div className="space-y-3">
              {workouts.map((workout) => (
                <WorkoutCard
                  key={workout.id}
                  workout={workout}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}