import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { NotificationBell } from '@/components/NotificationBell';
import { appointmentService } from '@/services/appointmentService';
import { businessService } from '@/services/businessService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, MapPin, Search, Star, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { Appointment, Business } from '@/types';

export default function CustomerDashboard() {
  const [appointmentFilter, setAppointmentFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: appointmentsResponse, isLoading: appointmentsLoading, error: appointmentsError } = useQuery({
    queryKey: ['appointments', appointmentFilter],
    queryFn: async () => {
      try {
        return await appointmentService.getAppointments();
      } catch (error: any) {
        // Only log in development
        if (import.meta.env.DEV) {
          console.warn('Error fetching appointments:', error.response?.data || error.message);
        }
        // Return empty array on error - don't throw to prevent query failure
        return { 
          success: false, 
          data: [], 
          message: error.response?.data?.message || error.message || 'Failed to fetch appointments', 
          timestamp: new Date().toISOString() 
        };
      }
    },
    retry: false, // Don't retry on error to avoid spam
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const { data: businessesResponse, isLoading: businessesLoading, error: businessesError } = useQuery({
    queryKey: ['businesses', searchTerm],
    queryFn: async () => {
      try {
        return await businessService.getBusinesses({ name: searchTerm || undefined });
      } catch (error: any) {
        // Only log in development
        if (import.meta.env.DEV) {
          console.warn('Error fetching businesses:', error.response?.data || error.message);
        }
        // Return empty array on error - don't throw to prevent query failure
        return { 
          success: false, 
          data: [], 
          message: error.response?.data?.message || error.message || 'Failed to fetch businesses', 
          timestamp: new Date().toISOString() 
        };
      }
    },
    retry: false, // Don't retry on error to avoid spam
    staleTime: 30000,
    refetchOnWindowFocus: false,
    enabled: !!searchTerm || true, // Only fetch when there's a search term or always
  });

  const appointments = appointmentsResponse?.data || [];
  const businesses = businessesResponse?.data || [];

  const filteredAppointments = appointments.filter((apt: Appointment) => {
    const aptDate = new Date(apt.appointmentDate);
    const now = new Date();
    
    if (appointmentFilter === 'upcoming') {
      return aptDate >= now && apt.status !== 'CANCELLED';
    } else if (appointmentFilter === 'past') {
      return aptDate < now || apt.status === 'COMPLETED';
    }
    return true;
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Panelim</h1>
          <NotificationBell />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Appointments */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Randevularım</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant={appointmentFilter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAppointmentFilter('all')}
                    >
                      Tümü
                    </Button>
                    <Button
                      variant={appointmentFilter === 'upcoming' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAppointmentFilter('upcoming')}
                    >
                      Yaklaşan
                    </Button>
                    <Button
                      variant={appointmentFilter === 'past' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAppointmentFilter('past')}
                    >
                      Geçmiş
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {appointmentsLoading ? (
                  <p className="text-muted-foreground text-center py-8">Randevular yükleniyor...</p>
                ) : appointmentsError ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-2">
                      Randevular şu anda yüklenemiyor.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Lütfen daha sonra tekrar deneyin.
                    </p>
                  </div>
                ) : filteredAppointments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Randevu bulunamadı
                  </p>
                ) : (
                  <div className="space-y-4">
                    {filteredAppointments.map((appointment: Appointment) => (
                      <div
                        key={appointment.id}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-lg">
                              {appointment.service?.name || 'Service'}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {appointment.business?.name}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(appointment.appointmentDate), 'MMM d, yyyy')}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {format(new Date(appointment.appointmentDate), 'h:mm a')}
                              </div>
                              {appointment.employee && (
                                <span>with {appointment.employee.name}</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                appointment.status === 'CONFIRMED'
                                  ? 'bg-green-100 text-green-800'
                                  : appointment.status === 'PENDING'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : appointment.status === 'COMPLETED'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {appointment.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Browse Businesses */}
            <Card>
              <CardHeader>
                <CardTitle>İşletmeleri Keşfet</CardTitle>
                <CardDescription>Yeni işletmeleri arayın ve keşfedin</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="İşletme ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                {businessesLoading ? (
                  <p className="text-muted-foreground text-center py-8">İşletmeler yükleniyor...</p>
                ) : businessesError ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-2">
                      İşletmeler şu anda yüklenemiyor.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Lütfen daha sonra tekrar deneyin.
                    </p>
                  </div>
                ) : businesses.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    İşletme bulunamadı
                  </p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {businesses.slice(0, 4).map((business: Business) => (
                    <Link key={business.id} to={`/businesses/${business.id}`}>
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                          <CardTitle className="text-lg">{business.name}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {business.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{business.city}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                    ))}
                  </div>
                )}
                <div className="mt-4 text-center">
                  <Link to="/businesses">
                    <Button variant="outline">Tüm İşletmeleri Görüntüle</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Hızlı İşlemler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/businesses">
                  <Button variant="outline" className="w-full justify-start">
                    <Search className="mr-2 h-4 w-4" />
                    İşletme Bul
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start">
                  <Heart className="mr-2 h-4 w-4" />
                  Favorilerim
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Star className="mr-2 h-4 w-4" />
                  Yorumlarım
                </Button>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>İstatistikler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Toplam Randevu</p>
                  <p className="text-2xl font-bold">{appointments.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Yaklaşan</p>
                  <p className="text-2xl font-bold">
                    {appointments.filter(
                      (apt: Appointment) =>
                        new Date(apt.appointmentDate) >= new Date() &&
                        apt.status !== 'CANCELLED'
                    ).length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}


