using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yiodara.Application.Helpers
{
    public static class TimeHelper
    {
        public static List<string> GetTimeOptions()
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

        // Convert string time to DateTime for database storage
        public static DateTime CombineDateAndTime(DateTime date, string timeString)
        {
            if (DateTime.TryParse(timeString, out DateTime time))
            {
                return new DateTime(date.Year, date.Month, date.Day, time.Hour, time.Minute, 0);
            }
            throw new ArgumentException($"Invalid time format: {timeString}");
        }
    }
}
