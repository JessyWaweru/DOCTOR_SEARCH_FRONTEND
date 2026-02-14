import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { MessageSquare, Star, Trash2, Edit, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Review {
  id: number;
  doctor: number;
  doctor_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function MyReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit State
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState(10);
  const [editComment, setEditComment] = useState('');

  // Fetch My Reviews
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reviews/?mine=true');
      setReviews(res.data);
    } catch (err) {
      console.error("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      await api.delete(`/reviews/${id}/`);
      setReviews(reviews.filter(r => r.id !== id));
    } catch (err) {
      alert("Failed to delete.");
    }
  };

  const openEdit = (review: Review) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleUpdate = async () => {
    if (!editingReview) return;
    try {
      await api.patch(`/reviews/${editingReview.id}/`, {
        rating: editRating,
        comment: editComment
      });
      setEditingReview(null);
      fetchReviews();
    } catch (err) {
      alert("Failed to update.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-full">
            <MessageSquare className="h-6 w-6 text-blue-600" />
          </div>
          My Reviews
        </h1>
        <p className="text-slate-500 mt-1">Manage all the feedback you've shared.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
           <MessageSquare className="h-12 w-12 text-slate-200 mx-auto mb-4" />
           <h3 className="text-lg font-semibold text-slate-900">No reviews yet</h3>
           <p className="text-slate-500 mb-6">You haven't written any reviews.</p>
           <Link to="/doctors"><Button>Find a Doctor to Review</Button></Link>
        </div>
      ) : (
        <div className="grid gap-4">
           {reviews.map(review => (
             <div key={review.id} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                   <div>
                      <h3 className="text-lg font-bold text-slate-900">{review.doctor_name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="font-normal text-slate-500">
                            {new Date(review.created_at).toLocaleDateString()}
                        </Badge>
                        {/* 10 STAR DISPLAY IN MY REVIEWS */}
                        <div className="flex items-center gap-0.5 ml-2">
                             {[...Array(10)].map((_, i) => (
                                <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-slate-200'}`} />
                             ))}
                        </div>
                        <span className="text-xs font-bold text-slate-600 ml-1">({review.rating}/10)</span>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(review)}>
                        <Edit className="h-4 w-4 text-slate-500" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(review.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                   </div>
                </div>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-lg text-sm italic">"{review.comment}"</p>
             </div>
           ))}
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={!!editingReview} onOpenChange={(open) => !open && setEditingReview(null)}>
        <DialogContent>
            <DialogHeader><DialogTitle>Edit Review</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label>Rating</Label>
                    <div className="flex gap-2 flex-wrap">
                        {[...Array(10)].map((_, i) => {
                            const val = i + 1;
                            return (
                                <button key={val} onClick={() => setEditRating(val)} className={`h-8 w-8 rounded font-bold text-xs ${editRating === val ? 'bg-primary text-white' : 'bg-slate-100'}`}>
                                    {val}
                                </button>
                            )
                        })}
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Comment</Label>
                    <Textarea value={editComment} onChange={(e) => setEditComment(e.target.value)} rows={4} />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={handleUpdate}>Update Review</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}