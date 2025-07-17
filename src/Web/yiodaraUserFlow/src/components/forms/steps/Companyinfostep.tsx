import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


const INDUSTRY_OPTIONS = [
  { value: "technology", label: "Technology" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance" },
  { value: "other", label: "Other" },
] as const;

const COMPANY_SIZES = [
  { value: "small", label: "Small (1-50 employees)" },
  { value: "medium", label: "Medium (51-200 employees)" },
  { value: "large", label: "Large (201-1000 employees)" },
] as const;

export const CompanyInfoStep = () => {
  const {
    register,
    formState: { errors },
    setValue,
    trigger,
    watch,
  } = useFormContext();

  const handleSelectChange = async (field: string, value: string) => {
    setValue(field, value);
    await trigger(field);
  };

  return (
    <div className="space-y-6 font-mulish">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <label className="block  text-base text-[#182230] font-bold">
            Company Name
          </label>
        </div>
        <Input
          {...register("companyName")}
          placeholder="e.g. Apple Inc., WHO, Samsung,...."
          className="w-full border-gray-200 "
          aria-invalid={errors.companyName ? "true" : "false"}
        />
        {errors.companyName && (
          <p className="text-sm text-red-500" role="alert">
            {errors.companyName.message as string}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <label className="block  text-base text-[#182230] font-bold">
            Website URL
          </label>
        </div>
        <Input
          {...register("websiteUrl")}
          placeholder="e.g. WHO.com, hp.com, ..."
          className="w-full border-gray-200"
          aria-invalid={errors.websiteUrl ? "true" : "false"}
        />
        {errors.websiteUrl && (
          <p className="text-sm text-red-500" role="alert">
            {errors.websiteUrl.message as string}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <label className="block text-base text-[#182230] font-bold">
            Industry/Field
          </label>
        </div>
        <Select
          onValueChange={(value) => handleSelectChange("industry", value)}
          value={watch("industry")}
        >
          <SelectTrigger
            className="w-full border-gray-200 placeholder:text-[#98A2B3] placeholder:text-base"
            aria-invalid={errors.industry ? "true" : "false"}
          >
            <SelectValue placeholder="e.g. Technology, NGOs, Electronics, ...." />
          </SelectTrigger>

          <SelectContent>
            {INDUSTRY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.industry && (
          <p className="text-sm text-red-500" role="alert">
            {errors.industry.message as string}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <label className="block text-base text-[#182230] font-bold">Company Size</label>
        </div>
        <Select
          onValueChange={(value) => handleSelectChange("companySize", value)}
          value={watch("companySize")}
        >
          <SelectTrigger
            className="w-full border-gray-200 placeholder:text-[#98A2B3] placeholder:text-base"
            aria-invalid={errors.companySize ? "true" : "false"}
          >
            <SelectValue placeholder="e.g. Small (1–50), Medium (51–200)...." />
          </SelectTrigger>
          <SelectContent>
            {COMPANY_SIZES.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.companySize && (
          <p className="text-sm text-red-500" role="alert">
            {errors.companySize.message as string}
          </p>
        )}
      </div>
    </div>
  );
};
