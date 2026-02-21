import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSaved } from '../context/SavedContext';
import { 
  Activity, Home, Search, Heart, LogIn, UserPlus, LogOut
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";

export default function Navbar() {
  const { logout, isAuthenticated } = useAuth();
  const { savedIds } = useSaved();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  // Helper Component for Link Icons
  const NavIcon = ({ to, icon: Icon, label, showBadge = false, count = 0 }: any) => (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <Link to={to}>
            <Button 
              variant="ghost" 
              size="icon"
              className={`relative h-10 w-10 rounded-full transition-all ${
                isActive(to) 
                  ? 'bg-primary/10 text-primary hover:bg-primary/20' 
                  : 'text-slate-500 hover:text-primary hover:bg-slate-100'
              }`}
            >
              <Icon className="h-5 w-5" />
              {showBadge && count > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] border-2 border-white pointer-events-none">
                  {count}
                </Badge>
              )}
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs font-semibold">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between relative">
          
          {/* --- LEFT SIDE: Navigation Icons --- */}
          <div className="flex items-center gap-1 md:gap-2 z-10">
            <NavIcon to="/" icon={Home} label="Home" />
            <NavIcon to="/doctors" icon={Search} label="Find Specialists" />
            
            {isAuthenticated && (
              <>
                <NavIcon 
                  to="/saved" 
                  icon={Heart} 
                  label="Saved Doctors" 
                  showBadge={true} 
                  count={savedIds.length} 
                />
                
                {/* MY REVIEWS TAB */}
               
              </>
            )}
          </div>

          {/* --- CENTER: Branding --- */}
          {/* Centered vertically and horizontally */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary tracking-tight group">
              <div className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="hidden md:inline-block">DocRank</span>
            </Link>
          </div>

          {/* --- RIGHT SIDE: Auth Icons --- */}
          <div className="flex items-center gap-1 z-10">
            {isAuthenticated ? (
              // LOGOUT BUTTON (Icon Only)
              <TooltipProvider>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="relative h-10 w-10 rounded-full text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all"
                      onClick={() => setIsLogoutOpen(true)}
                    >
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs font-semibold">
                    <p>Log Out</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              // LOGIN / SIGNUP ICONS
              <>
                <NavIcon to="/login" icon={LogIn} label="Log In" />
                <NavIcon to="/register" icon={UserPlus} label="Sign Up" />
              </>
            )}
          </div>
        </div>
      </nav>

      {/* --- LOGOUT CONFIRMATION MODAL --- */}
      <Dialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
               <LogOut className="h-5 w-5 text-red-500" />
               Confirm Logout
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to log out? You will need to sign in again to access your saved doctors.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end mt-4">
            <DialogClose asChild>
               <Button variant="outline" className="w-full sm:w-auto">Cancel</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
              onClick={() => {
                logout();
                setIsLogoutOpen(false);
                navigate('/login');
              }}
            >
              Log Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}