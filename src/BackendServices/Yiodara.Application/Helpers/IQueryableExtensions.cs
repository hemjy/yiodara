using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using Yiodara.Application.Common;
using Yiodara.Domain.Entities;
using Yiodara.Domain.Enums;

namespace Yiodara.Application.Helpers
{
    public static class QueryableExtensions
    {
        #region former code for apply filters 14-04-25
        //        public static async Task<Result<List<T>>> ToPaginatedResultAsync<T>(
        //            this IQueryable<T> query,
        //            PaginationRequest request) where T : class
        //        {
        //            try
        //            {
        //                // Ensure valid pagination parameters
        //                var pageNumber = Math.Max(1, request.PageNumber);
        //                var pageSize = Math.Min(50, Math.Max(1, request.PageSize));

        //                // Apply filtering
        //                query = ApplyFilters(query, request);

        //                // Apply ordering
        //                query = ApplyOrdering(query, request);

        //                // Get total count before pagination
        //                var total = await query.CountAsync();

        //                if (total == 0)
        //                {
        //                    return Result<List<T>>.Success(
        //                        new List<T>(),
        //                        pageNumber,
        //                        pageSize,
        //                        total,
        //                        "No records found.");
        //                }

        //                // Apply pagination
        //                var items = await query
        //                    .Skip((pageNumber - 1) * pageSize)
        //                    .Take(pageSize)
        //                    .ToListAsync();

        //                return Result<List<T>>.Success(
        //                    items,
        //                    pageNumber,
        //                    pageSize,
        //                    total,
        //                    $"{total} record(s) found.");
        //            }
        //            catch (Exception ex)
        //            {
        //                return Result<List<T>>.Failure(
        //                    "An error occurred while retrieving the data.",
        //                    new List<string> { ex.Message });
        //            }
        //        }

        //        //private static IQueryable<T> ApplyFilters<T>(IQueryable<T> query, PaginationRequest request)
        //        //    where T : class
        //        //{
        //        //    if (request.Id.HasValue)
        //        //    {
        //        //        // Assuming T has an Id property of type Guid
        //        //        var parameter = Expression.Parameter(typeof(T), "x");
        //        //        var property = Expression.Property(parameter, "Id");
        //        //        var value = Expression.Constant(request.Id.Value);
        //        //        var equals = Expression.Equal(property, value);
        //        //        var lambda = Expression.Lambda<Func<T, bool>>(equals, parameter);
        //        //        query = query.Where(lambda);
        //        //    }

        //        //    if (!string.IsNullOrWhiteSpace(request.SearchText))
        //        //    {
        //        //        var searchTerm = request.SearchText.ToLower().Trim();
        //        //        // Assuming T has a Name property - modify this based on your entity
        //        //        var parameter = Expression.Parameter(typeof(T), "x");
        //        //        var property = Expression.Property(parameter, "Name");
        //        //        var toLower = Expression.Call(property, typeof(string).GetMethod("ToLower", Type.EmptyTypes));
        //        //        var value = Expression.Constant(searchTerm);
        //        //        var contains = Expression.Call(toLower,
        //        //            typeof(string).GetMethod("Contains", new[] { typeof(string) }),
        //        //            value);
        //        //        var lambda = Expression.Lambda<Func<T, bool>>(contains, parameter);
        //        //        query = query.Where(lambda);
        //        //    }

        //        //    if (request.StartDate.HasValue && request.EndDate.HasValue)
        //        //    {
        //        //        // Assuming T has a CreatedDate property of type DateTime
        //        //        var parameter = Expression.Parameter(typeof(T), "x");
        //        //        var property = Expression.Property(parameter, "CreatedDate");
        //        //        var startValue = Expression.Constant(request.StartDate.Value);
        //        //        var endValue = Expression.Constant(request.EndDate.Value);
        //        //        var greaterThanOrEqual = Expression.GreaterThanOrEqual(property, startValue);
        //        //        var lessThanOrEqual = Expression.LessThanOrEqual(property, endValue);
        //        //        var andAlso = Expression.AndAlso(greaterThanOrEqual, lessThanOrEqual);
        //        //        var lambda = Expression.Lambda<Func<T, bool>>(andAlso, parameter);
        //        //        query = query.Where(lambda);
        //        //    }

