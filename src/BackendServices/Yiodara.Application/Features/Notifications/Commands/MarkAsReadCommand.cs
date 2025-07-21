
using MediatR;
using Serilog;
using Yiodara.Application.Common;
using Yiodara.Application.Interfaces.Repositories;

namespace Yiodara.Application.Features.Notification.Command
{


    public record MarkAsReadCommand(Guid Id) : IRequest<Result<Guid>>;
    

    public class MarkAsReadCommandHandler : IRequestHandler<MarkAsReadCommand, Result<Guid>>
    {
        private readonly ILogger _logger;
        private readonly IGenericRepositoryAsync<Domain.Entities.Notification> _notificationRepository;

        public MarkAsReadCommandHandler(
            ILogger logger,
            IGenericRepositoryAsync<Domain.Entities.Notification> notificationRepository)
        {
            _logger = logger;
            _notificationRepository = notificationRepository;
        }

        public async Task<Result<Guid>> Handle(MarkAsReadCommand request, CancellationToken cancellationToken)
        {
            var notification = await _notificationRepository.GetByIdAsync(request.Id);

            if (notification == null || notification.IsDeleted)
            {
                return Result<Guid>.Failure("Notification Not Found");
            }

            notification.IsRead = true;
            await _notificationRepository.UpdateAsync(notification);
            return Result<Guid>.Success(notification.Id);

        }
    }
}