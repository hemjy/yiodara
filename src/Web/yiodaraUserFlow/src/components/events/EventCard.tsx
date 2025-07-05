import { Button } from "@/components/ui/button";
import { Event } from "@/services/eventService";
import { Calendar, MapPin } from 'lucide-react';

interface EventCardProps {
  event: Event;
  onVolunteer?: (event: Event) => void;
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
    const day = date.getDate();
    const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
    const year = date.getFullYear();
    return `${weekday} ${day} ${month}, ${year}`;
};

export const EventCard = ({ event, onVolunteer }: EventCardProps) => {
  
  const handleVolunteerClick = () => {
    if (onVolunteer) {
      onVolunteer(event);
    }
    // TODO: Implement default volunteer action if needed, e.g., navigate to event page
  };

  return (
    <div className="bg-white border-[1px] transition-all duration-300 overflow-hidden flex flex-col">
      <div className="h-[230px] overflow-hidden">
        <img
          src={event.coverImageUrl}
          alt={event.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
        />
      </div>

      <div className="p-4 pb-6 flex flex-col flex-grow">
        <div className="space-y-[4px] text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-2 text-[#000000] font-bold font-mulish">
                <MapPin className="w-4 h-4" />
                <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2 leading-[150%]">
                <Calendar className="w-4 h-4 text-[#98A2B3]" />
                <span>{formatDate(event.eventDate)} {event.eventTime.toLowerCase()}</span>
            </div>
        </div>
        <h3 className="font-raleway font-bold text-lg lg:text-xl leading-tight mb-2">
          {event.title}
        </h3>
        
        <p className="font-mulish text-sm font-medium leading-relaxed text-gray-700 mb-6 flex-grow" style={{
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {event.description}
        </p>


        <Button 
          className="w-full bg-[#9F1AB1] hover:bg-[#8a0f9c] text-white font-medium mt-auto py-2.5"
          onClick={handleVolunteerClick}
        >
          Register as Volunteer
        </Button>
      </div>
    </div>
  );
}; 