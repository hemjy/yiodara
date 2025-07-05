import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  // DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useEvents } from "@/hooks/useEvents";
import { Event, VolunteerRegistration } from "@/services/eventService";
import eventService from "@/services/eventService";
import check from "@/assets/done-BezVd9SE1f.svg";
// import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const volunteerSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  eventId: z.string().nonempty({ message: "Please select an event" }),
});

type VolunteerFormData = z.infer<typeof volunteerSchema>;

interface VolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEvent?: Event | null;
}

export const VolunteerModal = ({ isOpen, onClose, initialEvent }: VolunteerModalProps) => {
  const { user, isAuthenticated } = useAuth();
  const { events, isLoading: isLoadingEvents } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(initialEvent || null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const methods = useForm<VolunteerFormData>({
    resolver: zodResolver(volunteerSchema),
    defaultValues: {
      email: user?.email || "",
      eventId: initialEvent?.id || "",
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = methods;

  useEffect(() => {
    if (initialEvent) {
      setSelectedEvent(initialEvent);
      setValue("eventId", initialEvent.id);
    }
  }, [initialEvent, setValue]);

  useEffect(() => {
    reset({
        email: user?.email || "",
        eventId: initialEvent?.id || ""
    });
  }, [user, initialEvent, reset]);

  const eventId = watch("eventId");

  useEffect(() => {
    const event = events.find((e) => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
    }
  }, [eventId, events]);

  const onSubmit = async (data: VolunteerFormData) => {
    setIsLoading(true);
    try {
      const response = await eventService.registerForEvent(data as VolunteerRegistration);
      if (response.succeeded) {
        setIsSubmitted(true);
        toast({
            title: "Registration Successful!",
            description: "You have successfully registered for the event.",
        });
      } else {
        toast({
            title: "Registration Failed",
            description: response.message || "An unknown error occurred.",
            variant: "destructive",
        });
      }
    } catch (error) {
        toast({
            title: "Error",
            description: "An error occurred while registering for the event.",
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleClose = () => {
    setIsSubmitted(false);
    reset({ email: user?.email || "", eventId: "" });
    onClose();
  };

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[480px] p-3 md:p-6">
          <div className="text-center">
            <img src={check} alt="Success" className="mx-auto h-20 w-20 mb-4" />
            <h2 className="text-2xl font-bold mb-2 font-raleway">Registration Successful!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for volunteering for the event. We've received your registration and will send more details to your email shortly.
            </p>
            <Button onClick={handleClose} className="w-full bg-[#9F1AB1] hover:bg-[#8a0f9c]">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px] p-3 md:p-6">
        <DialogHeader>
          <DialogTitle className=" text-2xl md:text-3xl font-bold text-center font-raleway leading-[150%]">
            Volunteer
          </DialogTitle>
          {/* <DialogClose asChild>
              <button className="absolute top-4 right-4" onClick={handleClose}>
                <X className="h-6 w-6" />
              </button>
          </DialogClose> */}
        </DialogHeader>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <Input
                {...register("email")}
                placeholder="e.g. example@gmail.com"
                className="w-full"
                readOnly={isAuthenticated}
                disabled={isAuthenticated}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Event Name</label>
              <Select onValueChange={(value) => setValue("eventId", value)} defaultValue={initialEvent?.id}>
                <SelectTrigger className="w-full" disabled={isLoadingEvents}>
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingEvents ? (
                    <SelectItem value="loading" disabled>Loading events...</SelectItem>
                  ) : (
                    events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.eventId && <p className="text-sm text-red-500">{errors.eventId.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Event Location</label>
              <Input
                value={selectedEvent?.location || ""}
                placeholder="Location will be shown here"
                className="w-full"
                readOnly
                disabled
              />
            </div>

            <Button type="submit" className="w-full bg-[#9F1AB1] hover:bg-[#8a0f9c]" disabled={isLoading}>
              {isLoading ? "Registering..." : "Register for Event"}
            </Button>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}; 