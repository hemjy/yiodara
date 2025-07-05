using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yiodara.Application.Interfaces
{
    public interface ICurrencyCountryMappingService
    {
        string GetCountryFromCurrency(string currencyCode);
    }
}
