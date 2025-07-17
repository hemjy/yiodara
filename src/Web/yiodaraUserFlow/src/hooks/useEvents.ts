import { useState, useEffect, useCallback } from 'react';
import eventService, { Event, GetEventsParams } from '@/services/eventService';

// Hook options interface
interface UseEventsOptions {
  autoFetch?: boolean;
  pageSize?: number;
  onError?: (error: string) => void;
  startDate?: string;
  endDate?: string;
}

// Hook return type
interface UseEventsReturn {
  events: Event[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  pageNumber: number;
  totalPages: number;
  setPageNumber: (page: number) => void;
  setDateRange: (startDate?: string, endDate?: string) => void;
}

// Custom hook for managing events
export const useEvents = (options: UseEventsOptions = {}): UseEventsReturn => {
  const { autoFetch = true, pageSize = 9, onError, startDate: initialStartDate, endDate: initialEndDate } = options;
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [startDate, setStartDate] = useState<string | undefined>(initialStartDate);
  const [endDate, setEndDate] = useState<string | undefined>(initialEndDate);

  const fetchEvents = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params: GetEventsParams = {
        pageNumber: page,
        pageSize: pageSize,
        ...(startDate && { StartDate: startDate }),
        ...(endDate && { EndDate: endDate }),
      };
      const response = await eventService.getAllEvents(params);
      
      if (response.succeeded) {
        setEvents(response.data);
        setPageNumber(response.pageNumber);
        setTotalPages(Math.ceil(response.total / response.pageSize));
      } else {
        const errorMessage = response.message || 'Failed to load events';
        setError(errorMessage);
        if (onError) {
          onError(errorMessage);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An error occurred while fetching events';
      
      console.error('Error fetching events:', err);
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, onError, startDate, endDate]);

  const handleSetPageNumber = (newPage: number) => {
    fetchEvents(newPage);
  }

  const handleSetDateRange = (newStartDate?: string, newEndDate?: string) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    setPageNumber(1); // Reset to first page when filtering
  };

  useEffect(() => {
    if (autoFetch) {
      fetchEvents(pageNumber);
    }
  }, [autoFetch, fetchEvents, pageNumber, startDate, endDate]);

  return {
    events,
    isLoading,
    error,
    refetch: () => fetchEvents(pageNumber),
    pageNumber,
    totalPages,
    setPageNumber: handleSetPageNumber,
    setDateRange: handleSetDateRange,
  };
}; 