        //        //    return query;
        //        //}

        //        #region former code for apply filters 14-04-25

        //        //    private static IQueryable<T> ApplyFilters<T>(IQueryable<T> query, PaginationRequest request)
        //        //where T : class
        //        //    {
        //        //        if (request.Id.HasValue)
        //        //        {
        //        //            var parameter = Expression.Parameter(typeof(T), "x");
        //        //            var property = Expression.Property(parameter, "Id");
        //        //            var value = Expression.Constant(request.Id.Value);
        //        //            var equals = Expression.Equal(property, value);
        //        //            var lambda = Expression.Lambda<Func<T, bool>>(equals, parameter);
        //        //            query = query.Where(lambda);
        //        //        }

        //        //        if (!string.IsNullOrWhiteSpace(request.SearchText))
        //        //        {
        //        //            var searchTerm = request.SearchText.ToLower().Trim();
        //        //            var parameter = Expression.Parameter(typeof(T), "x");

        //        //            // Get all string properties of the entity
        //        //            var stringProperties = typeof(T).GetProperties()
        //        //                .Where(p => p.PropertyType == typeof(string));

        //        //            Expression combinedExpression = null;

        //        //            foreach (var prop in stringProperties)
        //        //            {
        //        //                var property = Expression.Property(parameter, prop.Name);

        //        //                // Handle null check
        //        //                var nullCheck = Expression.NotEqual(property, Expression.Constant(null));

        //        //                var toLower = Expression.Call(property,
        //        //                    typeof(string).GetMethod("ToLower", Type.EmptyTypes));

        //        //                var value = Expression.Constant(searchTerm);

        //        //                var contains = Expression.Call(toLower,
        //        //                    typeof(string).GetMethod("Contains", new[] { typeof(string) }),
        //        //                    value);

        //        //                // Combine null check with contains
        //        //                var safePropCheck = Expression.AndAlso(nullCheck, contains);

        //        //                // Combine expressions with OR
        //        //                combinedExpression = combinedExpression == null
        //        //                    ? safePropCheck
        //        //                    : Expression.OrElse(combinedExpression, safePropCheck);
        //        //            }

        //        //            if (combinedExpression != null)
        //        //            {
        //        //                var lambda = Expression.Lambda<Func<T, bool>>(combinedExpression, parameter);
        //        //                query = query.Where(lambda);
        //        //            }
        //        //        }

        //        //        if (request.StartDate.HasValue && request.EndDate.HasValue)
        //        //        {
        //        //            // Check if entity has CreatedDate property
        //        //            var createdDateProperty = typeof(T).GetProperty("CreatedDate");
        //        //            if (createdDateProperty != null && createdDateProperty.PropertyType == typeof(DateTime))
        //        //            {
        //        //                var parameter = Expression.Parameter(typeof(T), "x");
        //        //                var property = Expression.Property(parameter, "CreatedDate");
        //        //                var startValue = Expression.Constant(request.StartDate.Value);
        //        //                var endValue = Expression.Constant(request.EndDate.Value);
        //        //                var greaterThanOrEqual = Expression.GreaterThanOrEqual(property, startValue);
        //        //                var lessThanOrEqual = Expression.LessThanOrEqual(property, endValue);
        //        //                var andAlso = Expression.AndAlso(greaterThanOrEqual, lessThanOrEqual);
        //        //                var lambda = Expression.Lambda<Func<T, bool>>(andAlso, parameter);
        //        //                query = query.Where(lambda);
        //        //            }
        //        //        }

        //        //        return query;
        //        //    }

        //        #endregion

        //        private static IQueryable<T> ApplyFilters<T>(IQueryable<T> query, PaginationRequest request)
        //    where T : class
        //        {
        //            if (request.StartDate.HasValue && request.EndDate.HasValue)
        //            {
        //                // Check for multiple possible date property names
        //                var possibleDateProps = new[] { "CreatedDate", "Created", "DonationDate", "Date", "TransactionDate" };
        //                PropertyInfo dateProperty = null;

