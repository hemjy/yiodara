import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import DonateAuthModal from "@/components/auth/DonateAuthModal";
import campaignService from "@/services/campaignService";
import { Skeleton } from "@/components/ui/skeleton";
import DonateModal from "@/components/donation/DonateModal";
import paymentService from "@/services/paymentService";
import authService from "@/services/authService";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UICampaign {
  id: string;
  category: string;
  title: string;
  description: string;
  image: string;
  target: number;
  raised: number;
  percentageRaised: number;
  otherImages?: string[];
}

const CampaignDetails = () => {
  const params = useParams<{ id: string }>();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [campaign, setCampaign] = useState<UICampaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [mainImage, setMainImage] = useState<string | "">("");
  const [isFading, setIsFading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Get campaign ID from URL params
  const campaignId = params.id;

  // Fetch campaign details from API
  useEffect(() => {
    const fetchCampaignDetails = async () => {
      if (!campaignId) {
        setError("Campaign ID not found");
        setIsLoading(false);
        return;
      }

      console.log("Fetching campaign with ID:", campaignId);

      try {
        setIsLoading(true);
        const response = await campaignService.getCampaignById(campaignId);
        console.log("API response:", response);

        if (response.succeeded && response.data) {
          const apiCampaign = response.data;
          console.log("Raw API campaign data:", apiCampaign);

          // TEMPORARY: Use default values until backend adds these fields
          // Remove this once backend provides actual values
          const amountRaised = apiCampaign.amountRaised || 850; // Default value for now
          const percentageRaised =
            apiCampaign.amount > 0
              ? Math.round((amountRaised / apiCampaign.amount) * 100)
              : 0;

          console.log("Calculated values:", {
            amountRaised,
            target: apiCampaign.amount,
            percentageRaised,
          });

          // Map API campaign to UI format
          const uiCampaign: UICampaign = {
            id: apiCampaign.id,
            category: apiCampaign.campaignCategoryDto.name,
            title: apiCampaign.title,
            description: apiCampaign.description,
            image: apiCampaign.coverImageBase64,
            target: apiCampaign.amount,
            raised: amountRaised, // Using default value for now
            percentageRaised: percentageRaised,
            otherImages: apiCampaign.otherImagesBase64,
          };

          console.log("Mapped UI campaign:", uiCampaign);
          setCampaign(uiCampaign);
        } else {
          console.error("API error:", response.message);
          setError(response.message || "Failed to fetch campaign details");
        }
      } catch (err) {
        console.error("Error fetching campaign:", err);
        setError("An error occurred while fetching campaign details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaignDetails();
    window.scrollTo(0, 0);
  }, [campaignId]);

  useEffect(() => {
    if (campaign) {
      setMainImage(campaign.image);
      const timer = setTimeout(() => setProgress(campaign.percentageRaised), 300);
      return () => clearTimeout(timer);
    }
  }, [campaign]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: campaign?.title,
          text: `Check out this campaign: ${campaign?.title}`,
          url: window.location.href,
        });
        toast({ title: "Shared successfully!" });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied!",
        description: "The campaign link has been copied to your clipboard.",
      });
    }
  };

  const handleThumbnailClick = (newImage: string) => {
    if (newImage === mainImage || isFading) return;

    setIsFading(true);
    setTimeout(() => {
      setMainImage(newImage);
      setIsFading(false);
    }, 300);
  };

  const handleDonateClick = () => {
    if (authLoading) return;

    if (isAuthenticated) {
      // Show donation modal for authenticated users
      setShowDonateModal(true);
    } else {
      // Show auth modal for unauthenticated users
      setShowAuthModal(true);
    }
  };

  // Add this function to handle donations
  const handleDonate = async (amount: number, isAnonymous: boolean) => {
    if (!campaign) {
      console.error("Campaign data is missing");
      return;
    }

    // Log the anonymous preference (for future backend integration)
    console.log("Donation anonymous preference:", isAnonymous);

    // Get user data from auth service
    const userData = authService.getUserInfo();

    if (!userData || !userData.id || !userData.email) {
      console.error("User data is missing or incomplete", userData);

      // Check if we can get user info from the auth context
      if (user && user.id && user.email) {
        console.log("Using user data from auth context:", user);

        // Store the user data for future use
        authService.storeUserData({
          succeeded: true,
          data: {
            userId: user.id,
            email: user.email,
            accessToken: authService.getAccessToken() || "",
            refreshToken: "",
          },
        });
      } else {
        alert("Please log in again to continue.");
        return;
      }
    }

    // Get the user data again (should be available now)
    const updatedUserData = authService.getUserInfo();

    if (!updatedUserData || !updatedUserData.id || !updatedUserData.email) {
      console.error("Still unable to get user data");
      alert("Unable to process your donation. Please log in again.");
      return;
    }

    try {
      console.log("Using user data for payment:", updatedUserData);

      // Create payment link request
      const paymentRequest = {
        campaignId: campaign.id,
        amount: amount,
        currency: "USD", // Hardcoded for now
        customerEmail: updatedUserData.email,
        userId: updatedUserData.id,
      };

      console.log("Creating payment link with request:", paymentRequest);

      // Call the API to create a payment link
      const response = await paymentService.createPaymentLink(paymentRequest);

      if (response.succeeded && response.data) {
        console.log("Payment link created:", response.data);

        // Redirect to the payment URL
        window.location.href = response.data.paymentUrl;
      } else {
        console.error("Failed to create payment link:", response.message);
        alert("There was an error processing your payment. Please try again.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("There was an error processing your payment. Please try again.");
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

  // Loading state
  if (isLoading || authLoading) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 mb-[80px] bg-white">
        {/* Static Header */}
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
            Campaign Details
          </h2>
        </div>

        {/* Skeleton for dynamic content */}
        <div className="animate-pulse">
          <div className="flex items-center justify-between font-raleway">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-24" />
          </div>

          <div className="mt-8">
            <Skeleton className="w-full h-[450px] rounded-lg mb-4" />

            <div className="mt-6 space-y-2">
              <Skeleton className="h-2.5 w-full rounded-full" />
              <div className="flex justify-between">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-6 w-1/6" />
              </div>
              <Skeleton className="h-12 w-3/4 pt-4" />
              <div className="space-y-2 pt-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 md:gap-6 gap-4 pt-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>

            <div className="flex md:space-x-6 space-x-3 mt-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <Link to="/campaigns">
            <Button variant="outline">Back to Campaigns</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Campaign not found
  if (!campaign) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Campaign not found</h1>
          <p className="text-gray-600 mb-4">
            The campaign you're looking for doesn't exist or may have been
            removed.
          </p>
          <Link to="/campaigns">
            <Button variant="outline">Back to Campaigns</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 mb-[80px] bg-white">
      <div className="text-center">
        <div className="relative text-center mt-[48px] md:mt-[60px] md:mb-[40px] mb-[20px]">
          <h1 className="absolute text-[44px] sm:text-5xl md:text-6xl lg:text-8xl w-full font-black font-raleway leading-[144px] text-[#F6D0FE] left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            CAMPAIGNS{" "}
          </h1>

          <h2 className="relative text-[12px] sm:text-2xl md:text-x[24px] leading-[36px] font-extrabold font-raleway text-[#9F1AB1] z-10">
            CAMPAIGNS{" "}
          </h2>
        </div>
        <h2 className="text-[24px] md:text-[48px] font-raleway font-bold leading-[150%] md:leading-[72px] mb-[12px] md:mb-[50px]">
          Campaign Details
        </h2>
      </div>

      <div className="flex items-center justify-between font-raleway">
        <div className="text-sm font-semibold text-gray-500 bg-white  py-2 px-2  md:px-4 md:py-2 rounded-lg shadow-sm">
          <Link to="/campaigns" className="hover:underline">
            Campaigns
          </Link>
          <span className="md:mx-2 mx-1">/</span>
          <span className="text-[#9F1AB1]">{campaign.title}</span>
        </div>
        <Button
          variant="outline"
          onClick={handleShare}
          className="flex items-center gap-2 text-gray-600 border-[#F2F4F7] hover:bg-[#F2F4F7] bg-[#FCFCFD] text-sm font-semibold"
        >
          Share
          <Upload className="size-4" />
        </Button>
      </div>

      <div className="mt-8">
        <div className="relative w-full overflow-hidden rounded-lg mb-4">
          <img
            src={mainImage}
            alt={campaign.title}
            className={`w-full object-cover max-h-[450px] transition-opacity duration-300 ${
              isFading ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`absolute bottom-4 left-4 font-raleway text-sm font-bold ${getCategoryStyle(
              campaign.category
            )} rounded px-3 py-1.5 shadow-lg`}
          >
            {campaign.category}
          </span>
        </div>

        <div className="mt-6 space-y-2">
          <div className="flex justify-between items-center space-x-2 sm:space-x-3 md:space-x-[4px]">
            <div className="h-2 sm:h-2.5 bg-gray-100 rounded-full flex-1">
              <div
                className="h-full bg-[#FDB022] rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${Math.min(progress, 100)}%`,
                }}
              />
            </div>
            <div className="text-right text-xs sm:text-sm md:text-base font-mulish font-bold text-black min-w-[35px] sm:min-w-[40px]">
              {campaign.percentageRaised}%
            </div>
          </div>

          <div className="flex sm:flex-row justify-between gap-2 sm:gap-2">
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

          <h1 className=" text-2xl md:text-4xl lg:text-5xl  font-bold font-raleway mt-4 leading-[150%]">
            {campaign.title}
          </h1>
          <p className="leading-[200%] mt-4 text-[#667085] font-mulish text-[16px]">
            {campaign.description}
          </p>

          {campaign.otherImages && campaign.otherImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 md:gap-6 gap-4">
              {campaign.otherImages.map((image, index) => (
                <div
                  key={index}
                  className="overflow-hidden shadow-md rounded-lg cursor-pointer"
                  onClick={() => handleThumbnailClick(image)}
                >
                  <img
                    src={image}
                    alt={`${campaign.title} - Image ${index + 1}`}
                    className={`w-full h-32 object-cover transition-all duration-300 hover:scale-110 hover:opacity-80 ${
                      mainImage === image
                        ? "ring-2 ring-primary ring-offset-2"
                        : ""
                    }`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex md:space-x-6 space-x-3">
          <Button className="w-full bg-[#FBE8FF] hover:bg-[#FBE8FF] text-[16px] font-semibold mt-6 py-6 text-[#BA24D5]">
            Volunteer{" "}
          </Button>
          <Button
            className="w-full bg-[#9F1AB1] hover:bg-[#8a0f9c] text-white text-base font-semibold mt-6 py-6"
            onClick={handleDonateClick}
          >
            Donate Now
          </Button>
        </div>
      </div>

      {/* Auth Modal */}
      <DonateAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        campaignTitle={campaign.title}
        campaignDescription={campaign.description}
        raisedAmount={campaign.raised}
        goalAmount={campaign.target}
        percentageRaised={campaign.percentageRaised}
      />

      {/* Donation Modal */}
      <DonateModal
        isOpen={showDonateModal}
        onClose={() => setShowDonateModal(false)}
        onDonate={handleDonate}
        campaignTitle={campaign.title}
        campaignDescription={campaign.description}
        raisedAmount={campaign.raised}
        goalAmount={campaign.target}
        percentageRaised={campaign.percentageRaised}
      />
    </div>
  );
};

export default CampaignDetails;