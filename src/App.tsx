import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthGuard } from "./components/auth/auth-guard";
import Home from "./pages/Home";
import AddWorkout from "./pages/AddWorkout";
import WorkoutDetail from "./pages/WorkoutDetail";
import CalendarView from "./pages/CalendarView";
import DateWorkouts from "./pages/DateWorkouts";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <AuthGuard>
                <Home />
              </AuthGuard>
            } />
            <Route path="/calendar" element={
              <AuthGuard>
                <CalendarView />
              </AuthGuard>
            } />
            <Route path="/date/:date" element={
              <AuthGuard>
                <DateWorkouts />
              </AuthGuard>
            } />
            <Route path="/add" element={
              <AuthGuard>
                <AddWorkout />
              </AuthGuard>
            } />
            <Route path="/edit/:id" element={
              <AuthGuard>
                <AddWorkout />
              </AuthGuard>
            } />
            <Route path="/workout/:id" element={
              <AuthGuard>
                <WorkoutDetail />
              </AuthGuard>
            } />
            <Route path="/settings" element={
              <AuthGuard>
                <Settings />
              </AuthGuard>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
