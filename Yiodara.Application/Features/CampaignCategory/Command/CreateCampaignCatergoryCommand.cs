using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Serilog;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Security.Principal;
using System.Text;
using System.Threading.Tasks;
using Yiodara.Application.Common;
using Yiodara.Application.DTOs;
using Yiodara.Application.Features.Auth.Commands;
using Yiodara.Application.Interfaces.Auth;
using Yiodara.Application.Interfaces.Repositories;
using Yiodara.Domain.Entities;

namespace Yiodara.Application.Features.CampaignCategory.Command
{
    public class CreateCampaignCatergoryCommand : IRequest<Result<Guid>>
    {
        [Required(ErrorMessage = "Name is required.")]
        [StringLength(20, ErrorMessage = "Name cannot be longer than 20 characters.")]
        public string? Name { get; set; }
    }

    public class CreateCampaignCatergoryCommandHandler : IRequestHandler<CreateCampaignCatergoryCommand, Result<Guid>>
    {
        private readonly ILogger _logger;
        private readonly IGenericRepositoryAsync<Domain.Entities.CampaignCategory> _campaignCategoryRepository;

        public CreateCampaignCatergoryCommandHandler(
            ILogger logger,
            IGenericRepositoryAsync<Domain.Entities.CampaignCategory> campaignCategoryRepository)
        {
            _logger = logger;
            _campaignCategoryRepository = campaignCategoryRepository;
        }

        public async Task<Result<Guid>> Handle(CreateCampaignCatergoryCommand request, CancellationToken cancellationToken)
        {
            try
            {
                _logger.Information("Handling creating campaign category handler");

                var validationResults = new List<ValidationResult>();
                var context = new ValidationContext(request);

                bool isValid = Validator.TryValidateObject(request, context, validationResults, true);

                if (!isValid)
                {
                    _logger.Warning("Validation failed for /creating campaign category request: {ValidationResults}", validationResults);
                    return Result<Guid>.Failure("failed", validationResults);
                }

                var campaignExists = await _campaignCategoryRepository
                                    .IsUniqueAsync(x => x.Name.Trim().ToLower() == request.Name.Trim().ToLower() && !x.IsDeleted);
                if (campaignExists)
                {
                    return Result<Guid>.Failure("Campaign Already Exist.");
                }

                // Create a new campaign 
                var newCampaign = Domain.Entities.CampaignCategory.Create(request.Name);

                // Add the new campaign to the repository
                await _campaignCategoryRepository.AddAsync(newCampaign);
                return Result<Guid>.Success(newCampaign.Id);
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error during creating campaign category");
                return Result<Guid>.Failure($"An unexpected error occurred: {ex.Message}");
            }
        }
    }
}