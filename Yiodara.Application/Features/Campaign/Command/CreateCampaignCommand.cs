using MediatR;
using Serilog;
using System.ComponentModel.DataAnnotations;
using Yiodara.Application.Common;
using Yiodara.Application.Interfaces.Repositories;

namespace Yiodara.Application.Features.Campaign.Command
{
    public class CreateCampaignCommand : IRequest<Result<Guid>>
    {
        [Required(ErrorMessage = "Title is required.")]
        [StringLength(20, ErrorMessage = "Name cannot be longer than 20 characters.")]

        public string? Title { get; set; }

        [Required(ErrorMessage = "Description is required.")]
        [StringLength(200, ErrorMessage = "Name cannot be longer than 200 characters.")]
        public string? Description { get; set; }

        [Required(ErrorMessage = "Category id is required.")]
        public Guid CampaignCatergoryId { get; set; }

        [Required(ErrorMessage = "Currency id is required.")]
        public string? Currency { get; set; }

        [Required(ErrorMessage = "Amount id is required.")]
        public double Amount { get; set; }

    }

    public class CreateCampaignCommandHandler : IRequestHandler<CreateCampaignCommand, Result<Guid>>
    {
        private readonly ILogger _logger;
        private readonly IGenericRepositoryAsync<Domain.Entities.Campaign> _campaignRepository;

        public CreateCampaignCommandHandler(
            ILogger logger,
            IGenericRepositoryAsync<Domain.Entities.Campaign> campaignRepository)
        {
            _logger = logger;
            _campaignRepository = campaignRepository;
        }

        public async Task<Result<Guid>> Handle(CreateCampaignCommand request, CancellationToken cancellationToken)
        {
            try
            {
                _logger.Information("Handling creating campaign handler");

                var validationResults = new List<ValidationResult>();
                var context = new ValidationContext(request);

                bool isValid = Validator.TryValidateObject(request, context, validationResults, true);

                if (!isValid)
                {
                    _logger.Warning("Validation failed for /creating campaign request: {ValidationResults}", validationResults);
                    return Result<Guid>.Failure("failed", validationResults);
                }



                var campaignExists = await _campaignRepository
                                   .IsUniqueAsync(x => x.Title.Trim().ToLower() == request.Title.Trim().ToLower() && !x.IsDeleted);

                if (campaignExists)
                {
                    return Result<Guid>.Failure("Campaign Already Exist.");
                }

                // Create a new campaign 
                var newCampaign = Domain.Entities.Campaign
                    .Create(request.Title, request.Description, 
                    request.CampaignCatergoryId, request.Currency, 
                    request.Amount); ;

                // Add the new campaign to the repository
                await _campaignRepository.AddAsync(newCampaign);
                return Result<Guid>.Success(newCampaign.Id);

            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error during creating campaign");
                return Result<Guid>.Failure($"An unexpected error occurred: {ex.Message}");
            }
        }
    }
}