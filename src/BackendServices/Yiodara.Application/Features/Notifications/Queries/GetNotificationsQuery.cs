using MediatR;
using Serilog;
using Yiodara.Application.Common;
using Yiodara.Application.DTOs;
using Yiodara.Application.Helpers;
using Yiodara.Application.Interfaces.Repositories;

namespace Yiodara.Application.Features.Notification.Query
{
    public class GetNotificationsQuery : PaginationRequest, IRequest<Result<List<GetNotificationsDto>>>
    {
        public bool? IsRead { get; set; }
    }

  

    public class GetNotificationsQueryHandler : IRequestHandler<GetNotificationsQuery, Result<List<GetNotificationsDto>>>
    {
        private readonly ILogger _logger;
        private readonly IGenericRepositoryAsync<Domain.Entities.Notification> _notificationRepository;

        public GetNotificationsQueryHandler(
            ILogger logger,
            IGenericRepositoryAsync<Domain.Entities.Notification> notificationRepository)
        {
            _logger = logger;
            _notificationRepository = notificationRepository;
        }

        public async Task<Result<List<GetNotificationsDto>>> Handle(GetNotificationsQuery request, CancellationToken cancellationToken)
        {
            var query = _notificationRepository.GetAllQuery().
                Where(x =>  !x.IsDeleted && (!request.IsRead.HasValue || request.IsRead == x.IsRead)
                && (!request.StartDate.HasValue || request.StartDate >= x.Created )
                && (!request.EndDate.HasValue || request.EndDate <= x.Created )
                && (!request.Id.HasValue || request.Id == x.Id )
                && (string.IsNullOrWhiteSpace(request.SearchText) || (x.Title + x.Message).ToLower().Contains(request.SearchText.ToLower().Trim()))
                ).Select(x => new GetNotificationsDto
                {
                    Message = x.Message, Title = x.Title, Id = x.Id, IsRead = x.IsRead,
                    Date = x.Created
                });

            var entityResult = await query.ToPaginatedResultAsync(request);
            return entityResult;


           
        }
    }
}