import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';
import { getUserFromToken } from '@/lib/jwt';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { User } from '@/types';

const loginSchema = z.object({
  email: z.string().email('Geçersiz e-posta adresi'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [emailForResend, setEmailForResend] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'BUSINESS_OWNER') {
        navigate('/business/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      
      // Backend response format:
      // { success: true, message: "...", data: { accessToken: "...", refreshToken: "...", tokenType: "Bearer" }, timestamp: "..." }
      
      let token: string | null = null;
      let user: User | null = null;
      
      if (response.success && response.data) {
        // Get token from accessToken field
        token = response.data.accessToken || response.data.token;
        
        // If user info is in response, use it; otherwise decode from token
        if (response.data.user) {
          user = response.data.user;
        } else if (token) {
          // Decode user info from JWT token
          const tokenUser = getUserFromToken(token);
          if (tokenUser) {
            // Create User object from token data
            // Note: We need to fetch full user details or use token data
            // For now, we'll create a minimal user object
            user = {
              id: tokenUser.id,
              email: tokenUser.email,
              fullName: data.email.split('@')[0], // Temporary, should fetch from API
              phone: '', // Will be updated when we fetch user details
              role: tokenUser.role as 'CUSTOMER' | 'BUSINESS_OWNER' | 'STAFF',
              emailVerified: true, // Assume verified if token is issued
            };
          }
        }
      }
      
      if (token) {
        // Try to fetch full user details from API
        let fullUser = user;
        try {
          // Temporarily set token to fetch user
          localStorage.setItem('accessToken', token);
          const userResponse = await authService.getCurrentUser();
          if (userResponse.success && userResponse.data) {
            fullUser = userResponse.data;
          }
        } catch (error) {
          console.warn('Could not fetch user details, using token data:', error);
          // If fetching fails, use the user from token
        }

        // If we still don't have user, create from token
        if (!fullUser && token) {
          const tokenUser = getUserFromToken(token);
          if (tokenUser) {
            fullUser = {
              id: tokenUser.id,
              email: tokenUser.email,
              fullName: data.email.split('@')[0],
              phone: '',
              role: tokenUser.role as 'CUSTOMER' | 'BUSINESS_OWNER' | 'STAFF',
              emailVerified: true,
            };
          }
        }

        if (fullUser) {
          setAuth(fullUser, token);
          toast.success('Giriş başarılı!');
          
          // Use window.location for reliable navigation after auth state update
          setTimeout(() => {
            if (fullUser!.role === 'BUSINESS_OWNER') {
              window.location.href = '/business/dashboard';
            } else {
              window.location.href = '/dashboard';
            }
          }, 100);
        } else {
          console.error('Login response structure:', JSON.stringify(response, null, 2));
          toast.error('Kullanıcı bilgileri alınamadı');
        }
      } else {
        console.error('Login response structure:', JSON.stringify(response, null, 2));
        toast.error('Token alınamadı');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || error.message || 'Giriş başarısız';
      toast.error(errorMessage);
      
      if (errorMessage.toLowerCase().includes('not verified') || errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('doğrulanmamış')) {
        setShowResend(true);
        setEmailForResend(data.email);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await authService.resendVerification(emailForResend);
      toast.success('Doğrulama e-postası gönderildi!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Doğrulama e-postası gönderilemedi');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Giriş Yap</CardTitle>
          <CardDescription className="text-center">
            Hesabınıza erişmek için e-posta ve şifrenizi girin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@email.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            {showResend && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800 mb-2">
                  E-postanız doğrulanmamış. Lütfen gelen kutunuzu kontrol edin veya doğrulama e-postasını tekrar gönderin.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResendVerification}
                >
                  Doğrulama E-postasını Tekrar Gönder
                </Button>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Giriş yapılıyor...
                </>
              ) : (
                'Giriş Yap'
              )}
            </Button>

            <div className="text-center text-sm space-y-1">
              <Link
                to="/forgot-password"
                className="text-primary hover:underline"
              >
                Şifrenizi mi unuttunuz?
              </Link>
              <p className="text-muted-foreground">
                Hesabınız yok mu?{' '}
                <Link to="/register" className="text-primary hover:underline">
                  Kayıt Ol
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


