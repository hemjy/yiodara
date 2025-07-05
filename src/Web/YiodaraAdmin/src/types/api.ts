// Generic API response wrapper
export interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: T;
  pageNumber?: number;
  pageSize?: number;
  total?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export interface DonationsResult {
  donations: {
    id: string;
    donorName: string;
    amount: number;
    totalDonation: number;
    date: string;
  }[];
  pageNumber: number;
  pageSize: number;
  total: number;
  hasPrevious: boolean;
  hasNext: boolean;
  message: string;
  succeeded: boolean;
}
// API Volunteer response structure (matches the actual API response)
export interface ApiVolunteer {
  userId: string;
  userName: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
}

// Volunteer response with pagination
export interface VolunteersResponse {
  succeeded: boolean;
  message: string;
  errors: any[];
  data: ApiVolunteer[];
  pageNumber: number;
  pageSize: number;
  total: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface VolunteerCountResponse {
  succeeded: boolean;
  message: string;
  errors: [];
  data: {
    totalVolunteers: number;
  };
}

// Donation data type
export interface Donation {
  id: string;
  amount: number;
  donorName: string;
  campaignName: string;
  date: string;
  // Add other fields based on actual API response
}

// Parameters for fetching donations
export interface DonationParams {
  searchTerm?: string;
  searchText?: string;
  pageNumber?: number;
  pageSize?: number;
  id?: string;
  orderBy?: number;
  descending?: boolean;
  startDate?: string;
  endDate?: string;
}

// Volunteer data type (for internal app use)
export interface Volunteer {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  userName?: string;
  location?: string;
  registrationDate?: string;
  status?: string;
}

// Parameters for fetching volunteers
export interface VolunteerParams {
  pageNumber?: number;
  pageSize?: number;
  id?: string;
  searchText?: string;
  orderBy?: number;
  descending?: boolean;
  startDate?: string;
  endDate?: string;
}

// Donor count response type
export interface DonorCountData {
  totalDonors: number;
  totalDonations: number;
  donationsToday: number;
  todayDonationsCount: number;
  campaignName: string;
}

// Parameters for fetching donor count
export interface DonorCountParams {
  campaignId?: string;
}

// Country donor data
export interface CountryDonorData {
  country: string;
  percentage: number;
  // Add other fields if they exist in the successful response
}

// Parameters for fetching donors by country
export interface DonorsByCountryParams {
  campaignId?: string;
}

// Donation record type (adjust fields based on actual data when available)
export interface DonationRecord {
  id: string;
  donorName: string;
  amount: number;
  date: string;
  campaignName?: string;
  campaignId?: string;
  status?: string;
  paymentMethod?: string;
  // Add other fields as needed once you see actual data
}

// Parameters for fetching all donations
export interface AllDonationsParams {
  searchTerm?: string;
  searchText?: string;
  pageNumber?: number;
  pageSize?: number;
  id?: string; // Campaign ID or other identifier
  orderBy?: number;
  descending?: boolean;
  startDate?: string;
  endDate?: string;
}

// Paginated response type for donations
export interface PaginatedDonationsResponse {
  data: DonationRecord[];
  pageNumber: number;
  pageSize: number;
  total: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

// Add this new interface for the donor data from the API
export interface ApiDonor {
  id: string;
  name: string;
  totalDonation: number;
  lastDonationAmount: number;
  lastDonationDate: string;
}

// Update the DonorCountResponse interface
export interface DonorCountResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: DonorCountData;
}

// Add a new interface for the donors response
export interface DonorsResponse {
  succeeded: boolean;
  message: string;
  errors: any[];
  data: ApiDonor[];
  pageNumber: number;
  pageSize: number;
  total: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

// Add these types to your existing api.ts file

// Partnership list item from API
export interface ApiPartnership {
  id: string;
  companyName: string;
  campaignName: string;
  email: string;
  industry: string;
  supportType: string;
  campaignCategory: string;
  dateCreated: string;
}

// Response for partnerships list
export interface PartnershipsResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: ApiPartnership[];
  pageNumber: number;
  pageSize: number;
  total: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

// Parameters for partnerships API
export interface PartnershipParams {
  pageNumber?: number;
  pageSize?: number;
  orderBy?: number;
  descending?: boolean;
  startDate?: string;
  endDate?: string;
  searchText?: string;
}

// Detailed partnership from API
export interface PartnershipDetail {
  id: string;
  categoryName: string;
  dateSubmitted: string;
  status: string;
  companyInformation: {
    companyName: string;
    websiteUrl: string;
    industry: string;
    companySize: string;
  };
  contactPerson: {
    fullName: string;
    jobTitle: string;
    emailAddress: string;
    phoneNumber: string;
  };
  partnershipDetails: {
    supportType: string;
    campaignInterested: string;
    howDoesYourOrganizationAimToContribute: string;
    whatImpactDoYouHopeToAchieve: string;
    anyOtherComments?: string;
  };
}

// Response for partnership detail
export interface PartnershipDetailResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: PartnershipDetail;
}