import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (isAuthenticated && user) {
      // Kullanıcı giriş yapmışsa, rolüne göre dashboard'a yönlendir
      if (user.role === 'BUSINESS_OWNER') {
        navigate('/business/dashboard');
      } else if (user.role === 'STAFF') {
        navigate('/staff/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      // Giriş yapmamışsa ana sayfaya git
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link 
            to={
              isAuthenticated && user 
                ? user.role === 'BUSINESS_OWNER' 
                  ? '/business/dashboard' 
                  : user.role === 'STAFF'
                  ? '/staff/dashboard'
                  : '/dashboard'
                : '/'
            } 
            onClick={handleLogoClick}
            className="text-2xl font-bold text-primary cursor-pointer hover:opacity-80 transition-opacity"
          >
            RandevuYönetim
          </Link>
          
          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {user?.fullName || user?.email?.split('@')[0] || 'Kullanıcı'}
                </span>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Çıkış Yap
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Giriş Yap</Button>
                </Link>
                <Link to="/register">
                  <Button>Kayıt Ol</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}


