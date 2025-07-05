using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using Yiodara.Domain.Enums;

namespace Yiodara.Application.Helpers
{
    public static class ListOrderHelper
    {
        public static List<ListOrder> GetValidListOrdersForEntity<T>() where T : class
        {
            // Map ListOrder enum values to property names
            var propertyMap = new Dictionary<ListOrder, string>
        {
            { ListOrder.Name, "Name" },
            { ListOrder.LastUpdated, "LastUpdatedDate" },
            { ListOrder.Created, "Created" },
            { ListOrder.DollarValue, "DollarValue" },
            { ListOrder.DonationDate, "DonationDate" },
            { ListOrder.Title, "Title" }
        };

            // Get the properties of the entity
            var entityProperties = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance)
                                            .Select(p => p.Name)
                                            .ToHashSet(StringComparer.OrdinalIgnoreCase);

            // Filter ListOrder values based on whether the mapped property exists in the entity
            return propertyMap
                .Where(kvp => entityProperties.Contains(kvp.Value))
                .Select(kvp => kvp.Key)
                .ToList();
        }
    }
}
