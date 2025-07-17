import img6 from "../assets/volunteersimg/Frame 1171275833.jpg";
import img7 from "../assets/volunteersimg/Frame 1948758318.png";
import vol1 from "../assets/volunteersimg/Frame 1171275806.png";
import vol2 from "../assets/volunteersimg/Frame 1171275806 (1).png";
import vol3 from "../assets/volunteersimg/Frame 1171275806 (2).png";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useEvents } from "@/hooks/useEvents";
import { EventCard } from "@/components/events/EventCard";
// import { Skeleton } from "@/components/ui/skeleton";
import { VolunteerModal } from "@/components/events/VolunteerModal";
import { VolunteerAuthModal } from "@/components/events/VolunteerAuthModal";
import { Event } from "@/services/eventService";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { EventCardSkeleton } from "@/components/events/EventCardSkeleton";

const volunteers = [
  { name: "Dave priel", image: vol1, alt: "Volunteer Johnson Smith", style: "bg-[#9F1AB1] text-white" },
  { name: "Mikky Beau", image: vol2, alt: "Volunteer Mikky Beau", style: "bg-[#EEAAFD] text-black" },
  { name: "Helen Peters", image: vol3, alt: "Volunteer Helen Peters", style: "bg-[#9F1AB1] text-white" },
  { name: "Belly Shawn", image: vol2, alt: "Volunteer Belly Shawn", style: "bg-[#EEAAFD] text-black" },
  { name: "Mel Hillary", image: vol2, alt: "Volunteer Mel Hillary", style: "bg-[#EEAAFD] text-black" },
  { name: "Johnson Smith", image: vol1, alt: "Volunteer Johnson Smith", style: "bg-[#9F1AB1] text-white" },
];

const VolunteerCard = ({ name, image, alt, style }: typeof volunteers[0]) => (
    <div className="grid gap-2 md:gap-[24px]">
        <img src={image} alt={alt} />
        <div className={`text-[24px] md:leading-[32px] text-center py-2 md:py-[24px] ${style}`}>
            <h2 className="text-[16px] leading-5 md:text-[24px] md:leading-[32px] font-raleway font-[700]">{name}</h2>
            <p className="text-[8px] leading-4 md:text-[16px] md:leading-[24px] font-mulish font-[400]">Volunteer</p>
        </div>
    </div>
);

