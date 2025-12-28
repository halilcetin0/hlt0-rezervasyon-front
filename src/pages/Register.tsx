import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const registerSchema = z.object({
  fullName: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  email: z.string().email('Geçersiz e-posta adresi'),
  phone: z.string().min(10, 'Telefon numarası en az 10 karakter olmalıdır'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  role: z.enum(['CUSTOMER', 'BUSINESS_OWNER']),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'CUSTOMER',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await authService.register(data);
      if (response.success) {
        setShowSuccess(true);
        toast.success('Kayıt başarılı! Lütfen e-postanızı kontrol edin.');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Kayıt başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">E-postanızı Kontrol Edin</CardTitle>
            <CardDescription className="text-center">
              E-posta adresinize doğrulama bağlantısı gönderdik
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Lütfen gelen kutunuzu kontrol edin ve hesabınızı etkinleştirmek için doğrulama bağlantısına tıklayın.
            </p>
            <Button
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Giriş Sayfasına Git
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Hesap Oluştur</CardTitle>
          <CardDescription className="text-center">
            Hesabınızı oluşturmak için bilgilerinizi girin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Ad Soyad</Label>
              <Input
                id="fullName"
                placeholder="Ahmet Yılmaz"
                {...register('fullName')}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName.message}</p>
              )}
            </div>

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
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+905551234567"
                {...register('phone')}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
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

            <div className="space-y-2">
              <Label htmlFor="role">Hesap Türü</Label>
              <select
                id="role"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register('role')}
              >
                <option value="CUSTOMER">Müşteri</option>
                <option value="BUSINESS_OWNER">İşletme Sahibi</option>
              </select>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Hesap oluşturuluyor...
                </>
              ) : (
                'Kayıt Ol'
              )}
            </Button>

            <div className="text-center text-sm">
              <p className="text-muted-foreground">
                Zaten hesabınız var mı?{' '}
                <Link to="/login" className="text-primary hover:underline">
                  Giriş Yap
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


