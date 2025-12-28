import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { Loader2, CheckCircle2 } from 'lucide-react';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      toast.error('Geçersiz sıfırlama bağlantısı');
      navigate('/forgot-password');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const response = await authService.resetPassword(token, data.password);
      if (response.success) {
        setSuccess(true);
        toast.success('Şifre başarıyla sıfırlandı!');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Şifre sıfırlama başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Şifre Sıfırlama</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4 py-8">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <p className="text-center text-muted-foreground">
              Şifreniz başarıyla sıfırlandı!
            </p>
            <p className="text-sm text-muted-foreground">
              Giriş sayfasına yönlendiriliyorsunuz...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Şifre Sıfırla</CardTitle>
          <CardDescription className="text-center">
            Yeni şifrenizi girin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Yeni Şifre</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Şifreyi Onayla</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sıfırlanıyor...
                </>
              ) : (
                'Şifreyi Sıfırla'
              )}
            </Button>

            <div className="text-center text-sm">
              <Link to="/login" className="text-primary hover:underline">
                Giriş Sayfasına Dön
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


