import { Link } from "react-router-dom";
import HeroImg from "../../../assets/landingimg/HeroSetion.png";

const HeroSection = () => {
  return (
    <section className="bg-[#FDF4FF]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 py-8 md:py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="order-1 md:order-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-[96px] font-[900] text-[#000000] leading-[120%] xl:leading-[115.2%] font-raleway">
              Changing Lives for the Better
            </h1>
            <p className="text-[#667085] text-sm md:text-base leading-[150%] font-mulish font-medium pt-4 md:pt-[16px] max-w-2xl mx-auto md:mx-0">
            Empower change with every donation. Yiodara connects you to a diverse range of trusted, life-changing campaigns. From funding critical projects to empowering local initiatives, you can find a cause you believe in and start your journey of impact today.
            </p>
            <div className="flex flex-row justify-center md:justify-start gap-4 mt-6 md:mt-[40px]">
              <Link to="/campaigns" className="w-auto">
                <button className=" w-auto px-4 md:px-6 md:py-3 h-[53px] bg-[#9F1AB1] text-white text-[12px] leading-[150%] md:text-base font-mulish font-bold hover:bg-opacity-90 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                  See Campaigns
                </button>
              </Link>

              <Link to="/volunteers">
              <button className="px-4 h-[53px] bg-transparent border-[#9F1AB1] border text-[12px] md:text-base leading-6 font-mulish font-bold text-[#9F1AB1] hover:bg-[#9F1AB1] hover:text-white transition-all duration-300">
                Become a Volunteer
              </button>
              </Link>
            </div>
          </div>

          <div className="order-2 md:order-2 mt-8 md:mt-0">
            <img
              src={HeroImg}
              alt="Hero Section"
              className="object-cover w-full h-auto rounded-lg mx-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;