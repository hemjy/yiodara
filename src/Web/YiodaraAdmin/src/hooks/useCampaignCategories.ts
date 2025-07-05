import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { campaignCategoryService } from '@/api/campaignCategoryService';
import {
  CampaignCategoryParams,
  CreateCampaignCategoryRequest,
  DeleteCampaignCategoryRequest,
  UpdateCampaignCategoryRequest,
} from '@/types/campaignCategory';
import { useToast } from "@/hooks/use-toast"

// Hook for fetching campaign categories
export const useCampaignCategories = (params: CampaignCategoryParams = {}) => {
  return useQuery({
    queryKey: ['campaignCategories', params],
    queryFn: () => campaignCategoryService.getAll(params),
  });
};

// Hook for fetching a single campaign category
export const useCampaignCategory = (id: string) => {
  return useQuery({
    queryKey: ['campaignCategory', id],
    queryFn: () => campaignCategoryService.getById(id),
    enabled: !!id,
  });
};

// Hook for creating a campaign category
export const useCreateCampaignCategory = () => {
  const { toast } = useToast()

  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateCampaignCategoryRequest) => campaignCategoryService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['campaignCategories'] });
      toast({
        title: 'Success',
        description: response.message || 'Category created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create category',
        variant: 'destructive',
      });
    },
  });
};

// Hook for updating a campaign category
export const useUpdateCampaignCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: UpdateCampaignCategoryRequest) => campaignCategoryService.update(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['campaignCategories'] });
      queryClient.invalidateQueries({ queryKey: ['campaignCategory', response.data.id] });
      toast({
        title: 'Success',
        description: response.message || 'Category updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update category',
        variant: 'destructive',
      });
    },
  });
};

// Hook for deleting a campaign category
export const useDeleteCampaignCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: DeleteCampaignCategoryRequest) => campaignCategoryService.delete(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['campaignCategories'] });
      toast({
        title: 'Success',
        description: response.message || 'Category deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete category',
        variant: 'destructive',
      });
    },
  });
}; 