import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, Activity, Users, Award, ArrowRight
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Import Components
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
  email: string;
  cell: string;
  image?: string;
}

export default function Home() {
  const { user,  isAuthenticated } = useAuth();
  
  const [topDoctors, setTopDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // Fetch only top 6 doctors
  const fetchTopDoctors = async () => {
    try {
      const res = await api.get(`/doctors/`);
      // Updated to 6 doctors
      setTopDoctors(res.data.slice(0, 6));
    } catch (err) {
      console.error("Failed to fetch doctors");
    }
  };

  useEffect(() => {
    fetchTopDoctors();
  }, []);

  return (
    <div className="min-h-screen  flex flex-col font-sans">
      

      {/* --- HERO SECTION (TOP) --- */}
      <div className="relative overflow-hidden border-b border-slate-100">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-primary/5 to-transparent rounded-full blur-3xl -z-10" />

        <div className="container mx-auto px-4 py-20 md:py-28 text-center relative z-10">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4">
             {isAuthenticated ? `Welcome back, ${user?.username}` : "Welcome to DocRank"} 👋
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            Find the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-500">Perfect Specialist</span> <br className="hidden md:block"/>
            For Your Needs.
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Real reviews from real patients. We bring transparency to healthcare by ranking doctors based on community trust and aggregated experiences.
          </p>

          <div className="flex justify-center gap-4">
            <Link to="/doctors">
              <Button size="lg" className="h-12 px-8 text-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                Browse Specialists <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* --- FEATURES SECTION (MIDDLE) --- */}
      <div className=" py-20 border-b border-slate-200">
        <div className="container mx-auto px-4">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900">Why DocRank?</h2>
                <p className="text-slate-500 mt-2">Built for patients, driven by data.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Feature 1 */}
                <Card className="border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 text-center py-6">
                    <CardHeader>
                        <div className="mx-auto w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 transform hover:scale-110 transition-transform">
                            <ShieldCheck className="h-7 w-7 text-blue-600" />
                        </div>
                        <CardTitle className="text-xl">100% Transparency</CardTitle>
                        <CardDescription className="text-base mt-2">
                            No paid promotions. Rankings are based purely on aggregated patient feedback.
                        </CardDescription>
                    </CardHeader>
                </Card>

                {/* Feature 2 */}
                <Card className="border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 text-center py-6">
                    <CardHeader>
                        <div className="mx-auto w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mb-4 transform hover:scale-110 transition-transform">
                            <Users className="h-7 w-7 text-teal-600" />
                        </div>
                        <CardTitle className="text-xl">Community Driven</CardTitle>
                        <CardDescription className="text-base mt-2">
                            Join thousands of verified patients sharing their authentic healthcare journeys.
                        </CardDescription>
                    </CardHeader>
                </Card>

                {/* Feature 3 */}
                <Card className="border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 text-center py-6">
                    <CardHeader>
                        <div className="mx-auto w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-4 transform hover:scale-110 transition-transform">
                            <Award className="h-7 w-7 text-amber-600" />
                        </div>
                        <CardTitle className="text-xl">Excellence Ranked</CardTitle>
                        <CardDescription className="text-base mt-2">
                            We highlight the best performing specialists in every field based on merit.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        </div>
      </div>

      {/* --- HOTTEST SPECIALISTS SECTION (BOTTOM) --- */}
      <main className="py-24">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
               <span className="h-px w-12 bg-slate-300"></span>
               <span className="text-primary font-bold uppercase tracking-wider text-sm">Top Rated</span>
               <span className="h-px w-12 bg-slate-300"></span>
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-2">Our Hottest Specialists</h2>
            <p className="text-slate-500 text-lg">The highest-rated doctors verified by our community.</p>
          </div>

          {/* Grid: 3 columns for 6 items looks best */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topDoctors.map((doc) => (
               <DoctorCard 
                 key={doc.id} 
                 doctor={doc} 
                 onClick={() => setSelectedDoctor(doc)} 
               />
            ))}
          </div>

          <div className="mt-16 text-center">
             <Link to="/doctors">
                <Button variant="default" size="lg" className="px-8 bg-slate-900 text-white hover:bg-slate-800">
                    View All Doctors
                </Button>
             </Link>
          </div>
        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className=" text-slate-300 py-12 text-center">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 mb-4 font-bold text-2xl text-white">
              <Activity className="h-6 w-6" /> DocRank
          </div>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">Connecting patients with trusted specialists through transparent, community-driven rankings.</p>
          <div className="text-sm text-slate-600 pt-8 border-t border-slate-800">
            © 2026 DocRank. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Details Modal */}
      <DoctorDetails 
         doctor={selectedDoctor} 
         isOpen={!!selectedDoctor} 
         onClose={() => setSelectedDoctor(null)} 
      />
    </div>
  );
}