        //                foreach (var propName in possibleDateProps)
        //                {
        //                    dateProperty = typeof(T).GetProperty(propName);
        //                    if (dateProperty != null && dateProperty.PropertyType == typeof(DateTime))
        //                        break;
        //                }

        //                if (dateProperty != null)
        //                {
        //                    var parameter = Expression.Parameter(typeof(T), "x");
        //                    var property = Expression.Property(parameter, dateProperty.Name);
        //                    var startValue = Expression.Constant(request.StartDate.Value);
        //                    var endValue = Expression.Constant(request.EndDate.Value);
        //                    var greaterThanOrEqual = Expression.GreaterThanOrEqual(property, startValue);
        //                    var lessThanOrEqual = Expression.LessThanOrEqual(property, endValue);
        //                    var andAlso = Expression.AndAlso(greaterThanOrEqual, lessThanOrEqual);
        //                    var lambda = Expression.Lambda<Func<T, bool>>(andAlso, parameter);
        //                    query = query.Where(lambda);
        //                }
        //            }
        //            return query;
        //        }
        //        //private static IQueryable<T> ApplyOrdering<T>(IQueryable<T> query, PaginationRequest request)
        //        //    where T : class
        //        //{
        //        //    // Assuming ListOrder is an enum with possible values like Name, Date, etc.
        //        //    var parameter = Expression.Parameter(typeof(T), "x");
        //        //    var property = Expression.Property(parameter, request.OrderBy.ToString());
        //        //    var lambda = Expression.Lambda(property, parameter);
        //        //    var methodName = request.Descending ?? true ? "OrderByDescending" : "OrderBy";

        //        //    // Apply ordering
        //        //    var orderByMethod = typeof(Queryable)
        //        //        .GetMethods()
        //        //        .First(m => m.Name == methodName && m.GetParameters().Length == 2)
        //        //        .MakeGenericMethod(typeof(T), property.Type);

        //        //    query = (IQueryable<T>)orderByMethod.Invoke(null, new object[] { query, lambda });

        //        //    return query;
        //        //}


        //        #region former Apply ordering method
        //        //    private static IQueryable<T> ApplyOrdering<T>(IQueryable<T> query, PaginationRequest request)
        //        //where T : class
        //        //    {
        //        //        // Convert enum value to string
        //        //        string orderByProperty = request.OrderBy.ToString();

        //        //        // Get the property info using reflection
        //        //        var propertyInfo = typeof(T).GetProperty(orderByProperty);
        //        //        if (propertyInfo == null)
        //        //            return query; // Return unordered if property not found

        //        //        var parameter = Expression.Parameter(typeof(T), "x");
        //        //        var property = Expression.Property(parameter, propertyInfo);
        //        //        var lambda = Expression.Lambda(property, parameter);

        //        //        // Determine ordering method
        //        //        var methodName = request.Descending ?? true ? "OrderByDescending" : "OrderBy";

        //        //        // Apply ordering
        //        //        var orderByMethod = typeof(Queryable)
        //        //            .GetMethods()
        //        //            .First(m => m.Name == methodName && m.GetParameters().Length == 2)
        //        //            .MakeGenericMethod(typeof(T), propertyInfo.PropertyType);

        //        //        try
        //        //        {
        //        //            query = (IQueryable<T>)orderByMethod.Invoke(null, new object[] { query, lambda });
        //        //        }
        //        //        catch (Exception)
        //        //        {
        //        //            // If ordering fails, return unordered query
        //        //            return query;
        //        //        }

        //        //        return query;
        //        //    }

        //        #endregion

