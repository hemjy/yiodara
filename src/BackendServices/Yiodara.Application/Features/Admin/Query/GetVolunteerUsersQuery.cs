using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Serilog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Yiodara.Application.Common;
using Yiodara.Application.Features.Admin.Query;
using Yiodara.Application.Helpers;
using Yiodara.Application.Interfaces.Repositories;
using Yiodara.Domain.Entities;
using Yiodara.Domain.Enums;

namespace Yiodara.Application.Features.Admin.Query
{
    public class GetVolunteersQuery : PaginationRequest, IRequest<Result<List<VolunteerDto>>>
    {
    }

    public class VolunteerDto
    {
        public string UserId { get; set; }
        public string UserName { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        //public DateTime CreatedDate { get; set; }
    }

    public class GetVolunteersQueryHandler : IRequestHandler<GetVolunteersQuery, Result<List<VolunteerDto>>>
    {
        private readonly ILogger _logger;
        private readonly IGenericRepositoryAsync<Domain.Entities.User> _userRepository;
        private readonly IGenericRepositoryAsync<IdentityUserRole<string>> _userRoleRepository;
        private readonly IGenericRepositoryAsync<IdentityRole> _roleRepository;

        public GetVolunteersQueryHandler(
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

        public async Task<Result<List<VolunteerDto>>> Handle(GetVolunteersQuery request, CancellationToken cancellationToken)
        {
            try
            {
                _logger.Information("Getting volunteers");
                   

                // Find the volunteer role
                var volunteerRole = await _roleRepository.GetByAsync(r => r.Name == "Volunteer");
                if (volunteerRole == null)
                {
                    _logger.Warning("Volunteer role not found");
                    return Result<List<VolunteerDto>>.Failure("Volunteer role not found in the system");
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

                // Apply pagination using extension method
                var entityResult = await query.ToPaginatedResultAsync(request);

                if (!entityResult.Succeeded)
                {
                    return Result<List<VolunteerDto>>.Failure(
                        entityResult.Message,
                        entityResult.Errors);
                }

                // Map users to DTOs
                var volunteerDtos = entityResult.Data.Select(u =>
                {
                    var user = u as Domain.Entities.User;
                    return new VolunteerDto
                    {
                        UserId = u.Id,
                        UserName = u.UserName,
                        FullName = user?.FullName,
                        Email = u.Email,
                        PhoneNumber = u.PhoneNumber,
                    };
                }).ToList();

                return Result<List<VolunteerDto>>.Success(
                     volunteerDtos,
                     entityResult.PageNumber ?? 1,
                     entityResult.PageSize ?? 10,
                     entityResult.Total ?? 0,
                     entityResult.Message);
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error while retrieving volunteers");
                return Result<List<VolunteerDto>>.Failure($"An unexpected error occurred: {ex.Message}");
            }
        }
    }
}