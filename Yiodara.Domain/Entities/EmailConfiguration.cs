using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yiodara.Domain.Entities
{
    public class EmailConfiguration
    {
        public string EmailSenderAddress { get; set; }
        public string EmailSenderName { get; set; }
        public string EmailSenderPassword { get; set; }
        public string SMTPServerAddress { get; set; }
        public int SMTPServerPort { get; set; }
    }
}
