import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Search, Heart, Loader2, ArrowRight } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DoctorCard from '@/components/DoctorCard';
import DoctorDetails from '@/components/DoctorDetails';

// --- INTERFACE ---
interface Doctor {
  id: number;
  name: string;
  specialty: string;
  hospital: string;
  location: string;
  average_rating: number | null;
  review_count: number;
  image?: string;
  email: string;
  cell: string;
}

export default function SavedDoctors() {
   // We can use this to check status if needed
  
  // Initialize with empty arrays to prevent "undefined" errors
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // 1. Fetch Data
  const fetchSaved = async () => {
    try {
      setLoading(true);
      const res = await api.get('/saved-doctors/');
      
      // Safety check: Ensure res.data is an array
      if (Array.isArray(res.data)) {
          // Extract doctor_details, handling potential missing data
          const docs = res.data.map((item: any) => item.doctor_details).filter(Boolean);
          setDoctors(docs);
          setFilteredDoctors(docs);
      } else {
          setDoctors([]);
          setFilteredDoctors([]);
      }
    } catch (err) {
      console.error("Failed to fetch saved doctors", err);
      setDoctors([]);
      setFilteredDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  // 2. Filter Logic (Safe Dependency)
  useEffect(() => {
    const safeDoctors = doctors || []; // Fallback to empty array
    
    if (!search) {
      setFilteredDoctors(safeDoctors);
    } else {
      const lowerSearch = search.toLowerCase();
      const filtered = safeDoctors.filter(doc => 
        (doc?.name || '').toLowerCase().includes(lowerSearch) || 
        (doc?.specialty || '').toLowerCase().includes(lowerSearch) ||
        (doc?.hospital || '').toLowerCase().includes(lowerSearch)
      );
      setFilteredDoctors(filtered);
    }
  }, [search, doctors]);

  // 3. Handle Modal Close (Refresh list in case user unsaved a doctor)
  const handleCloseModal = () => {
    setSelectedDoctor(null);
    fetchSaved(); // Re-fetch to remove unsaved doctors from the list
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
             <div className="p-2 bg-red-50 rounded-full">
               <Heart className="h-6 w-6 text-red-500 fill-current" />
             </div>
             Saved Specialists
           </h1>
           <p className="text-slate-500 mt-1">Your shortlisted doctors for quick access.</p>
        </div>
        
        <div className="relative w-full md:w-96">
           <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
           <Input 
             placeholder="Search your saved list..." 
             className="pl-10 bg-white"
             value={search}
             onChange={(e) => setSearch(e.target.value)}
           />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (filteredDoctors?.length || 0) === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
           <Heart className="h-12 w-12 text-slate-200 mx-auto mb-4" />
           <h3 className="text-lg font-semibold text-slate-900">No saved doctors found</h3>
           <p className="text-slate-500 mb-6">
             {search ? "Try adjusting your search terms." : "Go explore and save some specialists!"}
           </p>
           {!search && (
             <Link to="/doctors">
               <Button className="gap-2">
                 Find Doctors <ArrowRight className="h-4 w-4" />
               </Button>
             </Link>
           )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {filteredDoctors.map(doc => (
             <div key={doc.id} className="relative group/card">
                {/* Clean Card - No Buttons */}
                <DoctorCard 
                  doctor={doc} 
                  onClick={() => setSelectedDoctor(doc)} 
                />
             </div>
           ))}
        </div>
      )}

      {/* Details Modal */}
      <DoctorDetails 
         doctor={selectedDoctor} 
         isOpen={!!selectedDoctor} 
         onClose={handleCloseModal} 
      />
    </div>
  );
}