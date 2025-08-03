using System.Text.RegularExpressions;

namespace Yiodara.Application.Helpers
{
    public static class PhoneHelper
    {
        public static string NormalizePhoneNumber(string phoneNumber, string countryCode = "")
        {
            if (string.IsNullOrWhiteSpace(phoneNumber))
                return string.Empty;

            // Remove all spaces, dashes, parentheses, and other formatting
            var normalized = Regex.Replace(phoneNumber.Trim(), @"[\s\-\(\)\.]", "");

            // If it already starts with +, return as-is
            if (normalized.StartsWith("+"))
            {
                return normalized;
            }

            // If no + and we have a country code, try to add the appropriate country calling code
            if (!string.IsNullOrWhiteSpace(countryCode) && normalized.Length > 7)
            {
                var callingCode = countryCode.GetCountryCallingCode();
                if (!string.IsNullOrEmpty(callingCode))
                {
                    // Remove leading zero if present (common in many countries)
                    if (normalized.StartsWith("0"))
                    {
                        normalized = normalized.Substring(1);
                    }
                    return $"+{callingCode}{normalized}";
                }
            }

            // Return as-is if we can't determine the country code
            return normalized;
        }
    }
}