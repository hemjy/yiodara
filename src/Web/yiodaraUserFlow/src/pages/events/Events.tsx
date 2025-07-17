import { useEffect, useState } from "react";
import { useEvents } from "@/hooks/useEvents";
import { EventCard } from "@/components/events/EventCard";
import { Event } from "@/services/eventService";
import { VolunteerModal } from "@/components/events/VolunteerModal";
import { VolunteerAuthModal } from "@/components/events/VolunteerAuthModal";
import { useAuth } from "@/hooks/useAuth";
import { EventCardSkeleton } from "@/components/events/EventCardSkeleton";
import { DatePickerWithRange } from "@/pages/user/DatePickerWithRange";
import { DateRange } from "react-day-picker";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const EventsPage = () => {
  const eventsPerPage = 9;
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  
  const { events, isLoading, error, pageNumber, totalPages, setPageNumber, setDateRange: setEventsDateRange } =
    useEvents({ pageSize: eventsPerPage });

  const [isVolunteerModalOpen, setIsVolunteerModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
    
    let startDate: string | undefined;
    let endDate: string | undefined;
    
    if (newDateRange?.from) {
      startDate = newDateRange.from.toISOString();
    }
    if (newDateRange?.to) {
      endDate = newDateRange.to.toISOString();
    }
    
    setEventsDateRange(startDate, endDate);
  };

  const handleVolunteerClick = (event: Event) => {
    setSelectedEvent(event);
    if (isAuthenticated) {
      setIsVolunteerModalOpen(true);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleCloseModals = () => {
    setIsVolunteerModalOpen(false);
    setIsAuthModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <>
      <section className="bg-white py-12 md:py-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20">
          <div className="text-center mb-12">
            <div className="relative text-center mt-0 md:mt-[0px] md:mb-[40px] mb-[10px]">
              <h1 className="absolute w-full text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black font-raleway leading-tight md:leading-[144px] text-[#F6D0FE] left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                ALL EVENTS
              </h1>
              <h2 className="relative text-lg sm:text-xl md:text-2xl leading-9 font-extrabold font-raleway text-[#9F1AB1] z-10">
                UPCOMING EVENTS
              </h2>
            </div>
            <h2 className="text-3xl md:text-5xl font-raleway font-bold leading-[150%] md:leading-[200%] text-[#000000]">
              Volunteer with Us at Our Next Event
            </h2>
            <p className=" mt-3 md:mt-4 font-mulish max-w-3xl mx-auto text-base md:text-lg">
              Explore our upcoming events and find the perfect opportunity to
              get involved.
            </p>
          </div>

          {/* Date Filter */}
          <div className="mb-8 flex justify-center">
            <DatePickerWithRange
              date={dateRange}
              onDateChange={handleDateRangeChange}
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, index) => (
                <EventCardSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center text-red-500 text-lg">
              <p>Failed to load events. Please try again later.</p>
              <p className="text-sm mt-2">{error}</p>
            </div>
          ) : events.length === 0 ? (
            <div className=" font-mulish border text-center py-10">
              <h3 className="text-2xl font-bold">No Events Found</h3>
              <p className="text-gray-500 mt-2">
                There are no events matching your selected date range.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onVolunteer={handleVolunteerClick}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <Pagination>
                    <PaginationContent className="w-full flex justify-between">
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setPageNumber(pageNumber - 1)}
                          className={
                            pageNumber <= 1
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>

                      <div className="flex justify-center items-center cursor-pointer">
                        {[...Array(totalPages)].map((_, index) => {
                          const page = index + 1;
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= pageNumber - 1 && page <= pageNumber + 1)
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  onClick={() => setPageNumber(page)}
                                  isActive={pageNumber === page}
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          }
                          if (
                            page === pageNumber - 2 ||
                            page === pageNumber + 2
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
                          onClick={() => setPageNumber(pageNumber + 1)}
                          className={
                            pageNumber >= totalPages
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
        
      </section>
      <VolunteerModal
        isOpen={isVolunteerModalOpen}
        onClose={handleCloseModals}
        initialEvent={selectedEvent}
      />
      <VolunteerAuthModal
        isOpen={isAuthModalOpen}
        onClose={handleCloseModals}
      />
    </>
  );
};

export default EventsPage;
