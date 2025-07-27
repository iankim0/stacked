import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BottomNav } from '@/components/ui/bottom-nav';
import { storage } from '@/lib/storage';
import { Workout } from '@/types/workout';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isSameMonth, isToday } from 'date-fns';
import { cn } from '@/lib/utils';

export default function CalendarView() {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const stored = storage.getWorkouts();
    setWorkouts(stored);
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get first day of week (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = monthStart.getDay();
  
  // Create empty cells for days before the month starts
  const leadingEmptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const getWorkoutsForDate = (date: Date): Workout[] => {
    return workouts.filter(workout => {
      // Parse workout date properly to avoid timezone issues
      const workoutDate = workout.date.includes('T') ? workout.date.split('T')[0] : workout.date;
      const compareDate = format(date, 'yyyy-MM-dd');
      return workoutDate === compareDate;
    });
  };

  const getWorkoutCount = (): number => {
    return workouts.filter(workout => 
      isSameMonth(new Date(workout.date), currentDate)
    ).length;
  };

  const handleDateClick = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    navigate(`/date/${formattedDate}`);
  };

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
              <p className="text-sm text-muted-foreground">Your workout timeline</p>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <CalendarIcon size={16} />
              <span>{getWorkoutCount()} workouts this month</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Month Navigation */}
        <Card className="p-4 bg-surface border-border/50">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevMonth}
              className="h-8 w-8 p-0 hover:bg-secondary/50"
            >
              <ChevronLeft size={16} />
            </Button>
            
            <h2 className="text-lg font-semibold text-foreground">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextMonth}
              className="h-8 w-8 p-0 hover:bg-secondary/50"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </Card>

        {/* Calendar */}
        <Card className="p-4 bg-surface border-border/50">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before month starts */}
            {leadingEmptyDays.map((_, index) => (
              <div key={`empty-${index}`} className="h-12" />
            ))}

            {/* Days of the month */}
            {daysInMonth.map((date) => {
              const dayWorkouts = getWorkoutsForDate(date);
              const hasWorkouts = dayWorkouts.length > 0;
              const workoutCount = dayWorkouts.length;
              const isCurrentDay = isToday(date);

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDateClick(date)}
                  className={cn(
                    "h-12 rounded-lg text-sm font-medium transition-all duration-200",
                    "flex flex-col items-center justify-center relative",
                    "hover:bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/50",
                    "cursor-pointer text-foreground",
                    isCurrentDay && "ring-2 ring-primary/30 bg-primary/5"
                  )}
                >
                  <span className={cn(
                    isCurrentDay && "text-primary font-bold"
                  )}>
                    {format(date, 'd')}
                  </span>
                  
                  {hasWorkouts && (
                    <div className="absolute bottom-1">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        workoutCount === 1 && "bg-primary/60",
                        workoutCount === 2 && "bg-primary/80", 
                        workoutCount >= 3 && "bg-primary"
                      )} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Current Month Stats */}
        <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <Dumbbell size={18} className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {format(currentDate, 'MMMM')} Summary
              </h3>
              <p className="text-sm text-muted-foreground">Your monthly progress</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-foreground">{getWorkoutCount()}</div>
              <div className="text-sm text-muted-foreground">Total Workouts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {workouts.filter(w => isSameMonth(new Date(w.date), currentDate))
                  .reduce((acc, w) => {
                    return acc + (w.blocks?.flatMap(block => block.exercises).length || 0);
                  }, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Exercises</div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-2">
          <Button 
            onClick={() => navigate('/add')}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <CalendarIcon size={18} className="mr-2" />
            Log Today's Workout
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}