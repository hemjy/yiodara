using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yiodara.Application.DTOs;

namespace Yiodara.Application.Interfaces.Cloudinary
{
    public interface ICloudinaryService
    {
        Task<string> UploadBase64ImageAsync(string base64String);
        Task<List<string>> UploadMultipleBase64ImagesAsync(List<string> base64Strings);
        Task DeleteImageAsync(string imageUrl);
    }
}
