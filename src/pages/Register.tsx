import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Loader2, Eye, EyeOff, CheckCircle2, Check, X, ArrowLeft 
} from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth(); // Auto-login function

  const [step, setStep] = useState(1); // 1 = Details, 2 = OTP
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [otp, setOtp] = useState('');
  
  // Visibility Toggles
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Validation State
  const [error, setError] = useState('');
  const [passStrength, setPassStrength] = useState({
    length: false,
    number: false,
    special: false,
    upper: false
  });

  // Handle Input Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));

    // Real-time Password Strength Check
    if (id === 'password') {
      setPassStrength({
        length: value.length >= 8,
        number: /\d/.test(value),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(value),
        upper: /[A-Z]/.test(value)
      });
    }
  };

  // Step 1: Validate & Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!passStrength.length || !passStrength.number || !passStrength.special || !passStrength.upper) {
      setError("Please ensure your password meets all requirements.");
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/register/', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      setStep(2); // Success -> Move to OTP
    } catch (err: any) {
      const msg = err.response?.data?.username?.[0] || 
                  err.response?.data?.email?.[0] || 
                  "Registration failed. Username or Email may be taken.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Auto-Login
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/verify-email/', {
        username: formData.username,
        otp
      });

      if (res.data.access && res.data.refresh) {
          login(res.data.access, res.data.refresh, {
              username: res.data.username,
              user_id: res.data.user_id
          });
          navigate('/'); 
      } else {
          navigate('/login');
      }

    } catch (err) {
      setError("Invalid code. Please check your email and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative">
      
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
        
        {/* Header */}
        <div className="p-8 pb-6 text-center border-b border-slate-50 bg-slate-50/50">
          <h1 className="text-2xl font-bold text-slate-900">
            {step === 1 ? "Create Account" : "Verify Email"}
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            {step === 1 
              ? "Join DocRank to find the best specialists." 
              : `We sent a 6-digit code to ${formData.email}`}
          </p>
        </div>

        <div className="p-8 pt-6">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 flex items-start gap-2 border border-red-100 animate-in fade-in slide-in-from-top-1">
              <X className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 ? (
            /* --- STEP 1: REGISTRATION FORM --- */
            <form onSubmit={handleRegister} className="space-y-5">
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  placeholder="johndoe" 
                  required 
                  value={formData.username} 
                  onChange={handleChange} 
                  className="bg-slate-50 focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  required 
                  value={formData.email} 
                  onChange={handleChange} 
                  className="bg-slate-50 focus:bg-white transition-colors"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPass ? "text" : "password"} 
                    placeholder="Create a strong password" 
                    required 
                    value={formData.password} 
                    onChange={handleChange} 
                    className="pr-10 bg-slate-50 focus:bg-white transition-colors"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* Password Strength Indicators */}
                {formData.password && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                     <StrengthItem label="8+ Characters" met={passStrength.length} />
                     <StrengthItem label="Number (0-9)" met={passStrength.number} />
                     <StrengthItem label="Special Char (!@#)" met={passStrength.special} />
                     <StrengthItem label="Uppercase (A-Z)" met={passStrength.upper} />
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input 
                    id="confirmPassword" 
                    type={showConfirm ? "text" : "password"} 
                    placeholder="Repeat password" 
                    required 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    className={`pr-10 bg-slate-50 focus:bg-white transition-colors ${
                       formData.confirmPassword && formData.password !== formData.confirmPassword 
                       ? "border-red-300 focus-visible:ring-red-200" 
                       : ""
                    }`}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign Up"}
              </Button>
            </form>
          ) : (
            /* --- STEP 2: OTP FORM --- */
            <form onSubmit={handleVerify} className="space-y-6">
               <div className="flex justify-center mb-6">
                 <div className="bg-green-50 p-4 rounded-full border border-green-100 shadow-sm animate-in zoom-in duration-300">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                 </div>
               </div>
               
               <div className="space-y-3">
                <Label htmlFor="otp" className="text-center block text-slate-600">Enter Verification Code</Label>
                <Input 
                    id="otp" 
                    className="text-center text-3xl font-mono tracking-[0.5em] h-14 border-slate-200 focus:border-primary focus:ring-primary/20" 
                    maxLength={6} 
                    required 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value)} 
                    placeholder="000000"
                />
              </div>

              <Button type="submit" className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg shadow-green-600/20" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify & Login"}
              </Button>

              <button 
                  onClick={() => setStep(1)} 
                  type="button" 
                  className="w-full text-sm text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1 py-2"
              >
                  <ArrowLeft className="h-3 w-3" /> Back to details
              </button>
            </form>
          )}

          {/* Footer Link */}
          {step === 1 && (
             <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:text-primary/80 font-semibold hover:underline transition-all">
                    Log in
                </Link>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper Component for Strength Checklist
function StrengthItem({ label, met }: { label: string, met: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium transition-colors duration-300 ${met ? "text-green-600" : "text-slate-400"}`}>
       {met ? <Check className="h-3 w-3" /> : <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />}
       {label}
    </div>
  );
}