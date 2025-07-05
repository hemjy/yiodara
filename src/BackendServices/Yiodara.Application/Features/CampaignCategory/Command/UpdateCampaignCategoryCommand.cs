using MediatR;
using Serilog;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yiodara.Application.Common;
using Yiodara.Application.Features.CampaignCategory.Query;
using Yiodara.Application.Interfaces.Repositories;
using Yiodara.Domain.Entities;

namespace Yiodara.Application.Features.CampaignCategory.Command
{
    public class UpdateCampaignCategoryCommand : IRequest<Result<UpdateCampaignCategoryDto>>
    {
        [Required(ErrorMessage = "Name is required.")]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "Name is required.")]
        [StringLength(50, ErrorMessage = "Name cannot be longer than 50 characters.")]
        public string? Name { get; set; }
    }

    public class UpdateCampaignCategoryDto
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }
    }

    public class UpdateCampaignCategoryCommandHandler : IRequestHandler<UpdateCampaignCategoryCommand, Result<UpdateCampaignCategoryDto>>
    {
        private readonly ILogger _logger;
        private readonly IGenericRepositoryAsync<Domain.Entities.CampaignCategory> _campaignCategoryRepository;

        public UpdateCampaignCategoryCommandHandler(
            ILogger logger,
            IGenericRepositoryAsync<Domain.Entities.CampaignCategory> campaignCategoryRepository)
        {
            _logger = logger;
            _campaignCategoryRepository = campaignCategoryRepository;
        }

        public async Task<Result<UpdateCampaignCategoryDto>> Handle(UpdateCampaignCategoryCommand request, CancellationToken cancellationToken)
        {
            try
            {
                _logger.Information("Handling updating campaign category handler");

                var validationResults = new List<ValidationResult>();
                var context = new ValidationContext(request);

                bool isValid = Validator.TryValidateObject(request, context, validationResults, true);

                if (!isValid)
                {
                    _logger.Warning("Validation failed for /updating campaign category request: {ValidationResults}", validationResults);
                    return Result<UpdateCampaignCategoryDto>.Failure("failed", validationResults);
                }

                var campaignToBeEdited = await _campaignCategoryRepository.GetByAsync(t => t.Id == request.Id && !t.IsDeleted);

                if (campaignToBeEdited == null)
                {
                    return Result<UpdateCampaignCategoryDto>.Failure("This category does not exist");
                }

                if (!string.IsNullOrEmpty(request.Name))
                {
                    campaignToBeEdited.Name = request.Name;
                    campaignToBeEdited.LastModified = DateTime.UtcNow;
                }

                await _campaignCategoryRepository.UpdateAsync(campaignToBeEdited, false);

                await _campaignCategoryRepository.SaveChangesAsync();

                var campaignCategory = new UpdateCampaignCategoryDto
                {
                    Id = campaignToBeEdited.Id,
                    Name = campaignToBeEdited.Name
                };

                return Result<UpdateCampaignCategoryDto>.Success(campaignCategory, "Campaign updated sucessufully");
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error during updating campaign category");
                return Result<UpdateCampaignCategoryDto>.Failure($"An unexpected error occurred: {ex.Message}");
            }
        }
    }
}