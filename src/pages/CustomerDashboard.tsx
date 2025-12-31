import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { NotificationBell } from '@/components/NotificationBell';
import { appointmentService } from '@/services/appointmentService';
import { businessService } from '@/services/businessService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, MapPin, Search, Star, Heart, X, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Appointment, Business } from '@/types';
import toast from 'react-hot-toast';

export default function CustomerDashboard() {
  const [appointmentFilter, setAppointmentFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: appointments, isLoading: appointmentsLoading, error: appointmentsError } = useQuery({
    queryKey: ['appointments', appointmentFilter],
    queryFn: async () => {
      try {
        return await appointmentService.getAppointments();
      } catch (error: any) {
        // Only log in development
        if (import.meta.env.DEV) {
          console.warn('Error fetching appointments:', error.message);
        }
        // Return empty array on error - don't throw to prevent query failure
        return [];
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
        return [];
      }
    },
    retry: false, // Don't retry on error to avoid spam
    staleTime: 30000,
    refetchOnWindowFocus: false,
    enabled: !!searchTerm || true, // Only fetch when there's a search term or always
  });

  // Ensure appointments is always an array
  let appointmentsList: Appointment[] = [];
  if (Array.isArray(appointments)) {
    appointmentsList = appointments;
  } else if (appointments?.content && Array.isArray(appointments.content)) {
    appointmentsList = appointments.content;
  } else if (appointments?.data && Array.isArray(appointments.data)) {
    appointmentsList = appointments.data;
  }
  const businessesList = businesses || [];

  // Cancel appointment mutation
  const cancelMutation = useMutation({
    mutationFn: (appointmentId: string) => appointmentService.cancelAppointment(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Randevu başarıyla iptal edildi');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Randevu iptal edilemedi');
    },
  });

  const handleCancel = (appointmentId: string) => {
    if (confirm('Bu randevuyu iptal etmek istediğinizden emin misiniz?')) {
      cancelMutation.mutate(appointmentId);
    }
  };

  const filteredAppointments = appointmentsList.filter((apt: Appointment) => {
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
                                {format(new Date(appointment.appointmentDate), 'd MMMM yyyy', { locale: tr })}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {format(new Date(appointment.appointmentDate), 'HH:mm', { locale: tr })}
                              </div>
                              {appointment.employee && (
                                <span>ile {appointment.employee.name}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
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
                              {appointment.status === 'CONFIRMED' ? 'Onaylandı' :
                               appointment.status === 'PENDING' ? 'Beklemede' :
                               appointment.status === 'COMPLETED' ? 'Tamamlandı' :
                               'İptal Edildi'}
                            </span>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/appointments/${appointment.id}`)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Detay
                              </Button>
                              {(appointment.status === 'PENDING' || appointment.status === 'CONFIRMED') && 
                               new Date(appointment.appointmentDate) > new Date() && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleCancel(appointment.id)}
                                  disabled={cancelMutation.isPending}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  İptal Et
                                </Button>
                              )}
                            </div>
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
                ) : businessesList.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    İşletme bulunamadı
                  </p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {businessesList.slice(0, 4).map((business: Business) => (
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
                <Link to="/favorites">
                  <Button variant="outline" className="w-full justify-start">
                    <Heart className="mr-2 h-4 w-4" />
                    Favorilerim
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="outline" className="w-full justify-start">
                    <Star className="mr-2 h-4 w-4" />
                    Profilim
                  </Button>
                </Link>
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


