import { useState, useEffect } from 'react';
import calendar from "../assets/Calendar.svg"
import calendargrey from "../assets/Calendar (1).svg"
import { X } from "lucide-react";
import { useLocation } from "react-router-dom";
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
import PartnershipDetailView from "../components/partnerships/PartnershipDetailView";
import { usePartnerships } from "../hooks/usePartnerships";
import { PartnershipParams } from "../types/api";
import { Skeleton } from "../components/ui/skeleton";

const Partnerships = () => {
  const location = useLocation();
  
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  const [partnershipParams, setPartnershipParams] = useState<PartnershipParams>({
    pageNumber: 1,
    pageSize: 5,
    orderBy: 0,
    descending: true,
  });
  
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setSearchText(searchQuery);
      setIsSearching(true);
      // Add search text to partnership params
      setPartnershipParams(prev => ({
        ...prev,
        searchText: searchQuery
      }));
    } else {
      setSearchText("");
      setIsSearching(false);
      // Remove search text from params
      const newParams = { ...partnershipParams };
      delete newParams.searchText;
      setPartnershipParams(newParams);
    }
  }, [location.search]);
  
  const { 
    data: partnershipsData, 
    isLoading, 
    isError, 
    error 
  } = usePartnerships(partnershipParams);
  
  const [selectedPartnershipId, setSelectedPartnershipId] = useState<string | null>(null);
  console.log(partnershipsData)

  // Calculate pagination values
  const currentItems = partnershipsData?.partnerships || [];
  const totalPages = partnershipsData?.total 
    ? Math.ceil(partnershipsData.total / partnershipsData.pageSize) 
    : 1;
  const currentPage = partnershipsData?.pageNumber || partnershipParams.pageNumber;
  const hasPrevious = partnershipsData?.hasPrevious || false;
  const hasNext = partnershipsData?.hasNext || false;

  // Handle page change
  const handlePageChange = (page: number) => {
    setPartnershipParams(prev => ({
      ...prev,
      pageNumber: page,
    }));
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
    
    // Update partnership params
    const newParams = { ...partnershipParams };
    delete newParams.searchText;
    setPartnershipParams(newParams);
  };

  // Handle view partnership details
  const handleViewPartnership = (partnershipId: string) => {
    setSelectedPartnershipId(partnershipId);
  };

  // If a partnership is selected, show the detail view
  if (selectedPartnershipId) {
    return (
      <PartnershipDetailView 
        partnershipId={selectedPartnershipId} 
        onBack={() => setSelectedPartnershipId(null)} 
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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-[36px] leading-[54px] font-bold text-gray-800 flex items-center">
          Partnerships{" "}
          <span className="text-[#FCFCFD] bg-[#BA24D5] rounded-full text-center justify-center items-center flex size-[33px] text-sm font-mulish ml-2">
            {partnershipsData?.total || 0}
          </span>
        </h1>
        
        
        
        <div className="flex">
          <button className="bg-[#FEFAFF] text-[#9F1AB1] border border-[#F6D0FE] px-3 py-2 font-mulish font-medium text-sm rounded mr-2 flex items-center">
            All Partners 
            <span>
              <img src={calendar} alt="Calendar logo" className="size-4 ml-1"/>
            </span>
          </button>
          <button className="border-[#F5F5F4] border-[1.5px] text-[#D0D5DD] bg-[#F9FAFB] px-3 py-2 font-mulish font-medium text-sm rounded mr-2 flex items-center">
            Top Partners 
            <span>
              <img src={calendargrey} alt="Calendar logo" className="size-4 ml-1"/>
            </span>
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="space-y-4 p-6">
            <Skeleton className="h-10 w-full mb-4" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b">
                <Skeleton className="h-6 w-[180px]" />
                <Skeleton className="h-6 w-[120px]" />
                <Skeleton className="h-6 w-[150px]" />
                <Skeleton className="h-6 w-[140px]" />
                <Skeleton className="h-6 w-[100px]" />
                <Skeleton className="h-6 w-[60px]" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-red-500">
            Error loading partnerships: {error?.message || 'Unknown error'}
          </div>
        ) : currentItems.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No partnerships found.
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="py-3 px-4 text-left text-gray-800 font-semibold">
                  Company Name
                </TableHead>
                <TableHead className="py-3 px-4 text-left text-gray-800 font-semibold">
                  Campaign Name
                </TableHead>
                <TableHead className="py-3 px-4 text-left text-gray-800 font-semibold">
                  Industry
                </TableHead>
                <TableHead className="py-3 px-4 text-left text-gray-800 font-semibold">
                  Support Type
                </TableHead>
                <TableHead className="py-3 px-4 text-left text-gray-800 font-semibold">
                  Campaign Category
                </TableHead>
                <TableHead className="py-3 px-4 text-left text-gray-800 font-semibold">
                  Date
                </TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((item) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-gray-50 transition duration-200 font-mulish"
                >
                  <TableCell className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-[#BA24D5] rounded-md flex items-center justify-center text-white mr-3">
                        {item.companyName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{item.companyName}</div>
                        <div className="text-sm text-gray-500">{item.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4">{item.campaignName}</TableCell>
                  <TableCell className="py-3 px-4">{item.industry}</TableCell>
                  <TableCell className="py-3 px-4">{item.supportType}</TableCell>
                  <TableCell className="py-3 px-4">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-medium ${getCategoryColor(
                        item.campaignCategory
                      )}`}
                    >
                      {item.campaignCategory}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 px-4">{item.date}</TableCell>
                  <TableCell className="py-3 px-4 text-right">
                    <button 
                      className="text-[#BA24D5] hover:text-purple-800 transition duration-200"
                      onClick={() => handleViewPartnership(item.id)}
                    >
                      View
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        
        <div className="py-4 border-t px-4">
          <Pagination>
            <PaginationContent className="w-[100%] flex justify-between">
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) handlePageChange(currentPage - 1);
                  }}
                  className={!hasPrevious ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              <div className="flex justify-center items-center">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, and pages around current page
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"                        
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(page);
                          }}
                          className={
                            currentPage === page
                              ? "bg-[#F9F5FF] cursor-pointer border-none text-[#101828] font-mulish text-[14px] leading-5 font-medium"
                              : "text-[#98A2B3] cursor-pointer hover:bg-transparent"
                          }
                          isActive={page === currentPage}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  
                  // Show ellipsis for skipped pages
                  if (
                    (page === 2 && currentPage > 3) ||
                    (page === totalPages - 1 && currentPage < totalPages - 2)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  
                  return null;
                })}
              </div>
              
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) handlePageChange(currentPage + 1);
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
      </div>
    </section>
  );
};

const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case 'education':
      return 'bg-blue-100 text-blue-800';
    case 'medical care':
      return 'bg-red-100 text-red-800';
    case 'community service':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default Partnerships;
