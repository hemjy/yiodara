export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  eventDate: string; // ISO string
  eventTime: string;
  coverImageUrl: string;
  otherImageUrls?: string[];
}

export interface CreateEventRequest {
  title: string;
  description: string;
  location: string;
  eventDate: string; // ISO string
  eventTime: string;
  coverImageBase64: string;
  otherImagesBase64?: string[];
} 