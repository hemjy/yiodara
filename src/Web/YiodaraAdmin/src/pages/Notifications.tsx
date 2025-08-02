import React, { useState, useEffect } from 'react';
import { Bell, Check, X, MoreVertical, ServerCrash } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '@/hooks/useNotifications';
import { Skeleton } from '@/components/ui/skeleton';
import { Notification } from '@/types/api';

interface NotificationIconProps {
  isNew: boolean;
}

const NotificationIcon: React.FC<NotificationIconProps> = ({ isNew }) => {
  return (
    <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-[#6366F1] cursor-pointer rounded-full flex-shrink-0 flex items-center justify-center relative`}>
      <Bell className="w-5 h-5 text-white" />
      {isNew && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
      )}
    </div>
  );
};

const Notifications: React.FC = () => {
  const { data: fetchedNotifications, isLoading, error } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (fetchedNotifications?.data) {
      // Add a client-side 'isNew' flag for the notification dot animation
      const processed = fetchedNotifications.data.map((n: Notification) => ({ ...n, isNew: !n.isRead }));
      setNotifications(processed);
    }
  }, [fetchedNotifications]);

  const [filter, setFilter] = useState('all'); // all, unread
  const [showActions, setShowActions] = useState<string | null>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, isRead: true, isNew: false }
          : notification
      )
    );
    // TODO: Add API call to mark as read on the server
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({...notification, isRead: true, isNew: false }))
    );
    // TODO: Add API call to mark all as read
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setShowActions(null);
    // TODO: Add API call to delete notification
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      default:
        return notifications;
    }
  };

  const getTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return dateString; // Fallback to raw string if date is invalid
    }
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <div className="xl:max-w-4xl xl:mx-auto xl:p-4">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-raleway text-[#101828]">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="bg-[#BA24D5] cursor-pointer text-white text-sm font-semibold px-3 py-1 rounded-full min-w-[24px] text-center">
                {unreadCount}
              </span>
            )}
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 text-[#9F1AB1] hover:text-[#8f179f] font-medium text-sm sm:text-base transition-colors self-start sm:self-center"
            >
              <Check className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-4 border-b border-gray-200">
          {[
            { key: 'all', label: 'All', count: notifications.length },
            { key: 'unread', label: 'Unread', count: unreadCount },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`pb-3 px-1 text-sm sm:text-base font-medium border-b-2 transition-colors ${
                filter === tab.key
                  ? 'border-[#9F1AB1] text-[#9F1AB1]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label} {tab.count > 0 && `(${tab.count})`}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-start gap-3 sm:gap-4 p-4 bg-white rounded-lg shadow-sm">
              <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
              <div className="flex-grow space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))
        ) : error ? (
          <div className="text-center py-10 px-4 bg-white rounded-lg shadow-sm">
            <ServerCrash className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Failed to load notifications</h3>
            <p className="mt-1 text-sm text-gray-500">Something went wrong while fetching data. Please try again later.</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-500">
              {filter === 'all' ? "You're all caught up!" : `No unread notifications found.`}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white cursor-pointer p-4 sm:p-6 rounded-lg border transition-all duration-200 hover:shadow-md relative ${
                !notification.isRead
                  ? 'border-[#9F1AB1] bg-[#FEFAFF] shadow-sm'
                  : 'border-gray-200 hover:border-[#9F1AB1] hover:bg-[#FEFAFF]'
              }`}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <NotificationIcon isNew={!!notification.isNew} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h2 className={`text-base sm:text-lg font-bold font-mulish leading-tight ${
                      !notification.isRead ? 'text-[#101828]' : 'text-[#374151]'
                    }`}>
                      {notification.title}
                    </h2>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs sm:text-sm font-mulish whitespace-nowrap ${
                        !notification.isRead ? 'text-[#9F1AB1] font-semibold' : 'text-gray-500'
                      }`}>
                        {getTimeAgo(notification.date)}
                      </span>
                      
                      <div className="relative">
                        <button
                          onClick={() => setShowActions(showActions === notification.id ? null : notification.id)}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                        
                        {showActions === notification.id && (
                          <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                            {!notification.isRead && (
                              <button
                                onClick={() => {
                                  markAsRead(notification.id);
                                  setShowActions(null);
                                }}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Check className="w-4 h-4" />
                                Mark as read
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                            >
                              <X className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <p className={`text-sm font-mulish leading-relaxed mb-3 ${
                    !notification.isRead ? 'text-[#374151]' : 'text-[#6B7280]'
                  }`}>
                    {notification.message}
                  </p>
                </div>
              </div>
              
              {/* Unread indicator */}
              {!notification.isRead && (
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-[#9F1AB1] rounded-full"></div>
              )}
            </div>
          ))
        )}
      </div>
      
      {/* Load More Button (for pagination in real app) */}
      {filteredNotifications.length > 0 && (
        <div className="text-center mt-8">
          <button className="px-6 py-2 text-[#9F1AB1] border border-[#9F1AB1] rounded-lg hover:bg-[#FEFAFF] transition-colors font-medium">
            Load More Notifications
          </button>
        </div>
      )}
      
      {/* Click outside to close actions menu */}
      {showActions && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowActions(null)}
        />
      )}
    </div>
  );
};

export default Notifications;