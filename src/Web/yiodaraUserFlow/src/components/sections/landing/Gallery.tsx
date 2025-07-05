import gallery from "../../../assets/aboutimg/gallery.png";
import gallery2 from "../../../assets/aboutimg/Frame 50 (1).png";
import { Button } from "@/components/ui/button";

function Gallery() {
  return (
    <section className="bg-[#9F1AB1] py-10 md:py-12 lg:pt-[48px] lg:pb-[80px]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20">
        <div className="text-center">
          <div className="relative text-center mt-6 md:mt-[40px] mb-8 md:mb-[40px]">
            <h1 className="absolute w-full text-[44px] sm:text-5xl md:text-6xl lg:text-8xl font-black font-raleway leading-tight lg:leading-[144px] text-[#F6D0FE] left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-50">
              GALLERY
            </h1>

            <h2 className="relative text-[12px] sm:text-2xl md:text-[24px] leading-tight md:leading-[36px] font-extrabold font-raleway text-[#FFFFFF] z-10">
              GALLERY
            </h2>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[48px] font-raleway font-bold leading-[150%] lg:leading-[72px] text-[#FFFFFF] mb-8">
            See Images From our Past Campaigns.
          </h2>
        </div>

        <div className=" hidden md:block mt-8 md:mt-[48px] mb-8 md:mb-[48px]">
          <img 
            src={gallery} 
            alt="Gallery of past campaign images" 
            className="w-full h-auto rounded-lg"
          />
        </div>

         <div className=" block md:hidden mt-0  mb-8 md:mb-[48px]">
          <img 
            src={gallery2} 
            alt="Gallery of past campaign images" 
            className="w-full h-auto rounded-lg"
          />
        </div>

        <div className="flex justify-center">
          <Button className="px-8 py-3 md:px-[117px] md:h-[56px] md:py-[16px] hover:bg-transparent bg-transparent border border-[#FFFFFF] text-[#FFFFFF] text-sm md:text-[16px] leading-tight md:leading-[24px] font-bold font-mulish">
            View All
          </Button>
        </div>
      </div>
    </section>
  );
}

export default Gallery;