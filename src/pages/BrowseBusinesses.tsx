import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { businessService } from '@/services/businessService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MapPin, Building2 } from 'lucide-react';
import { Business } from '@/types';

export default function BrowseBusinesses() {
  const [searchTerm, setSearchTerm] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [businessType, setBusinessType] = useState('');

  const { data: businessesResponse, isLoading } = useQuery({
    queryKey: ['businesses', searchTerm, city, category, businessType],
    queryFn: () =>
      businessService.getBusinesses({
        name: searchTerm || undefined,
        city: city || undefined,
        category: category || undefined,
        businessType: businessType || undefined,
      }),
  });

  const businesses = businessesResponse || [];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">İşletmeleri Keşfet</h1>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Ara ve Filtrele</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="İsme göre ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Input
                  placeholder="Şehir"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Input
                  placeholder="Kategori"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Input
                  placeholder="İşletme Türü"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">İşletmeler yükleniyor...</p>
          </div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">İşletme bulunamadı</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business: Business) => (
              <Link key={business.id} to={`/businesses/${business.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Building2 className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle>{business.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {business.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{business.city}</span>
                      </div>
                      <div>
                        <span className="font-medium">Kategori: </span>
                        {business.category}
                      </div>
                      <div>
                        <span className="font-medium">Tür: </span>
                        {business.businessType}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}


