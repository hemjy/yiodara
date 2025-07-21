using FluentValidation;
using MediatR;
using Serilog;
using Yiodara.Application.Common;
using Yiodara.Application.Interfaces;
using Yiodara.Application.Interfaces.Repositories;

namespace Yiodara.Application.Features.Notification.Command
{
    public class CreateNotificationCommandValidator : AbstractValidator<CreateNotificationCommand>
    {
        public CreateNotificationCommandValidator()
        {
            RuleFor(x => x.Title).NotEmpty().WithMessage("{PropertyName} is required.");
            RuleFor(x => x.Message).NotEmpty().WithMessage("{PropertyName} is required.");

           
        }
    }

    public class CreateNotificationCommand : IRequest<Result<Guid>>
    {
        public string Title { get; set; }
        public string? Message { get; set; }

    }

    public class CreateNotificationCommandHandler : IRequestHandler<CreateNotificationCommand, Result<Guid>>
    {
        private readonly ILogger _logger;
        private readonly INotificationService _notificationService;

        public CreateNotificationCommandHandler(
            ILogger logger, INotificationService notificationService,
            INotificationService notificationRepository)
        {
            _logger = logger;
            _notificationService = notificationRepository;
        }

        public async Task<Result<Guid>> Handle(CreateNotificationCommand request, CancellationToken cancellationToken)
        {
            return await _notificationService.SendNotification(request.Title, request.Message);
        }
    }
}