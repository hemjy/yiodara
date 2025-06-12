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
    }
}
