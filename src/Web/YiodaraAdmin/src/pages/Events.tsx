import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { useEvents } from '@/hooks/useEvents';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from '@/components/ui/skeleton';
import { Event } from '@/types/event';


const Events: React.FC = () => {
  const [params, setParams] = useState<{
    pageNumber: number;
    pageSize: number;
    startDate?: string;
    endDate?: string;
    categoryId?: string;
  }>({
    pageNumber: 1,
    pageSize: 10,
  });

  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);

  const { data: eventsData, isLoading, isError } = useEvents(params);

  const totalEvents = eventsData?.total ?? 0;
  const events = eventsData?.data ?? [];

  const handleApplyDateFilter = () => {
    const startDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined;
    const endDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined;
    setParams(prev => ({ ...prev, startDate, endDate, pageNumber: 1 }));
    setIsDatePopoverOpen(false);
  };

  const handleClearDateFilter = () => {
    setDateRange(undefined);
    setParams(prev => ({ ...prev, startDate: undefined, endDate: undefined, pageNumber: 1 }));
    setIsDatePopoverOpen(false);
  };

  const handlePageChange = (page: number) => {
    setParams(prev => ({ ...prev, pageNumber: page }));
  };
  
  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[36px] leading-[54px] font-bold font-mulish text-gray-800 flex items-center">
          Events{" "}
          <span className="text-[#FCFCFD] bg-[#BA24D5] rounded-full text-center justify-center items-center flex size-[33px] text-sm font-mulish ml-2">
            {totalEvents}
          </span>
        </h1>
        <div className="flex items-center gap-4">
          <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
            <PopoverTrigger asChild>
              <button className="bg-[#FEFAFF] text-[#9F1AB1] border border-[#F6D0FE] px-3 py-2 font-mulish font-medium text-sm rounded mr-2 flex items-center">
                Filter by Date
                <CalendarIcon className="h-4 w-4 ml-1" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                disabled={{ before: new Date() }}
              />
              <div className="flex justify-end gap-2 p-4 border-t">
                <Button variant="ghost" onClick={handleClearDateFilter}>Clear</Button>
                <Button onClick={handleApplyDateFilter} disabled={!dateRange?.from}>Apply</Button>
              </div>
            </PopoverContent>
          </Popover>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="bg-[#FEFAFF] text-[#9F1AB1] border border-[#F6D0FE] px-3 py-2 font-mulish font-medium text-sm rounded flex items-center">
                <span>Filter by Category</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Category 1</DropdownMenuItem>
              <DropdownMenuItem>Category 2</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {isLoading ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Name</TableHead>
                <TableHead>Registered Volunteers</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="flex flex-col gap-1">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-64" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : isError ? (
          <div className="text-center py-16">
            <p className="text-red-500">Failed to load events.</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">No events found.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Name</TableHead>
                <TableHead>Registered Volunteers</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event: Event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-[#BA24D5] flex-shrink-0" />
                      <div>
                        <p className="font-semibold">{event.title}</p>
                        <p className="text-sm text-gray-500 truncate" style={{ maxWidth: '300px' }}>
                          {event.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>24</TableCell>
                  <TableCell>{event.location}</TableCell>
                  <TableCell>
                    {format(new Date(event.eventDate), 'dd/MM/yyyy')} . {event.eventTime}
                  </TableCell>
                  <TableCell>
                    <Button variant="link" className="text-[#BA24D5]">View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {events.length > 0 && (
        <div className="p-4 border-t border-gray-200">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(params.pageNumber - 1)}
                  className={!eventsData?.hasPrevious ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {/* Add pagination links here */}
              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(params.pageNumber + 1)}
                  className={!eventsData?.hasNext ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <div className="text-center text-sm text-gray-600 mt-2">
            Page {eventsData?.pageNumber} of {Math.ceil((eventsData?.total ?? 0) / (eventsData?.pageSize ?? 10))}
          </div>
        </div>
      )}
    </section>
  );
};

export default Events; 