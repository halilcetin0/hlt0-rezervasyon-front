import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { businessService } from '@/services/businessService';
import { favoriteService } from '@/services/favoriteService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Clock, Star, Heart } from 'lucide-react';
import { BookingModal } from '@/components/BookingModal';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function BusinessDetails() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: businessResponse } = useQuery({
    queryKey: ['business', id],
    queryFn: () => businessService.getBusiness(id!),
    enabled: !!id,
  });

  const { data: isFavoriteResponse } = useQuery({
    queryKey: ['favorite', id],
    queryFn: () => favoriteService.isFavorite(id!),
    enabled: !!id && isAuthenticated && user?.role === 'CUSTOMER',
  });

  const addFavoriteMutation = useMutation({
    mutationFn: (businessId: string) => favoriteService.addFavorite(businessId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite', id] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success('Favorilere eklendi');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Favorilere eklenemedi');
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: (businessId: string) => favoriteService.removeFavorite(businessId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite', id] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success('Favorilerden kaldırıldı');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Favorilerden kaldırılamadı');
    },
  });

  const isFavorite = isFavoriteResponse || false;

  const handleToggleFavorite = () => {
    if (!isAuthenticated || user?.role !== 'CUSTOMER') {
      toast.error('Favorilere eklemek için giriş yapmalısınız');
      return;
    }
    if (id) {
      if (isFavorite) {
        removeFavoriteMutation.mutate(id);
      } else {
        addFavoriteMutation.mutate(id);
      }
    }
  };

  const { data: servicesResponse } = useQuery({
    queryKey: ['business', id, 'services'],
    queryFn: () => businessService.getBusinessServices(id!),
    enabled: !!id,
  });

  const { data: employeesResponse } = useQuery({
    queryKey: ['business', id, 'employees'],
    queryFn: () => businessService.getBusinessEmployees(id!),
    enabled: !!id,
  });

  const { data: reviewsResponse } = useQuery({
    queryKey: ['business', id, 'reviews'],
    queryFn: () => businessService.getBusinessReviews(id!),
    enabled: !!id,
  });

  const business = businessResponse;
  const services = servicesResponse || [];
  const employees = employeesResponse || [];
  const reviews = reviewsResponse || [];

  if (!business) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <p>Yükleniyor...</p>
        </div>
      </Layout>
    );
  }

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length
      : 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">{business.name}</CardTitle>
                <CardDescription>{business.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{business.address}, {business.city}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{business.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{business.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">
                    {averageRating.toFixed(1)} ({reviews.length} yorum)
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle>Hizmetler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {services.map((service: any) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{service.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {service.duration} minutes • ${service.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Employees */}
            <Card>
              <CardHeader>
                <CardTitle>Ekibimiz</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {employees.map((employee: any) => (
                    <div key={employee.id} className="p-4 border rounded-lg">
                      <h4 className="font-medium">{employee.name}</h4>
                      {employee.specialization && (
                        <p className="text-sm text-muted-foreground">
                          {employee.specialization}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Yorumlar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <p className="text-muted-foreground">Henüz yorum yok</p>
                  ) : (
                    reviews.map((review: any) => (
                      <div key={review.id} className="border-b pb-4 last:border-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium">
                            {review.customer?.fullName || 'Anonymous'}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Randevu Al</CardTitle>
              </CardHeader>
              <CardContent>
                <BookingModal businessId={business.id} />
              </CardContent>
            </Card>
            {isAuthenticated && user?.role === 'CUSTOMER' && (
              <Card>
                <CardContent className="pt-6">
                  <Button
                    variant={isFavorite ? 'default' : 'outline'}
                    className="w-full"
                    onClick={handleToggleFavorite}
                    disabled={addFavoriteMutation.isPending || removeFavoriteMutation.isPending}
                  >
                    <Heart
                      className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-current' : ''}`}
                    />
                    {isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}


