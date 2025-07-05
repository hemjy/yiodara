import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { campaignService } from '@/api/campaignService';
import {
  CampaignParams,
  CreateCampaignRequest,
  UpdateCampaignRequest,
} from '@/types/campaign';
import { useToast } from "@/hooks/use-toast";

// Hook for fetching campaigns
export const useCampaigns = (params: CampaignParams = {}) => {
  return useQuery({
    queryKey: ['campaigns', params],
    queryFn: () => campaignService.getAll(params),
  });
};

export const useDraftCampaigns = (params: CampaignParams = {}) => {
  return useQuery({
    queryKey: ['draftCampaigns', params],
    queryFn: () => campaignService.getAllDrafts(params),
  });
};

// Hook for fetching a single campaign
export const useCampaign = (id: string) => {
  return useQuery({
    queryKey: ['campaign', id],
    queryFn: () => campaignService.getById(id),
    enabled: !!id,
  });
};

// Hook for creating a campaign
export const useCreateCampaign = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateCampaignRequest) => campaignService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({
        title: 'Success',
        description: response.message || 'Campaign created successfully',
      });
      return response.data; // Return the created campaign ID
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create campaign',
        variant: 'destructive',
      });
      throw error;
    },
  });
};

// Add this hook to your existing useCampaigns.ts file
export const useUpdateCampaign = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateCampaignRequest) => campaignService.update(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['draftCampaigns'] });
      toast({
        title: 'Success',
        description: response.message || 'Campaign updated successfully',
      });
      return response.data;
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update campaign',
        variant: 'destructive',
      });
      throw error;
    },
  });
}; 