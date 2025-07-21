using Yiodara.Application.Common;

namespace Yiodara.Application.Interfaces
{
    public interface INotificationService
    {
        Task<Result<Guid>> SendNotification(string title, string message);
    }
}