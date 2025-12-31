import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { appointmentService } from '@/services/appointmentService';
import { reviewService } from '@/services/reviewService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Star, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

export default function CreateReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [hoveredRating, setHoveredRating] = useState(0);

  const { data: appointmentResponse, isLoading } = useQuery({
    queryKey: ['appointment', id],
    queryFn: () => appointmentService.getAppointment(id!),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });

  const rating = watch('rating');

  const createMutation = useMutation({
    mutationFn: (data: ReviewFormData) => {
      if (!id) throw new Error('Appointment ID is required');
      return reviewService.createReview({
        appointmentId: id,
        rating: data.rating,
        comment: data.comment,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', id] });
      toast.success('Yorumunuz başarıyla eklendi!');
      navigate(`/appointments/${id}`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Yorum eklenemedi');
    },
  });

  const onSubmit = (data: ReviewFormData) => {
    if (data.rating === 0) {
      toast.error('Lütfen bir puan seçin');
      return;
    }
    createMutation.mutate(data);
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

  const appointment = appointmentResponse;

  if (!appointment || appointment.status !== 'COMPLETED') {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                Bu randevu için yorum yapılamaz.
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(`/appointments/${id}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Yorum Yap</CardTitle>
            <CardDescription>
              {appointment.business?.name} - {appointment.service?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="rating">Puan</Label>
                <div className="flex items-center gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setValue('rating', star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${
                          star <= (hoveredRating || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {errors.rating && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.rating.message}
                  </p>
                )}
                <input
                  type="hidden"
                  {...register('rating', { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label htmlFor="comment">Yorum (Opsiyonel)</Label>
                <textarea
                  id="comment"
                  {...register('comment')}
                  rows={5}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                  placeholder="Deneyiminizi paylaşın..."
                />
                {errors.comment && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.comment.message}
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || rating === 0}
                  className="flex-1"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Gönderiliyor...
                    </>
                  ) : (
                    'Yorumu Gönder'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/appointments/${id}`)}
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

