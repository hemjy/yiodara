import { useCategories } from "../../../hooks/useCategories";
import { Link } from "react-router-dom";
import ArrowRight from "../../../assets/arrow-right.svg";
import educationIcon from "../../../assets/landingimg/education.svg";
import healthcareIcon from "../../../assets/landingimg/healthcare.svg";
import medicalcareIcon from "../../../assets/landingimg/medicalcare.svg";
import communityserviceIcon from "../../../assets/landingimg/commnityservice.svg";

const categoryIcons: { [key: string]: string } = {
  "Medical Care": medicalcareIcon,
  "Education": educationIcon,
  "Healthy Food": healthcareIcon,
  "Community Service": communityserviceIcon,
  "Healthcare": healthcareIcon,
  // "Environment": environmentIcon,
};

function Categories() {
  const { categoryData: categories, isLoading, error } = useCategories({ autoFetch: true });
  
  return (
    <section className="bg-[#FDF4FF]/40 pt-16 pb-10  md:py-16 lg:py-[104px]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-[24px] items-center">
          <div>
            <div className="relative mt-0 md:mt-[40px] mb-6 md:mb-[40px]">
              <h1 className="absolute w-full text-[44px] sm:text-5xl md:text-6xl lg:text-[80px] font-black font-raleway leading-tight lg:leading-[144px] text-[#F6D0FE] left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-50">
                CATEGORIES
              </h1>

              <h2 className="relative text-[12px] sm:text-2xl md:text-[24px] leading-tight md:leading-[36px] font-extrabold font-raleway text-[#9F1AB1] z-10">
                CATEGORIES
              </h2>
            </div>
            
            <h2 className="text-2xl text-[#000000] font-raleway pt-3 md:pt-0 sm:text-3xl md:text-[36px] font-bold leading-[150%] md:leading-[60px]">
              See the Categories of Campaigns YIODARA Empowers through You.
            </h2>
          </div>

          <div>
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="animate-pulse bg-gray-200 rounded-lg h-48"></div>
                ))
              ) : error ? (
                <div className="col-span-2 text-center text-red-500">
                  <p>Error loading categories: {error}</p>
                </div>
              ) : (
                categories.slice(0, 4).map((category) => (
                  <div
                    key={category.id}
                    className="group pt-4 md:pt-[24px] justify-center items-center text-center transition-all duration-200 hover:shadow-lg flex flex-col cursor-pointer"
                  >
                    <div className="w-16 h-16 md:w-auto md:h-auto">
                      <img src={categoryIcons[category.name] || communityserviceIcon} alt={category.name} className="w-full h-full" />
                    </div>
                    <h3 className="text-lg md:text-xl lg:text-[24px] pb-6 md:pb-[60px] leading-tight lg:leading-7 font-bold font-raleway text-[#475467] pt-2 md:pt-[16px]">
                      {category.name}
                    </h3>
                  </div>
                ))
              )}
            </div>

            {!isLoading && !error && categories.length > 4 && (
              <div className="flex justify-end items-center mt-4">
                <Link to="/categories">
                  <button className="text-end font-mulish flex text-sm md:text-base lg:text-[16px] items-center text-[#9F1AB1] underline font-semibold group">
                    See More Category
                    <img
                      src={ArrowRight}
                      alt="See More"
                      className="w-4 md:w-[18px] ml-2 h-4 md:h-[18px] transition-transform group-hover:translate-x-1"
                    />
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Categories;
