import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, HelpCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { WorkoutCard } from '@/components/workout/workout-card';
import { BottomNav } from '@/components/ui/bottom-nav';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { storage } from '@/lib/storage';
import { initializeSampleData } from '@/lib/sample-data';
import { Workout } from '@/types/workout';
import { toast } from '@/hooks/use-toast';

export default function Home() {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  useEffect(() => {
    initializeSampleData();
    loadWorkouts();
  }, []);

  useEffect(() => {
    filterWorkouts();
    setCurrentPage(1); // Reset to first page when search changes
  }, [workouts, searchQuery]);

  const loadWorkouts = () => {
    const stored = storage.getWorkouts();
    // Sort by date descending (newest first) - avoid timezone issues
    const sorted = stored.sort((a, b) => {
      const dateA = a.date.split('T')[0];
      const dateB = b.date.split('T')[0];
      return dateB.localeCompare(dateA);
    });
    setWorkouts(sorted);
  };

  const filterWorkouts = () => {
    if (!searchQuery.trim()) {
      setFilteredWorkouts(workouts);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = workouts.filter(workout => {
      // Check workout name
      if (workout.name.toLowerCase().includes(query)) return true;
      
      // Check date (supports YYYY-MM-DD, MM/DD/YYYY, or partial matches)
      const workoutDate = workout.date.split('T')[0]; // Get YYYY-MM-DD part
      if (workoutDate.includes(query)) return true;
      
      // Check formatted date variations - fix timezone issue  
      const date = new Date(workout.date + 'T12:00:00');
      const formattedDate = format(date, 'M/d/yyyy'); // US format like 1/15/2024
      if (formattedDate.toLowerCase().includes(query)) return true;
      
      // Check month only (YYYY-MM)
      if (workoutDate.substring(0, 7).includes(query)) return true;
      
      // Check year only (YYYY)
      if (workoutDate.substring(0, 4).includes(query)) return true;
      
      // Check exercises in blocks
      return workout.blocks?.some(block => 
        block.exercises.some(exercise => 
          exercise.name.toLowerCase().includes(query)
        )
      ) || false;
    });
    setFilteredWorkouts(filtered);
  };

  const handleDeleteWorkout = (id: string) => {
    storage.deleteWorkout(id);
    loadWorkouts();
    toast({
      title: "Workout deleted",
      description: "The workout has been removed.",
    });
  };

  const handleEditWorkout = (workout: Workout) => {
    navigate(`/edit/${workout.id}`);
  };

  const handleViewWorkout = (workout: Workout) => {
    navigate(`/workout/${workout.id}`);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40">
        <div className="pt-safe p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Stacked</h1>
              <p className="text-sm text-muted-foreground">Your workout journey</p>
            </div>
            <Button 
              onClick={() => navigate('/add')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
            >
              <Plus size={18} className="mr-2" />
              Add Workout
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search workouts, exercises, or dates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-12 bg-surface border-border/50 focus:border-primary/50 placeholder:text-xs"
            />
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                >
                  <HelpCircle size={16} />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Search Help</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Search by Workouts</h4>
                    <p className="text-sm text-muted-foreground">Type workout names like "Push Day" or "Leg Workout"</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2">Search by Exercises</h4>
                    <p className="text-sm text-muted-foreground">Type exercise names like "Bench Press" or "Squats"</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2">Search by Dates</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• <code className="bg-muted px-1 rounded">2024-01-15</code> (Full date)</p>
                      <p>• <code className="bg-muted px-1 rounded">1/15/2024</code> (US format)</p>
                      <p>• <code className="bg-muted px-1 rounded">2024-01</code> (Month only)</p>
                      <p>• <code className="bg-muted px-1 rounded">2024</code> (Year only)</p>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {filteredWorkouts.length === 0 ? (
          <div className="text-center py-12">
            {searchQuery ? (
              <div className="space-y-2">
                <p className="text-muted-foreground">No workouts found for "{searchQuery}"</p>
                <Button 
                  variant="ghost" 
                  onClick={() => setSearchQuery('')}
                  className="text-primary hover:text-primary/80"
                >
                  Clear search
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xl font-semibold text-foreground">No workouts yet</p>
                  <p className="text-muted-foreground">Start tracking your fitness journey</p>
                </div>
                <Button 
                  onClick={() => navigate('/add')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Add Your First Workout
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                {searchQuery ? `Search Results (${filteredWorkouts.length})` : 'Recent Workouts'}
              </h2>
            </div>
            
            <div className="grid gap-4">
              {filteredWorkouts.slice(0, currentPage * itemsPerPage).map((workout) => (
                <WorkoutCard
                  key={workout.id}
                  workout={workout}
                  onEdit={handleEditWorkout}
                  onDelete={handleDeleteWorkout}
                  onView={handleViewWorkout}
                />
              ))}
            </div>
            
            {/* See More Button */}
            {filteredWorkouts.length > currentPage * itemsPerPage && (
              <div className="flex justify-center pt-4">
                <Button 
                  variant="outline"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="border-primary/20 text-primary hover:bg-primary/5"
                >
                  See More ({filteredWorkouts.length - currentPage * itemsPerPage} remaining)
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}