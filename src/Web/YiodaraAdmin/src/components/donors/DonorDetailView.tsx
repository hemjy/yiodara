import { useState } from 'react';
import { Loader2 } from "lucide-react";
import { ArrowLeft, Download, Printer, CalendarIcon } from "lucide-react";
import { format, addDays } from "date-fns";
import { useDonorHistory } from '../../hooks/useDonorHistory';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { Skeleton } from "../ui/skeleton";
import { DateRange } from 'react-day-picker';
import { exportToExcel } from '../../utils/fileUtils';

interface Donor {
  id: string;
  name: string;
  email: string;
  lastDonation: string;
  totalDonation: string;
  date: string;
  initials: string;
}

interface DonorDetailViewProps {
  donor: Donor;
  onBack: () => void;
}

const DonorDetailView = ({ donor, onBack }: DonorDetailViewProps) => {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({ from: undefined, to: undefined });
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  
  // Use our new hook to fetch donor history
  const { 
    data: donorHistory, 
    isLoading, 
    isError, 
    error 
  } = useDonorHistory({
    userId: donor.id,
    pageNumber,
    pageSize,
    startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
    endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined
  });
  
  // Extract data from the response
  const donorProfile = donorHistory?.data;
  const donations = donorProfile?.donations || [];
  const totalPages = donorHistory?.total 
    ? Math.ceil(donorHistory.total / donorHistory.pageSize) 
    : 1;
  
  // Apply date filter
  const applyDateFilter = () => {
    setStartDate(dateRange?.from);
    setEndDate(dateRange?.to);
    setPageNumber(1); // Reset to first page when filtering
    setIsDatePopoverOpen(false);
  };
  
  // Clear date filter
  const clearDateFilter = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setDateRange({ from: undefined, to: undefined });
    setPageNumber(1); // Reset to first page when clearing filters
    setIsDatePopoverOpen(false);
  };
  
  // Export to Excel
  const handleExportToExcel = () => {
    if (donations.length > 0) {
      const dataToExport = donations.map(d => ({
        'Campaign': d.campaignName,
        'Category': d.campaignCategoryName,
        'Donation': d.amount,
        'Date': new Date(d.donationDate).toLocaleDateString(),
      }));
      exportToExcel(dataToExport, `${donor.name}_Donation_History`);
    } else {
      alert('No donation history to export.');
    }
  };
  
  // Print certificate
  const printCertificate = () => {
    // Implementation for printing certificate
    alert('Print Certificate functionality would be implemented here');
  };
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPageNumber(newPage);
  };
  
  // Get category color class based on category name
  const getCategoryColorClass = (category: string) => {
    const categoryMap: Record<string, string> = {
      'Health Care': 'bg-purple-100 text-purple-800',
      'Education': 'bg-teal-100 text-teal-800',
      'Community Service': 'bg-yellow-100 text-yellow-800',
      'Healthy Food': 'bg-green-100 text-green-800',
      // Add more categories as needed
    };
    
    return categoryMap[category] || 'bg-gray-100 text-gray-800';
  };
  
  return (
    <div className="font-raleway">
      {/* Header with back button */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="flex items-center text-[16px] leading-[150%] text-[#101828] hover:text-gray-900 p-0 font-raleway font-bold"
          onClick={onBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>

      {/* Donor overview */}
      <div className="bg-[#F9FAFB] rounded-lg p-6 mb-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center font-raleway">
            <div className="w-16 h-16 bg-[#FBE8FF] rounded-full flex items-center justify-center text-[#BA24D5] mr-4 font-raleway font-extrabold text-[24px] leading-[150%]">
              {donor.initials}
            </div>
            <div>
              <div className="flex items-center">
                <p className="text-[#000000] mr-2 font-normal text-[16px] leading-[100%] font-raleway">Username:</p>
                <p className="font-bold font-raleway text-[16px] leading-[100%]">{donor.name}</p>
              </div>
              <div className="flex items-center mt-4">
              <p className="text-[#000000] mr-2 font-normal text-[16px] leading-[100%] font-raleway">Email Address:</p>
              <p className="font-bold font-raleway text-[16px] leading-[100%]">{donorProfile?.email || donor.email}</p>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center">
              <p className="text-[#000000] mr-2 font-normal text-[16px] leading-[100%] font-raleway">Total Donations:</p>
              <p className="font-bold text-xl">
                {donorProfile?.totalDonations 
                  ? `$ ${donorProfile.totalDonations.toFixed(2)}` 
                  : donor.totalDonation}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Donation history */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Donation History</h2>
          <div className="flex space-x-2">
            <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-[#FEFAFF] text-[#9F1AB1] border border-[#F6D0FE] px-3 py-2 font-mulish font-medium text-sm rounded flex items-center"
                  onClick={() => {
                    setDateRange({ from: startDate, to: endDate });
                    setIsDatePopoverOpen(true);
                  }}
                >
                  Filter by Date
                  <CalendarIcon className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-4 w-auto" align="end">
                <div className="space-y-4">
                  <div>
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      initialFocus
                      disabled={{ after: new Date() }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      className="bg-[#BA24D5] hover:bg-[#9F1AB1] text-white w-full"
                      onClick={applyDateFilter}
                    >
                      Apply
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={clearDateFilter}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Button 
              variant="outline" 
              className="bg-[#FEFAFF] text-[#9F1AB1] border border-[#F6D0FE] px-3 py-2 font-mulish font-medium text-sm rounded flex items-center"
              onClick={handleExportToExcel}
            >
              Export to Excel <Download className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              className="bg-[#FEFAFF] text-[#9F1AB1] border border-[#F6D0FE] px-3 py-2 font-mulish font-medium text-sm rounded flex items-center"
              onClick={printCertificate}
            >
              Print Certificate <Printer className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
          {isLoading ? (
            <div className="space-y-4">
              <div className="bg-[#F9FAFB] rounded-lg p-6 mb-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Skeleton className="h-16 w-16 rounded-full mr-4" />
                    <div className="space-y-4">
                      <Skeleton className="h-5 w-[150px]" />
                      <Skeleton className="h-5 w-[200px]" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-32" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6 p-4">
                <Skeleton className="h-8 w-48 mb-4" />
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b">
                      <Skeleton className="h-5 w-[200px]" />
                      <Skeleton className="h-5 w-[100px]" />
                      <Skeleton className="h-5 w-[80px]" />
                      <Skeleton className="h-5 w-[100px]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-red-500">
              Error loading donation history: {error?.message || 'Unknown error'}
            </div>
          ) : donations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No donation history found for this donor.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="py-3 px-4 text-left text-gray-800 font-semibold">
                      Campaign
                    </TableHead>
                    <TableHead className="py-3 px-4 text-left text-gray-800 font-semibold">
                      Campaign Category
                    </TableHead>
                    <TableHead className="py-3 px-4 text-left text-gray-800 font-semibold">
                      Donation
                    </TableHead>
                    <TableHead className="py-3 px-4 text-left text-gray-800 font-semibold">
                      Date
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donations.map((donation, index) => (
                    <TableRow
                      key={index}
                      className="hover:bg-gray-50 transition duration-200 font-mulish"
                    >
                      <TableCell className="">
                        {donation.campaignName}
                      </TableCell>
                      <TableCell className="">
                        <span className={`px-3 py-1 text-xs ${getCategoryColorClass(donation.campaignCategoryName)}`}>
                          {donation.campaignCategoryName}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        $ {donation.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="">
                        {new Date(donation.donationDate).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="p-4 border-t border-gray-200">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          if (pageNumber > 1) handlePageChange(pageNumber - 1);
                        }}
                        className={!donorHistory?.hasPrevious ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                      // Show first page, last page, and pages around current page
                      if (
                        p === 1 ||
                        p === totalPages ||
                        (p >= pageNumber - 1 && p <= pageNumber + 1)
                      ) {
                        return (
                          <PaginationItem key={p}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(p);
                              }}
                              isActive={p === pageNumber}
                            >
                              {p}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                      
                      // Show ellipsis for skipped pages
                      if (
                        (p === 2 && pageNumber > 3) ||
                        (p === totalPages - 1 && pageNumber < totalPages - 2)
                      ) {
                        return (
                          <PaginationItem key={p}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      
                      return null;
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          if (pageNumber < totalPages) handlePageChange(pageNumber + 1);
                        }}
                        className={!donorHistory?.hasNext ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
                <div className="text-center text-sm text-gray-600 mt-2">
                  {pageNumber} of {totalPages} Pages
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonorDetailView; 