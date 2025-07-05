using MediatR;
using Microsoft.EntityFrameworkCore;
using Serilog;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yiodara.Application.Common;
using Yiodara.Application.Interfaces.Repositories;

namespace Yiodara.Application.Features.Event.Query
{
    public class GetEventByIdQuery : IRequest<Result<GetEventByIdDto>>
    {
        [Required(ErrorMessage = "Id is required.")]
        public Guid Id { get; set; }
    }

    public class GetEventByIdDto
    {
        public Guid Id { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Location { get; set; }
        public DateTime EventDate { get; set; }
        public string EventTime { get; set; }
        public string? CoverImageUrl { get; set; }
        public List<string> OtherImageUrls { get; set; } = new List<string>();
    }

    public class GetEventByIdQueryHandler : IRequestHandler<GetEventByIdQuery, Result<GetEventByIdDto>>
    {
        private readonly ILogger _logger;
        private readonly IGenericRepositoryAsync<Domain.Entities.Event> _eventRepository;

        public GetEventByIdQueryHandler(
            ILogger logger,
            IGenericRepositoryAsync<Domain.Entities.Event> eventRepository)
        {
            _logger = logger;
            _eventRepository = eventRepository;
        }

        public async Task<Result<GetEventByIdDto>> Handle(GetEventByIdQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var eventEntity = await _eventRepository.GetAllQuery()
                    .FirstOrDefaultAsync(x => x.Id == request.Id && !x.IsDeleted, cancellationToken);

                if (eventEntity == null)
                {
                    return Result<GetEventByIdDto>.Failure($"Event with ID {request.Id} not found.");
                }

                var dto = new GetEventByIdDto
                {
                    Id = eventEntity.Id,
                    Title = eventEntity.Title,
                    Description = eventEntity.Description,
                    Location = eventEntity.Location,
                    EventDate = eventEntity.EventDate,
                    EventTime = eventEntity.EventTime,
                    CoverImageUrl = eventEntity.CoverImageUrl,
                    OtherImageUrls = eventEntity.OtherImageUrls
                };

                return Result<GetEventByIdDto>.Success(dto);
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error while getting event with ID {EventId}", request.Id);
                return Result<GetEventByIdDto>.Failure($"An unexpected error occurred: {ex.Message}");
            }
        }
    }
} 