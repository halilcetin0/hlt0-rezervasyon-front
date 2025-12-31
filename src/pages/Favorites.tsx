import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { favoriteService } from '@/services/favoriteService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Heart, Loader2 } from 'lucide-react';
import { Business } from '@/types';
import toast from 'react-hot-toast';

export default function Favorites() {
  const queryClient = useQueryClient();

  const { data: favoritesResponse, isLoading, error } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoriteService.getFavorites(),
  });

  const removeMutation = useMutation({
    mutationFn: (businessId: string) => favoriteService.removeFavorite(businessId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success('Favorilerden kaldırıldı');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Favorilerden kaldırılamadı');
    },
  });

  const handleRemove = (businessId: string) => {
    if (confirm('Bu işletmeyi favorilerden kaldırmak istediğinizden emin misiniz?')) {
      removeMutation.mutate(businessId);
    }
  };

  const favorites = favoritesResponse || [];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Favori İşletmelerim</h1>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-muted-foreground mt-2">Favoriler yükleniyor...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Favoriler yüklenemedi</p>
          </div>
        ) : favorites.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Henüz favori işletmeniz yok
              </p>
              <Link to="/businesses">
                <Button>İşletmeleri Keşfet</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((business: Business) => (
              <Card key={business.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{business.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(business.id)}
                      disabled={removeMutation.isPending}
                    >
                      <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                    </Button>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {business.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4" />
                    <span>{business.city}</span>
                  </div>
                  <Link to={`/businesses/${business.id}`}>
                    <Button variant="outline" className="w-full">
                      Detayları Gör
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

