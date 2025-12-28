import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { NotificationBell } from '@/components/NotificationBell';
import { appointmentService } from '@/services/appointmentService';
import { businessService } from '@/services/businessService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  Settings,
  Plus,
  Edit,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Appointment } from '@/types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function BusinessDashboard() {
  const navigate = useNavigate();
  const { data: appointmentsResponse, isLoading: appointmentsLoading, error: appointmentsError } = useQuery({
    queryKey: ['appointments'],
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

  const appointments = appointmentsResponse?.data || [];

  // Calculate stats
  const totalAppointments = appointments.length;
  const today = new Date();
  const todayAppointments = appointments.filter(
    (apt: Appointment) =>
      format(new Date(apt.appointmentDate), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
  ).length;

  const next7Days = appointments.filter(
    (apt: Appointment) => {
      const aptDate = new Date(apt.appointmentDate);
      const diffTime = aptDate.getTime() - today.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 7 && apt.status !== 'CANCELLED';
    }
  ).length;

  // Appointments by status
  const statusData = [
    { name: 'Onaylandı', value: appointments.filter((a: Appointment) => a.status === 'CONFIRMED').length },
    { name: 'Beklemede', value: appointments.filter((a: Appointment) => a.status === 'PENDING').length },
    { name: 'Tamamlandı', value: appointments.filter((a: Appointment) => a.status === 'COMPLETED').length },
    { name: 'İptal', value: appointments.filter((a: Appointment) => a.status === 'CANCELLED').length },
  ];

  // Last 7 days appointments
  const last7DaysData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = format(date, 'yyyy-MM-dd');
    const count = appointments.filter(
      (apt: Appointment) => format(new Date(apt.appointmentDate), 'yyyy-MM-dd') === dateStr
    ).length;
    return {
      date: format(date, 'MMM d'),
      appointments: count,
    };
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">İşletme Paneli</h1>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <Button>
              <Settings className="mr-2 h-4 w-4" />
              Ayarlar
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Randevu</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAppointments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bugünkü Randevular</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayAppointments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Yaklaşan (7 gün)</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{next7Days}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gelir</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₺{appointments
                  .filter((a: Appointment) => a.status === 'COMPLETED')
                  .reduce((sum: number, a: Appointment) => sum + (a.service?.price || 0), 0)
                  .toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Duruma Göre Randevular</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Son 7 Günün Randevuları</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={last7DaysData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="appointments" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Management Sections */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Hizmetler</CardTitle>
                <Button size="sm" onClick={() => navigate('/business/services')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Hizmet Ekle
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                İşletme hizmetlerinizi, fiyatlandırma ve sürelerini yönetin
              </p>
              <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/business/services')}>
                Hizmetleri Yönet
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Çalışanlar</CardTitle>
                <Button size="sm" onClick={() => navigate('/business/employees')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Çalışan Ekle
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ekip üyelerinizi ve çalışma saatlerini yönetin
              </p>
              <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/business/employees')}>
                Çalışanları Yönet
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>İşletme Profili</CardTitle>
                <Button size="sm" variant="outline" onClick={() => navigate('/business/profile')}>
                  <Edit className="h-4 w-4 mr-2" />
                  Düzenle
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                İşletme bilgilerinizi ve ayarlarınızı güncelleyin
              </p>
              <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/business/profile')}>
                Profili Düzenle
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Appointments */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Son Randevular</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.slice(0, 5).map((appointment: Appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{appointment.service?.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {appointment.customer?.fullName} • {format(new Date(appointment.appointmentDate), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
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
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}


