import { Link } from "react-router-dom";
import volimg from "../../../assets/landingimg/Union.jpg";
import ArrowRight from "../../../assets/landingimg/Vector.svg";

function AboutYiodara() {
  return (
    <section className="py-8 md:py-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20">
        <div className="flex flex-col lg:grid lg:grid-cols-2 items-center gap-6 md:gap-8 lg:gap-[26px]">
          <div className="w-full text-center mb-4 lg:hidden">
            <h2 className="text-xl sm:text-2xl font-extrabold font-raleway text-[#9F1AB1]">
              ABOUT YIODARA
            </h2>
            <h1 className="text-4xl sm:text-5xl font-black font-raleway text-[#F6D0FE] opacity-20 -mt-8">
              ABOUTYODARA
            </h1>
          </div>

          <div className="w-full lg:order-1">
            <div className="relative sm:w-full sm:h-auto sm:aspect-square overflow-hidden">
              <img
                src={volimg}
                alt="Charity volunteers with donation boxes"
                className="w-full h-full aspect-square object-cover rounded-[40px] sm:rounded-[60px] md:rounded-[80px] lg:rounded-[100px]"
                loading="lazy"
              />
            </div>
          </div>

          <div className="w-full space-y-4 lg:order-2">
            <div className="relative text-center mt-6 mb-6 hidden lg:block">
              <h1 className="absolute w-full text-4xl sm:text-5xl md:text-6xl lg:text-[80px] font-black font-raleway leading-tight md:leading-[144px] text-[#F6D0FE] left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-50">
                ABOUTYODARA
              </h1>

              <h2 className="relative text-left text-lg sm:text-xl md:text-2xl lg:text-[24px] leading-tight md:leading-[36px] font-extrabold font-raleway text-[#9F1AB1] z-10">
                ABOUT YIODARA
              </h2>
            </div>
            
            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] xl:text-[48px] leading-tight md:leading-[55px] font-raleway font-bold text-[#000000]">
              The Charity Platform for Everyone Everywhere.
            </h3>
            
            <p className="text-sm md:text-base font-medium leading-[200%] font-mulish text-[#667085] ">
            At Yiodara, we believe in the power of collective generosity. Our mission is to build a global community dedicated to creating positive change. We provide a transparent, secure, and accessible platform that empowers you to support causes you believe in, ensuring every donation makes a real, measurable impact.
            </p>
            
            <div className="flex justify-end items-center pt-2">
              <Link to="/about">
              <button className="text-end font-mulish flex text-sm md:text-base lg:text-[16px] items-center text-[#9F1AB1] underline font-semibold group">
                Learn More
                <img
                  src={ArrowRight}
                  alt=""
                  className="w-4 md:w-[18px] ml-2 h-4 md:h-[18px] transition-transform group-hover:translate-x-1"
                />
              </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutYiodara;