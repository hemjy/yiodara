import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Calendar, Loader2, Trash2, X } from "lucide-react";
import communityimg from "../assets/image (9).png";
import educationimg from "../assets/image (10).png";
import medicalimg from "../assets/image (11).png";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { campaignService } from "@/api/campaignService";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Campaign as ApiCampaign, CampaignParams } from "@/types/campaign";
import { useDraftCampaigns, useCampaigns } from "@/hooks/useCampaigns";

interface Campaign {
  id: string;
  title: string;
  description: string;
  image: string;
  category: "Medical Care" | "Education" | "Community Service" | "Healthy Care";
  goal: number;
  raised: number;
  left: number;
  status: "active" | "completed" | "draft";
  currency: string;
}

const Campaigns = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("all");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);
  
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setSearchText(searchQuery);
      setIsSearching(true);
    } else {
      setSearchText("");
      setIsSearching(false);
    }
  }, [location.search]);

  const queryParams: CampaignParams = {
    pageNumber: 1,
    pageSize: 50
  };

  if (searchText) {
    queryParams.searchText = searchText;
  }

  if (selectedCategory) {
    queryParams.categoryName = selectedCategory;
  }

  const { 
    data: campaignsData, 
    isLoading: isLoadingCampaigns, 
    isError: isErrorCampaigns, 
    error: campaignsError
  } = useCampaigns(queryParams);

  const {
    data: draftCampaignsData,
    isLoading: isLoadingDrafts,
  } = useDraftCampaigns(queryParams);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => campaignService.deleteCampaign(id),
    onSuccess: () => {
      toast({
        title: "Campaign deleted",
        description: "The campaign has been successfully deleted.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setCampaignToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete campaign. Please try again.",
        variant: "destructive",
      });
      console.error("Delete error:", error);
    }
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowCategoryDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const clearSearch = () => {
    setSearchText("");
    setIsSearching(false);
    navigate('/campaigns');
  };

  const getCategoryImage = (category: string) => {
    switch (category) {
      case "Medical Care":
        return medicalimg;
      case "Education":
        return educationimg;
      case "Healthy Care":
        return medicalimg;
      default:
        return communityimg;
    }
  };

  const campaigns: Campaign[] = campaignsData?.data?.map((campaign: ApiCampaign) => {
    return {
      id: campaign.id,
      title: campaign.title,
      description: campaign.description || "No description available",
      image: campaign.coverImageBase64,
      category: campaign.campaignCategoryDto?.name as any,
      goal: campaign.amount || 0,
      raised: campaign.amountRaised || 0,
      left: campaign.amountLeft || 0,
      status: campaign.isCompleted ? "completed" : "active",
      currency: campaign.currency
    };
  }) || [];

  const draftCampaigns: Campaign[] = draftCampaignsData?.data?.map((campaign: ApiCampaign) => {
    return {
      id: campaign.id,
      title: campaign.title,
      description: campaign.description || "No description available",
      image: campaign.coverImageBase64,
      category: campaign.campaignCategoryDto?.name as any,
      goal: campaign.amount || 0,
      raised: campaign.amountRaised || 0,
      left: campaign.amountLeft || 0,
      status: "draft",
      currency: campaign.currency
    };
  }) || [];

  const categories = Array.from(
    new Set(campaigns.map((campaign) => campaign.category))
  );

  const campaignsToDisplay = activeTab === 'draft' ? draftCampaigns : campaigns;

  const filteredCampaigns = campaignsToDisplay.filter((campaign) => {
    if (activeTab === "all") {
      if (campaign.status === 'draft') return false;
    } else if (activeTab === "completed" && campaign.status !== "completed") {
      return false;
    } else if (activeTab === "incomplete" && campaign.status !== "active") {
      return false;
    }

    if (selectedCategory && campaign.category !== selectedCategory) {
      return false;
    }

    return true;
  });

   const getCategoryBadgeColor = (category: string) => {
    const colors = [
      "bg-red-100 text-red-800",
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-yellow-100 text-yellow-800",
      "bg-indigo-100 text-indigo-800",
      "bg-pink-100 text-pink-800",
      "bg-purple-100 text-purple-800",
    ];

    switch (category) {
      case "Healthcare":
        return "bg-[#E9D7FE] text-[#9F1AB1]";
      case "Environment":
        return "bg-[#F0F9FF] text-[#026AA2]";
      case "Education":
        return "bg-[#FEF0C7] text-[#DC6803]";
      default: {
        const randomIndex = Math.floor(Math.random() * colors.length);
        return colors[randomIndex];
      }
    }
  };

  const getCurrencySymbol = (currencyCode: string): string => {
    switch (currencyCode?.toUpperCase()) {
      case 'USD':
        return '$';
      case 'POUNDS':
      case 'GBP':
        return '£';
      case 'EUR':
        return '€';
      case 'JPY':
        return '¥';
      case 'NGN':
      case 'NAIRA':
        return '₦';
      default:
        return currencyCode || '';
    }
  };

  const handleUpdateCampaign = (id: string) => {
    navigate(`/campaigns/edit/${id}`);
  };

  const handleDeleteCampaign = (id: string) => {
    setCampaignToDelete(id);
  };

  const confirmDelete = () => {
    if (campaignToDelete) {
      deleteMutation.mutate(campaignToDelete);
    }
  };

  const cancelDelete = () => {
    setCampaignToDelete(null);
  };

  if (isLoadingCampaigns || isLoadingDrafts) {
    return (
      <section className="font-raleway">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                
                <div className="flex justify-between py-4">
                  <div className="px-4">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-4 w-12 mt-2" />
                  </div>
                  <div className="px-4 border-l border-r">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-4 w-12 mt-2" />
                  </div>
                  <div className="px-4">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-4 w-12 mt-2" />
                  </div>
                </div>
                
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (isErrorCampaigns) {
    return (
      <div className="flex justify-center items-center h-64 flex-col">
        <div className="text-red-500 mb-4">Error loading campaigns</div>
        <div className="text-sm text-gray-500">{(campaignsError as Error)?.message || "Unknown error occurred"}</div>
        <Button 
          className="mt-4 bg-[#BA24D5] hover:bg-[#9F1AB1]"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <section className="font-raleway">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-6">
        <h1 className="text-2xl sm:text-[36px] leading-[150%] sm:leading-[54px] font-bold text-gray-800 flex items-center mb-2 sm:mb-0">
          Campaigns{" "}
          <span className="text-[#FCFCFD] bg-[#BA24D5] rounded-full text-center justify-center items-center flex size-[28px] sm:size-[33px] text-xs sm:text-sm font-mulish ml-2">
            {campaignsData?.data?.length || 0}
          </span>
        </h1>
      </div>

      {isSearching && (
        <div className="mb-4 sm:mb-6 p-2 md:p-3 bg-[#FDF4FF] rounded-md flex flex-row items-center justify-between gap-2">
          <span className="text-sm text-black">
            Showing results for: <span className="text-[#BA24D5] font-bold">"{searchText}"</span>
          </span>
          <button 
            onClick={clearSearch}
            className="text-[#BA24D5] text-sm hover:underline font-bold flex items-center self-start sm:self-auto"
          >
            Clear search <X className="h-3 w-3 ml-1 font-extrabold" />
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4 sm:mb-6 gap-4 font-mulish">
        <div className="flex gap-0 overflow-x-auto scrollbar-hide">
          <button
            className={`px-2 sm:px-6 py-2 text-center font-mulish text-xs sm:text-sm border border-[#BA24D5] whitespace-nowrap ${
              activeTab === "all"
                ? "bg-[#BA24D5] text-white font-semibold"
                : "bg-white text-[#BA24D5]"
            } rounded-l-md`}
            onClick={() => setActiveTab("all")}
          >
            All Campaigns
          </button>
          <button
            className={`px-2 sm:px-6 py-2 text-center font-mulish text-xs sm:text-sm border-t border-b border-r border-[#BA24D5] whitespace-nowrap ${
              activeTab === "completed"
                ? "bg-[#BA24D5] text-white"
                : "bg-white text-[#BA24D5]"
            }`}
            onClick={() => setActiveTab("completed")}
          >
            Completed Goals
          </button>
          <button
            className={`px-2 sm:px-6 py-2 text-center font-mulish text-xs sm:text-sm border-t border-b border-r border-[#BA24D5] whitespace-nowrap ${
              activeTab === "incomplete"
                ? "bg-[#BA24D5] text-white"
                : "bg-white text-[#BA24D5]"
            }`}
            onClick={() => setActiveTab("incomplete")}
          >
            Incomplete Goals
          </button>
          <button
            className={`px-2 sm:px-6 py-2 text-center font-mulish text-xs sm:text-sm border border-t-[#BA24D5] border-b-[#BA24D5]   border-r-[#BA24D5] whitespace-nowrap ${
              activeTab === "draft"
                ? "bg-[#BA24D5] text-white"
                : "bg-white text-[#BA24D5]"
            } rounded-r-md`}
            onClick={() => setActiveTab("draft")}
          >
            Draft
          </button>
        </div>
        
        <div className="flex flex-row gap-2 sm:gap-0">
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="outline"
              className="bg-[#FEFAFF] border border-[#BA24D5] px-2 sm:px-4 py-2 font-mulish font-medium text-xs sm:text-sm rounded-md sm:mr-2 flex items-center justify-between w-auto text-[text-[#9F1AB1]"
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              <span className="truncate text-[#BA24D5]">{selectedCategory || "Filter by Category"}</span>
              <ChevronDown className="h-4 w-4 ml-0 sm:ml-2 flex-shrink-0 text-[#BA24D5]" />
            </Button>

            {showCategoryDropdown && (
              <div className="absolute z-10 mt-1 w-full sm:w-48 bg-white border border-gray-200 rounded-md shadow-lg">
                <div className="py-1">
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#F9F5FF] hover:text-[#BA24D5]"
                    onClick={() => {
                      setSelectedCategory(null);
                      setShowCategoryDropdown(false);
                    }}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#F9F5FF] hover:text-[#BA24D5]"
                      onClick={() => {
                        setSelectedCategory(category);
                        setShowCategoryDropdown(false);
                      }}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <Button
            variant="outline"
            className="bg-[#FEFAFF] text-[#BA24D5] border border-[#BA24D5] px-2 sm:px-4 py-2 font-mulish font-medium text-xs sm:text-sm rounded-md flex items-center justify-center w-auto"
          >
            <span>By Date</span>
            <Calendar className="h-4 w-4 sm:ml-2" />
          </Button>
        </div>
      </div>

      {filteredCampaigns.length === 0 ? (
        <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg mx-2 sm:mx-0">
          <div className="mb-2 text-sm sm:text-base text-black">No campaigns found</div>
          <div className="text-xs sm:text-sm text-black px-4 font-bold">
            {isSearching
              ? `No results found for "${searchText}"`
              : selectedCategory 
                ? `No ${activeTab !== 'all' ? activeTab : ''} campaigns found in the ${selectedCategory} category.` 
                : `No ${activeTab !== 'all' ? activeTab : ''} campaigns available.`}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-4">
          {filteredCampaigns.map((campaign) => (
            <div key={campaign.id} className="overflow-hidden flex flex-col h-full relative group rounded-t-lg">
              <button
                className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCampaign(campaign.id);
                }}
                aria-label="Delete campaign"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </button>
              
              <div className="aspect-video sm:aspect-[16/9] overflow-hidden relative">
                <img
                  src={campaign.image}
                  alt={campaign.title}
                  className="w-full h-full hover:scale-105 transition-transform duration-300 cursor-pointer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = getCategoryImage(campaign.category);
                  }}
                />
                <div className="absolute bottom-2 left-2">
                  <span
                    className={`inline-block px-2 py-1 rounded-md text-xs font-bold ${getCategoryBadgeColor(
                      campaign.category
                    )}`}
                  >
                    {campaign.category}
                  </span>
                </div>
              </div>
              
              <div className="p-3 sm:p-4 flex flex-col flex-grow border-[1px] border-[#EAECF0] border-t-0 rounded-b-lg">
                <h3 className="font-bold text-base sm:text-lg mb-2 font-raleway sm:text-[16px] line-clamp-2">{campaign.title}</h3>
                <p className="font-mulish text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2 flex-grow">
                  {campaign.description}
                </p>

                <div className="flex justify-between text-center py-3 sm:py-4 font-mulish mx-auto">
                  <div className="px-4 sm:px-4">
                    <p className="text-[#000000] font-mulish text-sm sm:text-[15px] leading-[100%] font-bold">
                      {getCurrencySymbol(campaign.currency)} {campaign.goal.toLocaleString()}
                    </p>
                    <p className="text-[#475467] text-xs sm:text-[13px] leading-[100%] font-mulish pt-2">Goal</p>
                  </div>
                  <div className="px-4 sm:px-4 border-l border-r">
                    <p className="text-[#000000] font-mulish text-sm sm:text-[15px] leading-[100%] font-bold">
                      {getCurrencySymbol(campaign.currency)} {campaign.raised.toLocaleString()}
                    </p>
                    <p className="text-[#475467] text-xs sm:text-[13px] leading-[100%] font-mulish pt-2">Raised</p>
                  </div>
                  <div className="px-4 sm:px-4">
                    <p className="text-[#000000] font-mulish text-sm sm:text-[15px] leading-[100%] font-bold">
                      {getCurrencySymbol(campaign.currency)} {campaign.left.toLocaleString()}
                    </p>
                    <p className="text-[#475467] text-xs sm:text-[13px] leading-[100%] font-mulish pt-2">Left</p>
                  </div>
                </div>

                <button
                  className="w-full py-2 sm:py-2 text-xs sm:text-[14px] leading-[160%] bg-[#FDF4FF] border-[1.5px] text-[#BA24D5] font-mulish font-[600] rounded-none border-[#BA24D5] hover:bg-[#F9F5FF] transition-colors"
                  onClick={() => handleUpdateCampaign(campaign.id)}
                >
                  Update Campaign
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!campaignToDelete} onOpenChange={(open) => !open && setCampaignToDelete(null)}>
        <AlertDialogContent className="mx-4 sm:mx-auto max-w-md sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg sm:text-xl">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base">
              This action cannot be undone. This will permanently delete the campaign and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel onClick={cancelDelete} className="w-full sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white w-full sm:w-auto"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>Delete</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};

export default Campaigns;