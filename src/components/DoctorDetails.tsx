import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSaved } from '../context/SavedContext';
import { 
  Star, MapPin, Activity, Phone, Mail, Lock, LogIn, Heart, ExternalLink, Plus, Edit, Trash2, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Review {
  id: number;
  user: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  hospital: string;
  location: string;
  average_rating: number | null;
  review_count: number;
  email: string;
  cell: string;
  image?: string;
}

interface DoctorDetailsProps {
  doctor: Doctor | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DoctorDetails({ doctor, isOpen, onClose }: DoctorDetailsProps) {
  const { user, isAuthenticated } = useAuth();
  const { toggleSave, isSaved } = useSaved();
  const navigate = useNavigate();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myReview, setMyReview] = useState<Review | null>(null);
  
  // Modals State
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false); // New Delete Modal
  
  // Form State
  const [rating, setRating] = useState(10);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch Reviews
  const fetchReviews = async () => {
    if (!doctor) return;
    try {
        const res = await api.get(`/reviews/?doctor_id=${doctor.id}`);
        let allReviews: Review[] = res.data;
        
        // Find my review
        if (isAuthenticated && user) {
            const mine = allReviews.find(r => r.user === user.username);
            const others = allReviews.filter(r => r.user !== user.username);
            
            if (mine) {
                setMyReview(mine);
                setReviews([mine, ...others]);
            } else {
                setMyReview(null);
                setReviews(allReviews);
            }
        } else {
            setReviews(allReviews);
        }
    } catch (err) {
        console.error("Failed to fetch reviews");
    }
  };

  useEffect(() => {
    if (doctor && isOpen) {
      fetchReviews();
    }
  }, [doctor, isOpen, isAuthenticated, user]);

  // Open Write Modal
  const handleOpenWrite = () => {
      if (myReview) {
          setRating(myReview.rating);
          setComment(myReview.comment);
      } else {
          setRating(10);
          setComment('');
      }
      setIsWriteOpen(true);
  };

  // Handle Submit (Create or Update)
  const handleSubmitReview = async () => {
    if (!doctor) return;
    setLoading(true);
    try {
        if (myReview) {
            await api.patch(`/reviews/${myReview.id}/`, { rating, comment });
        } else {
            await api.post('/reviews/', { doctor: doctor.id, rating, comment });
        }
        setIsWriteOpen(false);
        setIsSuccessOpen(true); 
        await fetchReviews();
    } catch (err) {
        console.error("Failed to save review");
    } finally {
        setLoading(false);
    }
  };

  // Handle Delete
  const handleDeleteReview = async () => {
    if (!myReview) return;
    setLoading(true);
    try {
        await api.delete(`/reviews/${myReview.id}/`);
        setIsDeleteOpen(false);
        setMyReview(null); // Clear local state
        await fetchReviews(); // Refresh list
    } catch (err) {
        console.error("Failed to delete review");
    } finally {
        setLoading(false);
    }
  };

  if (!doctor) return null;
  const isDoctorSaved = isSaved(doctor.id);

  return (
    <>
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] w-full p-0 gap-0 flex flex-col bg-slate-50 overflow-hidden">
           
           {/* --- HEADER --- */}
           <div className="bg-slate-900 text-white p-6 shrink-0 relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                 <div className="flex gap-4 items-center">
                    <Avatar className="h-20 w-20 border-2 border-white/20 shadow-xl">
                       <AvatarImage src={doctor.image} className="object-cover"/>
                       <AvatarFallback className="text-slate-900 font-bold text-2xl bg-slate-200">
                          {doctor.name.substring(0,2)}
                       </AvatarFallback>
                    </Avatar>
                    <div>
                       <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-primary/90 text-white border-none px-2 py-0.5 text-xs font-semibold">Verified</Badge>
                          <TooltipProvider>
                            <Tooltip delayDuration={0}>
                              <TooltipTrigger asChild>
                                <button 
                                   onClick={(e) => { e.stopPropagation(); toggleSave(doctor.id); }}
                                   className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                                >
                                   <Heart className={`h-3.5 w-3.5 ${isDoctorSaved ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                                   {isDoctorSaved ? 'Saved' : 'Save'}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent><p>{isDoctorSaved ? "Unsave" : "Save"}</p></TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                       </div>
                       <DialogTitle className="text-2xl font-bold leading-tight">{doctor.name}</DialogTitle>
                       <p className="text-slate-400 flex items-center gap-2 text-sm mt-1">
                          <Activity className="h-4 w-4 shrink-0" /> {doctor.specialty}
                       </p>
                    </div>
                 </div>

                 {/* Rating Block (10 Stars) */}
                 <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl border border-white/5 backdrop-blur-sm">
                    <div className="text-3xl font-bold text-yellow-400 leading-none">
                       {doctor.average_rating?.toFixed(1) || "N/A"}
                    </div>
                    <div className="flex flex-col justify-center">
                       <div className="flex text-yellow-400 gap-0.5">
                           {[...Array(10)].map((_, i) => (
                              <Star key={i} className={`h-2 w-2 ${i < Math.round(doctor.average_rating || 0) ? 'fill-current' : 'text-white/20'}`} />
                           ))}
                       </div>
                       <span className="text-xs text-slate-300 font-medium mt-0.5">{doctor.review_count} Reviews</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* --- SCROLLABLE BODY --- */}
           <div className="flex-1 w-full bg-slate-50 overflow-y-auto">
              <div className="p-6">
                 <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-200/50 p-1">
                       <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Overview</TabsTrigger>
                       <TabsTrigger value="reviews" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Patient Reviews</TabsTrigger>
                    </TabsList>

                    {/* OVERVIEW TAB */}
                    <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Card className="border-slate-200 shadow-sm">
                             <CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Practice Location</CardTitle></CardHeader>
                             <CardContent className="space-y-4 text-sm font-medium text-slate-900">
                                <div className="flex items-start gap-3"><div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0"><Activity className="h-4 w-4 text-blue-600" /></div><div><p className="font-semibold">{doctor.hospital}</p><p className="text-slate-500 font-normal">Medical Center</p></div></div>
                                <Separator />
                                <div className="flex items-start gap-3"><div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0"><MapPin className="h-4 w-4 text-blue-600" /></div><div><p className="font-semibold">{doctor.location}</p><p className="text-slate-500 font-normal">City / Region</p></div></div>
                             </CardContent>
                          </Card>
                          <Card className="border-slate-200 shadow-sm">
                             <CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Contact Details</CardTitle></CardHeader>
                             <CardContent className="space-y-4 text-sm font-medium text-slate-900">
                                <a href={`tel:${doctor.cell}`} className="flex items-start gap-3 group p-2 -ml-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                                   <div className="h-8 w-8 bg-green-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-green-100 transition-colors"><Phone className="h-4 w-4 text-green-600" /></div>
                                   <div className="flex-1"><div className="flex justify-between items-center"><p className="font-semibold">{doctor.cell || 'Not Listed'}</p><ExternalLink className="h-3 w-3 text-slate-300 group-hover:text-green-600" /></div><p className="text-slate-500 font-normal">Tap to Call</p></div>
                                </a>
                                <Separator />
                                <a href={`mailto:${doctor.email}`} className="flex items-start gap-3 group p-2 -ml-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                                   <div className="h-8 w-8 bg-green-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-green-100 transition-colors"><Mail className="h-4 w-4 text-green-600" /></div>
                                   <div className="flex-1 min-w-0"><div className="flex justify-between items-start gap-2"><p className="font-semibold break-all leading-tight">{doctor.email || 'No Email'}</p><ExternalLink className="h-3 w-3 text-slate-300 group-hover:text-green-600 shrink-0 mt-1" /></div><p className="text-slate-500 font-normal mt-0.5">Tap to Email</p></div>
                                </a>
                             </CardContent>
                          </Card>
                       </div>
                    </TabsContent>

                    {/* REVIEWS LIST TAB */}
                    <TabsContent value="reviews" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-4">
                       {!isAuthenticated ? (
                          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 bg-white border border-dashed border-slate-200 rounded-xl">
                             <div className="h-14 w-14 bg-slate-50 rounded-full flex items-center justify-center"><Lock className="h-7 w-7 text-slate-400" /></div>
                             <div><h3 className="font-bold text-slate-900">Reviews are protected</h3><p className="text-slate-500 text-sm mt-1">Please log in to view patient experiences.</p></div>
                             <Button onClick={() => navigate('/login')} size="sm" className="gap-2"><LogIn className="h-4 w-4" /> Log In</Button>
                          </div>
                       ) : (
                          <>
                             {/* WRITE REVIEW BUTTON (Hidden if review exists) */}
                             {!myReview && (
                               <TooltipProvider>
                                 <Tooltip delayDuration={0}>
                                   <TooltipTrigger asChild>
                                     <Button 
                                        variant="outline" 
                                        className="w-full border-dashed border-2 border-slate-300 text-slate-500 hover:border-primary hover:text-primary hover:bg-primary/5 h-12 gap-2 mb-4"
                                        onClick={handleOpenWrite}
                                     >
                                        <Plus className="h-4 w-4" /> 
                                        Write a Review
                                     </Button>
                                   </TooltipTrigger>
                                   <TooltipContent side="top"><p>Share your experience</p></TooltipContent>
                                 </Tooltip>
                               </TooltipProvider>
                             )}

                             {reviews.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">No reviews yet. Be the first!</div>
                             ) : (
                                reviews.map((review) => (
                                   <div 
                                      key={review.id} 
                                      className={`p-4 rounded-xl border shadow-sm relative transition-all ${
                                         review.user === user?.username 
                                         ? 'bg-blue-50/50 border-blue-200 ring-1 ring-blue-200' 
                                         : 'bg-white border-slate-100'
                                      }`}
                                   >
                                      {/* --- YOUR REVIEW ACTIONS --- */}
                                      {review.user === user?.username && (
                                         <div className="absolute bottom-4 right-4 flex gap-2 items-center">
                                             <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">You</Badge>
                                             
                                             {/* EDIT BUTTON */}
                                             <TooltipProvider>
                                                <Tooltip delayDuration={0}>
                                                   <TooltipTrigger asChild>
                                                     <button 
                                                        onClick={handleOpenWrite}
                                                        className="p-1.5 rounded-full bg-white text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-colors shadow-sm"
                                                     >
                                                        <Edit className="h-3.5 w-3.5" />
                                                     </button>
                                                   </TooltipTrigger>
                                                   <TooltipContent><p>Edit Review</p></TooltipContent>
                                                </Tooltip>
                                             </TooltipProvider>

                                             {/* DELETE BUTTON */}
                                             <TooltipProvider>
                                                <Tooltip delayDuration={0}>
                                                   <TooltipTrigger asChild>
                                                     <button 
                                                        onClick={() => setIsDeleteOpen(true)}
                                                        className="p-1.5 rounded-full bg-white text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors shadow-sm"
                                                     >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                     </button>
                                                   </TooltipTrigger>
                                                   <TooltipContent><p className="text-red-500 font-semibold">Delete Review</p></TooltipContent>
                                                </Tooltip>
                                             </TooltipProvider>
                                         </div>
                                      )}

                                      <div className="flex justify-between items-start mb-2">
                                         <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8"><AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-xs">{review.user.substring(0,2).toUpperCase()}</AvatarFallback></Avatar>
                                            <span className="font-bold text-sm text-slate-700">{review.user}</span>
                                         </div>
                                         <div className="flex gap-0.5">
                                            {[...Array(10)].map((_, i) => (
                                               <Star key={i} className={`h-2.5 w-2.5 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-slate-200'}`} />
                                            ))}
                                         </div>
                                      </div>
                                      <p className="text-slate-600 text-sm leading-relaxed pl-10 pr-4 mb-4">"{review.comment}"</p>
                                      <div className="pl-10 text-xs text-slate-400">{new Date(review.created_at).toLocaleDateString()}</div>
                                   </div>
                                ))
                             )}
                          </>
                       )}
                    </TabsContent>
                 </Tabs>
              </div>
           </div>

           {/* --- FOOTER --- */}
           <div className="p-4 bg-white border-t flex justify-between items-center shrink-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <Button variant="ghost" onClick={onClose}>Close</Button>
              <Button className="bg-primary hover:bg-primary/90 gap-2 shadow-md shadow-primary/20">
                 <Phone className="h-4 w-4" /> 
                 <a href={`tel:${doctor.cell}`} className="text-inherit no-underline">Call to Book</a>
              </Button>
           </div>
      </DialogContent>
    </Dialog>

    {/* --- WRITE/UPDATE MODAL --- */}
    <Dialog open={isWriteOpen} onOpenChange={setIsWriteOpen}>
       <DialogContent className="sm:max-w-md">
          <DialogHeader>
             <DialogTitle>{myReview ? "Update Review" : "Write a Review"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
             <div className="space-y-2">
                <Label>Rating</Label>
                <div className="flex gap-1.5 flex-wrap">
                   {[...Array(10)].map((_, i) => {
                      const val = i + 1;
                      return (
                         <button key={val} onClick={() => setRating(val)} className={`h-8 w-8 rounded font-bold text-xs transition-all ${rating === val ? 'bg-primary text-white scale-110' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                            {val}
                         </button>
                      )
                   })}
                </div>
                <p className="text-xs text-slate-400 text-right w-full">10 = Excellent</p>
             </div>
             <div className="space-y-2">
                <Label>Your Experience</Label>
                <Textarea 
                   value={comment} onChange={(e) => setComment(e.target.value)} 
                   placeholder="Share details about your visit..." rows={4} 
                />
             </div>
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => setIsWriteOpen(false)}>Cancel</Button>
             <Button onClick={handleSubmitReview} disabled={loading}>{loading ? "Saving..." : "Post Review"}</Button>
          </DialogFooter>
       </DialogContent>
    </Dialog>

    {/* --- SUCCESS MODAL --- */}
    <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
               <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-xl text-center">Review Posted!</DialogTitle>
          </DialogHeader>
          <div className="text-center text-slate-500 py-2">
             Thank you for sharing your experience. Your review is now visible to others.
          </div>
          <DialogFooter className="sm:justify-center">
            <Button className="w-full sm:w-auto min-w-[120px]" onClick={() => setIsSuccessOpen(false)}>
              Okay
            </Button>
          </DialogFooter>
        </DialogContent>
    </Dialog>

    {/* --- DELETE CONFIRMATION MODAL --- */}
    <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
               <AlertTriangle className="h-5 w-5" />
               Delete Review?
            </DialogTitle>
          </DialogHeader>
          <div className="text-slate-500 py-2">
             Are you sure you want to delete your review? This action cannot be undone.
          </div>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button 
                variant="destructive" 
                onClick={handleDeleteReview} 
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
            >
                {loading ? "Deleting..." : "Delete Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}