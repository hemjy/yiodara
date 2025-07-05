using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yiodara.Application.DTOs;

namespace Yiodara.Application.Interfaces.Email
{
    public interface IEmailService
    {
        Task SendEmailClient(string msg, string title, string email);
        //Task<BaseResponse<MailReceiverDto>> SendMessageToUserAsync(CreateUser profile);
        Task<bool> SendEmailAsync(MailReceiverDto model, MailRequests request);
    }
}
