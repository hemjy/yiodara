using MediatR;
using Serilog;
using Yiodara.Application.Common;
using Yiodara.Application.Interfaces.Repositories;
using Yiodara.Domain.Entities;
using Yiodara.Application.Helpers;


namespace Yiodara.Application.Features.CampaignCategory.Query
{
    public class GetCampaignCategoriesQuery : PaginationRequest, IRequest<Result<List<GetCampaignCategoryDto>>>
    {
    }

    public class GetCampaignCategoriesQueryHandler : IRequestHandler<GetCampaignCategoriesQuery, Result<List<GetCampaignCategoryDto>>>
    {
        private readonly ILogger _logger;
        private readonly IGenericRepositoryAsync<Domain.Entities.CampaignCategory> _campaignCategoryRepository;

        public GetCampaignCategoriesQueryHandler(
            ILogger logger,
            IGenericRepositoryAsync<Domain.Entities.CampaignCategory> campaignCategoryRepository)
        {
            _logger = logger;
            _campaignCategoryRepository = campaignCategoryRepository;
        }

        public async Task<Result<List<GetCampaignCategoryDto>>> Handle(GetCampaignCategoriesQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var query = _campaignCategoryRepository.GetAllQuery();
                query = query.Where(x => !x.IsDeleted);

                var entityResult =  await query.ToPaginatedResultAsync(request);

                if (!entityResult.Succeeded)
                {
                    return Result<List<GetCampaignCategoryDto>>.Failure(
                        entityResult.Message,
                        entityResult.Errors);
                }

                var dtos = entityResult.Data.Select(entity => new GetCampaignCategoryDto
                {
                    Id = entity.Id,
                    Name = entity.Name
                }).ToList();

                return Result<List<GetCampaignCategoryDto>>.Success(
                    dtos,
                    entityResult.PageNumber ?? 1,
                    entityResult.PageSize ?? 10,
                    entityResult.Total ?? 0,
                    entityResult.Message);
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error during Geting campaign categories");
                return Result<List<GetCampaignCategoryDto>>.Failure($"An unexpected error occurred: {ex.Message}");
            }
        }
    }
}