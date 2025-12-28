import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      toast.error('Geçersiz doğrulama bağlantısı');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await authService.verifyEmail(token);
        if (response.success) {
          setStatus('success');
          toast.success('E-posta başarıyla doğrulandı!');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } catch (error: any) {
        setStatus('error');
        toast.error(error.response?.data?.message || 'Doğrulama başarısız');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">E-posta Doğrulama</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 py-8">
          {status === 'loading' && (
            <>
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <p className="text-muted-foreground">E-postanız doğrulanıyor...</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <p className="text-center text-muted-foreground">
                E-postanız başarıyla doğrulandı!
              </p>
              <p className="text-sm text-muted-foreground">
                Giriş sayfasına yönlendiriliyorsunuz...
              </p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <XCircle className="h-12 w-12 text-destructive" />
              <p className="text-center text-muted-foreground">
                Doğrulama başarısız. Bağlantı geçersiz veya süresi dolmuş olabilir.
              </p>
              <Button onClick={() => navigate('/login')}>
                Giriş Sayfasına Git
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


