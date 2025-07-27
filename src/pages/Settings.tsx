import { useState, useEffect } from 'react';
import { ArrowLeft, Settings as SettingsIcon, Scale, Download, Upload, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BottomNav } from '@/components/ui/bottom-nav';
import { storage } from '@/lib/storage';
import { WeightUnit } from '@/types/workout';
import { toast } from '@/hooks/use-toast';

export default function Settings() {
  const navigate = useNavigate();
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg');
  const [workoutCount, setWorkoutCount] = useState(0);

  useEffect(() => {
    const settings = storage.getSettings();
    setWeightUnit(settings.weightUnit);
    
    const workouts = storage.getWorkouts();
    setWorkoutCount(workouts.length);
  }, []);

  const handleWeightUnitChange = (newUnit: WeightUnit) => {
    setWeightUnit(newUnit);
    const settings = storage.getSettings();
    storage.saveSettings({ ...settings, weightUnit: newUnit });
    toast({
      title: "Settings Updated",
      description: `Weight unit changed to ${newUnit}`,
    });
  };

  const exportData = () => {
    const workouts = storage.getWorkouts();
    const settings = storage.getSettings();
    const exportData = {
      workouts,
      settings,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `stacked-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Data Exported",
      description: "Your workout data has been downloaded",
    });
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          
          if (data.workouts && Array.isArray(data.workouts)) {
            storage.saveWorkouts(data.workouts);
          }
          
          if (data.settings) {
            storage.saveSettings(data.settings);
            setWeightUnit(data.settings.weightUnit || 'kg');
          }

          setWorkoutCount(data.workouts?.length || 0);
          
          toast({
            title: "Data Imported",
            description: `Successfully imported ${data.workouts?.length || 0} workouts`,
          });
        } catch (error) {
          toast({
            title: "Import Failed",
            description: "Invalid file format",
            variant: "destructive"
          });
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to delete ALL workout data? This cannot be undone.')) {
      localStorage.removeItem('stacked_workouts');
      localStorage.removeItem('stacked_settings');
      setWorkoutCount(0);
      setWeightUnit('kg');
      
      toast({
        title: "Data Cleared",
        description: "All workout data has been deleted",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40">
        <div className="pt-safe p-4">
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
              <h1 className="text-xl font-bold text-foreground">Settings</h1>
              <p className="text-sm text-muted-foreground">
                Customize your Stacked experience
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* App Info */}
        <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <SettingsIcon size={18} className="text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Stacked</h2>
              <p className="text-sm text-muted-foreground">Your workout companion</p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {workoutCount} workout{workoutCount !== 1 ? 's' : ''} logged
          </div>
        </Card>

        {/* Preferences */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Preferences</h2>
          
          <Card className="p-4 bg-surface border-border/50">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Scale size={18} className="text-muted-foreground" />
                <div className="flex-1">
                  <Label className="text-sm font-medium text-foreground">Weight Unit</Label>
                  <p className="text-xs text-muted-foreground">Choose your preferred weight measurement</p>
                </div>
              </div>
              
              <Select value={weightUnit} onValueChange={handleWeightUnitChange}>
                <SelectTrigger className="bg-background border-border/50 focus:border-primary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kilograms (kg)</SelectItem>
                  <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        </div>

        {/* Data Management */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Data Management</h2>
          
          <Card className="p-4 bg-surface border-border/50 space-y-3">
            <Button 
              variant="outline"
              onClick={exportData}
              className="w-full justify-start h-12 border-border/50 hover:bg-secondary/50"
            >
              <Download size={18} className="mr-3 text-muted-foreground" />
              <div className="text-left">
                <div className="text-sm font-medium text-foreground">Export Data</div>
                <div className="text-xs text-muted-foreground">Download your workouts as backup</div>
              </div>
            </Button>

            <Button 
              variant="outline"
              onClick={importData}
              className="w-full justify-start h-12 border-border/50 hover:bg-secondary/50"
            >
              <Upload size={18} className="mr-3 text-muted-foreground" />
              <div className="text-left">
                <div className="text-sm font-medium text-foreground">Import Data</div>
                <div className="text-xs text-muted-foreground">Restore from backup file</div>
              </div>
            </Button>

            <Button 
              variant="outline"
              onClick={clearAllData}
              className="w-full justify-start h-12 border-destructive/50 text-destructive hover:bg-destructive/10 hover:border-destructive"
            >
              <Trash size={18} className="mr-3" />
              <div className="text-left">
                <div className="text-sm font-medium">Clear All Data</div>
                <div className="text-xs text-destructive/70">Delete all workouts permanently</div>
              </div>
            </Button>
          </Card>
        </div>

        {/* About */}
        <Card className="p-4 bg-surface border-border/50">
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">About Stacked</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A simple app to record and monitor your progress. Stack good reps, sets, weight, and workouts with Stacked.
            </p>
            <div className="text-xs text-muted-foreground pt-2 border-t border-border/30">
              Version 1.0 • Made for athletes by athletes
            </div>
          </div>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}