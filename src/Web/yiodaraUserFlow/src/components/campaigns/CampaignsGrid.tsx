import { CampaignCard } from "./CampaignCard";
import { CampaignSkeleton } from "./CampaignSkeleton";
import { UICampaign } from "@/hooks/useCampaigns";

interface CampaignsGridProps {
  campaigns: UICampaign[];
  isLoading: boolean;
  error: string | null;
  variant?: 'landing' | 'full';
  skeletonCount?: number;
  emptyMessage?: string;
  errorMessage?: string;
  onDonate?: (campaignId: string) => void;
}

export const CampaignsGrid = ({
  campaigns,
  isLoading,
  error,
  variant = 'full',
  skeletonCount = 6,
  emptyMessage = "No campaigns available at the moment.",
  errorMessage,
  onDonate
}: CampaignsGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[...Array(skeletonCount)].map((_, index) => (
          <CampaignSkeleton key={index} variant={variant} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8 px-4">
        <p className="text-base sm:text-lg">{errorMessage || error}</p>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <p className="text-base sm:text-lg text-gray-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-6">
      {campaigns.map((campaign) => (
        <CampaignCard 
          key={campaign.id} 
          campaign={campaign} 
          variant={variant}
          onDonate={onDonate}
        />
      ))}
    </div>
  );
}; 