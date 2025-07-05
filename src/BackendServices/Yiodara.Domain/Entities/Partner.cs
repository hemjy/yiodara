using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yiodara.Domain.Enums;

namespace Yiodara.Domain.Entities
{
    public class Partner : EntityBase
    {
        public Partner()
        {
        }

        public string CompanyName { get; set; }
        public string WebsiteUrl { get; set; }
        public Industry Industry { get; set; }
        public CompanySize CompanySize { get; set; }
        public string FullName { get; set; }
        public string JobTitle { get; set; }
        public string EmailAddress { get; set; }
        public string PhoneNumber { get; set; }
        public Guid CampaignId { get; set; }
        public SupportProvided SupportProvided { get; set; }
        public string? HowDoesYourOrganizationAimToContribute { get; set; }
        public string? WhatImpactDoYouHopeToAchieve { get; set; }
        public string? AnyOtherComments { get; set; }
        public bool AgreeToShareProvidedInfo { get; set; }
        public PartnerStatus Status { get; set; } = PartnerStatus.unconfirmed;
        public virtual Campaign Campaign { get; set; }

        public static Partner Create(
            string companyName,
            string websiteUrl,
            Industry industry,
            CompanySize companySize,
            string fullName,
            string jobTitle,
            string emailAddress,
            string phoneNumber,
            Guid campaignId,
            SupportProvided supportProvided,
            string howDoesYourOrganizationAimToContribute,
            string whatImpactDoYouHopeToAchieve,
            string anyOtherComments,
            bool agreeToShareProvidedInfo)
            => new()
            {
                CompanyName = companyName,
                WebsiteUrl = websiteUrl,
                Industry = industry,
                CompanySize = companySize,
                FullName = fullName,
                JobTitle = jobTitle,
                EmailAddress = emailAddress,
                PhoneNumber = phoneNumber,
                CampaignId = campaignId,
                SupportProvided = supportProvided,
                HowDoesYourOrganizationAimToContribute = howDoesYourOrganizationAimToContribute,
                WhatImpactDoYouHopeToAchieve = whatImpactDoYouHopeToAchieve,
                AnyOtherComments = anyOtherComments,
                AgreeToShareProvidedInfo = agreeToShareProvidedInfo
            };
    }
}