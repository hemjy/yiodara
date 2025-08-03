using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace Yiodara.Application.Validations
{
    public class InternationalPhoneAttribute : ValidationAttribute
    {
        public override bool IsValid(object? value)
        {
            if (value == null || string.IsNullOrWhiteSpace(value.ToString()))
                return false;

            var phoneNumber = value.ToString()!.Trim();

            // Remove all non-digit characters except + at the beginning
            var cleanNumber = Regex.Replace(phoneNumber, @"[^\d+]", "");

            // Check if it starts with + (international format)
            if (cleanNumber.StartsWith("+"))
            {
                // Remove the + and check if remaining are all digits
                var digitsOnly = cleanNumber.Substring(1);
                if (!Regex.IsMatch(digitsOnly, @"^\d+$"))
                    return false;

                // International numbers should be between 7-15 digits (excluding country code +)
                return digitsOnly.Length >= 7 && digitsOnly.Length <= 15;
            }
            else
            {
                // If no +, it should be all digits and reasonable length
                if (!Regex.IsMatch(cleanNumber, @"^\d+$"))
                    return false;

                return cleanNumber.Length >= 7 && cleanNumber.Length <= 15;
            }
        }

        public override string FormatErrorMessage(string name)
        {
            return $"The {name} field must be a valid international phone number (7-15 digits, optionally starting with +).";
        }
    }
}