function Voulnteers() {
  const [isVolunteerModalOpen, setIsVolunteerModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(()=>{
    window.scrollTo(0,0)
  },[])

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
    <section>
      <section className="bg-[#FDF4FF] mb-0">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 pt-[40px] pb-[64px] md:pb-[100px]">
          <div className="text-center">
            <div className="relative text-center mt-0 md:mt-[40px] md:mb-[40px] mb-[25px]">
              <h1 className="absolute w-full text-[40px] sm:text-5xl md:text-6xl lg:text-8xl font-black font-raleway leading-tight md:leading-[144px] text-[#F6D0FE] left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                VOLUNTEERS{" "}
              </h1>

              <h2 className="relative text-[12px] sm:text-xl md:text-[24px] leading-[36px] font-extrabold font-raleway text-[#9F1AB1] z-10">
                VOLUNTEERS{" "}
              </h2>
            </div>
            <h2 className="text-[38px] md:text-[48px] font-raleway font-bold leading-[150%] md:leading-[72px]">
              Be The Change You Want to See
            </h2>
            <p className="mt-[19px] font-mulish  max-w-4xl mx-auto text-gray-600 leading-[150%] md:leading-[32px] text-[14px] font-500">
              Your time and skills are invaluable to us. By volunteering with
              YIODARA, you're not just giving back; you're becoming part of a
              global movement dedicated to creating lasting change. Join our
              passionate team and help us build a better world, one community
              at a time.
            </p>
          </div>

          <div className="hidden md:grid mt-[60px] md:mt-[109px]">
            <img src={img6} alt="A collage of volunteers" height="50px" width={`100%`} />
          </div>

          <div className="grid md:hidden mt-[60px] md:mt-[109px]">
            <img src={img7} alt="A collage of volunteers" width={`100%`} />
          </div>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 relative -mt-[60px] -mb-[50px] z-10">
        <div className="relative w-full mx-auto mb-10 md:mt-[10px] mt-[44px]">
          <div className="absolute top-[-8px] left-[-8px] w-[30px] h-[30px] md:w-[60px] md:h-[60px] bg-[#E478FA] z-[-1]"></div>
          <div className="absolute top-[-8px] right-[-8px] w-[30px] h-[30px] md:w-[60px] md:h-[60px] bg-[#E478FA] z-[-1]"></div>

          <div className="bg-[#9F1AB1] py-[24px] px-4 md:px-[36px] text-[#FFFFFF] font-raleway text-sm md:text-base text-center shadow-[0_11px_2px_0_rgba(250,214,255,0.5)]">
            <h2>
              Every act of kindness creates a ripple effect. Our volunteers are
              the heart of our organization, driving change and touching lives
              every day. Together, we can amplify our impact and bring hope to
              countless individuals.
            </h2>
          </div>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 pt-[100px] md:pt-[130px] pb-[20px] md:pb-[50px]">
        <div className="text-center">
          <div className="relative text-center mt-0 md:mt-[40px] md:mb-[40px] mb-[25px]">
            <h1 className="absolute w-full text-[35px] sm:text-5xl md:text-6xl lg:text-8xl font-black font-raleway leading-tight md:leading-[144px] text-[#F6D0FE] left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              UPCOMING EVENTS{" "}
            </h1>

            <h2 className="relative text-[14px] sm:text-xl md:text-[24px] leading-[36px] font-extrabold font-raleway text-[#9F1AB1] z-10">
              UPCOMING EVENTS{" "}
            </h2>
          </div>

          <h2 className="text-[28px] md:text-[48px] font-raleway font-bold leading-[150%] md:leading-[72px]">
            Here are some upcoming events you can volunteer for.
          </h2>
        </div>
      </div>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 pb-[10px]">
        <EventsSection onVolunteerClick={handleVolunteerClick}/>
      </div>

      <div className="bg-[#FDF4FF]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 pt-[100px] md:pt-[130px] pb-[50px] md:pb-[200px] relative z-2">
        <div className="text-center">
          <div className="relative text-center mt-0 md:mt-[40px] md:mb-[40px] mb-[25px]">
            <h1 className="absolute w-full text-[40px] sm:text-5xl md:text-6xl lg:text-8xl font-black font-raleway leading-tight md:leading-[144px] text-[#F6D0FE] left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              BE A VOLUNTEER{" "}
            </h1>

            <h2 className="relative text-[12px] sm:text-xl md:text-[24px] leading-[36px] font-extrabold font-raleway text-[#9F1AB1] z-10">
              VOLUNTEERS{" "}
            </h2>
          </div>

          <h2 className="text-[28px] md:text-[48px] font-raleway font-bold leading-tight md:leading-[72px]">
            Here are some of our volunteers{" "}
          </h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mt-[28px] md:mt-[53px]">
            {volunteers.slice(0, 4).map((volunteer, index) => (
              <VolunteerCard key={index} {...volunteer} />
            ))}
            <div className="col-span-2 mt-6 md:hidden">
              <div className="bg-[#FDEAD7] px-7 py-11">
                <h2 className="font-bold text-[25px] leading-tight font-raleway pb-[24px]">
                  <span className="text-[#9F1AB1]">Click join now </span>
                  <br /> to be a part of our volunteer team at{" "}
                  <span className="text-[#9F1AB1]">Yiodara</span>
                </h2>
                <Button 
                  className=" bg-[#9F1AB1] w-full hover:bg-[#9F1AB1] text-base"
                  onClick={() => navigate("/events")}
                >
                  Join now
                </Button>
              </div>
            </div>
            
            <div className="hidden md:grid col-span-4">
              <div className="grid grid-cols-2 gap-6 mt-6">
                  <div className="grid grid-cols-2 gap-6 col-span-1">
                    {volunteers.slice(4).map((volunteer, index) => (
                      <VolunteerCard key={index + 4} {...volunteer} />
                    ))}
                  </div>
                  <div className="bg-[#FDEAD7] mt-[48px] px-[24px] pt-[39px] pb-[31px]">
                    <h2 className="font-bold text-[28px] md:text-[40px] leading-tight md:leading-[54px] font-raleway pb-[20px]">
                      <span className="text-[#9F1AB1]">Click join now </span>
                      <br /> to be a part of our volunteer team at{" "}
                      <span className="text-[#9F1AB1]">Yiodara</span>
                    </h2>
                    <Button 
                      className=" bg-[#9F1AB1] w-full hover:bg-[#9F1AB1] text-base"
                      onClick={() => navigate("/events")}
                    >
                      Join now
                    </Button>
                  </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
      <VolunteerModal
        isOpen={isVolunteerModalOpen}
        onClose={handleCloseModals}
        initialEvent={selectedEvent}
      />
      <VolunteerAuthModal
        isOpen={isAuthModalOpen}
        onClose={handleCloseModals}
      />
    </section>
  );
}

const EventsSection = ({ onVolunteerClick }: { onVolunteerClick: (event: Event) => void }) => {
  const { events, isLoading, error } = useEvents();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <EventCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6">
        {events.slice(0, 3).map(event => (
          <EventCard key={event.id} event={event} onVolunteer={onVolunteerClick} />
        ))}
      </div>
      {events.length > 1 && (
        <div className="text-center mt-8 mb-10 md:mt-12">
          <Button
            variant="outline"
            className="px-8 py-2 md:px-[71px] md:py-[0px] font-bold text-sm md:text-[16px] leading-tight md:leading-[24px] font-mulish bg-transparent text-[#9F1AB1] border-2 border-[#9F1AB1] hover:bg-[#9F1AB1] hover:text-white transition-all duration-300"
            onClick={() => navigate("/events")}
          >
            View All Events
          </Button>
        </div>
      )}
    </>
  );
};

export default Voulnteers;
