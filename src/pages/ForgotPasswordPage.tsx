import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { CheckCircle } from 'lucide-react';
import { useAuthContext } from '@/providers/AuthProvider';
import { FirebaseError } from 'firebase/app';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const { resetPassword } = useAuthContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await resetPassword(email);
      setIsSubmitted(true);
    } catch (err) {
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case 'auth/invalid-email':
            setError('Invalid email address');
            break;
          case 'auth/user-not-found':
            setError('No account found with this email');
            break;
          default:
            setError('Failed to send reset email. Please try again.');
        }
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-2">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Reset your password</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a link to reset your password
            </CardDescription>
          </CardHeader>
          {!isSubmitted ? (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="p-3 text-sm bg-destructive/10 border border-destructive/20 text-destructive rounded-md">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send reset link'}
                </Button>
                <div className="text-center text-sm">
                  <Link to="/login" className="text-primary hover:underline">
                    Back to login
                  </Link>
                </div>
              </CardFooter>
            </form>
          ) : (
            <CardContent className="space-y-4 text-center">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <p className="text-lg font-medium">Check your email</p>
              <p className="text-muted-foreground">
                We've sent a password reset link to <span className="font-medium">{email}</span>
              </p>
              <div className="pt-4">
                <Link to="/login">
                  <Button variant="outline" className="w-full">
                    Back to login
                  </Button>
                </Link>
              </div>
            </CardContent>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
