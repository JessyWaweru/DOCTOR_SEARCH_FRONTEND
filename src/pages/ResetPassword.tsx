import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  
  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/password-reset/confirm/', { 
        email, 
        otp, 
        new_password: newPassword 
      });
      // Redirect to login on success
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid code or request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <CardHeader className="text-center space-y-1">
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Set New Password</CardTitle>
          <CardDescription>
            Enter the code sent to your email and choose a new password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-50"
                placeholder="name@example.com"
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="otp">OTP Code</Label>
              <Input 
                id="otp"
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                className="text-center tracking-widest font-mono text-lg"
                placeholder="000000" 
                maxLength={6} 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  id="new-password"
                  type="password" 
                  className="pl-9"
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="••••••••"
                  required 
                />
              </div>
            </div>

            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? (
                 <>
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                 </>
              ) : (
                 <>
                   Reset Password <CheckCircle className="ml-2 h-4 w-4" />
                 </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}