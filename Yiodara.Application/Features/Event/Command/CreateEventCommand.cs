using MediatR;
using Serilog;
using System.ComponentModel.DataAnnotations;
using Yiodara.Application.Common;
using Yiodara.Application.Helpers;
using Yiodara.Application.Interfaces.Cloudinary;
using Yiodara.Application.Interfaces.Repositories;

namespace Yiodara.Application.Features.Event.Command
{
    public class CreateEventCommand : IRequest<Result<Guid>>
    {
        [Required]
        [StringLength(100, ErrorMessage = "Title cannot be longer than 100 characters.")]
        public string Title { get; set; }

        [Required]
        [StringLength(100, ErrorMessage = "Description cannot be longer than 100 characters.")]
        public string Description { get; set; }

        [Required]
        [StringLength(100, ErrorMessage = "Location cannot be longer than 100 characters.")]
        public string Location { get; set; }

        [Required]
        public DateTime EventDate { get; set; }

        [Required]
        [ValidTime(ErrorMessage = "Please provide a valid time in 12-hour format (e.g., 2:30 PM)")]
        public string EventTime { get; set; }

        [Required(ErrorMessage = "Cover image is required.")]
        public string CoverImageBase64 { get; set; }

        public List<string> OtherImagesBase64 { get; set; } = new List<string>();
    }

    public class CreateEventCommandHandler : IRequestHandler<CreateEventCommand, Result<Guid>>
    {
        private readonly ILogger _logger;
        private readonly IGenericRepositoryAsync<Domain.Entities.Event> _eventRepository;
        private readonly ICloudinaryService _cloudinaryService;

        public CreateEventCommandHandler(
            ILogger logger,
            IGenericRepositoryAsync<Domain.Entities.Event> eventRepository,
            ICloudinaryService cloudinaryService)
        {
            _logger = logger;
            _eventRepository = eventRepository;
            _cloudinaryService = cloudinaryService;
        }

        public async Task<Result<Guid>> Handle(CreateEventCommand request, CancellationToken cancellationToken)
        {
            try
            {
                _logger.Information("Handling create event command");

                var validationResults = new List<ValidationResult>();
                var validationContext = new ValidationContext(request);

                if (!Validator.TryValidateObject(request, validationContext, validationResults, true))
                {
                    _logger.Warning("Validation failed for create event request: {ValidationResults}", validationResults);
                    return Result<Guid>.Failure("Validation failed", validationResults);
                }

                if (request.EventDate < DateTime.UtcNow.Date)
                {
                    validationResults.Add(new ValidationResult("Event date cannot be in the past.", new[] { nameof(request.EventDate) }));
                }

                if (string.IsNullOrWhiteSpace(request.CoverImageBase64))
                {
                    validationResults.Add(new ValidationResult("Cover image is required.", new[] { nameof(request.CoverImageBase64) }));
                }

                if (validationResults.Any())
                {
                    _logger.Warning("Custom validation failed for create event request: {ValidationResults}", validationResults);
                    return Result<Guid>.Failure("Validation failed", validationResults);
                }

                // Check if event with same title already exists
                var eventExists = await _eventRepository
                    .IsUniqueAsync(x => x.Title.Trim().ToLower() == request.Title.Trim().ToLower() && !x.IsDeleted);

                if (eventExists)
                {
                    return Result<Guid>.Failure("Event with this title already exists.");
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

                // Create a new event
                var newEvent = Domain.Entities.Event.Create(
                    request.Title,
                    request.Description,
                    request.Location,
                    request.EventDate,
                    request.EventTime,
                    coverImageUrl,
                    otherImageUrls);

                // Add the new event to the repository
                await _eventRepository.AddAsync(newEvent);

                _logger.Information("Event created successfully with ID: {EventId}", newEvent.Id);
                return Result<Guid>.Success(newEvent.Id);
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error during event creation");
                return Result<Guid>.Failure($"An unexpected error occurred: {ex.Message}");
            }
        }
    }
}