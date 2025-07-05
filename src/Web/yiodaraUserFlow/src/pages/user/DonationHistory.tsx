import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDonationHistory } from "@/hooks/useDonationHistory";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import FileDown from "../../assets/Vector (2).svg";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { DatePickerWithRange } from "./DatePickerWithRange";
import { DateRange } from "react-day-picker";
import { format } from 'date-fns';
import { Donation } from "@/services/donationService";

const DonationHistory = () => {
  const { currentUser } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isAmountVisible, setIsAmountVisible] = useState(false);
  const donationsPerPage = 6;


  const userId = currentUser?.userId;

  const {
    data: historyData,
    isLoading,
    isError,
    error,
  } = useDonationHistory({
    userId: userId || "",
    pageNumber: currentPage,
    pageSize: donationsPerPage,
    startDate: dateRange?.from,
    endDate: dateRange?.to,
  });

  const handleDateChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
    setCurrentPage(1); // Reset to first page on date change
  };
  
  const user = historyData?.data;
  const donations = user?.donations || [];
  const totalPages = Math.ceil((historyData?.total || 0) / donationsPerPage);

  const renderTableContent = () => {
    if (isLoading) {
      return Array.from({ length: donationsPerPage }).map((_, index) => (
        <TableRow key={index}>
          <TableCell><Skeleton className="h-6 w-full" /></TableCell>
          <TableCell><Skeleton className="h-6 w-32" /></TableCell>
          <TableCell><Skeleton className="h-6 w-24" /></TableCell>
          <TableCell><Skeleton className="h-6 w-32" /></TableCell>
        </TableRow>
      ));
    }

    if (isError) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="text-center text-red-500 py-10">
            Error fetching donation history: {error instanceof Error ? error.message : "An unknown error occurred"}
          </TableCell>
        </TableRow>
      );
    }

    if (donations.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="text-center text-gray-500 py-10">
            You haven't made any donations yet.
          </TableCell>
        </TableRow>
      );
    }
    
    return donations.map((donation: Donation, index: number) => (
      <TableRow key={index}>
        <TableCell className="md:text-base font-mulish font-semibold">
          {donation.campaignName}
        </TableCell>
        <TableCell>
          <span
            className={`px-2 py-1 font-raleway font-bold text-[10px] md:text-[12px] leading-[18px] rounded-none ${
              donation.campaignCategoryName === "Medical Care" || donation.campaignCategoryName === "Healthcare"
                ? "bg-[#E9D7FE] text-[#9F1AB1]"
                : donation.campaignCategoryName === "Education"
                ? "bg-[#CFF9FE] text-[#088AB2]"
                : donation.campaignCategoryName === "Community Service"
                ? "bg-[#FEF0C7] text-[#DC6803]"
                : "bg-[#D1FADF] text-[#067647]"
            }`}
          >
            {donation.campaignCategoryName}
          </span>
        </TableCell>
        <TableCell className="md:text-base font-mulish font-medium">
          $ {donation.amount.toFixed(2)}
        </TableCell>
        <TableCell className="md:text-base font-mulish font-normal">
          {format(new Date(donation.donationDate), "yyyy-MM-dd")}
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 py-8">
      <div className="relative text-center mt-10 mb-12 md:mt-[60px] md:mb-[75px]">
        <h1 className="absolute w-full text-[37px] md:text-8xl font-black font-raleway leading-tight md:leading-[144px] text-[#F6D0FE] left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          DONATION HISTORY
        </h1>
        <h2 className="relative text-[12px] md:text-[24px] leading-tight md:leading-[36px] font-extrabold font-raleway text-[#9F1AB1] z-10">
          DONATION HISTORY
        </h2>
      </div>

      <div className="bg-[#F9FAFB] p-4 md:p-6 mb-8 border-[1.5px] border-[#EAECF0]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-4">
          <div className="flex items-center gap-4 font-raleway w-full">
            <div className="size-12 md:size-16 rounded-full bg-[#FBE8FF] flex items-center justify-center flex-shrink-0">
              {isLoading ? (
                <Skeleton className="h-10 w-10 rounded-full" />
              ) : (
                <span className="text-[#9F1AB1] text-xl md:text-2xl font-extrabold">
                  {user?.username?.charAt(0).toUpperCase() || "A"}
                </span>
              )}
            </div>

            <div className="space-y-3 md:space-y-4 w-full">
              <div className="flex flex-row md:items-center gap-2 font-raleway">
                <span className="text-[#101828] font-normal text-sm md:text-[16px] leading-tight md:leading-[18px]">
                  Username:
                </span>
                {isLoading ? <Skeleton className="h-5 w-32" /> : (
                  <span className="text-[#000000] font-bold text-sm md:text-[16px] leading-tight md:leading-[18px]">
                    {currentUser?.userName}
                  </span>
                )}
              </div>
              <div className="flex flex-row md:items-center gap-2 font-raleway">
                <span className="text-[#101828] font-normal text-sm md:text-[16px] leading-tight md:leading-[18px]">
                  Email Address:
                </span>
                {isLoading ? <Skeleton className="h-5 w-48" /> : (
                  <span className="text-[#000000] font-bold text-sm md:text-[16px] leading-tight md:leading-[18px] truncate">
                    {user?.email}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex w-full md:justify-end items-center gap-2 text-[16px] leading-[18px] font-normal font-raleway border-t md:border-t-0 pt-4 md:pt-0">
            <span className="text-[#101828] text-sm md:text-[16px]">Total Donations:</span>
            <div className="flex items-center gap-2 w-auto">
              {isLoading ? <Skeleton className="h-5 w-24" /> : (
                <span className="font-bold text-[#000000]">
                  $ {isAmountVisible ? user?.totalDonations?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "******"}
                </span>
              )}
              <button 
                className="ml-2 hover:text-[#9F1AB1] transition-colors"
                onClick={() => setIsAmountVisible(!isAmountVisible)}
                aria-label={isAmountVisible ? "Hide total donations" : "Show total donations"}
              >
                {isAmountVisible ? (
                  <EyeOff className="text-[#9F1AB1]" />
                ) : (
                  <Eye className="text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
          <h1 className="text-xl md:text-[24px] leading-tight md:leading-[36px] font-bold font-raleway">
            Donation History
          </h1>
          <div className="flex flex-row justify-end gap-4 w-auto">
            <DatePickerWithRange
              dateRange={dateRange}
              onDateChange={handleDateChange}
              className="w-auto"
            />
            <Button
              variant="outline"
              className="border-[#9F1AB1] text-[#9F1AB1] hover:text-[#9F1AB1] text-[14px] md:text-base font-medium bg-[#FDF2FF] font-mulish flex items-center gap-2 w-auto"
            >
              Export to Excel
              <img src={FileDown} alt="" className="size-3 md:size-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table className="border-[1.5px] border-gray-200 min-w-[640px]">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-[#101828] text-sm md:text-base font-bold font-raleway">
                  Campaign
                </TableHead>
                <TableHead className="text-[#101828] text-sm md:text-base font-bold font-raleway">
                  Campaign Category
                </TableHead>
                <TableHead className="text-[#101828] text-sm md:text-base font-bold font-raleway">
                  Donation
                </TableHead>
                <TableHead className="text-[#101828] text-sm md:text-base font-bold font-raleway">
                  Date
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {renderTableContent()}
            </TableBody>
          </Table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination>
            <PaginationContent className="w-[100%] flex justify-between">
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className={
                    currentPage === 1 || isLoading ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>

              <div className="flex justify-center items-center">
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;

                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => !isLoading && setCurrentPage(page)}
                          isActive={currentPage === page}
                          className={
                            currentPage === page
                              ? "bg-[#F9F5FF] cursor-pointer border-none text-[#101828] font-mulish text-[14px] leading-5 font-medium"
                              : "text-[#98A2B3] cursor-pointer hover:bg-transparent"
                          }
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }

                  if (page === currentPage - 2 || page === currentPage + 2) {
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
                  onClick={() =>
                    !isLoading && setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className={
                    currentPage === totalPages || isLoading
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default DonationHistory;