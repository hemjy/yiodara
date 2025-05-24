using MediatR;
using Microsoft.EntityFrameworkCore;
using Serilog;
using Yiodara.Application.Common;
using Yiodara.Application.Helpers;
using Yiodara.Application.Interfaces.Repositories;

namespace Yiodara.Application.Features.Partner.Query
{
    public class GetPartnersQuery : PaginationRequest, IRequest<Result<List<GetPartnersDto>>>
    {
        
    }

    public class GetPartnersDto
    {
        public Guid Id { get; set; }
        public string CompanyName { get; set; }
        public string CampaignName { get; set; }
        public string Industry { get; set; }
        public string SupportType { get; set; }
        public string CampaignCategory { get; set; }
        public string Email { get; set; }
        public DateTime DateCreated { get; set; }
    }

    public class GetPartnersQueryHandler : IRequestHandler<GetPartnersQuery, Result<List<GetPartnersDto>>>
    {
        private readonly ILogger _logger;
        private readonly IGenericRepositoryAsync<Domain.Entities.Partner> _partnerRepository;

        public GetPartnersQueryHandler(
            ILogger logger,
            IGenericRepositoryAsync<Domain.Entities.Partner> partnerRepository)
        {
            _logger = logger;
            _partnerRepository = partnerRepository;
        }

        public async Task<Result<List<GetPartnersDto>>> Handle(GetPartnersQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var query = _partnerRepository.GetAllQuery();

                query = query.Include(x => x.Campaign)
                       .ThenInclude(c => c.CampaignCategory)
                       .Where(x => !x.IsDeleted);

                var entityResult = await query.ToPaginatedResultAsync(request);

                if (!entityResult.Succeeded)
                {
                    return Result<List<GetPartnersDto>>.Failure(
                        entityResult.Message,
                        entityResult.Errors);
                }

                var dtos = entityResult.Data.Select(entity => new GetPartnersDto
                {
                    Id = entity.Id,
                    CompanyName = entity.CompanyName,
                    Industry = entity.Industry.ToString(),
                    SupportType = entity.SupportProvided.ToString(),
                    CampaignCategory = entity.Campaign.CampaignCategory.Name,
                    DateCreated = entity.Created,
                    CampaignName = entity.Campaign.Title ?? string.Empty,
                    Email = entity.EmailAddress
                }).ToList();

                return Result<List<GetPartnersDto>>.Success(
                    dtos,
                    entityResult.PageNumber ?? 1,
                    entityResult.PageSize ?? 10,
                    entityResult.Total ?? 0,
                    entityResult.Message);
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error getting partners list");
                return Result<List<GetPartnersDto>>.Failure($"An unexpected error occurred: {ex.Message}");
            }
        }
    }
}