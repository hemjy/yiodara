using MediatR;
using Serilog;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yiodara.Application.Common;
using Yiodara.Application.Interfaces.Cloudinary;
using Yiodara.Application.Interfaces.Repositories;
using Yiodara.Domain.Entities;

namespace Yiodara.Application.Features.Event.Command
{
    public class DeleteEventCommand : IRequest<Result<string>>
    {
        [Required(ErrorMessage = "Id is required.")]
        public Guid Id { get; set; }
    }

    public class DeleteEventCommandHandler : IRequestHandler<DeleteEventCommand, Result<string>>
    {
        private readonly ILogger _logger;
        private readonly IGenericRepositoryAsync<Domain.Entities.Event> _eventRepository;
        private readonly ICloudinaryService _cloudinaryService;

        public DeleteEventCommandHandler(
            ILogger logger,
            IGenericRepositoryAsync<Domain.Entities.Event> eventRepository,
            ICloudinaryService cloudinaryService)
        {
            _logger = logger;
            _eventRepository = eventRepository;
            _cloudinaryService = cloudinaryService;
        }

        public async Task<Result<string>> Handle(DeleteEventCommand request, CancellationToken cancellationToken)
        {
            try
            {
                _logger.Information("Handling deleting event handler");

                var validationResults = new List<ValidationResult>();
                var context = new ValidationContext(request);

                bool isValid = Validator.TryValidateObject(request, context, validationResults, true);

                if (!isValid)
                {
                    _logger.Warning("Validation failed for deleting event request: {ValidationResults}", validationResults);
                    return Result<string>.Failure("failed", validationResults);
                }

                var eventToBeDeleted = await _eventRepository.GetByAsync(t => t.Id == request.Id && !t.IsDeleted);

                if (eventToBeDeleted == null)
                {
                    return Result<string>.Failure("This event does not exist");
                }

                if (!string.IsNullOrEmpty(eventToBeDeleted.CoverImageUrl))
                {
                    await _cloudinaryService.DeleteImageAsync(eventToBeDeleted.CoverImageUrl);
                }

                // Delete all other images from Cloudinary
                foreach (var imageUrl in eventToBeDeleted.OtherImageUrls)
                {
                    await _cloudinaryService.DeleteImageAsync(imageUrl);
                }

                eventToBeDeleted.SoftDelete();

                await _eventRepository.UpdateAsync(eventToBeDeleted, false);
                await _eventRepository.SaveChangesAsync();

                return Result<string>.Success($"deleted successfully");
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error during deleting event");
                return Result<string>.Failure($"An unexpected error occurred: {ex.Message}");
            }
        }
    }
} 