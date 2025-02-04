using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yiodara.Application.DTOs
{
    public class SignUpResponseDto
    {
        public string? Token { get; set; }
        public string? RefreshToken { get; set; }
        public DateTime RefreshTokenExpiry { get; set; }
        public string? Email { get; set; }
        public string? Role { get; set; }
        public List<ValidationResult> ValidationErrors { get; set; } = new List<ValidationResult>();

    }
}
