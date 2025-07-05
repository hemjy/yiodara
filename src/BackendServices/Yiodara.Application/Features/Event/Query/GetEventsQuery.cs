using MediatR;
using Microsoft.EntityFrameworkCore;
using Serilog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yiodara.Application.Common;
using Yiodara.Application.Helpers;
using Yiodara.Application.Interfaces.Repositories;
using Yiodara.Domain.Entities;

namespace Yiodara.Application.Features.Event.Query
{
    public class GetEventsQuery : PaginationRequest, IRequest<Result<List<GetEventsDto>>>
    {
        public string? Title { get; set; }
        public DateTime? EventDate { get; set; }
    }

    public class GetEventsDto
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

    public class GetEventsQueryHandler : IRequestHandler<GetEventsQuery, Result<List<GetEventsDto>>>
    {
        private readonly ILogger _logger;
        private readonly IGenericRepositoryAsync<Domain.Entities.Event> _eventRepository;

        public GetEventsQueryHandler(
            ILogger logger,
            IGenericRepositoryAsync<Domain.Entities.Event> eventRepository)
        {
            _logger = logger;
            _eventRepository = eventRepository;
        }

        public async Task<Result<List<GetEventsDto>>> Handle(GetEventsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var query = _eventRepository.GetAllQuery();

                query = query.Where(x => !x.IsDeleted);

                // Apply manual filtering for specific event properties
                if (!string.IsNullOrWhiteSpace(request.Title))
                {
                    query = query.Where(x => x.Title != null &&
                                             x.Title.ToLower().Contains(request.Title.ToLower()));
                }

                if (request.EventDate.HasValue)
                {
                    query = query.Where(x => x.EventDate.Date == request.EventDate.Value.Date);
                }

                var entityResult = await query.ToPaginatedResultAsync(request);

                if (!entityResult.Succeeded)
                {
                    return Result<List<GetEventsDto>>.Failure(
                        entityResult.Message,
                        entityResult.Errors);
                }

                var dtos = entityResult.Data.Select(entity => new GetEventsDto
                {
                    Id = entity.Id,
                    Title = entity.Title,
                    Description = entity.Description,
                    Location = entity.Location,
                    EventDate = entity.EventDate,
                    EventTime = entity.EventTime,
                    CoverImageUrl = entity.CoverImageUrl,
                    OtherImageUrls = entity.OtherImageUrls
                }).ToList();

                return Result<List<GetEventsDto>>.Success(
                    dtos,
                    entityResult.PageNumber ?? 1,
                    entityResult.PageSize ?? 10,
                    entityResult.Total ?? 0,
                    entityResult.Message);
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error during getting events");
                return Result<List<GetEventsDto>>.Failure($"An unexpected error occurred: {ex.Message}");
            }
        }
    }
} 