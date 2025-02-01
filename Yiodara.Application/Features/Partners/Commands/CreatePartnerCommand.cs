using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yiodara.Application.Common;

namespace Yiodara.Application.Features.Partners.Commands
{
    public class CreatePartnerCommand : IRequest<Result<Guid>>
    {

    }
}
