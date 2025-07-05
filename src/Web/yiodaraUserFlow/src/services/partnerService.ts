import api from './api';

export interface FormData {
  companyName: string;
  websiteUrl: string;
  industry: string;
  companySize: string;
  fullName: string;
  jobTitle: string;
  email: string;
  phoneNumber: string;
  campaign: string;
  supportTypes: ("Products/Services" | "financial" | "volunteer" | "Marketing/Promotion" | "Expertise" | "other")[];
  otherSupport: string;
  contribution: string;
  impact: string;
  comments: string;
  agreement: boolean;
}

export interface CreatePartnerRequest {
  companyName: string;
  websiteUrl: string | null;
  industry: number;
  companySize: number;
  fullName: string;
  jobTitle: string | null;
  emailAddress: string;
  phoneNumber: string | null;
  campaignId: string;
  supportProvided: number;
  howDoesYourOrganizationAimToContribute: string | null;
  whatImpactDoYouHopeToAchieve: string | null;
  anyOtherComments: string | null;
  agreeToShareProvidedInfo: boolean;
}

export interface PartnerResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: Record<string, unknown> | null;
  pageNumber: number;
  pageSize: number;
  total: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

// Constants for mapping form values to API expected values
export const INDUSTRY_MAPPING = {
  "technology": 0,
  "healthcare": 1,
  "finance": 2,
  "other": 3
};

export const COMPANY_SIZE_MAPPING = {
  "small": 0,
  "medium": 1,
  "large": 2
};

export const SUPPORT_TYPE_MAPPING = {
  "Products/Services": 0,
  "financial": 1,
  "volunteer": 2,
  "Marketing/Promotion": 3,
  "other": 4,
  "Expertise": 5
};

const partnerService = {
  createPartner: async (partnerData: CreatePartnerRequest): Promise<PartnerResponse> => {
    try {
      console.log("Sending partner data:", JSON.stringify(partnerData, null, 2));
      
      const response = await api.post('/partner/create-partner', partnerData);
      console.log("Partner API response:", response.data);
      
      return response.data;
    } catch (error: unknown) {
      console.error("Partner API error:", error);
      
      // Check if it's an authentication error
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response?: { status: number; data: unknown } };
        if (axiosError.response?.status === 401) {
          console.error("Authentication error - token may be invalid or expired");
        }
        
        // Check if it's a validation error
        if (axiosError.response?.status === 400) {
          console.error("Validation error:", axiosError.response.data);
        }
      }
      
      throw error;
    }
  },
  
  mapFormDataToApiRequest: (formData: Partial<FormData>): CreatePartnerRequest => {
    console.log("Form data before mapping:", formData);
    
    // Log each field with its type
    console.log("DATA TYPES CHECK:", {
      companyName: `${formData.companyName} (${typeof formData.companyName})`,
      industry: `${formData.industry} (${typeof formData.industry})`,
      companySize: `${formData.companySize} (${typeof formData.companySize})`,
      fullName: `${formData.fullName} (${typeof formData.fullName})`,
      email: `${formData.email} (${typeof formData.email})`,
      campaign: `${formData.campaign} (${typeof formData.campaign})`,
      supportTypes: `${JSON.stringify(formData.supportTypes)} (${typeof formData.supportTypes})`,
      agreement: `${formData.agreement} (${typeof formData.agreement})`
    });
    
    // Map support types to a single number
    let supportProvided = 0;
    if (formData.supportTypes && formData.supportTypes.length > 0) {
      const firstType = formData.supportTypes[0];
      supportProvided = SUPPORT_TYPE_MAPPING[firstType as keyof typeof SUPPORT_TYPE_MAPPING] || 0;
    }
    
    // Map industry to number
    const industry = formData.industry 
      ? INDUSTRY_MAPPING[formData.industry as keyof typeof INDUSTRY_MAPPING] 
      : 0;
    
    // Map company size to number
    const companySize = formData.companySize 
      ? COMPANY_SIZE_MAPPING[formData.companySize as keyof typeof COMPANY_SIZE_MAPPING] 
      : 0;
    
    // Ensure required fields are not empty or null and match the API schema
    const mappedData: CreatePartnerRequest = {
      companyName: formData.companyName?.trim() || "",
      websiteUrl: formData.websiteUrl || null,
      industry: industry,
      companySize: companySize,
      fullName: formData.fullName?.trim() || "",
      jobTitle: formData.jobTitle || null,
      emailAddress: formData.email?.trim() || "",
      phoneNumber: formData.phoneNumber || null,
      campaignId: formData.campaign || "",
      supportProvided: supportProvided,
      howDoesYourOrganizationAimToContribute: formData.contribution || null,
      whatImpactDoYouHopeToAchieve: formData.impact || null,
      anyOtherComments: formData.comments || null,
      agreeToShareProvidedInfo: !!formData.agreement
    };
    
    // Log the mapped data to verify what we're sending
    console.log("Mapped data to send:", mappedData);
    
    return mappedData;
  },
  
  mapSupportTypes: (types: string[]): number => {
    // If no types selected, return 0 as default
    if (!types || types.length === 0) {
      return 0;
    }
    
    // Use the first selected type
    const type = types[0];
    return SUPPORT_TYPE_MAPPING[type as keyof typeof SUPPORT_TYPE_MAPPING] || 0;
  }
};

export default partnerService;