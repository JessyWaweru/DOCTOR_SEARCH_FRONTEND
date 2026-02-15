import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, LogIn as LogInIcon, ArrowLeft } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    login: '',
    password: ''
  });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login/', {
        username: formData.login, 
        password: formData.password
      });

      login(res.data.access, res.data.refresh, {
          username: res.data.username,
          user_id: res.data.user_id
      });
      
      navigate('/');
    } catch (err: any) {
      setError("Invalid credentials. Please check your username/email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center  p-4 relative">
      
      {/* --- BACK TO HOME BUTTON --- */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 md:top-10 md:left-10 flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-semibold"
      >
         <div className="h-8 w-8 bg-white rounded-full shadow-sm flex items-center justify-center border border-slate-200">
            <ArrowLeft className="h-4 w-4" />
         </div>
         <span className="hidden md:inline">Back to Home</span>
      </Link>
      {/* --------------------------- */}

      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
        
        <div className="p-8 pb-6 text-center border-b border-slate-50 bg-slate-50/50">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <LogInIcon className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
          <p className="text-slate-500 text-sm mt-2">
            Sign in to access your saved doctors and profile.
          </p>
        </div>

        <div className="p-8 pt-6">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 border border-red-100 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="login">Username or Email</Label>
              <Input 
                id="login" 
                placeholder="Enter username or email" 
                required 
                value={formData.login} 
                onChange={handleChange} 
                className="bg-slate-50 focus:bg-white transition-colors h-11"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Link 
                  to="/forgot-password" 
                  className="text-xs font-medium text-primary hover:text-primary/80 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPass ? "text" : "password"} 
                  placeholder="••••••••" 
                  required 
                  value={formData.password} 
                  onChange={handleChange} 
                  className="pr-10 bg-slate-50 focus:bg-white transition-colors h-11"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Log In"}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm text-slate-500">
             Don't have an account?{" "}
             <Link to="/register" className="text-primary hover:text-primary/80 font-semibold hover:underline transition-all">
                 Sign up
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}