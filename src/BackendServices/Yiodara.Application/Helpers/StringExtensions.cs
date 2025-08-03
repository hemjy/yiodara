using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yiodara.Application.Helpers
{
    public static class StringExtensions
    {
        /// <summary>
        /// Checks to see if a given string is empty.
        /// </summary>        
        public static bool IsEmpty(this string input)
        {
            return string.IsNullOrWhiteSpace(input);
        }

        /// <summary>
        /// Checks to see if a given string is not empty.
        /// </summary>        
        public static bool IsNotEmpty(this string input)
        {
            return !string.IsNullOrWhiteSpace(input);
        }

        public static string GetCountryCallingCode(this string countryCode)
        {
            // Map of common country codes to their calling codes
            var countryCallingCodes = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                { "US", "1" }, { "CA", "1" }, // North America
                { "GB", "44" }, { "IE", "353" }, // UK & Ireland
                { "AU", "61" }, { "NZ", "64" }, // Oceania
                { "DE", "49" }, { "FR", "33" }, { "IT", "39" }, { "ES", "34" }, // Western Europe
                { "NL", "31" }, { "BE", "32" }, { "CH", "41" }, { "AT", "43" },
                { "SE", "46" }, { "NO", "47" }, { "DK", "45" }, { "FI", "358" },
                { "PL", "48" }, { "CZ", "420" }, { "HU", "36" }, // Central Europe
                { "BR", "55" }, { "AR", "54" }, { "MX", "52" }, { "CO", "57" }, // Latin America
                { "PE", "51" }, { "CL", "56" }, { "VE", "58" }, { "EC", "593" },
                { "CN", "86" }, { "IN", "91" }, { "JP", "81" }, { "KR", "82" }, // Asia
                { "TH", "66" }, { "VN", "84" }, { "PH", "63" }, { "MY", "60" },
                { "SG", "65" }, { "ID", "62" }, { "PK", "92" }, { "BD", "880" },
                { "ZA", "27" }, { "NG", "234" }, { "KE", "254" }, { "EG", "20" }, // Africa
                { "MA", "212" }, { "TN", "216" }, { "GH", "233" }, { "TZ", "255" },
                { "RU", "7" }, { "UA", "380" }, { "TR", "90" }, { "IL", "972" }, // Eastern Europe/Middle East
                { "SA", "966" }, { "AE", "971" }, { "QA", "974" }, { "KW", "965" }
            };

            return countryCallingCodes.TryGetValue(countryCode, out var callingCode) ? callingCode : string.Empty;
        }
    }
}
