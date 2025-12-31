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
      } else if (user.role === 'STAFF') {
        navigate('/staff/dashboard', { replace: true });
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
      // Backend response format (after interceptor):
      // { accessToken: "...", refreshToken: "...", tokenType: "Bearer" }
      const response = await authService.login(data);
      
      // Get token from accessToken field
      const token = response.accessToken || response.token;
      
      if (!token) {
        console.error('Login response structure:', JSON.stringify(response, null, 2));
        toast.error('Token alınamadı');
        return;
      }

      // Decode user info from JWT token
      const tokenUser = getUserFromToken(token);
      if (!tokenUser) {
        console.error('Token decode failed');
        toast.error('Kullanıcı bilgileri alınamadı');
        return;
      }

      // Create initial user object from token
      let fullUser: User = {
        id: tokenUser.id,
        email: tokenUser.email,
        fullName: data.email.split('@')[0], // Temporary, will be updated from API
        phone: '',
        role: tokenUser.role as 'CUSTOMER' | 'BUSINESS_OWNER' | 'STAFF',
        emailVerified: true, // Assume verified if token is issued
      };

      // Try to fetch full user details from API
      try {
        // Temporarily set token to fetch user
        localStorage.setItem('accessToken', token);
        const userResponse = await authService.getCurrentUser();
        // userResponse is already the User object (after interceptor)
        if (userResponse) {
          fullUser = userResponse;
        }
      } catch (error) {
        console.warn('Could not fetch user details, using token data:', error);
        // If fetching fails, use the user from token
      }

      // Set auth and redirect
      setAuth(fullUser, token);
      toast.success('Giriş başarılı!');
      
      // Use window.location for reliable navigation after auth state update
      setTimeout(() => {
        if (fullUser.role === 'BUSINESS_OWNER') {
          window.location.href = '/business/dashboard';
        } else if (fullUser.role === 'STAFF') {
          window.location.href = '/staff/dashboard';
        } else {
          window.location.href = '/dashboard';
        }
      }, 100);
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('Login error:', error);
        console.error('Error response:', error.response?.data);
      }
      
      // Handle network errors
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || error.code === 'ERR_CONNECTION_REFUSED') {
        toast.error('Sunucuya bağlanılamıyor. Lütfen backend sunucusunun çalıştığından emin olun.', {
          duration: 5000,
        });
        return;
      }
      
      // Handle other errors
      const errorMessage = error.message || 'Giriş başarısız';
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
      toast.error(error.message || 'Doğrulama e-postası gönderilemedi');
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


