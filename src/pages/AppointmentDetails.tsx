import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { appointmentService } from '@/services/appointmentService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, User, Building2, X, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Appointment } from '@/types';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function AppointmentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: appointmentResponse, isLoading, error } = useQuery({
    queryKey: ['appointment', id],
    queryFn: () => appointmentService.getAppointment(id!),
    enabled: !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: (appointmentId: string) => appointmentService.cancelAppointment(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', id] });
      toast.success('Randevu başarıyla iptal edildi');
      navigate('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Randevu iptal edilemedi');
    },
  });

  const handleCancel = () => {
    if (confirm('Bu randevuyu iptal etmek istediğinizden emin misiniz?')) {
      if (id) {
        cancelMutation.mutate(id);
      }
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-muted-foreground mt-2">Randevu bilgileri yükleniyor...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !appointmentResponse) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                Randevu bulunamadı veya yüklenirken bir hata oluştu.
              </p>
              <div className="text-center mt-4">
                <Button variant="outline" onClick={() => navigate('/dashboard')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard'a Dön
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const appointment: Appointment = appointmentResponse;

  const canCancel = 
    user?.role === 'CUSTOMER' && 
    (appointment.status === 'PENDING' || appointment.status === 'CONFIRMED') &&
    new Date(appointment.appointmentDate) > new Date();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{appointment.service?.name || 'Randevu Detayı'}</CardTitle>
                <CardDescription>
                  Randevu bilgileri ve durumu
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span className="font-medium">İşletme:</span>
                  <span>{appointment.business?.name}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium">Adres:</span>
                  <span>{appointment.business?.address}, {appointment.business?.city}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Tarih:</span>
                  <span>{format(new Date(appointment.appointmentDate), 'd MMMM yyyy', { locale: tr })}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Saat:</span>
                  <span>{format(new Date(appointment.appointmentDate), 'HH:mm', { locale: tr })}</span>
                </div>
                {appointment.employee && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span className="font-medium">Çalışan:</span>
                    <span>{appointment.employee.name}</span>
                    {appointment.employee.specialization && (
                      <span className="text-sm">({appointment.employee.specialization})</span>
                    )}
                  </div>
                )}
                <div className="pt-4 border-t">
                  <span
                    className={`px-3 py-1 rounded text-sm font-medium ${
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
                </div>
                {appointment.notes && (
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Notlar:</p>
                    <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                  </div>
                )}
                {user?.role === 'CUSTOMER' && appointment.customer && (
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Müşteri Bilgileri:</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.customer.fullName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.customer.email}
                    </p>
                    {appointment.customer.phone && (
                      <p className="text-sm text-muted-foreground">
                        {appointment.customer.phone}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Service Details */}
            {appointment.service && (
              <Card>
                <CardHeader>
                  <CardTitle>Hizmet Detayları</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">{appointment.service.name}</p>
                    {appointment.service.description && (
                      <p className="text-sm text-muted-foreground">
                        {appointment.service.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-4 text-sm">
                      <span className="text-muted-foreground">
                        Süre: {appointment.service.duration} dakika
                      </span>
                      <span className="text-muted-foreground">
                        Fiyat: ₺{appointment.service.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>İşlemler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {canCancel && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleCancel}
                    disabled={cancelMutation.isPending}
                  >
                    <X className="h-4 w-4 mr-2" />
                    {cancelMutation.isPending ? 'İptal Ediliyor...' : 'Randevuyu İptal Et'}
                  </Button>
                )}
                {user?.role === 'CUSTOMER' && appointment.status === 'COMPLETED' && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate(`/appointments/${id}/review`)}
                  >
                    Yorum Yap
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Approval Status */}
            {(appointment.ownerApproved !== undefined || appointment.employeeApproved !== undefined) && (
              <Card>
                <CardHeader>
                  <CardTitle>Onay Durumu</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {appointment.ownerApproved !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">İşletme Sahibi:</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          appointment.ownerApproved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {appointment.ownerApproved ? 'Onaylandı' : 'Reddedildi'}
                      </span>
                    </div>
                  )}
                  {appointment.employeeApproved !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Çalışan:</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          appointment.employeeApproved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {appointment.employeeApproved ? 'Onaylandı' : 'Reddedildi'}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

