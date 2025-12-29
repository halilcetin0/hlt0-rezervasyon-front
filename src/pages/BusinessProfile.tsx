import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { businessService } from '@/services/businessService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Business } from '@/types';

const BUSINESS_TYPES = [
  { value: 'SALON', label: 'Güzellik Salonu' },
  { value: 'CLINIC', label: 'Klinik' },
  { value: 'STUDIO', label: 'Stüdyo' },
  { value: 'SPA', label: 'Spa' },
  { value: 'GYM', label: 'Spor Salonu' },
  { value: 'OTHER', label: 'Diğer' },
];

const businessSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  description: z.string().optional(),
  address: z.string().min(5, 'Adres en az 5 karakter olmalıdır'),
  city: z.string().min(2, 'Şehir en az 2 karakter olmalıdır'),
  category: z.string().min(2, 'Kategori en az 2 karakter olmalıdır'),
  businessType: z.string().min(2, 'İşletme türü en az 2 karakter olmalıdır'),
  phone: z.string().min(10, 'Telefon en az 10 karakter olmalıdır'),
  email: z.string().email('Geçersiz e-posta adresi'),
  imageUrl: z.string().url('Geçersiz URL').optional().or(z.literal('')),
});

type BusinessFormData = z.infer<typeof businessSchema>;

export default function BusinessProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get user's business
  const { data: businessResponse, isLoading } = useQuery({
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    values: business ? {
      name: business.name || '',
      description: business.description || '',
      address: business.address || '',
      city: business.city || '',
      category: business.category || '',
      businessType: business.businessType || '',
      phone: business.phone || '',
      email: business.email || '',
      imageUrl: business.imageUrl || '',
    } : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (data: BusinessFormData) => businessService.updateBusiness(String(business.id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-business'] });
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      toast.success('İşletme profili başarıyla güncellendi');
      navigate('/business/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Profil güncellenemedi');
    },
  });

  const onSubmit = (data: BusinessFormData) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
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

  if (!hasBusiness || !business) {
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/business/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
          <h1 className="text-3xl font-bold">İşletme Profili</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>İşletme Bilgilerini Düzenle</CardTitle>
            <CardDescription>
              İşletme bilgilerinizi güncelleyin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">İşletme Adı *</Label>
                  <Input id="name" {...register('name')} />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Kategori *</Label>
                  <Input id="category" {...register('category')} />
                  {errors.category && (
                    <p className="text-sm text-destructive">{errors.category.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessType">İşletme Türü *</Label>
                  <select
                    id="businessType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...register('businessType')}
                  >
                    <option value="">Seçiniz...</option>
                    {BUSINESS_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.businessType && (
                    <p className="text-sm text-destructive">{errors.businessType.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Şehir *</Label>
                  <Input id="city" {...register('city')} />
                  {errors.city && (
                    <p className="text-sm text-destructive">{errors.city.message}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Adres *</Label>
                  <Input id="address" {...register('address')} />
                  {errors.address && (
                    <p className="text-sm text-destructive">{errors.address.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon *</Label>
                  <Input id="phone" type="tel" {...register('phone')} />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-posta *</Label>
                  <Input id="email" type="email" {...register('email')} />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="imageUrl">Profil Resmi URL</Label>
                  <Input id="imageUrl" type="url" {...register('imageUrl')} />
                  {errors.imageUrl && (
                    <p className="text-sm text-destructive">{errors.imageUrl.message}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Açıklama</Label>
                  <textarea
                    id="description"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...register('description')}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    'Kaydet'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/business/dashboard')}
                >
                  İptal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