        //        private static IQueryable<T> ApplyOrdering<T>(IQueryable<T> query, PaginationRequest request)
        //        where T : class
        //        {
        //            try
        //            {
        //                // Map enum values to actual property names (optional - depends on your naming convention)
        //                Dictionary<ListOrder, string> propertyMap = new Dictionary<ListOrder, string>
        //                {
        //                    { ListOrder.Name, "Name" },
        //                    { ListOrder.LastUpdated, "LastUpdatedDate" }, // Adjust if your property has a different name
        //                    { ListOrder.Created, "Created" },         // Adjust if your property has a different name
        //                    { ListOrder.DollarValue, "DollarValue" },      // Adjust if your property has a different name
        //                    { ListOrder.DonationDate, "DonationDate" }      // Adjust if your property has a different name
        //                };

        //                // Get the actual property name to use
        //                string propertyName = propertyMap.ContainsKey(request.OrderBy)
        //                    ? propertyMap[request.OrderBy]
        //                    : request.OrderBy.ToString();

        //                // Check if property exists
        //                var propertyInfo = typeof(T).GetProperty(propertyName,
        //                    BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);

        //                if (propertyInfo == null)
        //                {
        //                    // Fallback to a default property if the requested one doesn't exist
        //                    propertyInfo = typeof(T).GetProperty("Id") ??
        //                        typeof(T).GetProperties().FirstOrDefault();

        //                    if (propertyInfo == null)
        //                        return query; // No properties available
        //                }

        //                // Create the expression
        //                var parameter = Expression.Parameter(typeof(T), "x");
        //                var property = Expression.Property(parameter, propertyInfo);
        //                var lambdaType = typeof(Func<,>).MakeGenericType(typeof(T), propertyInfo.PropertyType);
        //                var lambda = Expression.Lambda(lambdaType, property, parameter);

        //                // Determine ordering method
        //                string methodName = request.Descending ?? true ? "OrderByDescending" : "OrderBy";

        //                // Apply ordering
        //                var orderByMethod = typeof(Queryable)
        //                    .GetMethods()
        //                    .Where(m => m.Name == methodName && m.GetParameters().Length == 2)
        //                    .FirstOrDefault()
        //                    ?.MakeGenericMethod(typeof(T), propertyInfo.PropertyType);

        //                if (orderByMethod != null)
        //                {
        //                    query = (IQueryable<T>)orderByMethod.Invoke(null, new object[] { query, lambda });
        //                }

        //                return query;
        //            }
        //            catch (Exception)
        //            {
        //                // If ordering fails for any reason, return the original query
        //                return query;
        //            }
        //        }

        #endregion

        public static async Task<Result<List<T>>> ToPaginatedResultAsync<T>(
    this IQueryable<T> query,
    PaginationRequest request) where T : class
        {
            try
            {
                // Ensure valid pagination parameters
                var pageNumber = Math.Max(1, request.PageNumber);
                var pageSize = Math.Min(50, Math.Max(1, request.PageSize));

                // Apply filtering
                query = ApplyFilters(query, request);

                // Apply ordering
                query = ApplyOrdering(query, request);

                // Get total count before pagination
                var total = await query.CountAsync();

                if (total == 0)
                {
                    return Result<List<T>>.Success(
                        new List<T>(),
                        pageNumber,
                        pageSize,
                        total,
                        "No records found.");
                }

                // Apply pagination
                var items = await query
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return Result<List<T>>.Success(
                    items,
                    pageNumber,
                    pageSize,
                    total,
                    $"{total} record(s) found.");
            }
            catch (Exception ex)
            {
                return Result<List<T>>.Failure(
                    "An error occurred while retrieving the data.",
                    new List<string> { ex.Message });
            }
        }

        #region changed apply filters on 06-15-2025

        //private static IQueryable<T> ApplyFilters<T>(IQueryable<T> query, PaginationRequest request)
        //    where T : class
        //{
        //    if (!string.IsNullOrWhiteSpace(request.SearchText))
        //    {
        //        var searchTerm = request.SearchText.ToLower().Trim();
        //        var parameter = Expression.Parameter(typeof(T), "x");

        //        // Get all string properties of the entity
        //        var stringProperties = typeof(T).GetProperties()
        //            .Where(p => p.PropertyType == typeof(string));

