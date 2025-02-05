using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Yiodara.Application.Common
{
    public class Result<T>
    {
        // Properties for general result
        [JsonPropertyName("succeeded")]
        public bool Succeeded { get; set; }

        [JsonPropertyName("message")]
        public string Message { get; set; }

        [JsonPropertyName("errors")]
        public List<string> Errors { get; set; }

        [JsonPropertyName("validationErrors")]
        public List<ValidationResult> ValidationErrors { get; set; }

        [JsonPropertyName("data")]
        public T Data { get; set; }

        // Pagination properties (conditionally included)
        [JsonPropertyName("pageNumber")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public int? PageNumber { get; set; }

        [JsonPropertyName("pageSize")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public int? PageSize { get; set; }

        [JsonPropertyName("total")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public int? Total { get; set; }

        [JsonPropertyName("hasPrevious")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public bool? HasPrevious => PageNumber.HasValue ? PageNumber > 1 : null;

        [JsonPropertyName("hasNext")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public bool? HasNext => (PageSize.HasValue && Total.HasValue) ? PageSize < Total : null;

        public Result() { }
        // Constructor for regular results (non-paged)

        public Result(T data, bool succeeded, string message)
        {
            Data = data;
            Succeeded = succeeded;
            Message = message;
            Errors = new List<string>();
        }

        // Constructor for paged results
        public Result(T data, int pageNumber, int pageSize, int total, bool succeeded, string message)
        {
            Data = data;
            PageNumber = pageNumber;
            PageSize = pageSize;
            Total = total;
            Succeeded = succeeded;
            Message = message;
            Errors = new List<string>();
        }

        // Static methods for success and failure (non-paged)
        public static Result<T> Success(T data, string message = null)
        {
            return new Result<T>(data, true, message ?? "Operation succeeded.");
        }

        public static Result<T> Failure(string message, List<string> errors = null)
        {
            return new Result<T>(default(T), false, message) { Errors = errors ?? new List<string>() };
        }

        public static Result<T> Failure(string message, List<ValidationResult> errors)
        {
            return new Result<T>(default(T), false, message) { ValidationErrors = errors ?? new List<ValidationResult>() };
        }

        // Static methods for success and failure (paged)
        public static Result<T> Success(T data, int pageNumber, int pageSize, int total, string message = null)
        {
            message = message ?? $"{total} record(s) found.";
            return new Result<T>(data, pageNumber, pageSize, total, true, message);
        }

        public static Result<T> Failure(string message, int pageNumber, int? pageSize = null, int? total = null, List<string> errors = null)
        {
            return new Result<T>(default(T), pageNumber, pageSize ?? 10, total ?? 0, false, message) { Errors = errors ?? new List<string>() };
        }
    }
}
