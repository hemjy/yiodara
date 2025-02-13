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
    public class DeleteCampaignCommand : IRequest<Result<string>>
    {
        [Required(ErrorMessage = "Name is required.")]
        public Guid Id { get; set; }
    }

    public class DeleteCampaignCommandHandler : IRequestHandler<DeleteCampaignCommand, Result<string>>
    {
        private readonly ILogger _logger;
        private readonly IGenericRepositoryAsync<Domain.Entities.Campaign> _campaignRepository;

        public DeleteCampaignCommandHandler(
            ILogger logger,
            IGenericRepositoryAsync<Domain.Entities.Campaign> campaignRepository)
        {
            _logger = logger;
            _campaignRepository = campaignRepository;
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
                    return Result<string>.Failure("This category does not exist");
                }

                campaignToBeDeleted.IsDeleted = true;

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
