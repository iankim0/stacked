import { Home, Plus, Settings, Calendar } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  className?: string;
}

export function BottomNav({ className }: BottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: Plus, label: 'Add', path: '/add' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 bg-surface border-t border-border",
      "flex items-center justify-around h-16 px-4 z-50",
      className
    )}>
      {navItems.map(({ icon: Icon, label, path }) => {
        const isActive = location.pathname === path;
        
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 p-2 rounded-lg",
              "transition-colors duration-200 min-w-[60px]",
              isActive 
                ? "text-primary bg-primary/10" 
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )}
          >
            <Icon size={20} />
            <span className="text-xs font-medium">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}