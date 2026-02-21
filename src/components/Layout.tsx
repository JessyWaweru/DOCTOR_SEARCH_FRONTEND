import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen relative bg-slate-50 font-sans overflow-x-hidden selection:bg-primary/20">
       
       {/* --- 1. GLOBAL AMBIENT BACKGROUND --- */}
       {/* Fixed position ensures it stays in place while you scroll */}
       <div className="fixed inset-0 z-0 pointer-events-none">
          {/* Top Left Blob (Soft Blue) */}
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-100/50 rounded-full blur-[120px]" />
          
          {/* Bottom Right Blob (Soft Indigo) */}
          <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-100/40 rounded-full blur-[120px]" />
          
          {/* Center subtle highlight */}
          <div className="absolute top-[40%] left-[30%] w-[30vw] h-[30vw] bg-sky-50/60 rounded-full blur-[100px]" />
       </div>

       {/* --- 2. CONTENT WRAPPER --- */}
       {/* Z-10 ensures content sits ON TOP of the background blobs */}
       <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          
          <main className="flex-grow pt-16">
            {/* This is where Home, Doctors, Saved, etc. are rendered */}
            <Outlet />
          </main>

          {/* Optional: Footer to ground the page */}
          <footer className="py-6 text-center text-slate-400 text-sm border-t border-slate-200/60 bg-white/50 backdrop-blur-sm mt-auto">
            <p>© {new Date().getFullYear()} DocRank. All rights reserved.</p>
          </footer>
       </div>
    </div>
  );
}