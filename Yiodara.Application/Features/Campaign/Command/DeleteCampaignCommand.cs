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
using Yiodara.Application.Interfaces.Cloudinary;
using Yiodara.Application.Interfaces.Repositories;
using Yiodara.Domain.Entities;

namespace Yiodara.Application.Features.Campaign.Command
{
    public class DeleteCampaignCommand : IRequest<Result<string>>
    {
        [Required(ErrorMessage = "Name is required.")]
        public Guid Id { get; set; }
    }

    public class DeleteCampaignCommandHandler : IRequestHandler<DeleteCampaignCommand, Result<string>>
    {
        private readonly ILogger _logger;
        private readonly IGenericRepositoryAsync<Domain.Entities.Campaign> _campaignRepository;
        private readonly ICloudinaryService _cloudinaryService;

        public DeleteCampaignCommandHandler(
            ILogger logger,
            IGenericRepositoryAsync<Domain.Entities.Campaign> campaignRepository,
            ICloudinaryService cloudinaryService)
        {
            _logger = logger;
            _campaignRepository = campaignRepository;
            _cloudinaryService = cloudinaryService;
        }

        public async Task<Result<string>> Handle(DeleteCampaignCommand request, CancellationToken cancellationToken)
        {
            try
            {

                _logger.Information("Handling deleting campaign handler");

                var validationResults = new List<ValidationResult>();
                var context = new ValidationContext(request);

                bool isValid = Validator.TryValidateObject(request, context, validationResults, true);

                if (!isValid)
                {
                    _logger.Warning("Validation failed for /deleting campaign category request: {ValidationResults}", validationResults);
                    return Result<string>.Failure("failed", validationResults);
                }

                var campaignToBeDeleted = await _campaignRepository.GetByAsync(t => t.Id == request.Id && !t.IsDeleted);

                if (campaignToBeDeleted == null)
                {
                    return Result<string>.Failure("This campaign does not exist");
                }

                if (!string.IsNullOrEmpty(campaignToBeDeleted.CoverImage))
                {
                    await _cloudinaryService.DeleteImageAsync(campaignToBeDeleted.CoverImage);
                }

                // Delete all other images from Cloudinary
                foreach (var imageUrl in campaignToBeDeleted.OtherImages)
                {
                    await _cloudinaryService.DeleteImageAsync(imageUrl);
                }


                campaignToBeDeleted.IsDeleted = true;
                campaignToBeDeleted.LastModified = DateTime.UtcNow;

                await _campaignRepository.UpdateAsync(campaignToBeDeleted, false);
                await _campaignRepository.SaveChangesAsync();

                return Result<string>.Success($"deleted sucessfully");

            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error during deleting campaign category");
                return Result<string>.Failure($"An unexpected error occurred: {ex.Message}");
            }
        }
    }
}
