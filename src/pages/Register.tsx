import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, AlertCircle, Loader2 } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    age: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/register/', formData);
      // Optional: Add a success toast here if you installed 'sonner' or 'toast'
      navigate('/login'); 
    } catch (err: any) {
      // Handle Django field errors (which come as objects) or generic errors
      const res = err.response?.data;
      if (typeof res === 'object' && res !== null) {
        // Grab the first error message from the first key
        const firstErrorKey = Object.keys(res)[0];
        const firstErrorMessage = Array.isArray(res[firstErrorKey]) 
          ? res[firstErrorKey][0] 
          : res[firstErrorKey];
        setError(`${firstErrorKey}: ${firstErrorMessage}`);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">Create Account</CardTitle>
          <CardDescription>
            Join DocRank to find and review the best specialists.
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
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  placeholder="johndoe" 
                  value={formData.username} 
                  onChange={handleChange} 
                  required 
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="john@example.com" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="age">Age (Optional)</Label>
                <Input 
                  id="age" 
                  type="number" 
                  placeholder="25" 
                  value={formData.age} 
                  onChange={handleChange} 
                />
            </div>
            
            <Button className="w-full mt-2" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...
                </>
              ) : (
                'Sign Up'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-6 bg-slate-50/50">
            <p className="text-sm text-slate-500">
                Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Log in</Link>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}