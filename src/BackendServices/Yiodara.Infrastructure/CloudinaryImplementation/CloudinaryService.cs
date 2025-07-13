using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Configuration;
using Serilog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yiodara.Application.Interfaces.Cloudinary;

namespace Yiodara.Infrastructure.CloudinaryService
{
    public class CloudinaryService : ICloudinaryService
    {
        private readonly Cloudinary _cloudinary;
        private readonly ILogger _logger;

        public CloudinaryService(IConfiguration configuration, ILogger logger)
        {
            var account = new Account(
                configuration["Cloudinary:CloudName"],
                configuration["Cloudinary:ApiKey"],
                configuration["Cloudinary:ApiSecret"]
            );
            _cloudinary = new Cloudinary(account);
            _logger = logger;
        }

        public async Task<string> UploadBase64ImageAsync(string base64String)
        {
            try
            {
                if (string.IsNullOrEmpty(base64String))
                    throw new ArgumentException("No image data provided");

                var base64Data = base64String.Contains(",") ? base64String.Split(',')[1] : base64String;

                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription($"campaign_{Guid.NewGuid()}.jpg",
                                              new MemoryStream(Convert.FromBase64String(base64Data))),
                    Folder = "campaigns"
                };

                var uploadResult = await _cloudinary.UploadAsync(uploadParams);
                return uploadResult.SecureUrl.ToString();
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error uploading base64 image to Cloudinary");
                throw;
            }
        }

        public async Task<List<string>> UploadMultipleBase64ImagesAsync(List<string> base64Strings)
        {
            var uploadTasks = base64Strings.Select(base64 => UploadBase64ImageAsync(base64));
            return (await Task.WhenAll(uploadTasks)).ToList();
        }

        public async Task DeleteImageAsync(string imageUrl)
        {
            try
            {
                var publicId = GetPublicIdFromUrl(imageUrl);
                if (publicId == null) return;

                var deletionParams = new DeletionParams(publicId);
                await _cloudinary.DestroyAsync(deletionParams);
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error deleting image from Cloudinary");
                throw;
            }
        }

        private string GetPublicIdFromUrl(string imageUrl)
        {
            try
            {
                var uri = new Uri(imageUrl);
                var pathSegments = uri.Segments;
                var uploadIndex = Array.IndexOf(pathSegments, "upload/");
                if (uploadIndex == -1) return null;

                var publicId = string.Join("", pathSegments.Skip(uploadIndex + 2))
                    .TrimEnd('/')
                    .Split('.')[0];

                return $"campaigns/{publicId}";
            }
            catch
            {
                return null;
            }
        }

        public async Task<string> UploadBase64DocumentAsync(string base64Document)
        {
            try
            {
                // Generate a unique public ID
                var publicId = $"documents/doc_{Guid.NewGuid().ToString("N")[..12]}.pdf";

                // Upload raw document (PDF, Word, etc.)
                var uploadParams = new RawUploadParams()
                {
                    File = new FileDescription("document.pdf", base64Document),
                    PublicId = publicId
                };

                var uploadResult = await _cloudinary.UploadAsync(uploadParams);

                if (uploadResult.Error != null)
                {
                    throw new Exception($"Cloudinary upload failed: {uploadResult.Error.Message}");
                }

                return uploadResult.SecureUrl.ToString();
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to upload document to Cloudinary: {ex.Message}", ex);
            }
        }
    }
}
    