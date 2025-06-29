using MediatR;
using Serilog;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yiodara.Application.Common;
using Yiodara.Application.Helpers;
using Yiodara.Application.Interfaces.Cloudinary;
using Yiodara.Application.Interfaces.Repositories;
using Yiodara.Domain.Entities;

namespace Yiodara.Application.Features.Event.Command
{
    public class UpdateEventCommand : IRequest<Result<UpdateEventDto>>
    {
        [Required(ErrorMessage = "Id is required.")]
        public Guid Id { get; set; }
        
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Location { get; set; }
        public DateTime? EventDate { get; set; }
        public string? EventTime { get; set; }
        public string? CoverImageBase64 { get; set; }
        public List<string>? OtherImagesBase64 { get; set; }
        public List<string> ImagesToDelete { get; set; } = new List<string>();
    }

    public class UpdateEventDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Location { get; set; }
        public DateTime EventDate { get; set; }
        public string EventTime { get; set; }
    }

    public class UpdateEventCommandHandler : IRequestHandler<UpdateEventCommand, Result<UpdateEventDto>>
    {
        private readonly ILogger _logger;
        private readonly IGenericRepositoryAsync<Domain.Entities.Event> _eventRepository;
        private readonly ICloudinaryService _cloudinaryService;

        public UpdateEventCommandHandler(
            ILogger logger,
            IGenericRepositoryAsync<Domain.Entities.Event> eventRepository,
            ICloudinaryService cloudinaryService)
        {
            _logger = logger;
            _eventRepository = eventRepository;
            _cloudinaryService = cloudinaryService;
        }

        public async Task<Result<UpdateEventDto>> Handle(UpdateEventCommand request, CancellationToken cancellationToken)
        {
            try
            {
                _logger.Information("Handling updating event handler");

                var validationResults = new List<ValidationResult>();
                var context = new ValidationContext(request);

                bool isValid = Validator.TryValidateObject(request, context, validationResults, true);

                if (!isValid)
                {
                    _logger.Warning("Validation failed for updating event request: {ValidationResults}", validationResults);
                    return Result<UpdateEventDto>.Failure("failed", validationResults);
                }

                // Validate event time if provided
                if (!string.IsNullOrWhiteSpace(request.EventTime))
                {
                    var timeValidationResults = new List<ValidationResult>();
                    var timeContext = new ValidationContext(request) { MemberName = nameof(request.EventTime) };
                    Validator.TryValidateProperty(request.EventTime, timeContext, timeValidationResults);
                    
                    if (timeValidationResults.Any())
                    {
                        _logger.Warning("Event time validation failed: {TimeValidationResults}", timeValidationResults);
                        return Result<UpdateEventDto>.Failure("Event time validation failed", timeValidationResults);
                    }
                }

                // Validate event date if provided
                if (request.EventDate.HasValue && request.EventDate.Value < DateTime.UtcNow.Date)
                {
                    validationResults.Add(new ValidationResult("Event date cannot be in the past.", new[] { nameof(request.EventDate) }));
                }

                if (validationResults.Any())
                {
                    _logger.Warning("Custom validation failed for updating event request: {ValidationResults}", validationResults);
                    return Result<UpdateEventDto>.Failure("Validation failed", validationResults);
                }

                var eventToBeEdited = await _eventRepository.GetByAsync(t => t.Id == request.Id && !t.IsDeleted);

                if (eventToBeEdited == null)
                {
                    return Result<UpdateEventDto>.Failure("This event does not exist");
                }

                // Update properties if provided
                eventToBeEdited.Title = request.Title.IsNotEmpty() ? request.Title.Trim() : eventToBeEdited.Title;
                eventToBeEdited.Description = request.Description.IsNotEmpty() ? request.Description.Trim() : eventToBeEdited.Description;
                eventToBeEdited.Location = request.Location.IsNotEmpty() ? request.Location.Trim() : eventToBeEdited.Location;
                eventToBeEdited.EventDate = request.EventDate ?? eventToBeEdited.EventDate;
                eventToBeEdited.EventTime = request.EventTime.IsNotEmpty() ? request.EventTime : eventToBeEdited.EventTime;
                eventToBeEdited.LastModified = DateTime.UtcNow;

                // Handle cover image update
                if (!string.IsNullOrEmpty(request.CoverImageBase64))
                {
                    // Delete old cover image
                    if (!string.IsNullOrEmpty(eventToBeEdited.CoverImageUrl))
                    {
                        await _cloudinaryService.DeleteImageAsync(eventToBeEdited.CoverImageUrl);
                    }
                    // Upload new cover image
                    eventToBeEdited.CoverImageUrl = await _cloudinaryService.UploadBase64ImageAsync(request.CoverImageBase64);
                }

                // Handle other images
                var currentImages = eventToBeEdited.OtherImageUrls.ToList();

                // Delete requested images
                foreach (var imageUrl in request.ImagesToDelete)
                {
                    if (currentImages.Contains(imageUrl))
                    {
                        await _cloudinaryService.DeleteImageAsync(imageUrl);
                        currentImages.Remove(imageUrl);
                    }
                }

                // Add new images if any
                if (request.OtherImagesBase64?.Any() == true)
                {
                    if (request.OtherImagesBase64[0].IsNotEmpty())
                    {
                        var newImageUrls = await _cloudinaryService.UploadMultipleBase64ImagesAsync(request.OtherImagesBase64);
                        currentImages.AddRange(newImageUrls);
                    }
                }

                eventToBeEdited.OtherImageUrls = currentImages;

                await _eventRepository.UpdateAsync(eventToBeEdited, false);
                await _eventRepository.SaveChangesAsync();

                var eventDto = new UpdateEventDto
                {
                    Title = eventToBeEdited.Title,
                    Description = eventToBeEdited.Description,
                    Location = eventToBeEdited.Location,
                    EventDate = eventToBeEdited.EventDate,
                    EventTime = eventToBeEdited.EventTime
                };

                return Result<UpdateEventDto>.Success(eventDto, "Event updated successfully");
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error during updating event");
                return Result<UpdateEventDto>.Failure($"An unexpected error occurred: {ex.Message}");
            }
        }
    }
} 