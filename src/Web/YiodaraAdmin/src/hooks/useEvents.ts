import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createEvent, getTimeOptions, getEvents } from "@/api/eventService";
import { CreateEventRequest } from "@/types/event";

export const useEvents = (params: { pageNumber: number, pageSize: number, startDate?: string, endDate?: string, categoryId?: string }) => {
  return useQuery({
    queryKey: ["events", params],
    queryFn: () => getEvents(params),
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEventRequest) => createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

export const useEventTimeOptions = () => {
  return useQuery({
    queryKey: ["eventTimeOptions"],
    queryFn: getTimeOptions,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}; 