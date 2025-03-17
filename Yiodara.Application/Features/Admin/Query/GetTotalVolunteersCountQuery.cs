using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Serilog;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Yiodara.Application.Common;
using Yiodara.Application.Interfaces.Repositories;
using Yiodara.Domain.Entities;

namespace Yiodara.Application.Features.Admin.Query
{
    public class GetTotalVolunteersCountQuery : IRequest<Result<TotalVolunteersCountDto>>
    {
    }

    public class TotalVolunteersCountDto
    {
        public int TotalVolunteers { get; set; }
      
    }
    public class GetTotalVolunteersCountQueryHandler : IRequestHandler<GetTotalVolunteersCountQuery, Result<TotalVolunteersCountDto>>
    {
        private readonly ILogger _logger;
        private readonly IGenericRepositoryAsync<Domain.Entities.User> _userRepository;
        private readonly IGenericRepositoryAsync<IdentityUserRole<string>> _userRoleRepository;
        private readonly IGenericRepositoryAsync<IdentityRole> _roleRepository;

        public GetTotalVolunteersCountQueryHandler(
            ILogger logger,
            IGenericRepositoryAsync<Domain.Entities.User> userRepository,
            IGenericRepositoryAsync<IdentityUserRole<string>> userRoleRepository,
            IGenericRepositoryAsync<IdentityRole> roleRepository)
        {
            _logger = logger;
            _userRepository = userRepository;
            _userRoleRepository = userRoleRepository;
            _roleRepository = roleRepository;
        }

        public async Task<Result<TotalVolunteersCountDto>> Handle(GetTotalVolunteersCountQuery request, CancellationToken cancellationToken)
        {
            try
            {
                _logger.Information("Getting total volunteers count");

                // Find the volunteer role
                var volunteerRole = await _roleRepository.GetByAsync(r => r.Name == "Volunteer");
                if (volunteerRole == null)
                {
                    _logger.Warning("Volunteer role not found");
                    return Result<TotalVolunteersCountDto>.Failure("Volunteer role not found in the system");
                }

                // Get all user roles for the volunteer role
                var userRolesQuery = _userRoleRepository.GetAllQuery()
                    .Where(ur => ur.RoleId == volunteerRole.Id);

                // Get all users
                var usersQuery = _userRepository.GetAllQuery();

                // Join users with roles to get all volunteers
                var query = from ur in userRolesQuery
                            join u in usersQuery on ur.UserId equals u.Id
                            select u;

                // Count total volunteers
                int totalVolunteers = await query.CountAsync(cancellationToken);

                var result = new TotalVolunteersCountDto
                {
                    TotalVolunteers = totalVolunteers,
                };

                return Result<TotalVolunteersCountDto>.Success(result);
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error while retrieving total volunteers count");
                return Result<TotalVolunteersCountDto>.Failure($"An unexpected error occurred: {ex.Message}");
            }
        }
    }
}