﻿using MediatR;
using Microsoft.EntityFrameworkCore;
using Serilog;
using Yiodara.Application.Common;
using Yiodara.Application.Helpers;
using Yiodara.Application.Interfaces.Repositories;
using Yiodara.Domain.Entities;

namespace Yiodara.Application.Features.Campaign.Query
{
    public class GetCampaignsQuery : PaginationRequest, IRequest<Result<List<GetCampaignsDto>>>
    {
        public string? CategoryName { get; set; }
    }

    public class GetCampaignsDto
    {
        public Guid Id { get; set; }
        public string? OrganizationName { get; set; }
        public string? CompanyProfile { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public CampaignCategoryDto? CampaignCategoryDto { get; set; }
        public string? Currency { get; set; }
        public double Amount { get; set; }
        public double AmountRaised { get; set; }
        public double AmountLeft { get; set; }
        public bool IsCompleted { get; set; } = false;
        public bool IsDraft { get; set; }
        public string? CoverImageBase64 { get; set; }
        public List<string> OtherImagesBase64 { get; set; } = new List<string>();

    }

    public class CampaignCategoryDto
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }
    }

    public class GetCampaignsQueryHandler : IRequestHandler<GetCampaignsQuery, Result<List<GetCampaignsDto>>>
    {
        private readonly ILogger _logger;
        private readonly IGenericRepositoryAsync<Domain.Entities.Campaign> _campaignRepository;
        private readonly IGenericRepositoryAsync<Domain.Entities.PaymentTransaction> _paymentTransaction;

        public GetCampaignsQueryHandler(
            ILogger logger,
            IGenericRepositoryAsync<Domain.Entities.Campaign> campaignCategoryRepository,
            IGenericRepositoryAsync<PaymentTransaction> paymentTransaction)
        {
            _logger = logger;
            _campaignRepository = campaignCategoryRepository;
            _paymentTransaction = paymentTransaction;
        }

        public async Task<Result<List<GetCampaignsDto>>> Handle(GetCampaignsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var query = _campaignRepository.GetAllQuery();

                query = query.Include(x => x.CampaignCategory)
                       .Where(x => !x.IsDeleted && !x.IsDraft);

                if (!string.IsNullOrWhiteSpace(request.CategoryName))
                {
                    query = query.Where(x => x.Title != null &&
                                             x.Title.ToLower().Contains(request.CategoryName.ToLower()));
                }

                var entityResult = await query.ToPaginatedResultAsync(request);

                if (!entityResult.Succeeded)
                {
                    return Result<List<GetCampaignsDto>>.Failure(
                        entityResult.Message,
                        entityResult.Errors);
                }

                // Get the amount raised for each campaign in one batch
                var campaignIds = entityResult.Data.Select(c => c.Id).ToList();
                var paidTransactions = await _paymentTransaction.GetAllQuery()
                    .Where(x => campaignIds.Contains(x.CampaignId) && !x.IsDeleted && x.Status.ToLower() == "paid")
                    .ToListAsync(cancellationToken);

                // Group by campaign ID for efficient lookup
                var transactionsByCampaign = paidTransactions
                    .GroupBy(x => x.CampaignId)
                    .ToDictionary(g => g.Key, g => g.Sum(x => x.DollarValue));

                var dtos = entityResult.Data.Select(entity => {
                    double amountRaised = transactionsByCampaign.TryGetValue(entity.Id, out var raised) ? (double)raised : 0;
                    double amountLeft = entity.Amount - amountRaised;

                    return new GetCampaignsDto
                    {
                        Id = entity.Id,
                        OrganizationName = entity.OrganizationName,
                        CompanyProfile = entity.CompanyProfile,
                        Title = entity.Title,
                        Description = entity.Description,
                        Amount = entity.Amount,
                        AmountRaised = amountRaised,
                        AmountLeft = amountLeft,
                        Currency = entity.Currency,
                        IsCompleted = entity.IsCompleted,
                        CampaignCategoryDto = new CampaignCategoryDto
                        {
                            Id = entity.CampaignCategory.Id,
                            Name = entity.CampaignCategory.Name
                        },
                        CoverImageBase64 = entity.CoverImage,
                        OtherImagesBase64 = entity.OtherImages,
                        IsDraft = entity.IsDraft
                    };
                }).ToList();

                //var dtos = entityResult.Data.Select(entity => new GetCampaignsDto
                //{
                //    Id = entity.Id,
                //    Title = entity.Title,
                //    Description = entity.Description,
                //    Amount = entity.Amount,
                //    Currency = entity.Currency,
                //    IsCompleted = entity.IsCompleted,
                //    CampaignCategoryDto = new CampaignCategoryDto
                //    {
                //        Id = entity.CampaignCategory.Id,
                //        Name = entity.CampaignCategory.Name
                //    },
                //    CoverImageBase64 = entity.CoverImage,
                //    OtherImagesBase64 = entity.OtherImages
                //}).ToList();

                return Result<List<GetCampaignsDto>>.Success(
                    dtos,
                    entityResult.PageNumber ?? 1,
                    entityResult.PageSize ?? 10,
                    entityResult.Total ?? 0,
                    entityResult.Message);
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error during Geting campaign categories");
                return Result<List<GetCampaignsDto>>.Failure($"An unexpected error occurred: {ex.Message}");
            }
        }
    }
}