import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { businessService } from '@/services/businessService';
import { serviceService } from '@/services/serviceService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { Service } from '@/types';

const serviceSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  description: z.string().optional(),
  duration: z.number().min(1, 'Süre en az 1 dakika olmalıdır'),
  price: z.number().min(0, 'Fiyat 0 veya daha büyük olmalıdır'),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

export default function ServiceManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editingService, setEditingService] = useState<Service | null>(null);
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

  // Get services
  const { data: servicesResponse, isLoading } = useQuery({
    queryKey: ['services', businessId],
    queryFn: () => serviceService.getServices(businessId),
    enabled: !!businessId,
  });

  const services = servicesResponse?.data || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      duration: 30,
      price: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: ServiceFormData) => serviceService.createService(businessId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services', businessId] });
      toast.success('Hizmet başarıyla eklendi');
      reset();
      setShowForm(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Hizmet eklenemedi');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ServiceFormData) =>
      serviceService.updateService(businessId, editingService!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services', businessId] });
      toast.success('Hizmet başarıyla güncellendi');
      reset();
      setEditingService(null);
      setShowForm(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Hizmet güncellenemedi');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (serviceId: string) => serviceService.deleteService(businessId, serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services', businessId] });
      toast.success('Hizmet başarıyla silindi');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Hizmet silinemedi');
    },
  });

  const onSubmit = (data: ServiceFormData) => {
    if (editingService) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    reset({
      name: service.name,
      description: service.description || '',
      duration: service.duration,
      price: service.price,
    });
    setShowForm(true);
  };

  const handleDelete = (serviceId: string) => {
    if (confirm('Bu hizmeti silmek istediğinize emin misiniz?')) {
      deleteMutation.mutate(serviceId);
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
            <h1 className="text-3xl font-bold">Hizmet Yönetimi</h1>
          </div>
          <Button onClick={() => {
            setEditingService(null);
            reset();
            setShowForm(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Hizmet
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingService ? 'Hizmet Düzenle' : 'Yeni Hizmet Ekle'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Hizmet Adı *</Label>
                    <Input id="name" {...register('name')} />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Süre (dakika) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      {...register('duration', { valueAsNumber: true })}
                    />
                    {errors.duration && (
                      <p className="text-sm text-destructive">{errors.duration.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Fiyat (₺) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      {...register('price', { valueAsNumber: true })}
                    />
                    {errors.price && (
                      <p className="text-sm text-destructive">{errors.price.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Açıklama</Label>
                    <Input id="description" {...register('description')} />
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
                      editingService ? 'Güncelle' : 'Ekle'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingService(null);
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
        ) : services.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Henüz hizmet eklenmemiş</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service: Service) => (
              <Card key={service.id}>
                <CardHeader>
                  <CardTitle>{service.name}</CardTitle>
                  {service.description && (
                    <CardDescription>{service.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm">
                      <span className="font-medium">Süre:</span> {service.duration} dakika
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Fiyat:</span> ₺{service.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(service)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Düzenle
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(service.id)}
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

