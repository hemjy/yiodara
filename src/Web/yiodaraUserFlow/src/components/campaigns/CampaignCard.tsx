import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { UICampaign } from "@/hooks/useCampaigns";

interface CampaignCardProps {
  campaign: UICampaign;
  variant?: 'landing' | 'full';
  onDonate?: (campaignId: string) => void;
}

export const CampaignCard = ({ 
  campaign, 
  onDonate 
}: CampaignCardProps) => {
  const navigate = useNavigate();

  const handleDonateClick = () => {
    if (onDonate) {
      onDonate(campaign.id);
    } else {
      navigate(`/campaign/${campaign.id}`);
    }
  };

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case "Healthcare":
        return "bg-[#E9D7FE] text-[#9F1AB1]";
      case "Education":
        return "bg-[#CFF9FE] text-[#088AB2]";
      case "Environment":
        return "bg-[#FEF0C7] text-[#DC6803]";
      default:
        return "bg-[#F0F0F0] text-[#666666]";
    }
  };

  return (
    <div className=" bg-white border-[1px] transition-all duration-300 overflow-hidden">
      <div className="h-[231.33px] overflow-hidden">
        <img
          src={campaign.image}
          alt={campaign.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="px-3 sm:px-4 pb-4 sm:pb-6 md:pb-[24px]">
        <button
          className={`my-3 sm:my-4 md:my-[16px] font-raleway text-[10px] sm:text-xs md:text-[12px] leading-tight md:leading-[18px] font-bold ${getCategoryStyle(campaign.category)} rounded px-2 py-1 shadow-sm`}
        >
          {campaign.category}
        </button>
        
        <h3 className="font-raleway font-bold text-sm sm:text-base md:text-lg lg:text-xl leading-tight mb-2">
          {campaign.title}
        </h3>
        
        <p className="font-mulish text-xs sm:text-sm md:text-sm font-medium leading-relaxed sm:leading-6 md:leading-8 text-[#000000] mb-4 sm:mb-6 md:mb-[24px] overflow-hidden" style={{
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical'
        }}>
          {campaign.description}
        </p>

        <div className="space-y-2 sm:space-y-0">
          <div className="flex justify-between items-center space-x-2 sm:space-x-3 md:space-x-[4px]">
            <div className="h-2 sm:h-2.5 bg-gray-100 rounded-full flex-1">
              <div
                className="h-full bg-[#FDB022] rounded-full transition-all duration-300"
                style={{ width: `${Math.min(campaign.percentageRaised, 100)}%` }}
              />
            </div>
            <div className="text-right text-xs sm:text-sm md:text-base font-mulish font-bold text-black min-w-[35px] sm:min-w-[40px]">
              {campaign.percentageRaised}%
            </div>
          </div>
          
          <div className="flex sm:flex-row justify-between gap-2 sm:gap-2 ">
            <div className="text-xs sm:text-sm md:text-[16px] leading-tight md:leading-[32px] font-[400] font-mulish text-[#98A2B3]">
              Raised:{" "}
              <span className="text-[#FDB022] font-[700] text-sm sm:text-base">
                ${campaign.raised.toLocaleString()}
              </span>
            </div>
            <div className="text-xs sm:text-sm md:text-[16px] leading-tight md:leading-[32px] font-[400] font-mulish text-[#98A2B3] text-left sm:text-right">
              Goal:{" "}
              <span className="text-[#067647] font-[700] text-sm sm:text-base">
                ${campaign.target.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <Button 
          className="w-full bg-[#9F1AB1] hover:bg-[#8a0f9c] active:bg-[#7a0e8a] text-white text-sm sm:text-base font-medium mt-4 sm:mt-6 md:mt-[20px] py-2.5 sm:py-3 group-hover:bg-[#8a0f9c] transition-all duration-300 shadow-sm hover:shadow-md"
          onClick={handleDonateClick}
        >
          Donate Now
        </Button>
      </div>
    </div>
  );
}; 

{/* <div className="h-40 sm:h-48 overflow-hidden relative"> */}
{/* className="w-full h-full hover:scale-105 transition-transform duration-300" */}
