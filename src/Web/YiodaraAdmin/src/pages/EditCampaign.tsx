import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { campaignService } from "@/api/campaignService";
import { useUpdateCampaign } from "@/hooks/useCampaigns";
import { useCampaignCategories } from "@/hooks/useCampaignCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, Trash2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UpdateCampaignRequest } from "@/types/campaign";

const EditCampaign = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState<UpdateCampaignRequest>({
    id: id || "",
    title: "",
    description: "",
    campaignCategoryId: "",
    currency: "",
    amount: 0,
    isDraft: false,
    coverImageBase64: "",
    otherImagesBase64: [],
    imagesToDelete: [],
  });

  const { data: campaignData, isLoading: isCampaignLoading } = useQuery({
    queryKey: ["campaign", id],
    queryFn: () => campaignService.getById(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (campaignData?.data) {
      const campaign = campaignData.data;
      setFormData((prev) => ({
        ...prev,
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        campaignCategoryId: campaign.campaignCategoryDto.id,
        currency: campaign.currency,
        amount: campaign.amount,
        isDraft: campaign.isDraft,
      }));
    }
  }, [campaignData]);

  const { data: categoriesData, isLoading: isCategoriesLoading } = useCampaignCategories();
  const updateMutation = useUpdateCampaign();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleAction = (isDraft: boolean) => {
    updateMutation.mutate(
      { ...formData, isDraft },
      {
        onSuccess: () => {
          toast({ title: "Success", description: `Campaign ${isDraft ? 'draft saved' : 'updated'} successfully.` });
          navigate("/campaigns");
        },
        onError: (error: any) => {
          toast({ title: "Error", description: error.message || "An error occurred.", variant: "destructive" });
        },
      }
    );
  };

  if (isCampaignLoading || isCategoriesLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-[#BA24D5]" /></div>;
  }

  return (
    <div className="py-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Edit Campaign</h1>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <Label htmlFor="title">Campaign Title</Label>
            <Input id="title" name="title" value={formData.title} onChange={handleInputChange} />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={5} />
          </div>
          <div>
            <Label htmlFor="campaignCategoryId">Category</Label>
            <Select value={formData.campaignCategoryId} onValueChange={(value) => handleSelectChange("campaignCategoryId", value)}>
              <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
              <SelectContent>
                {categoriesData?.data?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={formData.currency} onValueChange={(value) => handleSelectChange("currency", value)}>
                <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="NAIRA">Naira (₦)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">Target Amount</Label>
              <Input id="amount" name="amount" type="number" value={formData.amount} onChange={handleNumberChange} />
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-gray-50 border-t flex justify-between items-center">
            <Button variant="outline" onClick={() => navigate("/campaigns")}>Cancel</Button>
            <div className="flex space-x-2">
                <Button
                type="button"
                variant="outline"
                onClick={() => handleAction(true)}
                disabled={updateMutation.isPending}
                >
                <Save className="mr-2 h-4 w-4" />
                {updateMutation.isPending && formData.isDraft ? "Saving..." : "Save Draft"}
                </Button>
                <Button
                type="button"
                onClick={() => handleAction(false)}
                className="bg-[#9F1AB1] hover:bg-[#8A1799] text-white"
                disabled={updateMutation.isPending}
                >
                <Save className="mr-2 h-4 w-4" />
                {updateMutation.isPending && !formData.isDraft ? "Updating..." : "Update Campaign"}
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EditCampaign;