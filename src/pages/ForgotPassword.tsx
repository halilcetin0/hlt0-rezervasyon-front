import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { Loader2, Mail } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Geçersiz e-posta adresi'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      const response = await authService.forgotPassword(data.email);
      if (response.success) {
        setEmailSent(true);
        toast.success('Şifre sıfırlama bağlantısı e-postanıza gönderildi!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Sıfırlama bağlantısı gönderilemedi');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">E-postanızı Kontrol Edin</CardTitle>
            <CardDescription className="text-center">
              Şifre sıfırlama bağlantısı gönderdik
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <Mail className="h-12 w-12 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              <strong>{getValues('email')}</strong> adresine şifre sıfırlama bağlantısı gönderdik.
              Lütfen gelen kutunuzu kontrol edin ve talimatları takip edin.
            </p>
            <Link to="/login">
              <Button className="w-full">Giriş Sayfasına Dön</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Şifremi Unuttum</CardTitle>
          <CardDescription className="text-center">
            E-posta adresinizi girin, size sıfırlama bağlantısı gönderelim
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

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                'Sıfırlama Bağlantısı Gönder'
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