        //        Expression combinedExpression = null;

        //        foreach (var prop in stringProperties)
        //        {
        //            var property = Expression.Property(parameter, prop.Name);

        //            // Handle null check
        //            var nullCheck = Expression.NotEqual(property, Expression.Constant(null));

        //            var toLower = Expression.Call(property,
        //                typeof(string).GetMethod("ToLower", Type.EmptyTypes));

        //            var value = Expression.Constant(searchTerm);

        //            var contains = Expression.Call(toLower,
        //                typeof(string).GetMethod("Contains", new[] { typeof(string) }),
        //                value);

        //            // Combine null check with contains
        //            var safePropCheck = Expression.AndAlso(nullCheck, contains);

        //            // Combine expressions with OR
        //            combinedExpression = combinedExpression == null
        //                ? safePropCheck
        //                : Expression.OrElse(combinedExpression, safePropCheck);
        //        }

        //        if (combinedExpression != null)
        //        {
        //            var lambda = Expression.Lambda<Func<T, bool>>(combinedExpression, parameter);
        //            query = query.Where(lambda);
        //        }
        //    }

        //    if (request.StartDate.HasValue && request.EndDate.HasValue)
        //    {
        //        // Check for multiple possible date property names
        //        var possibleDateProps = new[] { "CreatedDate", "Created", "DonationDate", "Date", "TransactionDate" };
        //        PropertyInfo dateProperty = null;

        //        foreach (var propName in possibleDateProps)
        //        {
        //            dateProperty = typeof(T).GetProperty(propName);
        //            if (dateProperty != null && dateProperty.PropertyType == typeof(DateTime))
        //                break;
        //        }

        //        if (dateProperty != null)
        //        {
        //            var parameter = Expression.Parameter(typeof(T), "x");
        //            var property = Expression.Property(parameter, dateProperty.Name);
        //            var startValue = Expression.Constant(request.StartDate.Value);
        //            var endValue = Expression.Constant(request.EndDate.Value);
        //            var greaterThanOrEqual = Expression.GreaterThanOrEqual(property, startValue);
        //            var lessThanOrEqual = Expression.LessThanOrEqual(property, endValue);
        //            var andAlso = Expression.AndAlso(greaterThanOrEqual, lessThanOrEqual);
        //            var lambda = Expression.Lambda<Func<T, bool>>(andAlso, parameter);
        //            query = query.Where(lambda);
        //        }
        //    }

        //    return query;
        //}

        #endregion

