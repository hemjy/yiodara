import { ApiResponse, CreateEventRequest, Event } from "@/types/event";
import { api } from "./client";

export const createEvent = async (data: CreateEventRequest): Promise<ApiResponse<Event>> => {
  const response = await api.post<ApiResponse<Event>>("/api/Event/create-event", data);
  return response.data;
};

export const getTimeOptions = async (): Promise<string[]> => {
    const response = await api.get<string[]>("/api/Event/time-options");
    return response.data;
}; 