import img3 from "../assets/aboutimg/image (3).png";
import img4 from "../assets/aboutimg/image (4).png";
import img5 from "../assets/aboutimg/image (5).png";
import star from "../assets/star.png";
import rob from "../assets/aboutimg/gallery.png";
import { useEffect, useState, useRef } from "react";
import gallery2 from "../assets/aboutimg/Frame 50 (1).png";
import gallery from "../assets/aboutimg/Frame 472.png";
import { Button } from "@/components/ui/button";
import Marquee from "react-fast-marquee";

function AboutUs() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeCard, setActiveCard] = useState<'vision' | 'mission' | 'value'>('value');
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [userInteracted, setUserInteracted] = useState(false);
  
  // Gallery images array
  const galleryImages = [img5, img3, img4, img5, img3];
  
  const cardImages = {
    vision: gallery,
    mission: img3,  
    value: gallery
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const itemWidth = scrollContainerRef.current.offsetWidth / 2;
      const newIndex = Math.round(scrollLeft / itemWidth);
      setCurrentIndex(newIndex);
    }
  };

  const handleCardClick = (card: 'vision' | 'mission' | 'value') => {
    setActiveCard(card);
    setUserInteracted(true);
    setIsAutoRotating(false);
    
    setTimeout(() => {
      setIsAutoRotating(true);
      setUserInteracted(false);
    }, 10000);
  };

  useEffect(() => {
    if (!isAutoRotating || userInteracted) return;

    const interval = setInterval(() => {
      setActiveCard(prevCard => {
        const cards = ['vision', 'mission', 'value'] as const;
        const currentIndex = cards.indexOf(prevCard);
        const nextIndex = (currentIndex + 1) % cards.length;
        return cards[nextIndex];
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoRotating, userInteracted]);

  const handleMouseEnter = () => {
    setIsAutoRotating(false);
  };

  const handleMouseLeave = () => {
    if (!userInteracted) {
      setIsAutoRotating(true);
    }
  };

  useEffect(()=> {
    window.scrollTo(0,0)
  },[])

  return (
    <section>
      <section className="bg-[#FDF4FF]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 py-0 md:py-7 pt-[40px] pb-[64px] md:pb-[93px]">
          <div className="text-center">
            <div className="relative text-center md:mt-[40px] mb-[36.5px] md:mb-[40px]">
              <h1 className="absolute w-full text-[40px] sm:text-5xl md:text-6xl lg:text-8xl font-black font-raleway md:leading-[144px] leading-[150%] text-[#F6D0FE] left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-50">
                ABOUT YIODARA{" "}
              </h1>

              <h2 className="relative text-[12px] sm:text-2xl md:text-[24px] leading-[36px] font-extrabold font-raleway text-[#9F1AB1] z-10">
                ABOUT YIODARA{" "}
              </h2>
            </div>
            <h2 className="text-3xl md:text-[48px] font-raleway font-bold leading-[120%] md:leading-[72px]">
              Everyone deserves a shot at greatness{" "}
            </h2>
            <p className="mt-4 md:mt-[19px] font-mulish max-w-4xl mx-auto text-[#667085] text-[14px] md:text-[16px]  leading-[150%] md:leading-[32px] font-500">
            Yiodara was born from a simple but powerful idea: that everyone, everywhere, deserves the opportunity to thrive. We saw a need for a more transparent and direct way for people to support causes that matter. <span className="hidden md:block">Our platform is built on a foundation of trust, leveraging technology to connect donors directly with vetted, impactful projects. We are committed to ensuring that your donation makes a profound difference, creating a world where compassion knows no borders</span>
            </p>
          </div>

          <div className="hidden md:grid grid-cols-5 gap-[16px] md:gap-[14px] mt-[73px]">
            {galleryImages.map((img, index) => (
              <div key={index} className="overflow-hidden rounded-lg">
                <img 
                  src={img} 
                  alt={`Gallery image ${index + 1}`} 
                  className="w-full h-auto object-cover transition-transform duration-300 ease-in-out hover:scale-105" 
                />
              </div>
            ))}
          </div>

          <div className="md:hidden mt-[68px]">
            <div className="relative">
              <div 
                ref={scrollContainerRef}
                className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-4 pb-4"
                style={{ 
                  scrollbarWidth: 'none', 
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch'
                }}
                onScroll={handleScroll}
              >
                {galleryImages.map((img, index) => (
                  <div 
                    key={index} 
                    className="flex-none w-[calc(50%-8px)] snap-start overflow-hidden rounded-lg"
                  >
                    <img 
                      src={img} 
                      alt={`Gallery image ${index + 1}`} 
                      className="w-full h-auto object-cover transition-transform duration-300 ease-in-out hover:scale-105"
                    />
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center space-x-2 mt-6">
                {Array.from({ length: Math.ceil(galleryImages.length / 2) }).map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      Math.floor(currentIndex / 2) === index 
                        ? 'bg-[#9F1AB1] w-6' 
                        : 'bg-gray-300'
                    }`}
                    onClick={() => {
                      if (scrollContainerRef.current) {
                        const itemWidth = scrollContainerRef.current.offsetWidth / 2;
                        scrollContainerRef.current.scrollTo({
                          left: index * itemWidth * 2,
                          behavior: 'smooth'
                        });
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-[#9F1AB1] mb-[56px] md:mb-[120px] py-[21px] font-mulish">
        <Marquee>
          <div className="flex items-center space-x-[4px] mx-8">
            <h2 className="md:text-[32px] font-medium leading-[150%] text-[17.07px] md:leading-[48px] text-[#F6D0FE]">
              YIODARA
            </h2>
            <img src={star} alt="" className="size-6 md:size-12 flex items-center" />
          </div>
          <div className="flex items-center space-x-[4px] mx-8">
            <h2 className="md:text-[32px] font-medium leading-[150%] text-[17.07px] md:leading-[48px] text-[#F6D0FE]">
              YIODARA
            </h2>
            <img src={star} alt="" className="size-6 md:size-12 flex items-center" />
          </div>
          <div className="flex items-center space-x-[4px] mx-8">
            <h2 className="md:text-[32px] font-medium leading-[150%] text-[17.07px] md:leading-[48px] text-[#F6D0FE]">
              YIODARA
            </h2>
            <img src={star} alt="" className="size-6 md:size-12 flex items-center" />
          </div>
          <div className="flex items-center space-x-[4px] mx-8">
            <h2 className="md:text-[32px] font-medium leading-[150%] text-[17.07px] md:leading-[48px] text-[#F6D0FE]">
              YIODARA
            </h2>
            <img src={star} alt="" className="size-6 md:size-12 flex items-center" />
          </div>
          <div className="flex items-center space-x-[4px] mx-8">
            <h2 className="md:text-[32px] font-medium leading-[150%] text-[17.07px] md:leading-[48px] text-[#F6D0FE]">
              YIODARA
            </h2>
            <img src={star} alt="" className="size-6 md:size-12 flex items-center" />
          </div>
        </Marquee>
      </div>

      <div className="max-w-[1440px] mx-auto sm:px-6 md:px-8 lg:px-12 xl:px-20 px-4 mb-[100px] md:mb-[120px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
          <div className="relative overflow-hidden rounded-lg order-1 md:order-2">
            <img 
              src={cardImages[activeCard]} 
              alt={`${activeCard} illustration`} 
              className="w-full h-auto md:h-full object-cover transition-all duration-500 ease-in-out"
              style={{ minHeight: '250px', maxHeight: '842px' }}
            />
          </div>

          <div 
            className="grid grid-rows-3 gap-[16px] order-2 md:order-1"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div 
              className={`px-[24px] py-[15px] cursor-pointer relative overflow-hidden transition-all duration-500 ease-out transform hover:scale-[1.02] ${
                activeCard === 'vision' 
                  ? 'bg-[#9F1AB1] text-[#FDF4FF] shadow-lg shadow-[#9F1AB1]/30' 
                  : 'bg-[#FBE8FF] hover:bg-[#F0D7FF] hover:shadow-md'
              }`}
              onClick={() => handleCardClick('vision')}
            >
              <div 
                className={`absolute inset-0 bg-[#9F1AB1] transition-all duration-700 ease-out ${
                  activeCard === 'vision' 
                    ? 'translate-x-0 opacity-100' 
                    : 'translate-x-full opacity-0'
                }`}
              />
              <div className="relative z-10">
                <h2 className={`text-[24px] md:text-[36px] leading-[150%] md:leading-[54px] font-raleway font-bold transition-all duration-500 ${
                  activeCard === 'vision' ? 'transform translate-y-0' : ''
                }`}>
                  Our Vision
                </h2>
                <p className={`text-[16px] leading-[200%] md:leading-[32px] font-medium font-mulish transition-all duration-500 delay-100 ${
                  activeCard === 'vision' ? 'text-[#FDF4FF]' : 'text-[#667085]'
                }`}>
                  To create a world where every act of generosity can spark meaningful, lasting change for communities in need.
                </p>
              </div>
            </div>

            <div 
              className={`px-[24px] py-[15px] cursor-pointer relative overflow-hidden transition-all duration-500 ease-out transform hover:scale-[1.02] ${
                activeCard === 'mission' 
                  ? 'bg-[#9F1AB1] text-[#FDF4FF] shadow-lg shadow-[#9F1AB1]/30' 
                  : 'bg-[#FBE8FF] hover:bg-[#F0D7FF] hover:shadow-md'
              }`}
              onClick={() => handleCardClick('mission')}
            >
              <div 
                className={`absolute inset-0 bg-[#9F1AB1] transition-all duration-700 ease-out ${
                  activeCard === 'mission' 
                    ? 'translate-x-0 opacity-100' 
                    : 'translate-x-full opacity-0'
                }`}
              />
              <div className="relative z-10">
                <h2 className={`text-[24px] md:text-[36px] leading-[150%] md:leading-[54px] font-raleway font-bold transition-all duration-500 ${
                  activeCard === 'mission' ? 'transform translate-y-0' : ''
                }`}>
                  Our Mission{" "}
                </h2>
                <p className={`text-[16px] leading-[200%] md:leading-[32px] font-medium font-mulish transition-all duration-500 delay-100 ${
                  activeCard === 'mission' ? 'text-[#FDF4FF]' : 'text-[#667085]'
                }`}>
                  To empower change-makers by providing a transparent, secure, and accessible platform that connects donors with verified, high-impact charitable campaigns.
                </p>
              </div>
            </div>

            <div 
              className={`px-[24px] py-[15px] cursor-pointer relative overflow-hidden transition-all duration-500 ease-out transform hover:scale-[1.02] ${
                activeCard === 'value' 
                  ? 'bg-[#9F1AB1] text-[#FDF4FF] shadow-lg shadow-[#9F1AB1]/30' 
                  : 'bg-[#FBE8FF] hover:bg-[#F0D7FF] hover:shadow-md'
              }`}
              onClick={() => handleCardClick('value')}
            >
              <div 
                className={`absolute inset-0 bg-[#9F1AB1] transition-all duration-700 ease-out ${
                  activeCard === 'value' 
                    ? 'translate-x-0 opacity-100' 
                    : 'translate-x-full opacity-0'
                }`}
              />
              <div className="relative z-10">
                <h2 className={`text-[24px] md:text-[36px] leading-[150%] md:leading-[54px] font-raleway font-bold transition-all duration-500 ${
                  activeCard === 'value' ? 'transform translate-y-0' : ''
                }`}>
                  Our Value{" "}
                </h2>
                <p className={`text-[16px] leading-[200%] md:leading-[32px] font-medium font-mulish transition-all duration-500 delay-100 ${
                  activeCard === 'value' ? 'text-[#FDF4FF]' : 'text-[#667085]'
                }`}>
                We operate with radical transparency, unwavering integrity, and a deep-seated belief in the power of community to uplift and empower
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#FBE8FF] pt-[40px] md:pt-[48px]">
        <div className="max-w-[1440px] mx-auto sm:px-6 md:px-8 lg:px-12 xl:px-20 px-4">
          <div className="text-center">
            <div className="relative text-center md:mt-[40px] mb-[20px] md:mb-[40px]">
              <h1 className="absolute w-full text-[44px] sm:text-5xl md:text-6xl lg:text-8xl font-black font-raleway leading-[144px] text-[#F6D0FE] left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                GALLERY{" "}
              </h1>

              <h2 className="relative text-[12px] sm:text-2xl md:text-[24px] leading-[36px] font-extrabold font-raleway text-[#9F1AB1] z-10">
                GALLERY{" "}
              </h2>
            </div>
            <h2 className="md:text-[48px] leading-[150%] text-[24px] font-raleway font-bold md:leading-[72px]">
              See Images From our Past Campaigns.{" "}
            </h2>
          </div>

          <img src={rob} alt="" className="mt-[48px] mb-[48px] hidden md:block" />

          <div className=" block md:hidden mt-[40px] mb-[48px]">
            <img  src={gallery2}  alt="Gallery of past campaign images"  className="w-full h-auto rounded-lg"/>
          </div>

          <div className=" flex justify-center">
            <Button className="px-[117px] h-[56px] py-[16px] hover:bg-transparent bg-transparent border-[1px] border-[#9F1AB1] text-[#9F1AB1] mb-[80px] text-[16px] leading-[24px] font-bold font-mulish">
              View All
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutUs;