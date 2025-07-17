import { useFormContext } from "react-hook-form";
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import campaignService from "@/services/campaignService";

// Define the Campaign interface based on the API response
interface Campaign {
  id: string;
  title: string;
  description: string;
  campaignCategoryDto: {
    id: string;
    name: string;
  };
  currency: string;
  amount: number;
  amountRaised: number;
  amountLeft: number;
  isCompleted: boolean;
  coverImageBase64: string;
  otherImagesBase64: string[];
}

const SUPPORT_TYPES = [
  { id: "Products/Services", label: "Products/Services" },
  { id: "financial", label: "Financial" },
  { id: "volunteer", label: "Volunteer Support" },
  { id: "Marketing/Promotion", label: "Marketing/Promotion" },
  { id: "Expertise", label: "Expertise" },
  { id: "other", label: "Other (specify)" },
];

export const CollaborationStep = () => {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useFormContext();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch campaigns on component mount
  useEffect(() => {
    const fetchCampaigns = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await campaignService.getAllCampaigns();
        if (response.succeeded) {
          setCampaigns(response.data);
        } else {
          setError(response.message || "Failed to load campaigns");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred while loading campaigns");
        console.error("Error fetching campaigns:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const supportTypes = watch("supportTypes") || [];
  const showOtherSupport = supportTypes.includes("other");

  const handleSupportTypeToggle = async (type: string) => {
    const current = supportTypes;
    const updated: string[] = current.includes(type)
      ? current.filter((t: string) => t !== type)
      : [...current, type].slice(0, 3);
    setValue("supportTypes", updated);
    await trigger("supportTypes");
  };



  return (
    <div className="max-h-[60vh] overflow-y-auto pr-4 space-y-6 scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-transparent font-mulish">
      <div className="space-y-2">
        <label className="block text-base text-[#182230] font-bold">Campaign Interest</label>
        <Select
          onValueChange={(value) => {
            setValue("campaign", value);
            trigger("campaign");
          }}
          value={watch("campaign")}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full border-gray-200">
            <SelectValue placeholder={isLoading ? "Loading..." : "Select a campaign..."} />
          </SelectTrigger>
          <SelectContent>
            {campaigns.map((campaign) => (
              <SelectItem key={campaign.id} value={campaign.id}>
                {campaign.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {errors.campaign && (
          <p className="text-sm text-red-500">
            {errors.campaign.message as string}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-base text-[#182230] font-bold">
          Support Types (Select up to 3)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {SUPPORT_TYPES.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => handleSupportTypeToggle(type.id)}
              className={`p-2 border rounded transition-all duration-200 font-mulish ${
                supportTypes.includes(type.id)
                  ? "border-[#9F1AB1] bg-[#FBE8FF] text-[#9F1AB1] text-base font-bold"
                  : "border-[#98A2B3] hover:border-gray-300 text-[#98A2B3]"
              } ${
                supportTypes.length >= 3 && !supportTypes.includes(type.id)
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={
                supportTypes.length >= 3 && !supportTypes.includes(type.id)
              }
            >
              {type.label}
            </button>
          ))}
        </div>
        {errors.supportTypes && (
          <p className="text-sm text-red-500">
            {errors.supportTypes.message as string}
          </p>
        )}
      </div>

      {showOtherSupport && (
        <div className="space-y-2">
          <label className="block text-base text-[#182230] font-bold">
            Please specify other support
          </label>
          <Textarea
            {...register("otherSupport")}
            placeholder="Please explain the other type of support you can provide..."
            className="min-h-[100px]"
          />
          {errors.otherSupport && (
            <p className="text-sm text-red-500">
              {errors.otherSupport.message as string}
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-base text-[#182230] font-bold">
          How does your organization aim to contribute?
        </label>
        <Textarea
          {...register("contribution")}
          className="min-h-[150px] resize-none"
          placeholder="Please describe how your organization plans to support our campaign..."
          maxLength={500}
        />
        {errors.contribution && (
          <p className="text-sm text-red-500">
            {errors.contribution.message as string}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-base text-[#182230] font-bold">
          What impact do you hope to achieve?
        </label>
        <Textarea
          {...register("impact")}
          className="min-h-[150px] resize-none"
          placeholder="Please describe the impact you hope to make through this partnership..."
          maxLength={500}
        />
        {errors.impact && (
          <p className="text-sm text-red-500">
            {errors.impact.message as string}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block  text-base text-[#182230] font-bold">
          Additional Comments (Optional)
        </label>
        <Textarea
          {...register("comments")}
          placeholder="Any additional information you'd like to share..."
          className="min-h-[100px]"
        />
        {errors.comments && (
          <p className="text-sm text-red-500">
            {errors.comments.message as string}
          </p>
        )}
      </div>

      <div className="flex items-start space-x-2 pt-4">
        <Checkbox
          id="agreement"
          onCheckedChange={(checked) => {
            setValue("agreement", checked);
            trigger("agreement");
          }}
          className="mt-1"
        />
        <label htmlFor="agreement" className="text-sm text-gray-600">
          I agree to share the provided information with YIODARA and confirm
          that I have the authority to submit this partnership request.
        </label>
      </div>
      {errors.agreement && (
        <p className="text-sm text-red-500">
          {errors.agreement.message as string}
        </p>
      )}
    </div>
  );
};
