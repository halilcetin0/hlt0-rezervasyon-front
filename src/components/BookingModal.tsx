import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { businessService } from '@/services/businessService';
import { appointmentService } from '@/services/appointmentService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format, addDays, startOfDay } from 'date-fns';
import toast from 'react-hot-toast';
import { Calendar, Clock, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BookingModalProps {
  businessId: string;
}

export function BookingModal({ businessId }: BookingModalProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  const { data: servicesResponse } = useQuery({
    queryKey: ['business', businessId, 'services'],
    queryFn: () => businessService.getBusinessServices(businessId),
  });

  const { data: employeesResponse } = useQuery({
    queryKey: ['business', businessId, 'employees'],
    queryFn: () => businessService.getBusinessEmployees(businessId),
  });

  const selectedServiceData = servicesResponse?.data?.find((s: any) => s.id === selectedService);
  const selectedEmployeeData = employeesResponse?.data?.find((e: any) => e.id === selectedEmployee);

  const { data: availableSlotsResponse, isLoading: loadingSlots } = useQuery({
    queryKey: ['available-slots', selectedEmployee, selectedDate, selectedServiceData?.duration],
    queryFn: () =>
      appointmentService.getAvailableSlots({
        employeeId: selectedEmployee,
        date: selectedDate,
        duration: selectedServiceData?.duration || 30,
      }),
    enabled: !!selectedEmployee && !!selectedDate && !!selectedServiceData,
  });

  const availableSlots = availableSlotsResponse?.data || [];

  const bookingMutation = useMutation({
    mutationFn: appointmentService.createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Randevu başarıyla alındı!');
      navigate('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Randevu alınamadı');
    },
  });

  const handleBook = () => {
    if (!isAuthenticated) {
      toast.error('Randevu almak için lütfen giriş yapın');
      navigate('/login');
      return;
    }

    if (!selectedService || !selectedEmployee || !selectedDate || !selectedTime) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    const appointmentDate = `${selectedDate}T${selectedTime}:00`;

    bookingMutation.mutate({
      businessId,
      serviceId: selectedService,
      employeeId: selectedEmployee,
      appointmentDate,
    });
  };

  const services = servicesResponse?.data || [];
  const employees = employeesResponse?.data || [];

  // Generate next 30 days for date selection
  const dates = Array.from({ length: 30 }, (_, i) => {
    const date = addDays(startOfDay(new Date()), i);
    return format(date, 'yyyy-MM-dd');
  });

  return (
    <div className="space-y-4">
      {!isAuthenticated && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 mb-2">
            Randevu almak için lütfen giriş yapın
          </p>
          <Button
            size="sm"
            onClick={() => navigate('/login')}
          >
            Giriş Yap
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {/* Service Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">Hizmet Seçin</label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={selectedService}
            onChange={(e) => {
              setSelectedService(e.target.value);
              setSelectedEmployee('');
              setSelectedDate('');
              setSelectedTime('');
            }}
          >
            <option value="">Bir hizmet seçin...</option>
            {services.map((service: any) => (
              <option key={service.id} value={service.id}>
                {service.name} - {service.duration}min - ${service.price}
              </option>
            ))}
          </select>
        </div>

        {/* Employee Selection */}
        {selectedService && (
          <div>
            <label className="text-sm font-medium mb-2 block">Çalışan Seçin</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={selectedEmployee}
              onChange={(e) => {
                setSelectedEmployee(e.target.value);
                setSelectedDate('');
                setSelectedTime('');
              }}
            >
              <option value="">Bir çalışan seçin...</option>
              {employees.map((employee: any) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Date Selection */}
        {selectedEmployee && (
          <div>
            <label className="text-sm font-medium mb-2 block">Tarih Seçin</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedTime('');
              }}
            >
              <option value="">Bir tarih seçin...</option>
              {dates.map((date) => (
                <option key={date} value={date}>
                  {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Time Slot Selection */}
        {selectedDate && (
          <div>
            <label className="text-sm font-medium mb-2 block">Saat Seçin</label>
            {loadingSlots ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : availableSlots.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                Bu tarih için müsait saat yok
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((slot: string) => (
                  <Button
                    key={slot}
                    variant={selectedTime === slot ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTime(slot)}
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Book Button */}
        {selectedTime && (
          <Button
            className="w-full"
            onClick={handleBook}
            disabled={bookingMutation.isPending}
          >
            {bookingMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Randevu alınıyor...
              </>
            ) : (
              'Randevu Al'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}


