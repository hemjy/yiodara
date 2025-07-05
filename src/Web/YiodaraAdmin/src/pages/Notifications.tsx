import React, { useState } from 'react';
import { Bell, Heart, Users, Handshake, Check, X, MoreVertical, Filter } from 'lucide-react';

const initialNotifications = [
  {
    id: 1,
    type: 'donation',
    title: 'New Donation Received',
    message: 'John Smith donated $500 to your "Clean Water Initiative" campaign. Thank you for making a difference in our community!',
    time: 'Just Now',
    isNew: true,
    isRead: false,
    amount: '$500',
    donor: 'John Smith'
  },
  {
    id: 2,
    type: 'donation',
    title: 'Large Donation Alert',
    message: 'Anonymous donor contributed $2,000 to "Education for All" program. This brings us closer to our monthly goal!',
    time: '15 mins ago',
    isNew: true,
    isRead: false,
    amount: '$2,000',
    donor: 'Anonymous'
  },
  {
    id: 3,
    type: 'partnership',
    title: 'Partnership Opportunity',
    message: 'Green Earth Foundation wants to collaborate on environmental projects. They are interested in co-funding your next initiative.',
    time: '2 hours ago',
    isNew: false,
    isRead: false,
    organization: 'Green Earth Foundation'
  },
  {
    id: 4,
    type: 'volunteer',
    title: 'New Volunteer Registration',
    message: 'Sarah Johnson signed up to volunteer for your upcoming community cleanup event scheduled for this weekend.',
    time: '4 hours ago',
    isNew: false,
    isRead: true,
    volunteer: 'Sarah Johnson'
  },
  {
    id: 5,
    type: 'donation',
    title: 'Monthly Goal Achievement',
    message: 'Congratulations! You have reached 80% of your monthly donation goal. Keep up the great work!',
    time: '1 day ago',
    isNew: false,
    isRead: true,
    progress: '80%'
  },
];

const NotificationIcon = ({ type, isNew }) => {
  const getIcon = () => {
    switch (type) {
      case 'donation':
        return <Heart className="w-5 h-5 text-white" />;
      case 'volunteer':
        return <Users className="w-5 h-5 text-white" />;
      case 'partnership':
        return <Handshake className="w-5 h-5 text-white" />;
      default:
        return <Bell className="w-5 h-5 text-white" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'donation':
        return 'bg-[#BA24D5]';
      case 'volunteer':
        return 'bg-[#059669]';
      case 'partnership':
        return 'bg-[#DC6803]';
      default:
        return 'bg-[#6366F1]';
    }
  };

  return (
    <div className={`w-10 h-10 sm:w-12 sm:h-12 ${getBgColor()}  cursor-pointer rounded-full flex-shrink-0 flex items-center justify-center relative`}>
      {getIcon()}
      {isNew && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
      )}
    </div>
  );
};

const Notifications = () => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState('all'); // all, unread, donations, volunteers, partnerships
  const [showActions, setShowActions] = useState(null);

  const newNotificationCount = notifications.filter(n => n.isNew && !n.isRead).length;
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true, isNew: false }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ 
        ...notification, 
        isRead: true, 
        isNew: false 
      }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setShowActions(null);
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'donations':
        return notifications.filter(n => n.type === 'donation');
      case 'volunteers':
        return notifications.filter(n => n.type === 'volunteer');
      case 'partnerships':
        return notifications.filter(n => n.type === 'partnership');
      default:
        return notifications;
    }
  };

  const getTimeAgo = (timeString) => {
    // In a real app, you'd use a proper date library
    return timeString;
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
            {newNotificationCount > 0 && (
              <span className="bg-[#BA24D5] cursor-pointer text-white text-sm font-semibold px-3 py-1 rounded-full min-w-[24px] text-center">
                {newNotificationCount}
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
            { key: 'donations', label: 'Donations', count: notifications.filter(n => n.type === 'donation').length },
            { key: 'volunteers', label: 'Volunteers', count: notifications.filter(n => n.type === 'volunteer').length },
            { key: 'partnerships', label: 'Partnerships', count: notifications.filter(n => n.type === 'partnership').length },
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
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-500">
              {filter === 'all' ? "You're all caught up!" : `No ${filter} notifications found.`}
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
                <NotificationIcon type={notification.type} isNew={notification.isNew} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h2 className={`text-base sm:text-lg font-bold font-mulish leading-tight ${
                      !notification.isRead ? 'text-[#101828]' : 'text-[#374151]'
                    }`}>
                      {notification.title}
                    </h2>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs sm:text-sm font-mulish whitespace-nowrap ${
                        notification.isNew ? 'text-[#9F1AB1] font-semibold' : 'text-gray-500'
                      }`}>
                        {getTimeAgo(notification.time)}
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
                  
                  {/* Additional Info */}
                  {notification.amount && (
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="font-semibold text-[#059669]">Amount: {notification.amount}</span>
                      {notification.donor !== 'Anonymous' && (
                        <span className="text-gray-600">From: {notification.donor}</span>
                      )}
                    </div>
                  )}
                  
                  {notification.volunteer && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Volunteer: </span>{notification.volunteer}
                    </div>
                  )}
                  
                  {notification.organization && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Organization: </span>{notification.organization}
                    </div>
                  )}
                  
                  {notification.progress && (
                    <div className="text-sm">
                      <span className="font-medium text-[#059669]">Progress: </span>
                      <span className="text-gray-600">{notification.progress}</span>
                    </div>
                  )}
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