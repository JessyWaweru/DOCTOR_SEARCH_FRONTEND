import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Loader2, Eye, EyeOff, Mail, ArrowLeft, KeyRound, CheckCircle2 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = Request, 2 = Confirm
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [successOpen, setSuccessOpen] = useState(false);

  // Form Data
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  // Visibility
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // STEP 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await api.post('/auth/password-reset/', { email });
      setStep(2);
      setMessage(`We sent a 6-digit code to ${email}`);
    } catch (err) {
      // Security practice: Don't reveal if email exists, just move to step 2
      setStep(2);
      setMessage(`If an account exists for ${email}, a code has been sent.`);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify & Reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/password-reset/confirm/', {
        email,
        otp,
        new_password: newPassword
      });
      
      // Open Success Modal instead of Alert
      setSuccessOpen(true);
      
    } catch (err: any) {
      setError("Invalid code or request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="p-8 pb-6 text-center border-b border-slate-50 bg-slate-50/50">
          <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            {step === 1 ? <Mail className="h-6 w-6 text-blue-600" /> : <KeyRound className="h-6 w-6 text-blue-600" />}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {step === 1 ? "Forgot Password?" : "Set New Password"}
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            {step === 1 
              ? "No worries, we'll send you reset instructions." 
              : message}
          </p>
        </div>

        <div className="p-8 pt-6">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 border border-red-100 text-center animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}

          {step === 1 ? (
            /* --- FORM 1: EMAIL REQUEST --- */
            <form onSubmit={handleRequestOtp} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter your email" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="h-11"
                />
              </div>
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Reset Code"}
              </Button>
            </form>
          ) : (
            /* --- FORM 2: OTP & NEW PASSWORD --- */
            <form onSubmit={handleResetPassword} className="space-y-5">
              
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input 
                  id="otp" 
                  placeholder="000000" 
                  className="text-center tracking-widest text-lg font-mono h-11 border-slate-200 focus:border-primary"
                  maxLength={6} 
                  required 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)} 
                />
              </div>

              {/* New Password Field */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input 
                    id="newPassword" 
                    type={showPass ? "text" : "password"} 
                    placeholder="Min 8 chars" 
                    required 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    className="pr-10 h-11"
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

              {/* Confirm Password Field (With Eye Icon) */}
              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input 
                    id="confirmNewPassword" 
                    type={showConfirm ? "text" : "password"} 
                    placeholder="Repeat password" 
                    required 
                    value={confirmNewPassword} 
                    onChange={(e) => setConfirmNewPassword(e.target.value)} 
                    className="pr-10 h-11"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-11 bg-green-600 hover:bg-green-700 font-semibold" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Reset Password"}
              </Button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
             <Link to="/login" className="text-slate-500 hover:text-slate-800 flex items-center justify-center gap-2 text-sm font-medium transition-colors">
                 <ArrowLeft className="h-4 w-4" /> Back to Log In
             </Link>
          </div>
        </div>
      </div>

      {/* --- SUCCESS MODAL --- */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
               <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-xl text-center">Password Reset Successful</DialogTitle>
            <DialogDescription className="text-center pt-2">
              Your password has been updated securely. You can now use your new password to log in.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center mt-4">
            <Button 
              className="w-full sm:w-auto min-w-[150px]" 
              onClick={() => navigate('/login')}
            >
              Go to Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}