import { useState, useEffect } from 'react';
import calendar from "../assets/Calendar.svg";
import { useVolunteers } from '../hooks/useVolunteers';
import { useVolunteerCount } from '../hooks/useVolunteerCount';
import { useLocation } from "react-router-dom";
import { X, ChevronDown } from "lucide-react";
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
import { Skeleton } from "../components/ui/skeleton";

const Volunteers = () => {
  const location = useLocation();
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  const [volunteerParams, setVolunteerParams] = useState({
    pageNumber: 1,
    pageSize: 7, 
  });

  // Get search param from URL on initial load
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setSearchText(searchQuery);
      setIsSearching(true);
      // Add search text to volunteer params
      setVolunteerParams(prev => ({
        ...prev,
        searchText: searchQuery
      }));
    } else {
      setSearchText("");
      setIsSearching(false);
      // Remove search text from params
      const newParams = { ...volunteerParams };
      delete newParams.searchText;
      setVolunteerParams(newParams);
    }
  }, [location.search]);

  // Clear search function
  const clearSearch = () => {
    // Navigate to the current page without search param
    window.history.pushState(
      {}, 
      '', 
      `${window.location.pathname}`
    );
    setSearchText("");
    setIsSearching(false);
    // Remove search text from params
    const newParams = { ...volunteerParams };
    delete newParams.searchText;
    setVolunteerParams(newParams);
  };

  // Fetch volunteers data
  const { 
    data: volunteersData, 
    isLoading, 
    isError, 
    error 
  } = useVolunteers(volunteerParams);
  
  // Fetch total volunteer count
  const { 
    data: volunteerCountData,
    isLoading: isLoadingCount
  } = useVolunteerCount();
  
  // Fallback to empty data if API call fails or is loading
  const currentItems = volunteersData?.volunteers || [];
  const totalPages = volunteersData?.pagination 
    ? Math.ceil(volunteersData.pagination.total / volunteersData.pagination.pageSize) 
    : 1; 
  const currentPage = volunteersData?.pagination?.pageNumber || volunteerParams.pageNumber;

  // Handle page change
  const handlePageChange = (page: number) => {
    setVolunteerParams(prev => ({
      ...prev,
      pageNumber: page,
    }));
  };

  // Handle date filter
  const handleDateFilter = () => {
    console.log("Date filter clicked");
  };

  // Handle location filter
  const handleLocationFilter = () => {
    console.log("Location filter clicked");
  };

  return (
    <section className="font-raleway">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-[36px] leading-[54px] font-bold text-gray-800 flex items-center">
          Volunteers{" "}
          <span className="text-[#FCFCFD] bg-[#BA24D5] rounded-full text-center justify-center items-center flex size-[33px] text-sm font-mulish ml-2">
            {isLoadingCount ? "..." : volunteerCountData?.totalVolunteers}
          </span>
        </h1>
        <div className="flex">
          <button 
            className="bg-[#FEFAFF] text-[#9F1AB1] border border-[#F6D0FE] px-3 py-2 font-mulish font-medium text-sm rounded mr-2 flex items-center"
            onClick={handleDateFilter}
          >
            Filter by Date <span><img src={calendar} alt="Calendar logo" className="size-4 ml-1"/></span>
          </button>
          <button 
            className="bg-[#FEFAFF] text-[#9F1AB1] border border-[#F6D0FE] px-3 py-2 font-mulish font-medium text-sm rounded flex items-center"
            onClick={handleLocationFilter}
          >
            Filter by Location <ChevronDown className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
      
      {/* Search notification */}
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
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {isLoading ? (
          <>
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="py-3 px-4 text-left text-gray-800 font-semibold">
                    Names
                  </TableHead>
                  <TableHead className="py-3 px-4 text-left text-gray-800 font-semibold">
                    Phone Number
                  </TableHead>
                  <TableHead className="py-3 px-4 text-left text-gray-800 font-semibold">
                    Email
                  </TableHead>
                  <TableHead className="py-3 px-4 text-left text-gray-800 font-semibold">
                    Username
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <TableRow key={i}>
                    <TableCell className="py-3 px-4">
                      <div className="flex items-center">
                        <Skeleton className="w-8 h-8 rounded-full mr-3" />
                        <Skeleton className="h-5 w-[120px]" />
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4"><Skeleton className="h-5 w-[100px]" /></TableCell>
                    <TableCell className="py-3 px-4"><Skeleton className="h-5 w-[150px]" /></TableCell>
                    <TableCell className="py-3 px-4"><Skeleton className="h-5 w-[80px]" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="p-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-8" />
                <div className="flex space-x-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
              <div className="text-center mt-6">
                <Skeleton className="h-5 w-[100px] mx-auto" />
              </div>
            </div>
          </>
        ) : isError ? (
          <div className="p-8 text-center text-red-500">
            <p>Error loading volunteers: {error?.message || "Unknown error"}</p>
            <button 
              className="mt-4 bg-[#FEFAFF] text-[#9F1AB1] border border-[#F6D0FE] px-4 py-2 rounded"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>{volunteersData?.message || "No volunteers found."}</p>
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
                    Phone Number
                  </TableHead>
                  <TableHead className="py-3 px-4 text-left text-gray-800 font-semibold">
                    Email
                  </TableHead>
                  <TableHead className="py-3 px-4 text-left text-gray-800 font-semibold">
                    Username
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className='cursor-pointer'>
                {currentItems.map((volunteer, index) => (
                  <TableRow
                    key={volunteer.id || index}
                    className="hover:bg-gray-50 transition duration-200 font-mulish"
                  >
                    <TableCell className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-[#BA24D5] text-white flex items-center justify-center font-bold mr-3">
                          {volunteer.name ? volunteer.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??'}
                        </div>
                        <div>
                          <div className="font-semibold">{volunteer.name || 'Unknown'}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4">{volunteer.phoneNumber || 'N/A'}</TableCell>
                    <TableCell className="py-3 px-4">{volunteer.email || 'N/A'}</TableCell>
                    <TableCell className="py-3 px-4">{volunteer.userName || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="p-4 border-t border-gray-200">
              <Pagination>
                <PaginationContent className="w-[100%] flex justify-between">
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) handlePageChange(currentPage - 1);
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
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
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
              <div className="text-center text-sm text-gray-600 mt-6 font-mulish">
                {currentPage} of {totalPages} Pages
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Volunteers;