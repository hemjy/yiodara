using Stripe.Forwarding;
using Yiodara.Application.Common;
using Yiodara.Application.Interfaces;
using Yiodara.Application.Interfaces.Repositories;

namespace Yiodara.Application.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IGenericRepositoryAsync<Domain.Entities.Notification> _notificationRepository;
        public NotificationService(IGenericRepositoryAsync<Domain.Entities.Notification> notificationRepository)
        {
            _notificationRepository = notificationRepository;
        }

        public async Task<Result<Guid>> SendNotification(string title, string message)
        {
            var NotificationExists = await _notificationRepository
                                 .IsUniqueAsync(x => x.Title.Trim().ToLower() == title.Trim().ToLower() && x.Message.Trim().ToLower() == message.Trim().ToLower() && !x.IsDeleted);

            if (NotificationExists)
            {
                return Result<Guid>.Failure("Notification Already Exist.");
            }
            // Create a new Notification 
            var newNotification = Domain.Entities.Notification
                .Create(title, message);


            // Add the new Notification to the repository
            await _notificationRepository.AddAsync(newNotification);
            return Result<Guid>.Success(newNotification.Id);

        }
    }
}
