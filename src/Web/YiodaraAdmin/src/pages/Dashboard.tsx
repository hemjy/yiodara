import { useState } from "react";
import { Button } from "@/components/ui/button";
import DollarSignIcon from "../assets/Frame 1948757240.svg";
import Users from "../assets/Frame 1948757242.svg";
import Cash from "../assets/Frame 1948757243.svg";
import Donation from "../assets/Frame 1948757241.svg";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import communityimg from "../assets/image (9).png";
import educationimg from "../assets/image (10).png";
import medicalimg from "../assets/image (11).png";
import worldMap from "../assets/global-globalization-world-map-environmental-concservation-concept-b 1 (1).png";
import BarChart from "@/components/charts/BarChart";
import nigeria from "../assets/twemoji_flag-nigeria.svg";
import US from "../assets/twemoji_flag-united-states.svg";
import Ghana from "../assets/twemoji_flag-ghana.svg";
import UK from "../assets/twemoji_flag-united-kingdom.svg";
import SouthKorea from "../assets/twemoji_flag-south-korea.svg";
import Germany from "../assets/twemoji_flag-germany.svg";

import EuropeanUnion from "../assets/european-union-seeklogo.png";
import { useDonations } from '../hooks/useDonations';
import { useDonorCount, DonorCountResult } from '../hooks/useDonorCount';
import { useVolunteerCount } from '../hooks/useVolunteerCount';
import { Skeleton } from '@/components/ui/skeleton';
import { useDonorsByCountry } from '../hooks/useDonorsByCountry';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import { campaignService } from "@/api/campaignService";
import { useNavigate } from "react-router-dom";

type Donation = {
  id: string;
  donorName: string;
  amount: number;
  totalDonation: number;
  date: string;
  donorImage?: string; // Add optional donorImage property
};


// Mock chart data
const chartData = {
  labels: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  datasets: [
    {
      data: [
        3000, 6000, 10000, 3000, 7500, 4000, 2200, 3000, 8000, 3000, 5500, 9000,
      ],
      backgroundColor: "#BA24D5",
    },
  ],
};


