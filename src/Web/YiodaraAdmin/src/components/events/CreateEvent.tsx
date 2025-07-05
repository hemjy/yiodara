import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import forward from "@/assets/forward.svg";
import { CreateEventRequest } from "@/types/event";
import { useToast } from "@/hooks/use-toast";
import { useCreateEvent, useEventTimeOptions } from "@/hooks/useEvents";

import { MapPin, } from 'lucide-react';


const CreateEvent = () => {
  const navigate = useNavigate();
  const [isCalendarOpen, setCalendarOpen] = useState(false);
  
  const [formData, setFormData] = useState<Partial<CreateEventRequest>>({
    title: "",
    description: "",
    location: "",
    eventDate: "",
    eventTime: "",
    coverImageBase64: "",
    otherImagesBase64: [],
  });
  
  const { data: timeOptions, isLoading: timeOptionsLoading } = useEventTimeOptions();
  const createEventMutation = useCreateEvent();
  const { toast } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof CreateEventRequest, value: string | string[] | undefined) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        handleInputChange("coverImageBase64", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 100) {
      newErrors.title = "Title cannot be longer than 100 characters";
    }
    
    if (!formData.description) {
      newErrors.description = "Description is required";
    } else if (formData.description.length > 200) {
      newErrors.description = "Description cannot be longer than 200 characters";
    }

    if (!formData.coverImageBase64) {
      newErrors.coverImageBase64 = "Cover image is required";
    }

    if (!formData.location) newErrors.location = "Location is required";
    if (!formData.eventDate) newErrors.eventDate = "Event date is required";
    if (!formData.eventTime) newErrors.eventTime = "Event time is required";
        
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    createEventMutation.mutate(formData as CreateEventRequest, {
      onSuccess: () => {
        toast({
          title: "Event Published!",
          description: "Your event has been successfully published.",
        });
        navigate("/events");
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || "There was an error publishing your event. Please try again.";
        toast({
          title: "Publication Failed",
          description: errorMessage,
          variant: "destructive",
        });
        console.error("Error creating event:", error);
      },
    });
  };

  const handleGoBack = () => {
    navigate("/events");
  };

  const handleCancel = () => {
    navigate("/events");
  };

  return (
    <div className="container mx-auto py-4 px-0 bg-white">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          className="p-0 flex items-center"
          onClick={handleGoBack}
        >
          <img src={forward} alt="" className="s-[24px]" />
          <span className="font-raleway text-[16px] font-bold leading-[150%]">Go Back</span>
        </Button>
      </div>

      <h1 className="text-[32px] font-bold mb-6 font-raleway ">Create Event</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-3/5 bg-[#FCFCFC] p-6 rounded-[8px] border">
          <div>
            <div>
              <div className="mb-6">
                <div className="inline-flex items-center">
                  <div className="w-4 h-[36px] rounded bg-[#BA24D5] mr-2"></div>
                  <span className="text-[20px] font-mulish text-[#101828] font-semibold leading-8">Event Details</span>
                </div>
                
                <div className="mt-6 mb-4">
                  <label className="block text-[14px] leading-6 font-medium mb-3 text-[#101828] font-mulish">
                    Event Title
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className={`w-full border-2 focus:border-[#BA24D5] focus:ring-[#BA24D5] ${errors.title ? "border-red-500" : ""}`}
                    placeholder="Enter event title"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.title?.length || 0}/100 characters
                  </p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-[14px] leading-6 font-medium mb-3 text-[#101828] font-mulish">
                    Event Description
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Write your event description..."
                    className={`w-full border-2 focus:border-[#BA24D5] focus:ring-[#BA24D5] ${errors.description ? "border-red-500" : ""}`}
                    rows={5}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.description?.length || 0}/200 characters
                  </p>
                </div>

                <div className="mb-4">
                    <label className="block text-[14px] leading-6 font-medium mb-3 text-[#101828] font-mulish">
                    Image
                    </label>
                    <div className="bg-gray-50 rounded-md h-[240px] flex items-center justify-center">
                        {formData.coverImageBase64 ? (
                        <div className="relative w-full h-full">
                            <img
                            src={formData.coverImageBase64}
                            alt="Cover"
                            className="w-full h-full object-cover rounded-md"
                            />
                            <button
                            onClick={() => handleInputChange("coverImageBase64", "")}
                            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
                            >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18M6 6L18 18" stroke="#101828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            </button>
                        </div>
                        ) : (
                        <div>
                            <input
                            type="file"
                            id="coverImage"
                            className="hidden"
                            accept="image/*"
                            onChange={handleCoverImageUpload}
                            />
                            <label
                            htmlFor="coverImage"
                            className="flex flex-col items-center cursor-pointer bg-white py-3 px-6 rounded-md shadow-sm border border-gray-300"
                            >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-1">
                                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span className="text-gray-600">Click or drop image</span>
                            </label>
                        </div>
                        )}
                    </div>
                    {errors.coverImageBase64 && (
                        <p className="text-red-500 text-xs mt-1">{errors.coverImageBase64}</p>
                    )}
                </div>

                <div className="mb-4">
                  <label className="block text-[14px] leading-6 font-medium mb-3 text-[#101828] font-mulish">
                    Location
                  </label>
                  <Input
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className={`w-full border-2 focus:border-[#BA24D5] focus:ring-[#BA24D5] ${errors.location ? "border-red-500" : ""}`}
                    placeholder="Enter event location"
                  />
                  {errors.location && (
                    <p className="text-red-500 text-xs mt-1">{errors.location}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[14px] leading-6 font-medium mb-3 text-[#101828] font-mulish">
                      Event Date
                    </label>
                    <Popover open={isCalendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal border-2",
                            !formData.eventDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.eventDate ? format(new Date(formData.eventDate), "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.eventDate ? new Date(formData.eventDate) : undefined}
                          onSelect={(date) => {
                            handleInputChange("eventDate", date?.toISOString());
                            setCalendarOpen(false);
                          }}
                          disabled={{ before: new Date() }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.eventDate && (
                      <p className="text-red-500 text-xs mt-1">{errors.eventDate}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[14px] leading-6 font-medium mb-3 text-[#101828] font-mulish">
                      Event Time
                    </label>
                    <Select
                      value={formData.eventTime}
                      onValueChange={(value) => handleInputChange("eventTime", value)}
                    >
                      <SelectTrigger className="w-full border-2 border-gray-200 focus:border-[#BA24D5] focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-md">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[220px]">
                        {timeOptionsLoading ? (
                          <SelectItem value="loading" disabled>Loading...</SelectItem>
                        ) : (
                          timeOptions?.map((time) => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {errors.eventTime && (
                      <p className="text-red-500 text-xs mt-1">{errors.eventTime}</p>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
          <div className="flex space-x-2 mt-[48px]">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="w-full rounded-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-[#9F1AB1] rounded-none text-white w-full hover:bg-[#BA24D5]"
              disabled={createEventMutation.isPending}
            >
              {createEventMutation.isPending ? "Creating Event..." : "Create Event"}
            </Button>
          </div>
        </div>
        <div className="lg:w-2/5 bg-[#FCFCFC] p-6 rounded-lg border">
          <div className="mb-4">
            <div className="inline-flex items-center">
              <div className="w-1 h-8 rounded bg-[#BA24D5] mr-4"></div>
              <span className="text-xl font-semibold text-[#101828]">Preview</span>
            </div>
          </div>
          
          <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
            <div className="h-48 bg-gray-200 relative">
              {formData.coverImageBase64 ? (
                <img
                  src={formData.coverImageBase64}
                  alt="Event Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  Cover image preview
                </div>
              )}
            </div>
            
            <div className="p-4">
              <div className="flex items-center text-sm text-gray-700 mb-2 min-h-[20px]">
                <MapPin size={16} className="mr-2 text-gray-400" />
                <span className="font-medium">{formData.location || "Location will appear here"}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500 mb-4 min-h-[20px]">
                <CalendarIcon size={16} className="mr-2 text-gray-400" />
                {formData.eventDate || formData.eventTime ? (
                    <span>
                        {formData.eventDate ? format(new Date(formData.eventDate), 'E d MMM, yyyy') : null}
                        {formData.eventTime ? ` at ${formData.eventTime}` : null}
                    </span>
                ) : (
                    <span>Date and time will appear here</span>
                )}
              </div>
              
              <h3 className="font-bold text-xl mb-2 text-[#1D2939] min-h-[28px]">
                {formData.title || "Event Title"}
              </h3>
              
              <div className="text-sm text-[#475467] break-words line-clamp-4 min-h-[80px]">
                {formData.description || "Event description will appear here"}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
          background-color: #F6D0FE;
        }
        .rdp-day_selected,
        .rdp-day_selected:focus,
        .rdp-day_selected:hover {
          background-color: #9F1AB1;
          color: white;
        }
        .rdp-button[disabled] {
          color: #d1d5db;
        }
        .rdp-caption_label {
          font-size: 1rem;
          font-weight: 600;
        }
        .rdp-nav_button {
          border-radius: 0.25rem;
          border: 1px solid #e5e7eb;
        }
        .rdp-head_cell {
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default CreateEvent; 