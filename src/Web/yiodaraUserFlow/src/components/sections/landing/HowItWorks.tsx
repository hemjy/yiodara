import donation from "../../../assets/landingimg/donation.svg";
import gotoweb from "../../../assets/landingimg/gotoweb.svg";
import selectacampaign from "../../../assets/landingimg/selectacampaign.svg";

function HowItWorks() {
  return (
    <section className="bg-[#9F1AB1] py-[64px] md:py-12 lg:py-[83px]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20">
        <div className="text-center">
          <div className="relative text-center mt-6 md:mt-[40px] mb-8 md:mb-[50px]">
            <h1 className="absolute w-full text-[44px] sm:text-5xl md:text-6xl lg:text-8xl font-black font-raleway leading-tight lg:leading-[144px] text-[#F6D0FE] left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-50">
              HOW IT WORKS
            </h1>

            <h2 className="relative text-[12px] sm:text-2xl md:text-[24px] leading-tight md:leading-[36px] font-extrabold font-raleway text-[#FDF4FF] z-10">
              HOW IT WORKS
            </h2>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-raleway font-bold leading-tight lg:leading-[72px] text-[#FFFFFF] mb-8 md:mb-10 lg:mb-12">
            Donating on YIODARA Takes Just a Few Minutes.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-10 text-[#ffffff]">
            <div className="flex flex-col items-center justify-center text-center">
              <img 
                src={gotoweb} 
                alt="Go to website" 
                className="w-40 h-40 md:w-44 md:h-44 lg:w-auto lg:h-auto mb-4"
              />
              <h3 className="text-xl md:text-2xl lg:text-[24px] leading-tight lg:leading-7 font-raleway font-bold mb-2 md:mb-4">
                Go to The Website
              </h3>
              <p className="text-sm md:text-base lg:text-[16px] leading-relaxed lg:leading-[32px] font-mulish">
              Your journey to making a difference starts here. Our platform is designed for easy navigation, allowing you to seamlessly explore impactful projects right from your device
              </p>
            </div>

            <div className="flex flex-col items-center justify-center text-center ">
              <img 
                src={selectacampaign} 
                alt="Select a campaign" 
                 className=" w-40 h-40 md:w-44 md:h-44 lg:w-auto lg:h-auto mb-4"
              />
              <h3 className="text-xl md:text-2xl lg:text-[24px] leading-tight lg:leading-7 font-raleway font-bold mb-2 md:mb-4">
                Select a Campaign
              </h3>
              <p className="text-sm md:text-base lg:text-[16px] leading-relaxed lg:leading-[32px] font-mulish">
              Browse through a curated selection of verified charitable campaigns. Each one tells a unique story and outlines its goals, so you can confidently choose a cause that speaks to your heart
              </p>
            </div>

            <div className="flex flex-col items-center justify-center text-center ">
              <img 
                src={donation} 
                alt="Make donation" 
               className="w-40 h-40 md:w-44 md:h-44 lg:w-auto lg:h-auto mb-4"
              />
              <h3 className="text-xl md:text-2xl lg:text-[24px] leading-tight lg:leading-7 font-raleway font-bold mb-2 md:mb-4">
                Make Donations
              </h3>
              <p className="text-sm md:text-base lg:text-[16px] leading-relaxed lg:leading-[32px] font-mulish">
              Our secure payment system makes giving simple and safe. With just a few clicks, you can contribute to a campaign and receive immediate confirmation, knowing your generosity is already on its way to creating change.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
