using FluentEmail.Core;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;
using Yiodara.Application.DTOs;
using Yiodara.Application.Interfaces.Email;
using Yiodara.Domain.Entities;

namespace Yiodara.Infrastructure.Email
{
    public class EmailService : IEmailService
    {
        private readonly IWebHostEnvironment _hostenv;
        private readonly EmailConfiguration _emailConfiguration;
        private readonly string _apiKey;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IWebHostEnvironment hostenv, IOptions<EmailConfiguration> emailConfiguration, IConfiguration configuration, ILogger<EmailService> logger)
        {
            _hostenv = hostenv;
            _emailConfiguration = emailConfiguration.Value;
            _apiKey = configuration.GetValue<string>("MailConfig:mailApikey");
            _logger = logger;
        }



        public async Task SendEmailClient(string msg, string title, string email)
        {
            _logger.LogInformation("SendEmailClient called with email: {Email}, subject: {Title}", email, title);

            if (string.IsNullOrEmpty(msg))
            {
                _logger.LogError("Email message content cannot be null or empty");
                throw new ArgumentNullException(nameof(msg), "Email message content cannot be null or empty");
            }

            var message = new MimeMessage();
            message.To.Add(MailboxAddress.Parse(email));
            message.From.Add(new MailboxAddress(_emailConfiguration.EmailSenderName, _emailConfiguration.EmailSenderAddress));
            message.Subject = title;

            message.Body = new TextPart("html")
            {
                Text = msg
            };

            using (var client = new MailKit.Net.Smtp.SmtpClient())
            {
                try
                {
                    _logger.LogInformation("Connecting to SMTP server at {SMTPServerAddress}", _emailConfiguration.SMTPServerAddress);
                    client.Connect(_emailConfiguration.SMTPServerAddress, _emailConfiguration.SMTPServerPort, true);
                    client.Authenticate(_emailConfiguration.EmailSenderAddress, _emailConfiguration.EmailSenderPassword);
                    client.Send(message);
                    _logger.LogInformation("Email sent successfully to: {Email}", email);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while sending email to: {Email}", email);
                    throw;
                }
                finally
                {
                    client.Disconnect(true);
                    client.Dispose();
                }
            }
        }

        public async Task<bool> SendEmailAsync(MailReceiverDto model, MailRequests request)
        {
            _logger.LogInformation("SendEmailAsync called for email: {Email}", model.Email);

            try
            {
                if (string.IsNullOrWhiteSpace(request.HtmlContent))
                {
                    _logger.LogError("Email content cannot be null or empty");
                    throw new ArgumentNullException(nameof(request.HtmlContent), "Email content cannot be null or empty");
                }

                await SendEmailClient(request.HtmlContent, request.Title, model.Email);
                _logger.LogInformation("Email content sent successfully to: {Email}", model.Email);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while sending email to: {Email}", model.Email);
                throw new Exception("There was an error while sending email", ex);
            }
        }

        //public async Task<BaseResponse<MailReceiverDto>> SendMessageToUserAsync(CreateUser user)
        //{
        //    _logger.LogInformation("SendMessageToUserAsync called for user: {UserName}", user.FirstName + " " + user.LastName);

        //    var mailReceiverRequest = new MailReceiverDto
        //    {
        //        Email = user.Email,
        //        Name = user.FirstName + " " + user.LastName,
        //    };

        //    string emailBody = $"<p>Hello {user.FirstName},</p>\r\n" +
        //            $"<p>Welcome to Korede Hotel Management! We’re delighted to have you join our community.</p>\r\n" +
        //            $"<p>At Korede Hotel, we are dedicated to providing exceptional service and a memorable experience for all our guests. Here are a few things you can expect:</p>\r\n" +
        //            $"<ul>" +
        //            $"<li><strong>Top-notch Accommodations:</strong> Enjoy our well-appointed rooms and suites designed for your comfort and relaxation.</li>" +
        //            $"<li><strong>Exceptional Dining:</strong> Savor delicious meals at our on-site restaurant, offering a variety of culinary delights.</li>" +
        //            $"<li><strong>Excellent Amenities:</strong> Take advantage of our state-of-the-art facilities, including a fitness center, spa, and swimming pool.</li>" +
        //            $"<li><strong>Personalized Service:</strong> Our dedicated staff is here to ensure your stay is tailored to your needs.</li>" +
        //            $"</ul>" +
        //            $"<p>We hope you enjoy all that Korede Hotel has to offer and that your experience with us is nothing short of exceptional. Should you have any questions or require assistance, please do not hesitate to reach out to our team.</p>\r\n" +
        //            $"<p>Once again, welcome to Korede Hotel! We look forward to serving you and making your stay unforgettable.</p>\r\n" +
        //            $"<p>Warm regards,</p>\r\n" +
        //            $"<p><strong>The Korede Hotel Team</strong></p>";

        //    var mailRequest = new MailRequests
        //    {
        //        Body = emailBody,
        //        Title = "WELCOME TO KOREDE HOTEL MANAGEMENT SYSTEM",
        //        HtmlContent = emailBody,
        //        ToEmail = user.Email
        //    };

        //    try
        //    {
        //        await SendEmailAsync(mailReceiverRequest, mailRequest);
        //        _logger.LogInformation("Email sent successfully to: {Email}", mailReceiverRequest.Email);
        //        return new BaseResponse<MailReceiverDto>
        //        {
        //            Message = "Email sent successfully",
        //            Success = true,
        //            Data = mailReceiverRequest
        //        };
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogError(ex, "Failed to send email to: {Email}", mailReceiverRequest.Email);
        //        return new BaseResponse<MailReceiverDto>
        //        {
        //            Message = $"Failed to send notification: {ex.Message}",
        //            Success = false,
        //        };
        //    }
        //}

    }

}