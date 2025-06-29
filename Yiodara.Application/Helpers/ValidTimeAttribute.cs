using System.ComponentModel.DataAnnotations;

namespace Yiodara.Application.Helpers
{
    public class ValidTimeAttribute : ValidationAttribute
    {
        private static readonly List<string> ValidTimes = GetValidTimes();
        
        public override bool IsValid(object value)
        {
            if (value == null || string.IsNullOrWhiteSpace(value.ToString()))
                return false;
                
            return ValidTimes.Contains(value.ToString());
        }
        
        private static List<string> GetValidTimes()
        {
            var options = new List<string>();
            
            // Add 12:00 AM and 12:30 AM first
            options.Add("12:00 AM");
            options.Add("12:30 AM");
            
            // Add 1:00 AM through 11:30 AM
            for (int hour = 1; hour <= 11; hour++)
            {
                options.Add($"{hour}:00 AM");
                options.Add($"{hour}:30 AM");
            }
            
            // Add 12:00 PM and 12:30 PM
            options.Add("12:00 PM");
            options.Add("12:30 PM");
            
            // Add 1:00 PM through 11:30 PM
            for (int hour = 1; hour <= 11; hour++)
            {
                options.Add($"{hour}:00 PM");
                options.Add($"{hour}:30 PM");
            }
            
            return options;
        }
    }
} 