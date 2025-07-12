namespace Yiodara.Application.Interfaces
{
    public interface ICurrencyCountryMappingService
    {
        string GetCountryFromCurrency(string currencyCode);
    }
}
