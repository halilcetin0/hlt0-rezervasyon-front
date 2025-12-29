import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { businessService } from '@/services/businessService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';
import { Loader2, Building2 } from 'lucide-react';

const businessSchema = z.object({
  name: z.string().min(2, 'İşletme adı en az 2 karakter olmalıdır').max(255, 'İşletme adı en fazla 255 karakter olabilir'),
  description: z.string().max(5000, 'Açıklama en fazla 5000 karakter olabilir').optional(),
  category: z.string().min(1, 'Kategori zorunludur'),
  address: z.string().min(5, 'Adres en az 5 karakter olmalıdır').max(500, 'Adres en fazla 500 karakter olabilir'),
  city: z.string().min(1, 'Şehir zorunludur'),
  businessType: z.string().min(1, 'İşletme türü zorunludur'),
  phone: z.string()
    .min(10, 'Telefon en az 10 karakter olmalıdır')
    .max(20, 'Telefon en fazla 20 karakter olabilir')
    .regex(/^[\d\s\+\-\(\)]+$/, 'Geçersiz telefon numarası formatı'),
  email: z.string().email('Geçersiz e-posta adresi'),
  imageUrl: z.string().url('Geçersiz URL').optional().or(z.literal('')),
});

type BusinessFormData = z.infer<typeof businessSchema>;

const BUSINESS_TYPES = [
  { value: 'SALON', label: 'Güzellik Salonu' },
  { value: 'CLINIC', label: 'Klinik' },
  { value: 'STUDIO', label: 'Stüdyo' },
  { value: 'SPA', label: 'Spa' },
  { value: 'GYM', label: 'Spor Salonu' },
  { value: 'OTHER', label: 'Diğer' },
];

export function CreateBusinessForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
  });

  const createMutation = useMutation({
    mutationFn: (data: BusinessFormData) => businessService.createBusiness(data),
    onSuccess: async () => {
      toast.success('İşletme başarıyla oluşturuldu!');
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['my-business'] });
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      // Refetch the query and wait for it to complete
      await queryClient.refetchQueries({ queryKey: ['my-business'], exact: true });
      // Small delay to ensure query is updated in cache
      await new Promise(resolve => setTimeout(resolve, 100));
      // Navigate after refetch is complete
      navigate('/business/dashboard', { replace: true });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'İşletme oluşturulamadı';
      toast.error(errorMessage);
      
      // Handle validation errors
      if (error.response?.data?.data && typeof error.response.data.data === 'object') {
        const validationErrors = error.response.data.data;
        Object.keys(validationErrors).forEach((field) => {
          toast.error(`${field}: ${validationErrors[field]}`, { duration: 4000 });
        });
      }
    },
  });

  const onSubmit = (data: BusinessFormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Building2 className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">İşletmenizi Oluşturun</CardTitle>
          <CardDescription className="text-lg mt-2">
            Randevu sisteminizi kullanmaya başlamak için işletme bilgilerinizi girin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">İşletme Adı *</Label>
                <Input
                  id="name"
                  placeholder="Örn: Güzellik Salonu"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Kategori *</Label>
                <Input
                  id="category"
                  placeholder="Örn: Güzellik & Bakım"
                  {...register('category')}
                />
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
                <Input
                  id="city"
                  placeholder="Örn: İstanbul"
                  {...register('city')}
                />
                {errors.city && (
                  <p className="text-sm text-destructive">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Adres *</Label>
                <Input
                  id="address"
                  placeholder="Örn: Atatürk Caddesi No:123"
                  {...register('address')}
                />
                {errors.address && (
                  <p className="text-sm text-destructive">{errors.address.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefon *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Örn: +902121234567"
                  {...register('phone')}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-posta *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Örn: info@salon.com"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="imageUrl">Profil Resmi URL</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  {...register('imageUrl')}
                />
                {errors.imageUrl && (
                  <p className="text-sm text-destructive">{errors.imageUrl.message}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Açıklama</Label>
                <textarea
                  id="description"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="İşletmeniz hakkında bilgi verin..."
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                'İşletmeyi Oluştur'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

