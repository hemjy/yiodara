using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System.Text.Json;
using Yiodara.Application.Common;
using Yiodara.Application.DTOs;
using Yiodara.Application.Interfaces;

namespace Yiodara.Infrastructure.ExternalServices
{
    public class UtilityService : IUtilityService
    {
        private readonly HttpClient _httpClient;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public UtilityService(HttpClient httpClient, IHttpContextAccessor httpContextAccessor)
        {

            _httpClient = httpClient;
            _httpContextAccessor = httpContextAccessor;

        }
        public async Task<Result<GeoInfo>> GetGeoInfoByClientIp()
        {
            var baseurl = GetAuthority();
            if (string.IsNullOrEmpty(baseurl) || baseurl.Contains("localhost", StringComparison.CurrentCultureIgnoreCase)) return Result<GeoInfo>.Success(new GeoInfo
            {
                Country_code = "NG",
                Country = "Nigeria",
                Currency_Code = "NGN",
                City = "Abuja",
                Country_flag = "https://cdn.ipwhois.io/flags/ng.svg",
                Currency_symbol = "₦",
                Success = true,

            });
            string ip = GetClientIpAddress();
           // var url = $"https://ipinfo.io/{ip}/json/";
             var url = $"https://ipwhois.app/json/{ip}/";
            var response = await _httpClient.GetAsync(url);
            if (!response.IsSuccessStatusCode) return Result<GeoInfo>.Failure(await response.Content.ReadAsStringAsync());

            var content = await response.Content.ReadAsStringAsync();
            var responseData = JsonConvert.DeserializeObject<GeoInfo>(await response.Content.ReadAsStringAsync());

            return Result<GeoInfo>.Success(responseData ?? new GeoInfo());
        }
        private string GetClientIpAddress()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null)
                return string.Empty;
            if (httpContext.Request.Headers.TryGetValue("X-Forwarded-For", out Microsoft.Extensions.Primitives.StringValues value)) return value;

            return httpContext.Connection.RemoteIpAddress.MapToIPv4().ToString();
        }
        private string GetAuthority()
        {
            var request = _httpContextAccessor.HttpContext?.Request;
            if (request == null)
                return string.Empty;

            return $"{request.Scheme}://{request.Host}";
        }
    }
}
