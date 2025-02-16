using MediatR;
using Serilog;
using System.ComponentModel.DataAnnotations;
using Yiodara.Application.Common;
using Yiodara.Application.Interfaces.Cloudinary;
using Yiodara.Application.Interfaces.Repositories;

namespace Yiodara.Application.Features.Campaign.Command
{
    public class CreateCampaignCommand : IRequest<Result<Guid>>
    {
        [Required(ErrorMessage = "Title is required.")]
        [StringLength(20, ErrorMessage = "Title cannot be longer than 20 characters.")]

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

        [Required(ErrorMessage = "Cover image is required.")]
        public string CoverImageBase64 { get; set; }

        public List<string> OtherImagesBase64 { get; set; } = new List<string>();

    }

    public class CreateCampaignCommandHandler : IRequestHandler<CreateCampaignCommand, Result<Guid>>
    {
        private readonly ILogger _logger;
        private readonly IGenericRepositoryAsync<Domain.Entities.Campaign> _campaignRepository;
        private readonly ICloudinaryService _cloudinaryService;

        public CreateCampaignCommandHandler(
            ILogger logger,
            IGenericRepositoryAsync<Domain.Entities.Campaign> campaignRepository,
            ICloudinaryService cloudinaryService)
        {
            _logger = logger;
            _campaignRepository = campaignRepository;
            _cloudinaryService = cloudinaryService;
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

                // Upload cover image
                string coverImageUrl = await _cloudinaryService.UploadBase64ImageAsync(request.CoverImageBase64);

                // Upload other images if any
                List<string> otherImageUrls = new List<string>();
                if (request.OtherImagesBase64?.Any() == true)
                {
                    otherImageUrls = await _cloudinaryService.UploadMultipleBase64ImagesAsync(request.OtherImagesBase64);
                }

                  // Create a new campaign 
                var newCampaign = Domain.Entities.Campaign
                    .Create(request.Title, request.Description,
                    request.CampaignCatergoryId, request.Currency,
                    request.Amount, coverImageUrl, otherImageUrls);


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