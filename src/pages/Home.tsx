import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Users, Search } from 'lucide-react';

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Eğer kullanıcı giriş yapmışsa, dashboard'a yönlendir
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

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">
            Akıllı Randevu Yönetim Sistemi
          </h1>
          <p className="text-xl mb-8 text-blue-100">
            Randevularınızı kolayca alın. İşletmenizi verimli yönetin.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" variant="secondary">
                Başlayın
              </Button>
            </Link>
            <Link to="/businesses">
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600">
                İşletmeleri Keşfet
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Nasıl Çalışır?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Search className="h-12 w-12 text-primary mb-4" />
                <CardTitle>İşletmeleri Bul</CardTitle>
                <CardDescription>
                  Kategori, konum veya isme göre işletmeleri arayın ve keşfedin
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Calendar className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Randevu Al</CardTitle>
                <CardDescription>
                  Bir hizmet seçin, çalışan seçin ve zaman dilimi belirleyin
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Clock className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Takvimi Yönet</CardTitle>
                <CardDescription>
                  Tüm randevularınızı tek bir yerden görüntüleyin ve yönetin
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Özellikler</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Müşteriler İçin</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Kolay randevu alma</li>
                  <li>• İşletmeleri keşfetme ve arama</li>
                  <li>• Randevularınızı yönetme</li>
                  <li>• Hizmetleri değerlendirme ve yorum yapma</li>
                  <li>• Favori işletmeleri kaydetme</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Calendar className="h-8 w-8 text-primary mb-2" />
                <CardTitle>İşletme Sahipleri İçin</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Randevuları ve takvimi yönetme</li>
                  <li>• Gelir ve analitik takibi</li>
                  <li>• Hizmet ve çalışan yönetimi</li>
                  <li>• Müşteri yorumlarını görüntüleme</li>
                  <li>• Çalışma saatlerini belirleme</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}


