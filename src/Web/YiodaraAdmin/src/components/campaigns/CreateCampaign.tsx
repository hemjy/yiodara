import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import forward from "@/assets/forward.svg";
import { useCreateCampaign } from "@/hooks/useCampaigns";
import { useCampaignCategories } from "@/hooks/useCampaignCategories";
import { CreateCampaignRequest } from "@/types/campaign";
import { useToast } from "@/hooks/use-toast";

import { RichTextEditor } from "@/components/ui/rich-text-editor";

type Step = "title-description" | "images" | "target";

const CreateCampaign = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>("title-description");
  
  const [formData, setFormData] = useState<Partial<CreateCampaignRequest>>({
    title: "",
    description: "",
    campaignCatergoryId: "",
    currency: "USD",
    amount: 0,
    coverImageBase64: "",
    otherImagesBase64: [],
  });

  const [previewCategory, setPreviewCategory] = useState<string>("");
  
  const { data: categoriesResponse, isLoading: categoriesLoading } = useCampaignCategories();
  
  const createCampaign = useCreateCampaign();

  const { toast } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  const [descriptionCharCount, setDescriptionCharCount] = useState(0);

  const handleInputChange = (field: keyof CreateCampaignRequest, value: string | number | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    if (field === 'description') {
      const textOnly = stripHtml(value as string);
      setDescriptionCharCount(textOnly.length);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    const category = categoriesResponse?.data.find(cat => cat.id === categoryId);
    if (category) {
      setPreviewCategory(category.name);
      handleInputChange("campaignCatergoryId", categoryId);
    }
  };

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        handleInputChange("coverImageBase64", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOtherImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setFormData(prev => ({
            ...prev,
            otherImagesBase64: [...(prev.otherImagesBase64 || []), base64String],
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveOtherImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      otherImagesBase64: prev.otherImagesBase64?.filter((_, i) => i !== index) || [],
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 20) {
      newErrors.title = "Title cannot be longer than 20 characters";
    }
    
    if (!formData.description) {
      newErrors.description = "Description is required";
    } else if (formData.description.length > 200) {
      newErrors.description = "Description cannot be longer than 200 characters";
    }
    
    if (!formData.campaignCatergoryId) {
      newErrors.campaignCatergoryId = "Category is required";
    }
    
    if (currentStep === "images" && !formData.coverImageBase64) {
      newErrors.coverImageBase64 = "Cover image is required";
    }
    
    if (currentStep === "target") {
      if (!formData.currency) {
        newErrors.currency = "Currency is required";
      }
      if (!formData.amount || formData.amount <= 0) {
        newErrors.amount = "Amount must be greater than 0";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      if (currentStep === "title-description") {
        setCurrentStep("images");
      } else if (currentStep === "images") {
        setCurrentStep("target");
      }
    } else {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before proceeding",
        variant: "destructive",
      });
    }
  };

  const handleGoBack = () => {
    if (currentStep === "title-description") {
      navigate("/campaigns");
    } else if (currentStep === "images") {
      setCurrentStep("title-description");
    } else if (currentStep === "target") {
      setCurrentStep("images");
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      await createCampaign.mutateAsync(formData as CreateCampaignRequest);
      
      toast({
        title: "Campaign Published!",
        description: "Your campaign has been successfully published and is now live.",
        variant: "success",
      });
      
      navigate("/campaigns");
    } catch (error) {
      toast({
        title: "Publication Failed",
        description: "There was an error publishing your campaign. Please try again.",
        variant: "error",
      });
      console.error("Error creating campaign:", error);
    }
  };

  const handleCancel = () => {
    navigate("/campaigns");
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "Medical Care":
        return "bg-[#E9D7FE] text-[#9F1AB1]";
      case "Education":
        return "bg-[#CFF9FE] text-[#088AB2] font-raleway rounded-none font-[700] text-[8px] leading-[100%] mb-[2px]";
      case "Healthy Food":
        return "bg-[#D1FADF] text-[#067647]";
      default:
        return "bg-[#FEF0C7] text-[#DC6803]";
    }
  };

  const isEmptyDescription = (desc: string) => {
    return !desc || desc.trim() === '';
  };

  return (
    <div className="container mx-auto py-4 px-0 bg-white">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          className="p-0 flex items-center"
          onClick={handleGoBack}
        >
          <img src={forward} alt="" className="s-[24px]" />
          <span className="font-raleway text-[16px] font-bold leading-[150%]">Go Back</span>
        </Button>
      </div>

      <h1 className="text-[32px] font-bold mb-6 font-raleway ">New Campaign</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-3/5 bg-[#FCFCFC] p-6 rounded-[8px] border">
          {currentStep === "title-description" && (
            <div>
              <div className="mb-6">
                <div className="inline-flex items-center">
                  <div className="w-4 h-[36px] rounded bg-[#BA24D5] mr-2"></div>
                  <span className="text-[20px] font-mulish text-[#101828] font-semibold leading-8">Title & description</span>
                </div>
                
                <div className="mt-6 mb-4">
                  <label className="block text-[14px] leading-6 font-medium mb-3 text-[#101828] font-mulish">
                    Campaign Title
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className={`w-full border-2 focus:border-[#BA24D5] focus:ring-[#BA24D5] ${errors.title ? "border-red-500" : ""}`}
                    placeholder="Enter campaign title"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.title?.length || 0}/20 characters
                  </p>
                </div>
                
                <div className="mb-4">
                <label className="block text-[14px] leading-6 font-medium mb-3 text-[#101828] font-mulish">
                Campaign Description
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Write your campaign description..."
                    className={`w-full border-2 focus:border-[#BA24D5] focus:ring-[#BA24D5] ${errors.description ? "border-red-500" : ""}`}
                    rows={5}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.description?.length || 0}/200 characters
                  </p>
                </div>
                
                <div className="mb-0">
                <label className="block text-[14px] leading-6 font-medium mb-3 text-[#101828] font-mulish">
                Campaign Category
                  </label>
                  <Select
                    value={formData.campaignCatergoryId}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger className="w-full border-2 border-gray-200 focus:border-[#BA24D5] focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-md">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="border-gray-200 shadow-md rounded-md">
                      {categoriesLoading ? (
                        <div className="py-2 px-2 text-gray-500">Loading categories...</div>
                      ) : (
                        categoriesResponse?.data.map((category) => (
                          <SelectItem 
                            key={category.id} 
                            value={category.id}
                            className="py-2 px-2 data-[highlighted]:bg-[#F6D0FE] data-[highlighted]:text-[#BA24D5] data-[state=checked]:bg-[#F6D0FE] data-[state=checked]:text-[#BA24D5]"
                          >
                            {category.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {errors.campaignCatergoryId && (
                    <p className="text-red-500 text-sm mt-1">{errors.campaignCatergoryId}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === "images" && (
            <div>
              <div className="mb-6">
                <div className="inline-flex items-center">
                  <div className="w-4 h-[36px] rounded bg-[#BA24D5] mr-2"></div>
                  <span className="text-[20px] font-mulish text-[#101828] font-semibold leading-8">Images</span>
                </div>
                
                <div className="mt-6">
                  <label className="block text-[14px] leading-6 font-medium mb-3 text-[#101828] font-mulish">
                    Cover Image
                  </label>
                  
                  {/* Cover Image Upload Area */}
                  <div className="bg-gray-100 rounded-md h-[240px] flex items-center justify-center mb-6">
                    {formData.coverImageBase64 ? (
                      <div className="relative w-full h-full">
                        <img
                          src={formData.coverImageBase64}
                          alt="Cover"
                          className="w-full h-full object-cover rounded-md"
                        />
                        <button
                          onClick={() => handleInputChange("coverImageBase64", "")}
                          className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="#101828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="file"
                          id="coverImage"
                          className="hidden"
                          accept="image/*"
                          onChange={handleCoverImageUpload}
                        />
                        <label
                          htmlFor="coverImage"
                          className="flex flex-col items-center cursor-pointer bg-white py-3 px-6 rounded-md shadow-sm"
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-1">
                            <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span className="text-gray-600">Click or drop image</span>
                        </label>
                      </div>
                    )}
                  </div>
                  
                  {errors.coverImageBase64 && (
                    <p className="text-red-500 text-sm mt-1">{errors.coverImageBase64}</p>
                  )}
                  
                  {/* More Images Section */}
                  <label className="block text-[14px] leading-6 font-medium mb-3 text-[#101828] font-mulish">
                    More Images
                  </label>
                  
                  <div className="flex space-x-2 mb-4">
                    {/* Display uploaded images */}
                    {formData.otherImagesBase64?.map((img, index) => (
                      <div key={index} className="relative w-[120px] h-[120px] bg-gray-100 rounded-md">
                        <img
                          src={img}
                          alt={`Additional ${index + 1}`}
                          className="w-full h-full object-cover rounded-md"
                        />
                        <button
                          className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
                          onClick={() => handleRemoveOtherImage(index)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="#101828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                    
                    {/* Empty placeholders */}
                    {Array.from({ length: 5 - (formData.otherImagesBase64?.length || 0) }).map((_, index) => (
                      <div key={`empty-${index}`} className="w-[120px] h-[120px] bg-gray-100 rounded-md">
                        {index === 0 && (formData.otherImagesBase64?.length || 0) < 5 && (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <input
                              type="file"
                              id="otherImages"
                              className="hidden"
                              accept="image/*"
                              multiple
                              onChange={handleOtherImagesUpload}
                            />
                            <label
                              htmlFor="otherImages"
                              className="flex flex-col items-center cursor-pointer h-full w-full"
                            >
                              <div className="flex flex-col items-center justify-center h-full">
                                <span className="text-sm text-gray-500 text-center">Upload New Image</span>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-2 text-[#BA24D5]">
                                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                            </label>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === "target" && (
            <div>
              <div className="mb-6">
                <div className="inline-flex items-center">
                  <div className="w-4 h-[36px] rounded bg-[#BA24D5] mr-2"></div>
                  <span className="text-[20px] font-mulish text-[#101828] font-semibold leading-8">Target</span>
                </div>
                
                <div className="mt-6 mb-4">
                  <label className="block text-[14px] leading-6 font-medium mb-3 text-[#101828] font-mulish">
                    Currency
                  </label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => handleInputChange("currency", value)}
                  >
                    <SelectTrigger className="w-full border border-gray-200 focus:border-[#BA24D5] focus:ring-[#BA24D5] focus-visible:ring-[#BA24D5] focus-visible:ring-offset-0 rounded-md">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="NAIRA">NAIRA</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                      <SelectItem value="POUNDS">POUNDS</SelectItem>
                      <SelectItem value="EUROS">EUROS</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.currency && (
                    <p className="text-red-500 text-sm mt-1">{errors.currency}</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className="block text-[14px] leading-6 font-medium mb-3 text-[#101828] font-mulish">
                    Amount
                  </label>
                  <div className="relative rounded-md border border-gray-200 focus-within:border-[#BA24D5] focus-within:ring-1 focus-within:ring-[#BA24D5] overflow-hidden">
                    <div className="absolute inset-y-0 left-0 flex items-center bg-gray-100 px-3 border-r border-gray-200">
                      <span className="text-gray-700 font-medium">
                        {formData.currency === "USD" ? "$" : 
                         formData.currency === "NAIRA" ? "₦" :
                         formData.currency === "CAD" ? "C$" :
                         formData.currency === "POUNDS" ? "£" :
                         formData.currency === "EUROS" ? "€" : "$"}
                      </span>
                    </div>
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9,]*"
                      value={formData.amount ? formData.amount.toLocaleString() : ""}
                      onChange={(e) => {
                        const value = e.target.value.replace(/,/g, '');
                        const numValue = value ? parseFloat(value) : 0;
                        handleInputChange("amount", numValue);
                      }}
                      className="pl-12 border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      placeholder="0"
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-2 mt-[48px]">
            <button
              onClick={handleCancel}
              className="border-[#F6D0FE] border w-full font-medium text-[16px] bg-[#FEFAFF] px-8 rounded-none text-[#9F1AB1]"
            >
              Cancel
            </button>
            
            {currentStep === "target" ? (
              <Button
                onClick={handleSubmit}
                className="bg-[#9F1AB1] text-white w-full rounded-none px-8 hover:bg-[#BA24D5]"
                disabled={createCampaign.isPending}
              >
                {createCampaign.isPending ? "Publishing..." : "Publish Now"}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="bg-[#9F1AB1] text-white w-full rounded-none px-8 hover:bg-[#BA24D5]"
              >
                Next
              </Button>
            )}
          </div>
        </div>

        <div className="lg:w-2/5 bg-[#FCFCFC] p-6 rounded-lg border">
          <div className="mb-4">
          <div className="inline-flex items-center">
            <div className="w-4 h-[36px] rounded bg-[#BA24D5] mr-2"></div>
              <span className="text-[20px] font-mulish text-[#101828] font-semibold leading-8">Preview</span>
            </div>
          </div>
          
          <div className="border rounded-lg overflow-hidden">
            {/* Preview Image */}
            <div className="h-48 bg-gray-100 relative">
              {formData.coverImageBase64 ? (
                <img
                  src={formData.coverImageBase64}
                  alt="Campaign Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No image uploaded
                </div>
              )}
            </div>
            
            {/* Preview Content */}
            <div className="p-4">
              {/* Category badge */}
              {previewCategory && (
                <div className="mb-2">
                  <span
                    className={`inline-block px-2 py-1 rounded-md text-xs font-bold ${getCategoryBadgeColor(
                      previewCategory
                    )}`}
                  >
                    {previewCategory}
                  </span>
                </div>
              )}
              
              <h3 className="font-inter font-[600] mb-2 text-[#1A1D1F] leading-8 text-[20px] tracking-[-2%]">
                {formData.title || "Campaign Title"}
              </h3>
              
              <div className="font-mulish text-sm text-gray-600 mb-4 line-clamp-4">
                {formData.description && !isEmptyDescription(formData.description) ? (
                  <p>{formData.description}</p>
                ) : (
                  "Campaign description will appear here"
                )}
              </div>
              
              {currentStep === "target" && formData.amount > 0 && (
                <div className="mt-4 bg-[#F9ECFF] p-3 rounded-md">
                  <span className="font-bold text-xl text-[#101828]">
                    {formData.currency === "USD" ? "$" : 
                     formData.currency === "NAIRA" ? "₦" :
                     formData.currency === "CAD" ? "C$" :
                     formData.currency === "POUNDS" ? "£" :
                     formData.currency === "EUROS" ? "€" : "$"}
                    {formData.amount.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        [data-state="open"] .select-value {
          background-color: #F6D0FE;
          color: #BA24D5;
          border-radius: 4px;
          padding: 2px 8px;
        }

        .select-content {
          background-color: white !important;
          border: none !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
          border-radius: 8px !important;
        }

        .select-item {
          text-align: right !important;
          padding: 12px 16px !important;
          color: #4B5563 !important;
        }

        .select-item[data-state="checked"] {
          background-color: #F6D0FE !important;
          color: #BA24D5 !important;
          font-weight: 500 !important;
        }

        .select-item[data-highlighted] {
          background-color: #F6D0FE !important;
          color: #BA24D5 !important;
        }
      `}</style>
    </div>
  );
};

export default CreateCampaign; 