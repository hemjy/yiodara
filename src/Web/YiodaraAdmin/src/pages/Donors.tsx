import { useState, useEffect } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import { CalendarIcon, X } from "lucide-react";
import DonorDetailView from "../components/donors/DonorDetailView";
import { useDonations } from '../hooks/useDonations';
import { Calendar } from "../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { format } from "date-fns";
import { DonationParams } from '../types/api';
import { Skeleton } from "../components/ui/skeleton";
import { useLocation } from "react-router-dom";
import { DateRange } from "react-day-picker";

type ActiveTab = "all" | "top";

interface Donor {
  id: string;
  name: string;
  email: string;
  lastDonation: string;
  totalDonation: string;
  date: string;
  initials: string;
}

const Donors = () => {
  const location = useLocation();
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  
  // Applied filter state
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // Picker UI state
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<ActiveTab>("all");
  
  // Get search param from URL
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  const [donorParams, setDonorParams] = useState<DonationParams>({
    pageNumber: 1,
    pageSize: 5, 
    orderBy: 0,
    descending: true, 
    startDate: undefined,
    endDate: undefined,
  });

  useEffect(() => {
    switch (activeTab) {
      case "top":
        setDonorParams(prev => ({ ...prev, orderBy: 1, descending: true, pageNumber: 1 }));
        break;
      case "all":
      default:
        setDonorParams(prev => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { orderBy, descending, ...rest } = prev;
          return { ...rest, pageNumber: 1 };
        });
        break;
    }
  }, [activeTab]);
  
  // Get search param from URL on initial load
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setSearchText(searchQuery);
      setIsSearching(true);
      // Add search text to donor params
      setDonorParams(prev => ({
        ...prev,
        searchText: searchQuery
      }));
    } else {
      setSearchText("");
      setIsSearching(false);
      // Remove search text from params
      const newParams = { ...donorParams };
      delete newParams.searchText;
      setDonorParams(newParams);
    }
  }, [location.search]);
  
  const { 
    data: donationsData, 
    isLoading, 
    isError, 
    error
  } = useDonations(donorParams);
  
  // Calculate pagination values
  const currentItems = donationsData?.donations || [];
  const totalPages = donationsData?.total 
    ? Math.ceil(donationsData.total / donationsData.pageSize) 
    : 1;
  const currentPage = donationsData?.pageNumber || donorParams.pageNumber;
  const totalDonors = donationsData?.total || 0;
  const hasPrevious = donationsData?.hasPrevious || false;
  const hasNext = donationsData?.hasNext || false;

  // Handle page change
  const handlePageChange = (page: number) => {
    setDonorParams(prev => ({
      ...prev,
      pageNumber: page,
    }));
  };

  // Apply date filters
  const handleApplyDateFilter = () => {
    const newStartDate = dateRange?.from;
    const newEndDate = dateRange?.to;

    setStartDate(newStartDate);
    setEndDate(newEndDate);
    
    setDonorParams(prev => ({
      ...prev,
      pageNumber: 1,
      startDate: newStartDate ? format(newStartDate, 'yyyy-MM-dd') : undefined,
      endDate: newEndDate ? format(newEndDate, 'yyyy-MM-dd') : undefined,
    }));

    setIsDatePopoverOpen(false);
  };
  
  // Clear date filters
  const handleClearDateFilter = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setDateRange(undefined);
    
    setDonorParams(prev => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { startDate, endDate, ...rest } = prev;
      return { ...rest, pageNumber: 1 };
    });

    setIsDatePopoverOpen(false);
  };

  // Clear search function
  const clearSearch = () => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.delete('search');
    
    // Update the URL without the search parameter
    history.pushState(
      null,
      '',
      `${location.pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    );
    
    // Update state
    setSearchText("");
    setIsSearching(false);
    
    // Update donor params
    const newParams = { ...donorParams };
    delete newParams.searchText;
    setDonorParams(newParams);
  };

  // Transform API data to match your donor format
  const transformedDonors: Donor[] = Array.isArray(currentItems) 
    ? currentItems.map(donation => {
        const nameParts = (donation.donorName || '').split(' ');
        const initials = nameParts.length >= 2 
          ? `${nameParts[0][0]}${nameParts[1][0]}` 
          : donation.donorName?.substring(0, 2) || 'NA';
        
        return {
          id: donation.id,
          name: donation.donorName || 'Anonymous',
          email: 'No email',
          lastDonation: `$ ${donation.amount.toFixed(2)}`,
          totalDonation: `$ ${donation.totalDonation.toFixed(2)}`,
          date: new Date(donation.date).toLocaleDateString(),
          initials: initials.toUpperCase()
        };
      })
    : [];

  // Handle view donor details
  const handleViewDonor = (donor: Donor) => {
    setSelectedDonor(donor);
  };

  // If a donor is selected, show the detail view
  if (selectedDonor) {
    return (
      <DonorDetailView 
        donor={selectedDonor} 
        onBack={() => setSelectedDonor(null)} 
      />
    );
  }

  return (
    <section className="font-raleway">

{isSearching && (
        <div className="bg-[#F9F5FF] px-4 py-2 rounded-md flex items-center w-full mb-4">
          <span className="text-[#BA24D5]">Showing results for: "{searchText}"</span>
          <button 
            onClick={clearSearch}
            className="ml-auto text-gray-500 hover:text-gray-700 flex items-center"
          >
            Clear search <X className="h-4 w-4 ml-1" />
          </button>
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <h1 className="text-[36px] leading-[54px] font-bold text-gray-800 flex items-center">
          Donors{" "}
          <span className="text-[#FCFCFD] bg-[#BA24D5] text-center justify-center items-center flex w-[50px] h-[33px] rounded-3xl text-sm font-mulish ml-2">
            {totalDonors}
          </span>
        </h1>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="bg-gray-50 rounded-lg p-1 flex">
            <button
              className={`py-2 px-4 rounded-lg font-medium text-sm flex-1 transition-colors ${
                activeTab === 'all' 
                  ? "bg-white text-[#BA24D5] shadow-sm" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab('all')}
            >
              All Donors
            </button>
            <button
              className={`py-2 px-4 rounded-lg font-medium text-sm flex-1 transition-colors ${
                activeTab === 'top' 
                  ? "bg-white text-[#BA24D5] shadow-sm" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab('top')}
            >
              Top Donors
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-[#FEFAFF] text-[#9F1AB1] border border-[#F6D0FE] px-3 py-2 font-mulish font-medium text-sm rounded flex items-center h-9"
                   onClick={() => {
                    setDateRange({ from: startDate, to: endDate });
                    setIsDatePopoverOpen(true);
                  }}
                >
                  Filter by Date
                  <CalendarIcon className="ml-auto h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  initialFocus
                  disabled={{ after: new Date() }}
                />
                <div className="flex justify-end gap-2 p-4 border-t">
                   <Button 
                    variant="ghost" 
                    onClick={handleClearDateFilter}
                    disabled={!dateRange?.from && !dateRange?.to}
                  >
                    Clear
                  </Button>
                  <Button 
                    onClick={handleApplyDateFilter}
                    disabled={!dateRange?.from}
                  >
                    Apply
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {isLoading ? (
          <div>
            <div className="bg-gray-50 px-4 py-3">
              <div className="flex">
                <Skeleton className="h-6 w-24 mr-6" />
                <Skeleton className="h-6 w-32 mr-6" />
                <Skeleton className="h-6 w-32 mr-6" />
                <Skeleton className="h-6 w-24 mr-6" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
            
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="border-b border-gray-100 px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Skeleton className="h-8 w-8 rounded-full mr-3" />
                    <div>
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-24 mr-6" />
                  <Skeleton className="h-5 w-24 mr-6" />
                  <Skeleton className="h-5 w-24 mr-6" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500">
            Error loading donors: {error?.message || 'Unknown error'}
          </div>
        ) : transformedDonors.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {donationsData?.message || 'No donors found.'}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="py-3 px-4 text-left text-gray-800 font-semibold">
                    Names
                  </TableHead>
                  <TableHead className="py-3 px-4 text-left text-gray-800 font-semibold">
                    Last Donation
                  </TableHead>
                  <TableHead className="py-3 px-4 text-left text-gray-800 font-semibold">
                    Total Donation
                  </TableHead>
                  <TableHead className="py-3 px-4 text-left text-gray-800 font-semibold">
                    Date
                  </TableHead>
                  <TableHead className="py-3 px-4 text-right text-gray-800 font-semibold">
                    {/* View column - header intentionally left empty */}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transformedDonors.map((donor, index) => (
                  <TableRow
                    key={donor.id || index}
                    className="hover:bg-gray-50 transition duration-200 font-mulish"
                  >
                    <TableCell className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-[#BA24D5] text-white flex items-center justify-center font-bold mr-3">
                          {donor.initials}
                        </div>
                        <div>
                          <div className="font-semibold">{donor.name}</div>
                          <div className="text-gray-500 text-sm">{donor.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4">{donor.lastDonation}</TableCell>
                    <TableCell className="py-3 px-4">{donor.totalDonation}</TableCell>
                    <TableCell className="py-3 px-4">{donor.date}</TableCell>
                    <TableCell className="py-3 px-4 text-right">
                      <button 
                        className="text-[#BA24D5] hover:text-purple-800 transition duration-200"
                        onClick={() => handleViewDonor(donor)}
                      >
                        View
                      </button>
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
                        if (currentPage && currentPage > 1) handlePageChange(currentPage - 1);
                      }}
                      className={!hasPrevious ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, and pages around current page
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (currentPage && page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(page);
                            }}
                            isActive={page === currentPage}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    
                    // Show ellipsis for skipped pages
                    if (
                      (currentPage && page === 2 && currentPage > 3) ||
                      (currentPage && page === totalPages - 1 && currentPage < totalPages - 2)
                    ) {
                      return (
                        <PaginationItem key={page}>
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
                        if (currentPage && currentPage < totalPages) handlePageChange(currentPage + 1);
                      }}
                      className={!hasNext ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
              <div className="text-center text-sm text-gray-600 mt-2">
                {currentPage} of {totalPages} Pages
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Donors;