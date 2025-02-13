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

namespace Yiodara.Application.Features.Campaign.Command
{
    public class UpdateCampaignCommand : IRequest<Result<UpdateCampaignDto>>
    {
        [Required(ErrorMessage = "Id is required.")]
        public Guid Id { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public Guid CampaignCategoryId { get; set; }
        public string? Currency { get; set; }
        public double Amount { get; set; }
    }

    public class UpdateCampaignDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public Guid CampaignCategoryId { get; set; }
        public string? Currency { get; set; }
        public double Amount { get; set; }
    }

    public class UpdateCampaignCommandHandler : IRequestHandler<UpdateCampaignCommand, Result<UpdateCampaignDto>>
    {
        private readonly ILogger _logger;
        private readonly IGenericRepositoryAsync<Domain.Entities.Campaign> _campaignRepository;

        public UpdateCampaignCommandHandler(
            ILogger logger,
            IGenericRepositoryAsync<Domain.Entities.Campaign> campaignRepository)
        {
            _logger = logger;
            _campaignRepository = campaignRepository;
        }

        public async Task<Result<UpdateCampaignDto>> Handle(UpdateCampaignCommand request, CancellationToken cancellationToken)
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
                    return Result<UpdateCampaignDto>.Failure("failed", validationResults);
                }

                var campaignToBeEdited = await _campaignRepository.GetByAsync(t => t.Id == request.Id && !t.IsDeleted);

                if (campaignToBeEdited == null)
                {
                    return Result<UpdateCampaignDto>.Failure("This category does not exist");
                }

                campaignToBeEdited.Title = request.Title;
                campaignToBeEdited.Description = request.Description;
                campaignToBeEdited.Currency = request.Currency;
                campaignToBeEdited.Amount = request.Amount;
                campaignToBeEdited.CampaignCategoryId = request.CampaignCategoryId;
                campaignToBeEdited.LastModified = DateTime.UtcNow;

                await _campaignRepository.UpdateAsync(campaignToBeEdited, false);
                await _campaignRepository.SaveChangesAsync();

                var campaignCategory = new UpdateCampaignDto
                {
                    Title = campaignToBeEdited.Title,
                    Description = campaignToBeEdited.Description,
                    Amount = campaignToBeEdited.Amount,
                    CampaignCategoryId = campaignToBeEdited.CampaignCategoryId,
                    Currency = campaignToBeEdited.Currency
                };

                return Result<UpdateCampaignDto>.Success(campaignCategory, "Campaign updated sucessufully");
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error during updating campaign");
                return Result<UpdateCampaignDto>.Failure($"An unexpected error occurred: {ex.Message}");
            }
        }
    }
}