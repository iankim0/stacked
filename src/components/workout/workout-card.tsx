import { Workout } from '@/types/workout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Dumbbell, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface WorkoutCardProps {
  workout: Workout;
  onEdit?: (workout: Workout) => void;
  onDelete?: (id: string) => void;
  onView?: (workout: Workout) => void;
  className?: string;
}

export function WorkoutCard({ 
  workout, 
  onEdit, 
  onDelete, 
  onView,
  className 
}: WorkoutCardProps) {
  // Helper function to get all exercises from blocks
  const getAllExercises = () => {
    return workout.blocks?.flatMap(block => block.exercises) || [];
  };

  const allExercises = getAllExercises();
  const totalSets = allExercises.reduce((acc, exercise) => acc + exercise.sets.length, 0);
  const exerciseCount = allExercises.length;

  return (
    <Card className={cn(
      "p-4 bg-gradient-to-br from-card to-surface hover:from-surface-elevated hover:to-card",
      "border border-border/50 transition-all duration-300 hover:border-primary/20",
      "hover:shadow-lg cursor-pointer group",
      className
    )}>
      <div onClick={() => onView?.(workout)} className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
              {workout.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar size={14} />
              <span>{format(new Date(workout.date + 'T00:00:00'), 'MMM dd, yyyy')}</span>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(workout);
                }}
                className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
              >
                <Edit size={14} />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(workout.id);
                }}
                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 size={14} />
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Dumbbell size={14} />
            <span>{exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''}</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            Sets: {totalSets}
          </Badge>
        </div>

        {/* Exercise preview */}
        <div className="space-y-1">
          {allExercises.slice(0, 2).map((exercise) => (
            <div key={exercise.id} className="text-sm text-muted-foreground">
              {exercise.name} (Sets: {exercise.sets.length})
            </div>
          ))}
          {allExercises.length > 2 && (
            <div className="text-sm text-muted-foreground">
              +{allExercises.length - 2} more...
            </div>
          )}
        </div>

        {/* Notes preview */}
        {workout.notes && (
          <p className="text-sm text-muted-foreground line-clamp-2 italic">
            "{workout.notes}"
          </p>
        )}
      </div>
    </Card>
  );
}