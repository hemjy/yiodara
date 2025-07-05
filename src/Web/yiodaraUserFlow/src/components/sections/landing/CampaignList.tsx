import { Button } from "@/components/ui/button";
import { useCampaigns } from "@/hooks/useCampaigns";
import { CampaignsGrid } from "@/components/campaigns/CampaignsGrid";

function CampaignList() {
  const { campaigns, isLoading, error } = useCampaigns({ 
    limit: 3,
    onError: (error) => console.error("Landing page campaign fetch error:", error)
  });
    
  return (
    <section className="bg-[#FDF4FF] py-10 md:py-16 lg:pb-[80px] lg:pt-[40px]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20">
        <div className="text-center">
          <div className="relative text-center mt-6 md:mt-[60px] mb-1 md:mb-[40px]">
            <h1 className="block absolute w-full text-[44px] sm:text-5xl md:text-6xl lg:text-8xl font-black font-raleway leading-tight lg:leading-[144px] text-[#F6D0FE] left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              CAMPAIGNS
            </h1>
            <h2 className="relative text-[12px] sm:text-2xl md:text-[24px] leading-tight md:leading-[36px] font-extrabold font-raleway text-[#9F1AB1] z-10">
              CAMPAIGNS
            </h2>
          </div>
          
          <h2 className="text-2xl mt-4 md:mt-0 leading-[150%] sm:text-3xl md:text-4xl lg:text-[48px] font-raleway font-bold lg:leading-[72px] mb-8 md:mb-[48px]">
            See Popular Campaigns & Donate to Them.
          </h2>
        </div>

        <div className="mb-8 md:mb-12">
          <CampaignsGrid
            campaigns={campaigns}
            isLoading={isLoading}
            error={error}
            variant="landing"
            skeletonCount={3}
            emptyMessage="No campaigns available at the moment."
            errorMessage="Failed to load campaigns. Please try again later."
          />
        </div>

        <div className="text-center">
          <Button
            className="px-8 py-2 md:px-[71px] md:py-[0px] font-bold text-sm md:text-[16px] leading-tight md:leading-[24px] font-mulish bg-transparent text-[#9F1AB1] border-2 border-[#9F1AB1] hover:bg-[#9F1AB1] hover:text-white transition-all duration-300"
            onClick={() => (window.location.href = "/campaigns")}
          >
            View All Campaigns
          </Button>
        </div>
      </div>
    </section>
  );
}

export default CampaignList;