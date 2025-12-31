import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { userService } from '@/services/userService';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

const profileSchema = z.object({
  fullName: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  phone: z.string().min(10, 'Telefon numarası en az 10 karakter olmalıdır'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Mevcut şifre gereklidir'),
  newPassword: z.string().min(6, 'Yeni şifre en az 6 karakter olmalıdır'),
  confirmPassword: z.string().min(6, 'Şifre onayı gereklidir'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function UserProfile() {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const { data: profileResponse, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => userService.getProfile(),
    enabled: !!user,
  });

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      phone: user?.phone || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  // Update form when profile data loads
  if (profileResponse && !isLoading) {
    resetProfile({
      fullName: profileResponse.fullName,
      phone: profileResponse.phone,
    });
  }

  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormData) => userService.updateProfile(data),
    onSuccess: (response) => {
      updateUser(response.data);
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Profil başarıyla güncellendi!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Profil güncellenemedi');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      userService.changePassword(data),
    onSuccess: () => {
      resetPassword();
      setShowPasswordForm(false);
      toast.success('Şifre başarıyla değiştirildi!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Şifre değiştirilemedi');
    },
  });

  const onSubmitProfile = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const onSubmitPassword = (data: PasswordFormData) => {
    changePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-muted-foreground mt-2">Profil bilgileri yükleniyor...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Profil Ayarları</h1>

        {/* Profile Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Kişisel Bilgiler</CardTitle>
            <CardDescription>Profil bilgilerinizi güncelleyin</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
              <div>
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  E-posta adresi değiştirilemez
                </p>
              </div>

              <div>
                <Label htmlFor="fullName">Ad Soyad</Label>
                <Input
                  id="fullName"
                  {...registerProfile('fullName')}
                  placeholder="Adınız ve soyadınız"
                />
                {profileErrors.fullName && (
                  <p className="text-sm text-destructive mt-1">
                    {profileErrors.fullName.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  {...registerProfile('phone')}
                  placeholder="Telefon numaranız"
                />
                {profileErrors.phone && (
                  <p className="text-sm text-destructive mt-1">
                    {profileErrors.phone.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  'Kaydet'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle>Şifre Değiştir</CardTitle>
            <CardDescription>Hesap güvenliğiniz için şifrenizi düzenli olarak güncelleyin</CardDescription>
          </CardHeader>
          <CardContent>
            {!showPasswordForm ? (
              <Button
                variant="outline"
                onClick={() => setShowPasswordForm(true)}
              >
                Şifre Değiştir
              </Button>
            ) : (
              <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    {...registerPassword('currentPassword')}
                    placeholder="Mevcut şifrenizi girin"
                  />
                  {passwordErrors.currentPassword && (
                    <p className="text-sm text-destructive mt-1">
                      {passwordErrors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="newPassword">Yeni Şifre</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    {...registerPassword('newPassword')}
                    placeholder="Yeni şifrenizi girin"
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-sm text-destructive mt-1">
                      {passwordErrors.newPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...registerPassword('confirmPassword')}
                    placeholder="Yeni şifrenizi tekrar girin"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-sm text-destructive mt-1">
                      {passwordErrors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                  >
                    {changePasswordMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Değiştiriliyor...
                      </>
                    ) : (
                      'Şifreyi Değiştir'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowPasswordForm(false);
                      resetPassword();
                    }}
                  >
                    İptal
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

