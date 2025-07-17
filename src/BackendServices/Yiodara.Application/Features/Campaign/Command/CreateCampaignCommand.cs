using MediatR;
using Serilog;
using System.ComponentModel.DataAnnotations;
using Yiodara.Application.Common;
using Yiodara.Application.Helpers;
using Yiodara.Application.Interfaces.Cloudinary;
using Yiodara.Application.Interfaces.Repositories;

namespace Yiodara.Application.Features.Campaign.Command
{
    public class CreateCampaignCommand : IRequest<Result<Guid>>
    {
        [Required]
        public string? OrganizationName { get; set; }

        public string? CompanyProfile { get; set; }

        [Required]
        [StringLength(100, ErrorMessage = "Title cannot be longer than 100 characters.")]
        public string? Title { get; set; }

        public string? Description { get; set; }

        public Guid CampaignCatergoryId { get; set; } = new Guid();

        public string? Currency { get; set; }

        public double Amount { get; set; }

        public string CoverImageBase64 { get; set; }
        public bool IsDraft { get; set; }
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

                if (request.IsDraft)
                {
                    // Only validate Title
                    var titleContext = new ValidationContext(request) { MemberName = nameof(request.Title) };
                    Validator.TryValidateProperty(request.Title, titleContext, validationResults);
                }
                else
                {
                    if (string.IsNullOrWhiteSpace(request.Description))
                        validationResults.Add(new ValidationResult("Description is required.", new[] { nameof(request.Description) }));

                    if (request.CampaignCatergoryId == Guid.Empty)
                        validationResults.Add(new ValidationResult("Category id is required.", new[] { nameof(request.CampaignCatergoryId) }));

                    if (string.IsNullOrWhiteSpace(request.Currency))
                        validationResults.Add(new ValidationResult("Currency is required.", new[] { nameof(request.Currency) }));

                    if (request.Amount <= 0)
                        validationResults.Add(new ValidationResult("Amount is required and must be greater than 0.", new[] { nameof(request.Amount) }));

                    if (string.IsNullOrWhiteSpace(request.CoverImageBase64))
                        validationResults.Add(new ValidationResult("Cover image is required.", new[] { nameof(request.CoverImageBase64) }));

                    ValidationHelper.ValidateBase64Document(request.CompanyProfile, nameof(request.CoverImageBase64), validationResults);
                }

                if (validationResults.Any())
                {
                    _logger.Warning("Validation failed for creating campaign request: {ValidationResults}", validationResults);
                    return Result<Guid>.Failure("failed", validationResults);
                }

                var campaignExists = await _campaignRepository
                                   .IsUniqueAsync(x => x.Title.Trim().ToLower() == request.Title.Trim().ToLower() && !x.IsDeleted);

                if (campaignExists)
                {
                    return Result<Guid>.Failure("Campaign Already Exist.");
                }

                string coverImageUrl = string.Empty;

                if (request.CoverImageBase64.IsNotEmpty())
                {
                    // Upload cover image
                    coverImageUrl = await _cloudinaryService.UploadBase64ImageAsync(request.CoverImageBase64);
                }

                // Upload other images if any
                List<string> otherImageUrls = new();

                if (request.OtherImagesBase64?.Any() == true)
                {
                    if (request.OtherImagesBase64[0].IsNotEmpty())
                    {
                        otherImageUrls = await _cloudinaryService.UploadMultipleBase64ImagesAsync(request.OtherImagesBase64);
                    }
                }

                string? documentUrl = null;

                if (request.CompanyProfile.IsNotEmpty())
                {
                    try
                    {
                        _logger.Information("Uploading company profile...");
                        documentUrl = await _cloudinaryService.UploadBase64DocumentAsync(request.CompanyProfile);
                    }
                    catch (Exception ex)
                    {
                        _logger.Error(ex, "Failed to upload supporting document.");
                        return Result<Guid>.Failure("Failed to upload supporting document. Please ensure the file is a valid base64-encoded document and less than 10MB.");
                    }
                }

                // Create a new campaign 
                var newCampaign = Domain.Entities.Campaign
                    .Create(request.Title, request.Description,
                    request.CampaignCatergoryId, request.Currency,
                    request.Amount, coverImageUrl, otherImageUrls, request.IsDraft,
                    documentUrl, request.OrganizationName);


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