import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { businessService } from '@/services/businessService';
import { employeeService } from '@/services/employeeService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, ArrowLeft, Loader2, Clock } from 'lucide-react';
import { Employee } from '@/types';

const employeeSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  email: z.string().email('Geçersiz e-posta adresi'),
  phone: z.string().optional(),
  specialization: z.string().optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

export default function EmployeeManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Get user's business
  const { data: businessResponse, isLoading: businessLoading } = useQuery({
    queryKey: ['my-business'],
    queryFn: async () => {
      try {
        const response = await businessService.getMyBusiness();
        return { hasBusiness: true, business: response.data };
      } catch (error: any) {
        // 404 means no business exists
        if (error.response?.status === 404) {
          return { hasBusiness: false, business: null };
        }
        throw error;
      }
    },
    enabled: !!user,
    retry: false,
  });

  const hasBusiness = businessResponse?.hasBusiness || false;
  const business = businessResponse?.business;
  const businessId = business?.id || '';

  if (businessLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-muted-foreground mt-2">Yükleniyor...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!hasBusiness || !businessId) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">İşletme bulunamadı. Lütfen önce işletme bilgilerinizi oluşturun.</p>
              <Button onClick={() => navigate('/business/dashboard')}>
                Dashboard'a Dön
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Get employees
  const { data: employeesResponse, isLoading } = useQuery({
    queryKey: ['employees', businessId],
    queryFn: () => employeeService.getEmployees(businessId),
    enabled: !!businessId,
  });

  const employees = employeesResponse?.data || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
  });

  const createMutation = useMutation({
    mutationFn: (data: EmployeeFormData) => employeeService.createEmployee(businessId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees', businessId] });
      toast.success('Çalışan başarıyla eklendi');
      reset();
      setShowForm(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Çalışan eklenemedi');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: EmployeeFormData) =>
      employeeService.updateEmployee(businessId, editingEmployee!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees', businessId] });
      toast.success('Çalışan başarıyla güncellendi');
      reset();
      setEditingEmployee(null);
      setShowForm(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Çalışan güncellenemedi');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (employeeId: string) => employeeService.deleteEmployee(businessId, employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees', businessId] });
      toast.success('Çalışan başarıyla silindi');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Çalışan silinemedi');
    },
  });

  const onSubmit = (data: EmployeeFormData) => {
    if (editingEmployee) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    reset({
      name: employee.name,
      email: employee.email,
      phone: employee.phone || '',
      specialization: employee.specialization || '',
    });
    setShowForm(true);
  };

  const handleDelete = (employeeId: string) => {
    if (confirm('Bu çalışanı silmek istediğinize emin misiniz?')) {
      deleteMutation.mutate(employeeId);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/business/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Geri
            </Button>
            <h1 className="text-3xl font-bold">Çalışan Yönetimi</h1>
          </div>
          <Button onClick={() => {
            setEditingEmployee(null);
            reset();
            setShowForm(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Çalışan
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingEmployee ? 'Çalışan Düzenle' : 'Yeni Çalışan Ekle'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Ad Soyad *</Label>
                    <Input id="name" {...register('name')} />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-posta *</Label>
                    <Input id="email" type="email" {...register('email')} />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input id="phone" type="tel" {...register('phone')} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialization">Uzmanlık</Label>
                    <Input id="specialization" {...register('specialization')} />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Kaydediliyor...
                      </>
                    ) : (
                      editingEmployee ? 'Güncelle' : 'Ekle'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingEmployee(null);
                      reset();
                    }}
                  >
                    İptal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-muted-foreground mt-2">Yükleniyor...</p>
          </div>
        ) : employees.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Henüz çalışan eklenmemiş</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((employee: Employee) => (
              <Card key={employee.id}>
                <CardHeader>
                  <CardTitle>{employee.name}</CardTitle>
                  {employee.specialization && (
                    <CardDescription>{employee.specialization}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm">
                      <span className="font-medium">E-posta:</span> {employee.email}
                    </p>
                    {employee.phone && (
                      <p className="text-sm">
                        <span className="font-medium">Telefon:</span> {employee.phone}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(employee)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Düzenle
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(employee.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Sil
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

