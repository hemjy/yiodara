using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yiodara.Domain.Entities
{
    public class VolunteerCountry : EntityBase
    {
        [Required]
        public string? UserId { get; set; }
       
        [Required]
        [StringLength(100)]
        public string? CountryName { get; set; }

        [StringLength(2)]
        public string? Code { get; set; }

        public virtual User User { get; set; }

        public static VolunteerCountry Create(string userId, string countryName, string code) =>
            new VolunteerCountry
            {
                UserId = userId,
                CountryName = countryName,
                Code = code
            };

    }
}
