import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Search, MapPin, Star, Filter, LogOut, User as UserIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  hospital: string;
  location: string;
  average_rating: number | null;
  review_count: number;
}

export default function Home() {
  const { user, logout } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  
  // Review State
  const [rating, setRating] = useState(10);
  const [comment, setComment] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchDoctors = async (query = '') => {
    try {
      const res = await api.get(`/doctors/?search=${query}`);
      setDoctors(res.data);
    } catch (err) {
      console.error("Failed to fetch doctors");
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => fetchDoctors(search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const submitReview = async () => {
    if (!selectedDoctor) return;
    try {
      await api.post('/reviews/', {
        doctor: selectedDoctor.id,
        rating,
        comment
      });
      setIsDialogOpen(false);
      fetchDoctors(search); // Refresh list
      setComment('');
      setRating(10);
    } catch (err) {
      alert("Failed to review. You may have already reviewed this doctor.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* --- NAVBAR --- */}
      <nav className="sticky top-0 z-30 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xl text-primary">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                    <Star className="h-5 w-5 text-white fill-current" />
                </div>
                DocRank
            </div>

            <div className="flex items-center gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                             <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                                <UserIcon className="h-5 w-5 text-slate-600"/>
                             </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.username}</p>
                                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600 cursor-pointer">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
      </nav>

      <main className="container py-10 space-y-8">
        {/* --- HEADER & SEARCH --- */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-6 border-b">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">Find Specialists</h1>
                <p className="text-muted-foreground">
                    Browse top-rated doctors ranked by patient trust scores.
                </p>
            </div>
            <div className="w-full md:w-[400px] relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search name, hospital, or specialty..." 
                    className="pl-9 bg-white"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
        </div>

        {/* --- DOCTOR GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc) => (
            <Card key={doc.id} className="group hover:shadow-lg transition-all duration-300 border-slate-200">
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <Badge variant="outline" className="mb-2 bg-primary/5 text-primary border-primary/20">
                                {doc.specialty}
                            </Badge>
                            <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">
                                {doc.name}
                            </CardTitle>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className={`flex items-center gap-1 font-bold text-lg ${
                                (doc.average_rating || 0) >= 8 ? 'text-green-600' : 
                                (doc.average_rating || 0) >= 5 ? 'text-yellow-600' : 'text-slate-400'
                            }`}>
                                <Star className="h-4 w-4 fill-current" />
                                {doc.average_rating ? doc.average_rating.toFixed(1) : '-'}
                            </div>
                            <span className="text-xs text-muted-foreground">{doc.review_count} reviews</span>
                        </div>
                    </div>
                    <CardDescription className="flex items-center gap-1.5 mt-1">
                        <MapPin className="h-3.5 w-3.5" /> 
                        <span className="truncate">{doc.hospital}, {doc.location}</span>
                    </CardDescription>
                </CardHeader>
                
                <CardContent>
                    <div className="pt-2">
                        {/* REVIEW MODAL */}
                        <Dialog open={isDialogOpen && selectedDoctor?.id === doc.id} onOpenChange={(open) => {
                            setIsDialogOpen(open);
                            if (open) setSelectedDoctor(doc);
                        }}>
                            <DialogTrigger asChild>
                                <Button className="w-full" variant="secondary">
                                    Rate Doctor
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Rate {doc.name}</DialogTitle>
                                    <DialogDescription>
                                        Share your experience to help others find the best care.
                                    </DialogDescription>
                                </DialogHeader>
                                
                                <div className="grid gap-6 py-4">
                                    <div className="grid gap-3">
                                        <Label>Score (1-10)</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {[...Array(10)].map((_, i) => {
                                                const val = i + 1;
                                                return (
                                                    <button
                                                        key={val}
                                                        onClick={() => setRating(val)}
                                                        className={`h-9 w-9 rounded-md flex items-center justify-center text-sm font-medium transition-all ${
                                                            rating === val 
                                                            ? 'bg-primary text-primary-foreground shadow-md scale-110' 
                                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                                        }`}
                                                    >
                                                        {val}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                        <div className="flex justify-between text-xs text-muted-foreground px-1">
                                            <span>Poor</span>
                                            <span>Excellent</span>
                                        </div>
                                    </div>
                                    
                                    <div className="grid gap-2">
                                        <Label>Comment (Optional)</Label>
                                        <Textarea 
                                            placeholder="Wait time, bedside manner, effectiveness..." 
                                            className="resize-none"
                                            rows={3}
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button onClick={submitReview} className="w-full sm:w-auto">Submit Review</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
            </Card>
            ))}
        </div>
      </main>
    </div>
  );
}