// Helper function to get flag image based on country name
const getCountryFlag = (countryName: string) => {
  const flagMap: Record<string, string> = {
    'Nigeria': nigeria,
    'United States': US,
    'Ghana': Ghana,
    'United Kingdom': UK,
    'South Korea': SouthKorea,
    'Germany': Germany,
    'European Union': EuropeanUnion
  };
  
  return flagMap[countryName] || '';
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("top");
  const [donationParams, setDonationParams] = useState({
    pageNumber: 1,
    pageSize: 10,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch donation data
  const { 
    data: donationsData, 
    isLoading: isLoadingDonations,
    isError: isErrorDonations,
    error: donationsError
  } = useDonations(donationParams);

  // Fetch donor count and statistics
  const {
    data: donorCountData,
    isSuccess: donorCountSucceeded
  } = useDonorCount();
  
  // Fetch total volunteer count
  const { 
      data: volunteerCountData,
      isLoading: isLoadingCount
    } = useVolunteerCount();

  const dynamicOverviewData = [
    {
      icon: DollarSignIcon,
      amount: donorCountSucceeded ? `$${donorCountData.totalDonations.toLocaleString()}` : "$...",
      description: "Total Donation",
    },
    {
      icon: Cash,
      amount: donorCountSucceeded ? `$${donorCountData.donationsToday.toLocaleString()}` : "$...",
      description: "Donations Today",
    },
    {
      icon: Donation,
      amount: donorCountSucceeded ? donorCountData.totalDonors.toLocaleString() : "...",
      description: "Total Donors",
    },
    {
      icon: Users,
      amount: isLoadingCount ? "..." : volunteerCountData?.totalVolunteers,
      description: "Total Volunteers",
    },
  ];

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

  const handleUpdateCampaign = (id: string) => {
    navigate(`/campaigns/edit/${id}`);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setDonationParams(prev => ({
      ...prev,
      pageNumber: page,
    }));
  };

  const {
    data: countryData,
    isLoading: isLoadingCountryData,
  } = useDonorsByCountry();


  // Handle refresh data
  const handleRefreshData = async () => {
    setIsRefreshing(true);
    
    try {
      // Invalidate all relevant queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['donorCount'] }),
        queryClient.invalidateQueries({ queryKey: ['donations'] }),
        queryClient.invalidateQueries({ queryKey: ['volunteerCount'] }),
        queryClient.invalidateQueries({ queryKey: ['donorsByCountry'] })
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500); // Add a small delay to make the animation visible
    }
  };

  // Add this query to fetch real campaign data
  const { 
    data: campaignsData, 
    isLoading: isLoadingCampaigns, 
    isError: isErrorCampaigns, 
    error: campaignsError 
  } = useQuery({
    queryKey: ['dashboardCampaigns'],
    queryFn: () => campaignService.getAllCampaigns({ pageSize: 4 }), // Limit to 4 campaigns for dashboard
  });

  // Process campaigns data
  const realCampaigns = campaignsData?.data?.map((campaign: any) => {
  return {
      id: campaign.id,
      title: campaign.title,
      description: campaign.description || "No description available",
      image: campaign.coverImageBase64 || getCategoryImage(campaign.campaignCategoryDto?.name),
      category: campaign.campaignCategoryDto?.name || "Community Service",
      goal: campaign.amount || 0,
      raised: campaign.amountRaised || 0,
      left: campaign.amountLeft,
      status: campaign.isCompleted ? "completed" : "active",
      currency: campaign.currency || "USD"
    };
  }) || [];

  // Get category image (keep your existing function)
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

  // Get currency symbol
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
        return '$'; // Default to $ if not found
    }
  };

  return (
    <section className="font-raleway">
      <div className="flex flex-row justify-between items-center mb-4 sm:mb-6 space-y-0 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl lg:text-[36px] font-bold text-gray-800 leading-[150%]">
          Dashboard
        </h1>
        <button
          onClick={handleRefreshData}
          disabled={isRefreshing}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors self-end sm:self-auto"
          title="Refresh data"
        >
          <RefreshCw 
            className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-[#BA24D5]' : 'text-black'}`} 
          />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 font-mulish">
        {dynamicOverviewData.map((item, index) => (
          <div
            key={index}
            className="bg-gradient-to-b cursor-pointer from-[#FBE8FF] to-[#FEF9FF] p-4 sm:p-6 hover:shadow-lg shadow-sm border border-[#FBE8FF] rounded-lg"
          >
            <img src={item.icon} alt="" className="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4" />
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 truncate">{item.amount}</h2>
            <p className="text-sm sm:text-base text-[#667085]">{item.description}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-1 lg:grid-cols-2 sm:gap-6 mb-6 sm:mb-8 font-mulish">
        
        {/* Donors Location - First on Desktop, Second on Mobile */}
        <div className="border rounded-lg p-2 sm:p-6 order-2 lg:order-1">
          <h2 className="text-lg sm:text-xl font-bold mb-4">Donors Location</h2>
          <div className="mb-4">
            <img
              src={worldMap}
              alt="World Map"
              className="object-cover w-full h-full sm:h-auto rounded hover:scale-105 transition-transform duration-300 cursor-pointer"
            />
          </div>
          <div className="space-y-2 sm:space-y-4">
            {isLoadingCountryData ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Skeleton className="w-5 h-5 sm:w-6 sm:h-6 rounded-full mr-2" />
                      <Skeleton className="h-4 sm:h-5 w-20 sm:w-24" />
                    </div>
                    <Skeleton className="h-4 sm:h-5 w-10 sm:w-12" />
                  </div>
                ))}
              </div>
            ) : !countryData?.succeeded ? (
              <div className="p-3 sm:p-4 text-center text-gray-500 font-mulish text-sm">
                {countryData?.message || "No country data available"}
              </div>
            ) : (
              countryData.countries.map((country, index) => (
                <div key={index} className="flex items-center justify-between py-1">
                  <div className="flex items-center">
                    <img 
                      src={getCountryFlag(country.country)} 
                      alt={country.country} 
                      className="w-5 h-5 sm:w-6 sm:h-6 object-cover mr-2 rounded-sm flex-shrink-0" 
                    />
                    <span className="text-sm sm:text-base truncate">{country.country}</span>
                  </div>
                  <span className="text-sm sm:text-base font-medium text-gray-700">{country.percentage}%</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border rounded-lg p-2 sm:p-6 order-1 lg:order-2">
          <div className="flex justify-between items-center mb-0 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold">Statistics</h2>
          </div>

          {/* Date Filter - Mobile Responsive */}
          <div className="flex flex-row justify-between items-center mt-2 md:mt-3 mb-4">
            <span className="text-xs sm:text-sm text-[#000000] font-bold font-mulish mr sm:mr-2">Filter by Date:</span>
            
            <div className="flex space-x-1 sm:space-y-0 flex-row sm:space-x-2">

              <button className="bg-[#FEFAFF] border-[#F6D0FE] border-[1.5px] text-[#BA24D5] rounded-md px-1 md:px-3 md:py-2 text-xs sm:text-sm font-medium">
                <span>Select Start Date</span>
              </button>

              <span className=" sm:inline text-gray-400">-</span>

              <button className="bg-[#F9F5FF] border-[#F6D0FE] border-[1.5px] text-[#BA24D5] rounded-md px-1 md:px-3 md:py-2 text-xs sm:text-sm font-medium">
                <span>Select End Date</span>
              </button>
            </div>
          </div>

          <div className="h-64 sm:h-80">
            <BarChart data={chartData} />
          </div>
        </div>
      </div>

      <div className="space-y-6 lg:space-y-0 lg:flex lg:gap-6 mb-6 sm:mb-8">
        
        {/* Campaigns Section */}
        <div className="lg:w-2/3">
          <div className="flex space-y-2 sm:space-y-0 flex-row justify-between items-end mb-4">
            <h2 className="text-base font-bold text-[#131316] leading-[150%]">Campaigns</h2>
            <button 
              className="text-[#BA24D5] font-bold text-[14px] underline leading-[150%] self-start sm:self-auto"
              onClick={() => navigate('/campaigns')}
            >
              See all campaigns
            </button>
          </div>

          {isLoadingCampaigns ? (
            <div className="space-y-4 sm:space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <Skeleton className="h-40 sm:h-48 w-full" />
                  <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                    <Skeleton className="h-5 sm:h-6 w-3/4" />
                    <Skeleton className="h-3 sm:h-4 w-full" />
                    <Skeleton className="h-3 sm:h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : isErrorCampaigns ? (
            <div className="flex justify-center items-center h-48 sm:h-64 flex-col p-4">
              <div className="text-red-500 mb-4 text-sm sm:text-base text-center">Error loading campaigns</div>
              <div className="text-xs sm:text-sm text-gray-500 text-center">
                {(campaignsError as Error)?.message || "Unknown error occurred"}
              </div>
            </div>
          ) : realCampaigns.length === 0 ? (
            <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg">
              <div className="text-gray-500 mb-2 text-sm sm:text-base">No campaigns found</div>
              <div className="text-xs sm:text-sm text-gray-400">
                There are no active campaigns at the moment.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
              {realCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="overflow-hidden rounded-t-lg flex flex-col h-full"
                >
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
                        className={`inline-block px-2 py-1 text-xs font-bold rounded ${getCategoryBadgeColor(
                          campaign.category
                        )}`}
                      >
                        {campaign.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 flex flex-col flex-grow border rounded-b-lg">
                    <h3 className="font-bold text-base sm:text-lg mb-2 line-clamp-2">{campaign.title}</h3>
                    <p className="font-mulish text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2 flex-grow">
                      {campaign.description}
                    </p>

                    <div className="font-mulish">
                      <div className="grid grid-cols-3 text-center py-0 my-4">
                        <div>
                          <p className="font-bold text-[15px] leading-[100%]  ">
                            {getCurrencySymbol(campaign.currency)}{campaign.goal.toLocaleString()}
                          </p>
                          <p className="text-[#475467] text-[13px] leading-[100%] font-mulish pt-2">Goal</p>
                        </div>

                        <div className="border-l border-r ">
                          <p className="font-bold text-[15px] leading-[100%]">
                            {getCurrencySymbol(campaign.currency)}{campaign.raised.toLocaleString()}
                          </p>
                          <p className="text-[#475467] text-[13px] leading-[100%] font-mulish pt-2">Raised</p>
                        </div>

                        <div className="">
                          <p className="font-bold text-[15px] leading-[100%]"> 
                            {getCurrencySymbol(campaign.currency)}{campaign.left.toLocaleString()}
                          </p>
                          <p className="text-[#475467] text-[13px] leading-[100%] font-mulish pt-2">Left</p>
                        </div>
                      </div>
                      </div>

                    <Button
                        className="w-full rounded-none font-mulish bg-[#FDF4FF] text-[#BA24D5] border-[1.5px] border-[#BA24D5] hover:bg-[#F9F5FF] text-xs sm:text-sm py-2"
                        onClick={() => handleUpdateCampaign(campaign.id)}
                      >
                        Update Campaign
                      </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:w-1/3">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4">Donors</h2>
            <div className="bg-gray-50 rounded-lg p-1 sm:p-2 flex mb-4 sm:mb-6">
              <button
                className={`py-2 px-3 sm:px-6 rounded-lg font-medium text-xs sm:text-sm flex-1 transition-colors ${
                  activeTab === "top" 
                    ? "bg-white text-[#BA24D5] shadow-sm" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("top")}
              >
                Top Donors
              </button>
              <button
                className={`py-2 px-3 sm:px-6 rounded-lg font-medium text-xs sm:text-sm flex-1 transition-colors ${
                  activeTab === "recent" 
                    ? "bg-white text-[#BA24D5] shadow-sm" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("recent")}
              >
                Recent Donors
              </button>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {isLoadingDonations ? (
              <>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-4 sm:pb-6">
                    <div className="flex items-center">
                      <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full mr-3 sm:mr-4" />
                      <div className="space-y-1 sm:space-y-2">
                        <Skeleton className="h-4 sm:h-5 w-24 sm:w-32" />
                        <Skeleton className="h-3 sm:h-4 w-32 sm:w-40" />
                      </div>
                    </div>
                    <Skeleton className="h-4 sm:h-6 w-16 sm:w-20" />
                  </div>
                ))}
              </>
            ) : isErrorDonations ? (
              <div className="p-3 sm:p-4 border border-red-200 bg-red-50 text-red-700 rounded-lg text-xs sm:text-sm">
                Error loading donations: {donationsError?.message || 'Unknown error'}
              </div>
            ) : donationsData?.donations.length === 0 ? (
              <div className="p-3 sm:p-4 border border-gray-200 bg-gray-50 text-gray-700 rounded-lg text-xs sm:text-sm">
                {donationsData?.message || 'No donations found.'}
              </div>
            ) : (
              donationsData?.donations.map((donation: Donation) => (
                <div key={donation.id} className="flex items-center justify-between border-b pb-4 sm:pb-6 font-mulish">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center text-[#BA24D5] mr-2 sm:mr-3 overflow-hidden flex-shrink-0">
                      {donation.donorImage ? (
                        <img 
                          src={donation.donorImage}
                          alt={donation.donorName} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.textContent = donation.donorName.split(' ').map(n => n[0]).join('').substring(0, 2);
                          }}
                        />
                      ) : (
                        <span className="text-xs sm:text-sm font-bold">
                          {donation.donorName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-gray-800 text-xs sm:text-sm truncate">{donation.donorName}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-1 line-clamp-2">
                        Last Donation on {new Date(donation.date).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}, at {new Date(donation.date).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right ml-2 flex-shrink-0">
                    <p className="font-bold text-gray-400 text-xs sm:text-sm">${donation.amount.toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
            
            <div className="text-center">
              <Button 
                variant="link" 
                className="text-[#BA24D5] font-medium text-xs sm:text-sm"
                onClick={() => navigate('/donors')}
              >
                Show more
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;