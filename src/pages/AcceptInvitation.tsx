import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { employeeService } from '@/services/employeeService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Davet kabul ediliyor...');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Geçersiz davet bağlantısı.');
      toast.error('Geçersiz davet bağlantısı.');
      return;
    }

    const acceptInvitation = async () => {
      try {
        const response = await employeeService.acceptInvitation(token);
        if (response.success) {
          setStatus('success');
          setMessage('Davet başarıyla kabul edildi! Giriş yapabilirsiniz.');
          toast.success('Davet başarıyla kabul edildi!');
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(response.message || 'Davet kabul edilemedi.');
          toast.error(response.message || 'Davet kabul edilemedi.');
        }
      } catch (error: any) {
        setStatus('error');
        const errorMessage = error.response?.data?.message || 'Davet kabul edilemedi.';
        setMessage(errorMessage);
        toast.error(errorMessage);
      }
    };

    acceptInvitation();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Davet Kabul Sayfası</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 py-8">
          {status === 'loading' && (
            <>
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <p className="text-muted-foreground text-center">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <p className="text-center text-muted-foreground">
                {message}
              </p>
              <Button onClick={() => navigate('/login')}>
                Giriş Sayfasına Git
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="h-12 w-12 text-destructive" />
              <p className="text-center text-muted-foreground">
                {message}
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

