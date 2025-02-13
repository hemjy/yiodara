using MediatR;
using Serilog;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yiodara.Application.Common;
using Yiodara.Application.Features.CampaignCategory.Command;
using Yiodara.Application.Interfaces.Repositories;
using Yiodara.Domain.Entities;

namespace Yiodara.Application.Features.CampaignCategory.Query
{
    public class GetCampaignCategoryQuery : IRequest<Result<GetCampaignCategoryDto>>
    {
        [Required(ErrorMessage = "Id is required.")]
        public Guid Id { get; set; }
    }

    public class GetCampaignCategoryDto
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }
    }

    public class GetCampaignCategoryQueryHandler : IRequestHandler<GetCampaignCategoryQuery, Result<GetCampaignCategoryDto>>
    {
        private readonly ILogger _logger;
        private readonly IGenericRepositoryAsync<Domain.Entities.CampaignCategory> _campaignCategoryRepository;

        public GetCampaignCategoryQueryHandler(
            ILogger logger,
            IGenericRepositoryAsync<Domain.Entities.CampaignCategory> campaignCategoryRepository)
        {
            _logger = logger;
            _campaignCategoryRepository = campaignCategoryRepository;
        }

        public async Task<Result<GetCampaignCategoryDto>> Handle(GetCampaignCategoryQuery request, CancellationToken cancellationToken)
        {
            try
            {
                _logger.Information("Handling creating campaign category handler");

                var validationResults = new List<ValidationResult>();
                var context = new ValidationContext(request);

                bool isValid = Validator.TryValidateObject(request, context, validationResults, true);

                if (!isValid)
                {
                    _logger.Warning("Validation failed for /getting campaign category request: {ValidationResults}", validationResults);
                    return Result<GetCampaignCategoryDto>.Failure("failed", validationResults);
                }

                var campaignExists = await _campaignCategoryRepository
                                    .GetByIdAsync(request.Id);

                if (campaignExists == null)
                {
                    return Result<GetCampaignCategoryDto>.Failure("Campaign Already Exist.");
                }

                var campaignCategory = new GetCampaignCategoryDto
                {
                    Id = campaignExists.Id,
                    Name = campaignExists.Name
                };

                return Result<GetCampaignCategoryDto>.Success(campaignCategory, "Campaign returned sucessufully");
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error during Geting campaign category");
                return Result<GetCampaignCategoryDto>.Failure($"An unexpected error occurred: {ex.Message}");
            }  
        }
    }
}