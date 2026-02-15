import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Search, Loader2 } from 'lucide-react'; // Removed Heart import
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Import Shared Components
import DoctorCard from '@/components/DoctorCard';
import DoctorDetails from '@/components/DoctorDetails';

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

export default function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch Doctors
  const fetchDoctors = async (query = '') => {
    try {
      setLoading(true);
      const res = await api.get(`/doctors/?search=${query}`);
      setDoctors(res.data);
    } catch (err) {
      console.error("Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => fetchDoctors(search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div className="min-h-screen  flex flex-col">
      {/* --- HEADER --- */}
      <div className="bg-white border-b sticky top-16 z-30 shadow-sm py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
             <div>
                <h1 className="text-2xl font-bold text-slate-900">Specialist Directory</h1>
                <p className="text-slate-500 text-sm">Find and book trusted doctors near you.</p>
             </div>
             
             <div className="relative w-full md:w-[400px]">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search by name, specialty, or hospital..." 
                  className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
          </div>
        </div>
      </div>

      {/* --- GRID --- */}
      <div className="container mx-auto px-4 py-8 flex-grow">
        {loading ? (
           <div className="flex justify-center py-20">
               <Loader2 className="h-8 w-8 animate-spin text-primary" />
           </div>
        ) : doctors.length === 0 ? (
           <div className="text-center py-20 text-slate-500">
              No doctors found matching "{search}".
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {doctors.map((doc) => (
               <div key={doc.id} className="relative group/card">
                  {/* Shared Doctor Card */}
                  <DoctorCard 
                    doctor={doc} 
                    onClick={() => setSelectedDoctor(doc)} 
                  />
                  
                  {/* REMOVED THE HEART BUTTON OVERLAY HERE */}
               </div>
            ))}
          </div>
        )}
      </div>

      {/* --- SHARED DETAILS MODAL --- */}
      <DoctorDetails 
         doctor={selectedDoctor} 
         isOpen={!!selectedDoctor} 
         onClose={() => setSelectedDoctor(null)} 
      />
    </div>
  );
}