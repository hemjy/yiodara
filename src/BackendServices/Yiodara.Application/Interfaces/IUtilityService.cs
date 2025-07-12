using Yiodara.Application.Common;
using Yiodara.Application.DTOs;

namespace Yiodara.Application.Interfaces
{
    public interface IUtilityService
    {
        Task<Result<GeoInfo>> GetGeoInfoByClientIp();
    }
}