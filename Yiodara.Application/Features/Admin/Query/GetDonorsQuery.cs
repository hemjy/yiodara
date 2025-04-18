using MediatR;
using Microsoft.EntityFrameworkCore;
using Serilog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yiodara.Application.Common;
using Yiodara.Application.Helpers;
using Yiodara.Application.Interfaces.Repositories;

namespace Yiodara.Application.Features.Admin.Query
{
    public class GetDonorsQuery : PaginationRequest, IRequest<Result<List<GetDonorsDto>>>
    {
        public string? SearchTerm { get; set; }
    }

    public class GetDonorsDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public decimal TotalDonation { get; set; }
        public decimal LastDonationAmount { get; set; }
        public DateTime LastDonationDate { get; set; }
    }

    public class GetDonorsQueryHandler : IRequestHandler<GetDonorsQuery, Result<List<GetDonorsDto>>>
    {
        private readonly ILogger _logger;
        private readonly IGenericRepositoryAsync<Domain.Entities.User> _userRepository;
        private readonly IGenericRepositoryAsync<Domain.Entities.PaymentTransaction> _paymentRepository;

        public GetDonorsQueryHandler(
            ILogger logger,
            IGenericRepositoryAsync<Domain.Entities.User> userRepository,
            IGenericRepositoryAsync<Domain.Entities.PaymentTransaction> paymentRepository)
        {
            _logger = logger;
            _userRepository = userRepository;
            _paymentRepository = paymentRepository;
        }

        public async Task<Result<List<GetDonorsDto>>> Handle(GetDonorsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                _logger.Information("Getting all donors with pagination");

                // Get all users who have made donations
                var donorIdsQuery = _paymentRepository.GetAllQuery()
                    .Where(x => !x.IsDeleted && x.Status.ToLower() == "paid" && x.UserId != null)
                    .Select(x => x.UserId)
                    .Distinct();

                // Get user query with donors only
                var query = _userRepository.GetAllQuery()
                    .Where(x => donorIdsQuery.Contains(x.Id));

                if (!string.IsNullOrWhiteSpace(request.SearchTerm))
                {
                    string searchTerm = request.SearchTerm.ToLower();
                    query = query.Where(x =>
                        (x.UserName != null && x.UserName.ToLower().Contains(searchTerm)) ||
                        (x.Email != null && x.Email.ToLower().Contains(searchTerm)) ||
                        (x.FullName != null && x.FullName.ToLower().Contains(searchTerm)));
                }

                // Apply pagination
                var entityResult = await query.ToPaginatedResultAsync(request);

                if (!entityResult.Succeeded)
                {
                    return Result<List<GetDonorsDto>>.Failure(
                        entityResult.Message,
                        entityResult.Errors);
                }

                var donorList = new List<GetDonorsDto>();

                foreach (var user in entityResult.Data)
                {
                    // Get all paid donations for this user
                    var userDonations = await _paymentRepository.GetAllQuery()
                        .Where(x => x.UserId == user.Id && !x.IsDeleted && x.Status.ToLower() == "paid")
                        .OrderByDescending(x => x.Created)
                        .ToListAsync(cancellationToken);

                    if (userDonations.Any())
                    {
                        var lastDonation = userDonations.First(); 
                        var totalDonation = userDonations.Sum(x => x.Amount);

                        donorList.Add(new GetDonorsDto
                        {
                            Id = new Guid(user.Id),
                            Name = user.FullName,
                            TotalDonation = totalDonation,
                            LastDonationAmount = lastDonation.Amount,
                            LastDonationDate = lastDonation.Created,
                        });
                    }

                }
                return Result<List<GetDonorsDto>>.Success(
                   donorList.OrderByDescending(x => x.TotalDonation).ToList(),
                   entityResult.PageNumber ?? 1,
                   entityResult.PageSize ?? 10,
                   entityResult.Total ?? 0,
                   entityResult.Message);

            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error while getting donors list");
                return Result<List<GetDonorsDto>>.Failure($"An unexpected error occurred: {ex.Message}");
            }
        }
    }
}