using Yiodara.Application.Interfaces;

public class CurrencyCountryMappingService : ICurrencyCountryMappingService
{
    private readonly Dictionary<string, string> _currencyToCountryMap;

    public CurrencyCountryMappingService()
    {
        // Initialize with common currency to country mappings
        _currencyToCountryMap = new Dictionary<string, string>
            {
                { "USD", "United States" },
                { "EUR", "European Union" },
                { "GBP", "United Kingdom" },
                { "JPY", "Japan" },
                { "CAD", "Canada" },
                { "AUD", "Australia" },
                { "CHF", "Switzerland" },
                { "CNY", "China" },
                { "INR", "India" },
                { "NGN", "Nigeria" },
                { "KES", "Kenya" },
                { "ZAR", "South Africa" },
                { "BRL", "Brazil" },
                { "RUB", "Russia" },
                { "MXN", "Mexico" }
                // Add more mappings as needed
            };
    }

    public string GetCountryFromCurrency(string currencyCode)
    {
        currencyCode = currencyCode.ToUpper();
        if (string.IsNullOrEmpty(currencyCode))
            return "Unknown";

        if (_currencyToCountryMap.TryGetValue(currencyCode, out string country))
            return country;

        return $"Unknown ({currencyCode})";
    }
}