import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useCategories } from "@/hooks/useCategories";
import { CampaignsGrid } from "@/components/campaigns/CampaignsGrid";
import { useToast } from "@/hooks/use-toast";


const Campaigns = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const campaignsPerPage = 9;

  const { campaigns, isLoading, error } = useCampaigns({
    onError: (errorMessage) => {
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  const { 
    categories: dynamicCategories, 
    isLoading: categoriesLoading, 
    error: categoriesError 
  } = useCategories({
    onError: (errorMessage) => {
      console.error("Categories fetch error:", errorMessage);
    }
  });

  const availableCategories = categoriesError || categoriesLoading 
    ? ["All", "Healthcare", "Education", "Environment"] 
    : dynamicCategories;

  const filteredCampaigns = useMemo(
    () =>
      campaigns.filter(
        (campaign) =>
          activeCategory === "All" || campaign.category === activeCategory
      ),
    [campaigns, activeCategory]
  );

  const totalPages = Math.ceil(filteredCampaigns.length / campaignsPerPage);
  const startIndex = (currentPage - 1) * campaignsPerPage;
  const displayedCampaigns = filteredCampaigns.slice(
    startIndex,
    startIndex + campaignsPerPage
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 mb-[80px]">
      <div className="text-center">
        <div className="relative text-center mt-[48px] md:mt-[60px] md:mb-[40px] mb-[20px]">
          <h1 className="absolute text-[44px] sm:text-5xl md:text-6xl lg:text-8xl w-full font-black font-raleway leading-[144px] text-[#F6D0FE] left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            CAMPAIGNS{" "}
          </h1>

          <h2 className="relative text-[12px] sm:text-2xl md:text-[24px] leading-[36px] font-extrabold font-raleway text-[#9F1AB1] z-10">
            CAMPAIGNS{" "}
          </h2>
        </div>
        <h2 className="text-[24px] md:text-[48px] font-raleway font-bold leading-[150%] md:leading-[72px] mb-[12px] md:mb-[50px]">
          See Popular Campaigns & Donate to Them.{" "}
        </h2>
      </div>

      <div className="mb-[40px] md:flex md:space-x-4 md:mb-[62px]">
        <h2 className="text-[16px] hidden md:block md:text-[24px] leading-[36px] font-mulish font-bold mb-3 md:mb-0">
          Campaign Categories:
        </h2>

        <div className="md:hidden overflow-x-auto scrollbar-hide">
          <div className="flex gap-3 pb-2 min-w-max">
            {availableCategories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                onClick={() => {
                  setActiveCategory(category);
                  setCurrentPage(1); 
                }}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap flex-shrink-0 ${
                  activeCategory === category
                    ? "bg-[#FBE8FF] border-[#9F1AB1] hover:bg-[#FBE8FF] border-[1px] font-mulish font-[700] text-[#9F1AB1]"
                    : "border-[#98A2B3] text-[#98A2B3] hover:border-[#9F1AB1] hover:text-[#9F1AB1]"
                }`}
                aria-label={`Filter by ${category}`}
                role="tab"
                aria-selected={activeCategory === category}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Desktop: Flex Wrap */}
        <div className="hidden md:flex flex-wrap gap-3 items-center">
          {availableCategories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              onClick={() => {
                setActiveCategory(category);
                setCurrentPage(1); 
              }}
              className={`px-[27px] py-2 text-base ${
                activeCategory === category
                  ? "bg-[#FBE8FF] border-[#9F1AB1] hover:bg-[#FBE8FF] border-[1px] font-mulish font-[700] text-[#9F1AB1]"
                  : "border-[#98A2B3] text-[#98A2B3] hover:border-[#9F1AB1] hover:text-[#9F1AB1]"
              }`}
              aria-label={`Filter by ${category}`}
              role="tab"
              aria-selected={activeCategory === category}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <CampaignsGrid
        campaigns={displayedCampaigns}
        isLoading={isLoading}
        error={error}
        variant="full"
        skeletonCount={6}
        emptyMessage="No campaigns found for this category."
        errorMessage="Failed to load campaigns. Please try again later."
      />

      {!isLoading && !error && totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination className="">
            <PaginationContent className=" w-[100%] flex justify-between">
              <PaginationItem className=" ">
                <PaginationPrevious
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>

              <div className="flex justify-center items-center">
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;

                  // Show first page, current page, last page, and pages around current
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className={
                            currentPage === page
                              ? "bg-[#F9F5FF] cursor-pointer border-none text-[#101828] font-mulish text-[14px] leading-5 font-medium"
                              : "text-[#98A2B3] cursor-pointer hover:bg-transparent"
                          }
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }

                  // Show ellipsis
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }

                  return null;
                })}
              </div>

              <PaginationItem className="">
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default Campaigns;