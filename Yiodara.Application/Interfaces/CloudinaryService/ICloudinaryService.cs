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
        Task<string> UploadImageAsync(IFormFile file);
        Task<string> UploadImageAsync(string base64Image);
        Task<ImageUploadResult> GetImageByPublicIdAsync(string publicId);
        Task<DeletionResult> DeleteImageAsync(string publicId);
        Task<List<string>> GetAllImagesAsync(string folderPath = "");
    }
}
