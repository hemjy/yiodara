﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yiodara.Application.DTOs
{
    public class RefreshTokenDto
    {
        public string? AccessToken { get; set; }

        public string? RefreshToken { get; set; }
    }
}