        private static IQueryable<T> ApplyFilters<T>(IQueryable<T> query, PaginationRequest request)
    where T : class
        {
            if (!string.IsNullOrWhiteSpace(request.SearchText))
            {
                var searchTerm = request.SearchText.ToLower().Trim();
                var parameter = Expression.Parameter(typeof(T), "x");

                // Get all string properties of the entity
                var stringProperties = typeof(T).GetProperties()
                    .Where(p => p.PropertyType == typeof(string));

                Expression combinedExpression = null;

                foreach (var prop in stringProperties)
                {
                    var property = Expression.Property(parameter, prop.Name);

                    // Handle null check
                    var nullCheck = Expression.NotEqual(property, Expression.Constant(null));

                    var toLower = Expression.Call(property,
                        typeof(string).GetMethod("ToLower", Type.EmptyTypes));

                    var value = Expression.Constant(searchTerm);

                    var contains = Expression.Call(toLower,
                        typeof(string).GetMethod("Contains", new[] { typeof(string) }),
                        value);

                    // Combine null check with contains
                    var safePropCheck = Expression.AndAlso(nullCheck, contains);

                    // Combine expressions with OR
                    combinedExpression = combinedExpression == null
                        ? safePropCheck
                        : Expression.OrElse(combinedExpression, safePropCheck);
                }

                if (combinedExpression != null)
                {
                    var lambda = Expression.Lambda<Func<T, bool>>(combinedExpression, parameter);
                    query = query.Where(lambda);
                }
            }

            if (request.StartDate.HasValue && request.EndDate.HasValue)
            {
                // Check for multiple possible date property names
                var possibleDateProps = new[] { "CreatedDate", "Created", "DonationDate", "Date", "TransactionDate" };
                PropertyInfo dateProperty = null;

                foreach (var propName in possibleDateProps)
                {
                    dateProperty = typeof(T).GetProperty(propName);
                    if (dateProperty != null && (dateProperty.PropertyType == typeof(DateTime) || dateProperty.PropertyType == typeof(DateTime?)))
                        break;
                }

                if (dateProperty != null)
                {
                    var parameter = Expression.Parameter(typeof(T), "x");
                    var property = Expression.Property(parameter, dateProperty.Name);

                    // Convert DateTime to UTC and handle date ranges properly
                    var startDate = request.StartDate.Value.Date; 
                    var endDate = request.EndDate.Value.Date.AddDays(1); 

                    var startDateUtc = startDate.Kind == DateTimeKind.Utc
                        ? startDate
                        : DateTime.SpecifyKind(startDate, DateTimeKind.Utc);

                    var endDateUtc = endDate.Kind == DateTimeKind.Utc
                        ? endDate
                        : DateTime.SpecifyKind(endDate, DateTimeKind.Utc);

                    var startValue = Expression.Constant(startDateUtc);
                    var endValue = Expression.Constant(endDateUtc);

                    var greaterThanOrEqual = Expression.GreaterThanOrEqual(property, startValue);
                    var lessThan = Expression.LessThan(property, endValue); // Changed to LessThan instead of LessThanOrEqual
                    var andAlso = Expression.AndAlso(greaterThanOrEqual, lessThan);
                    var lambda = Expression.Lambda<Func<T, bool>>(andAlso, parameter);
                    query = query.Where(lambda);
                }
            }

            return query;
        }

        private static IQueryable<T> ApplyOrdering<T>(IQueryable<T> query, PaginationRequest request)
            where T : class
        {
            try
            {
                // Map enum values to actual property names (optional - depends on your naming convention)
                Dictionary<ListOrder, string> propertyMap = new Dictionary<ListOrder, string>
        {
            { ListOrder.Name, "Name" },
            { ListOrder.LastUpdated, "LastUpdatedDate" },
            { ListOrder.Created, "Created" },
            { ListOrder.DollarValue, "DollarValue" },
            { ListOrder.DonationDate, "DonationDate" },
            { ListOrder.Title, "Title" }
        };

                // Get the actual property name to use
                string propertyName = propertyMap.ContainsKey(request.OrderBy)
                    ? propertyMap[request.OrderBy]
                    : request.OrderBy.ToString();

                // Check if property exists
                var propertyInfo = typeof(T).GetProperty(propertyName,
                    BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);

                if (propertyInfo == null)
                {
                    // Fallback to a default property if the requested one doesn't exist
                    propertyInfo = typeof(T).GetProperty("Id") ??
                        typeof(T).GetProperties().FirstOrDefault();

                    if (propertyInfo == null)
                        return query; // No properties available
                }

                // Create the expression
                var parameter = Expression.Parameter(typeof(T), "x");
                var property = Expression.Property(parameter, propertyInfo);
                var lambdaType = typeof(Func<,>).MakeGenericType(typeof(T), propertyInfo.PropertyType);
                var lambda = Expression.Lambda(lambdaType, property, parameter);

                // Determine ordering method
                string methodName = request.Descending ?? false ? "OrderByDescending" : "OrderBy";

                // Apply ordering
                var orderByMethod = typeof(Queryable)
                    .GetMethods()
                    .Where(m => m.Name == methodName && m.GetParameters().Length == 2)
                    .FirstOrDefault()
                    ?.MakeGenericMethod(typeof(T), propertyInfo.PropertyType);

                if (orderByMethod != null)
                {
                    query = (IQueryable<T>)orderByMethod.Invoke(null, new object[] { query, lambda });
                }

                return query;
            }
            catch (Exception)
            {
                // If ordering fails for any reason, return the original query
                return query;
            }
        }


    }
}