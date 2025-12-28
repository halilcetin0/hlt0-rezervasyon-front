import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { notificationService } from '@/services/notificationService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();

  // Poll for unread count every 30 seconds
  const { data: unreadCountData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      try {
        const response = await notificationService.getUnreadCount();
        return response.data ?? 0;
      } catch (error: any) {
        // Only log in development, silently fail in production
        if (import.meta.env.DEV) {
          console.warn('Error fetching unread count:', error.response?.data || error.message);
        }
        return 0; // Return 0 on error
      }
    },
    refetchInterval: 30000,
    retry: false, // Don't retry to avoid spam
    refetchOnWindowFocus: false,
  });

  const { data: notificationsData } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        const response = await notificationService.getNotifications({ page: 0, size: 10 });
        return response.data ?? [];
      } catch (error: any) {
        // Only log in development, silently fail in production
        if (import.meta.env.DEV) {
          console.warn('Error fetching notifications:', error.response?.data || error.message);
        }
        return []; // Return empty array on error
      }
    },
    enabled: isOpen,
    retry: false, // Don't retry to avoid spam
    refetchOnWindowFocus: false,
  });

  const markAsReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      toast.success('Tüm bildirimler okundu olarak işaretlendi');
    },
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = unreadCountData || 0;
  const notifications = notificationsData || [];

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-5 w-5 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto z-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bildirimler</CardTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs"
              >
                Tümünü okundu işaretle
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Bildirim yok
              </p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border cursor-pointer hover:bg-accent ${
                    !notification.read ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="h-2 w-2 bg-primary rounded-full ml-2" />
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}


