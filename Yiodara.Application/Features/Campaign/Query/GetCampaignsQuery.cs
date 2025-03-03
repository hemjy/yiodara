using MediatR;
using Microsoft.EntityFrameworkCore;
using Serilog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yiodara.Application.Common;
using Yiodara.Application.Features.CampaignCategory.Query;
using Yiodara.Application.Helpers;
using Yiodara.Application.Interfaces.Repositories;
using Yiodara.Domain.Entities;

namespace Yiodara.Application.Features.Campaign.Query
{
    public class GetCampaignsQuery : PaginationRequest, IRequest<Result<List<GetCampaignsDto>>>
    {
        public string? CategoryName { get; set; }
    }

    public class GetCampaignsDto
    {
        public Guid Id { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public CampaignCategoryDto? CampaignCategoryDto { get; set; }
        public string? Currency { get; set; }
        public double Amount { get; set; }
        public bool IsCompleted { get; set; } = false;

        public string? CoverImageBase64 { get; set; }

        public List<string> OtherImagesBase64 { get; set; } = new List<string>();

    }

    public class CampaignCategoryDto
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }
    }

    public class GetCampaignsQueryHandler : IRequestHandler<GetCampaignsQuery, Result<List<GetCampaignsDto>>>
    {
        private readonly ILogger _logger;
        private readonly IGenericRepositoryAsync<Domain.Entities.Campaign> _campaignRepository;

        public GetCampaignsQueryHandler(
            ILogger logger,
            IGenericRepositoryAsync<Domain.Entities.Campaign> campaignCategoryRepository)
        {
            _logger = logger;
            _campaignRepository = campaignCategoryRepository;
        }

        public async Task<Result<List<GetCampaignsDto>>> Handle(GetCampaignsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var query = _campaignRepository.GetAllQuery();

                query = query.Include(x => x.CampaignCategory)
                       .Where(x => !x.IsDeleted);

                if (!string.IsNullOrWhiteSpace(request.CategoryName))
                {
                    query = query.Where(x => x.CampaignCategory.Name != null &&
                                             x.CampaignCategory.Name.ToLower().Contains(request.CategoryName.ToLower()));
                }

                var entityResult = await query.ToPaginatedResultAsync(request);

                if (!entityResult.Succeeded)
                {
                    return Result<List<GetCampaignsDto>>.Failure(
                        entityResult.Message,
                        entityResult.Errors);
                }

                var dtos = entityResult.Data.Select(entity => new GetCampaignsDto
                {
                    Id = entity.Id,
                    Title = entity.Title,
                    Description = entity.Description,
                    Amount = entity.Amount,
                    Currency = entity.Currency,
                    IsCompleted = entity.IsCompleted,
                    CampaignCategoryDto = new CampaignCategoryDto
                    {
                        Id = entity.CampaignCategory.Id,
                        Name = entity.CampaignCategory.Name
                    },
                    CoverImageBase64 = entity.CoverImage,
                    OtherImagesBase64 = entity.OtherImages
                }).ToList();

                return Result<List<GetCampaignsDto>>.Success(
                    dtos,
                    entityResult.PageNumber ?? 1,
                    entityResult.PageSize ?? 10,
                    entityResult.Total ?? 0,
                    entityResult.Message);
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error during Geting campaign categories");
                return Result<List<GetCampaignsDto>>.Failure($"An unexpected error occurred: {ex.Message}");
            }
        }
    }
}