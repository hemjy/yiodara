import { useState, useEffect } from 'react';
import campaignService, { Campaign as ApiCampaign } from '@/services/campaignService';

// Shared UI Campaign interface
export interface UICampaign {
  id: string;
  category: string;
  title: string;
  description: string;
  image: string;
  target: number;
  raised: number;
  percentageRaised: number;
}

// Convert API campaign to UI campaign format
export const mapApiCampaignToUiCampaign = (campaign: ApiCampaign): UICampaign => {
  const percentageRaised = campaign.amount > 0 
    ? Math.round((campaign.amountRaised / campaign.amount) * 100) 
    : 0;
  
  return {
    id: campaign.id,
    category: campaign.campaignCategoryDto.name,
    title: campaign.title,
    description: campaign.description,
    image: campaign.coverImageBase64,
    target: campaign.amount,
    raised: campaign.amountRaised,
    percentageRaised: percentageRaised
  };
};

// Hook options interface
interface UseCampaignsOptions {
  autoFetch?: boolean;
  limit?: number;
  onError?: (error: string) => void;
}

// Hook return type
interface UseCampaignsReturn {
  campaigns: UICampaign[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

// Custom hook for managing campaigns
export const useCampaigns = (options: UseCampaignsOptions = {}): UseCampaignsReturn => {
  const { autoFetch = true, limit, onError } = options;
  const [campaigns, setCampaigns] = useState<UICampaign[]>([]);
  const [isLoading, setIsLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await campaignService.getAllCampaigns();
      
      if (response.succeeded) {
        let mappedCampaigns = response.data.map(mapApiCampaignToUiCampaign);
        
        // Apply limit if specified
        if (limit && limit > 0) {
          mappedCampaigns = mappedCampaigns.slice(0, limit);
        }
        
        setCampaigns(mappedCampaigns);
      } else {
        const errorMessage = response.message || 'Failed to load campaigns';
        setError(errorMessage);
        onError?.(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An error occurred while fetching campaigns';
      
      console.error('Error fetching campaigns:', err);
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  useEffect(() => {
    if (autoFetch) {
      fetchCampaigns();
    }
  }, [autoFetch, limit]);

  return {
    campaigns,
    isLoading,
    error,
    refetch: fetchCampaigns,
    clearError
  };
};

// Individual campaign hook
interface UseCampaignOptions {
  campaignId: string;
  autoFetch?: boolean;
  onError?: (error: string) => void;
}

interface UseCampaignReturn {
  campaign: UICampaign | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

export const useCampaign = (options: UseCampaignOptions): UseCampaignReturn => {
  const { campaignId, autoFetch = true, onError } = options;
  
  const [campaign, setCampaign] = useState<UICampaign | null>(null);
  const [isLoading, setIsLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaign = async () => {
    if (!campaignId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await campaignService.getCampaignById(campaignId);
      
      if (response.succeeded) {
        const mappedCampaign = mapApiCampaignToUiCampaign(response.data);
        setCampaign(mappedCampaign);
      } else {
        const errorMessage = response.message || 'Failed to load campaign';
        setError(errorMessage);
        onError?.(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An error occurred while fetching campaign';
      
      console.error('Error fetching campaign:', err);
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  useEffect(() => {
    if (autoFetch && campaignId) {
      fetchCampaign();
    }
  }, [autoFetch, campaignId]);

  return {
    campaign,
    isLoading,
    error,
    refetch: fetchCampaign,
    clearError
  };
}; 