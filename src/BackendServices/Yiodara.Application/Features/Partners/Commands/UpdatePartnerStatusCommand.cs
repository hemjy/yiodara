using MediatR;
using Serilog;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Threading;
using System.Threading.Tasks;
using Yiodara.Application.Common;
using Yiodara.Application.Interfaces.Repositories;
using Yiodara.Domain.Entities;
using Yiodara.Domain.Enums;

namespace Yiodara.Application.Features.Partner.Command
{
    public class UpdatePartnerStatusCommand : IRequest<Result<Guid>>
    {
        [Required(ErrorMessage = "Partner ID is required.")]
        public Guid PartnerId { get; set; }

        public UpdatePartnerStatusCommand(Guid partnerId)
        {
            PartnerId = partnerId;
        }
    }

    public class UpdatePartnerStatusCommandHandler : IRequestHandler<UpdatePartnerStatusCommand, Result<Guid>>
    {
        private readonly ILogger _logger;
        private readonly IGenericRepositoryAsync<Domain.Entities.Partner> _partnerRepository;

        public UpdatePartnerStatusCommandHandler(
            ILogger logger,
            IGenericRepositoryAsync<Domain.Entities.Partner> partnerRepository)
        {
            _logger = logger;
            _partnerRepository = partnerRepository;
        }

        public async Task<Result<Guid>> Handle(UpdatePartnerStatusCommand request, CancellationToken cancellationToken)
        {
            try
            {
                _logger.Information("Handling update partner status for partner ID: {PartnerId}", request.PartnerId);

                var validationResults = new List<ValidationResult>();
                var context = new ValidationContext(request);
                bool isValid = Validator.TryValidateObject(request, context, validationResults, true);

                if (!isValid)
                {
                    _logger.Warning("Validation failed for updating partner status: {ValidationResults}", validationResults);
                    return Result<Guid>.Failure("Validation failed", validationResults);
                }

                var partner = await _partnerRepository.GetByIdAsync(request.PartnerId);

                if (partner == null)
                {
                    _logger.Warning("Partner with ID {PartnerId} not found", request.PartnerId);
                    return Result<Guid>.Failure($"Partner with ID {request.PartnerId} not found.");
                }

                if(partner.Status == PartnerStatus.confirmed)
                {
                    _logger.Information("Partner with ID {PartnerId} already confirmed", request.PartnerId);
                    return Result<Guid>.Success(partner.Id,$"Partner with ID {request.PartnerId} already confirmed.");
                }
                // Update the partner status
                partner.Status = PartnerStatus.confirmed;

                await _partnerRepository.UpdateAsync(partner);

                _logger.Information("Successfully updated status to {Status} for partner ID: {PartnerId}",
                    PartnerStatus.confirmed, request.PartnerId);

                return Result<Guid>.Success(partner.Id, $"Partner status successfully updated to {PartnerStatus.confirmed}");
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error during updating partner status for partner ID: {PartnerId}", request.PartnerId);
                return Result<Guid>.Failure($"An unexpected error occurred: {ex.Message}");
            }
        }
    }
}