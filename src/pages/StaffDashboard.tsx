import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { NotificationBell } from '@/components/NotificationBell';
import { appointmentService } from '@/services/appointmentService';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Appointment } from '@/types';
import toast from 'react-hot-toast';

export default function StaffDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get appointments for this employee
  const { data: appointmentsResponse, isLoading: appointmentsLoading, error: appointmentsError } = useQuery({
    queryKey: ['appointments', 'staff'],
    queryFn: async () => {
      try {
        return await appointmentService.getAppointments();
      } catch (error: any) {
        if (import.meta.env.DEV) {
          console.warn('Error fetching appointments:', error.response?.data || error.message);
        }
        return [];
      }
    },
    retry: false,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  // Ensure appointments is always an array
  let appointments: Appointment[] = [];
  if (Array.isArray(appointmentsResponse)) {
    appointments = appointmentsResponse;
  } else if (appointmentsResponse?.content && Array.isArray(appointmentsResponse.content)) {
    appointments = appointmentsResponse.content;
  } else if (appointmentsResponse?.data && Array.isArray(appointmentsResponse.data)) {
    appointments = appointmentsResponse.data;
  }
  
  // Filter appointments for this employee
  const myAppointments = appointments.filter(
    (apt: Appointment) => {
      const employeeId = apt.employeeId?.toString();
      const userId = user?.id?.toString();
      return employeeId === userId;
    }
  );

  // Approve/Reject mutations
  const approveMutation = useMutation({
    mutationFn: (appointmentId: string) => appointmentService.approveByEmployee(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Randevu onaylandı');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Randevu onaylanamadı');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (appointmentId: string) => appointmentService.rejectByEmployee(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Randevu reddedildi');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Randevu reddedilemedi');
    },
  });

  const handleApprove = (appointmentId: string) => {
    if (confirm('Bu randevuyu onaylamak istediğinizden emin misiniz?')) {
      approveMutation.mutate(appointmentId);
    }
  };

  const handleReject = (appointmentId: string) => {
    if (confirm('Bu randevuyu reddetmek istediğinizden emin misiniz?')) {
      rejectMutation.mutate(appointmentId);
    }
  };

  // Filter appointments
  const upcomingAppointments = myAppointments.filter(
    (apt: Appointment) => new Date(apt.appointmentDate) >= new Date() && apt.status !== 'CANCELLED'
  );

  const pastAppointments = myAppointments.filter(
    (apt: Appointment) => new Date(apt.appointmentDate) < new Date() || apt.status === 'COMPLETED'
  );

  const pendingAppointments = myAppointments.filter(
    (apt: Appointment) => apt.status === 'PENDING' && apt.employeeApproved === undefined
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Çalışan Paneli</h1>
          <NotificationBell />
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Randevu</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myAppointments.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Yaklaşan</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bekleyen Onay</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingAppointments.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Geçmiş</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pastAppointments.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Approvals */}
        {pendingAppointments.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Onay Bekleyen Randevular</CardTitle>
              <CardDescription>Bu randevuları onaylamanız veya reddetmeniz gerekiyor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingAppointments.map((appointment: Appointment) => (
                  <div
                    key={appointment.id}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-lg">{appointment.service?.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {appointment.business?.name}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Müşteri: {appointment.customer?.fullName || appointment.customer?.email}
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
                        </div>
                        {appointment.notes && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Not: {appointment.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApprove(appointment.id)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Onayla
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleReject(appointment.id)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reddet
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Appointments */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Yaklaşan Randevular</CardTitle>
            <CardDescription>Bugünden itibaren planlanmış randevularınız</CardDescription>
          </CardHeader>
          <CardContent>
            {appointmentsLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                <p className="text-muted-foreground mt-2">Randevular yükleniyor...</p>
              </div>
            ) : appointmentsError ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Randevular yüklenemedi</p>
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Yaklaşan randevu bulunamadı</p>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment: Appointment) => (
                  <div
                    key={appointment.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-lg">{appointment.service?.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {appointment.business?.name}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Müşteri: {appointment.customer?.fullName || appointment.customer?.email}
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
                        </div>
                        {appointment.notes && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Not: {appointment.notes}
                          </p>
                        )}
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
                          {appointment.status === 'CONFIRMED' ? 'Onaylandı' :
                           appointment.status === 'PENDING' ? 'Beklemede' :
                           appointment.status === 'COMPLETED' ? 'Tamamlandı' :
                           'İptal Edildi'}
                        </span>
                        {appointment.employeeApproved !== undefined && (
                          <div className="mt-1">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                appointment.employeeApproved
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {appointment.employeeApproved ? 'Onayladınız' : 'Reddettiniz'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Past Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Geçmiş Randevular</CardTitle>
            <CardDescription>Tamamlanmış veya geçmiş randevularınız</CardDescription>
          </CardHeader>
          <CardContent>
            {pastAppointments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Geçmiş randevu bulunamadı</p>
            ) : (
              <div className="space-y-4">
                {pastAppointments.slice(0, 10).map((appointment: Appointment) => (
                  <div
                    key={appointment.id}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{appointment.service?.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {appointment.business?.name} • {appointment.customer?.fullName || appointment.customer?.email}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(new Date(appointment.appointmentDate), 'd MMMM yyyy HH:mm', { locale: tr })}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          appointment.status === 'COMPLETED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {appointment.status === 'COMPLETED' ? 'Tamamlandı' : 'Geçmiş'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

