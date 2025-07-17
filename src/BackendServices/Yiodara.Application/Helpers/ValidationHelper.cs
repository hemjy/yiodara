using System.ComponentModel.DataAnnotations;

namespace Yiodara.Application.Helpers
{
    public static class ValidationHelper
    {
        public static void ValidateBase64Document(string base64Document, string propertyName, List<ValidationResult> validationResults)
        {
            try
            {
                if (base64Document.IsEmpty())
                {
                    validationResults.Add(new ValidationResult("Company profile document is required, (10Mb limit).", new[] { propertyName }));
                    return;
                }
                string base64Content;

                if (base64Document.Contains(","))
                {
                    base64Content = base64Document.Split(',')[1];
                }
                else
                {
                    base64Content = base64Document;
                }

                if (!IsValidBase64String(base64Content))
                {
                    validationResults.Add(new ValidationResult("Cover image is not a valid base64 string.", new[] { propertyName }));
                    return;
                }

                var documentBytes = Convert.FromBase64String(base64Content);

                const int maxFileSizeBytes = 10 * 1024 * 1024;
                if (documentBytes.Length > maxFileSizeBytes)
                {
                    validationResults.Add(new ValidationResult("Cover image size exceeds the 10MB limit.", new[] { propertyName }));
                }
            }
            catch (FormatException)
            {
                validationResults.Add(new ValidationResult("Cover image is not a valid base64 format.", new[] { propertyName }));
            }
        }

        private static bool IsValidBase64String(string base64String)
        {
            if (string.IsNullOrEmpty(base64String))
                return false;

            if (base64String.Length % 4 != 0)
                return false;

            return System.Text.RegularExpressions.Regex.IsMatch(base64String, @"^[A-Za-z0-9+/]*={0,2}$");
        }
    }
}