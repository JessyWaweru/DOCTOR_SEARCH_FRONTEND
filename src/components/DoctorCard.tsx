import { Star, MapPin, Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  hospital: string;
  location: string;
  average_rating: number | null;
  review_count: number;
  image?: string;
}

interface DoctorCardProps {
  doctor: Doctor;
  onClick: () => void;
}

export default function DoctorCard({ doctor, onClick }: DoctorCardProps) {
  return (
    <Card 
      onClick={onClick}
      // ADDED: h-full flex flex-col (Forces card to fill height and organize vertically)
      className="h-full flex flex-col group cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border-slate-200 bg-white overflow-hidden relative"
    >
      {/* Bold Rating Badge (Top Right) */}
      <div className="absolute top-0 right-0 bg-slate-900 text-white px-4 py-2 rounded-bl-xl z-10 shadow-md">
         <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="font-bold text-lg">{doctor.average_rating?.toFixed(1) || 'N/A'}</span>
         </div>
      </div>

      <CardHeader className="pb-2 flex flex-row gap-4 items-center">
        <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarImage src={doctor.image} alt={doctor.name} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                {doctor.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
        </Avatar>
        <div>
            <Badge variant="secondary" className="mb-1 text-primary bg-primary/5 border-primary/10">
                {doctor.specialty}
            </Badge>
            <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">
                {doctor.name}
            </CardTitle>
        </div>
      </CardHeader>
      
      {/* ADDED: flex-1 (Pushes the footer to the bottom) */}
      <CardContent className="flex-1 space-y-2 text-sm text-slate-600">
         <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-slate-400" />
            <span className="truncate font-medium">{doctor.hospital}</span>
         </div>
         <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-400" />
            <span className="truncate">{doctor.location}</span>
         </div>
      </CardContent>

      <CardFooter className="pt-3 pb-3 bg-slate-50/50 border-t flex justify-between items-center text-xs font-medium text-slate-500">
         <span>{doctor.review_count} Reviews</span>
         <span className="text-primary group-hover:underline">View Profile &rarr;</span>
      </CardFooter>
    </Card>
  );
}