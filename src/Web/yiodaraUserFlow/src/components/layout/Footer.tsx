import { Link } from "react-router-dom";
import { useCategories } from "@/hooks/useCategories";
import { Instagram } from "lucide-react";
import linkedin from "../../assets/LinkedinLogo.svg"
import X from "../../assets/XLogo.svg"
import LogoSecondary from "../../assets/logo-secondary.svg"

const Footer = () => {
  const { categoryData: categories, isLoading } = useCategories({
    autoFetch: true,
    includeAll: false,
  });
  const curentYear = new Date().getFullYear();

  const slugify = (text: string) => {
    return text.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <footer className="bg-[#9F1AB1] text-white py-[44px] md:py-[40px]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <img src={LogoSecondary} alt="Yiodara Logo" className="size-14" />
              <span className="text-base font-[900] font-mulish">Yiodara</span>
            </Link>
            <p className="text-[14px] leading-[150%] md:text-[16px] md:leading-[24px] w-[298px] font-bold font-mulish">
              The Charity Platform for Everyone Everywhere.
            </p>
          </div>

          <div className="flex md:flex-row flex-col gap-6 md:gap-[115px] mt-6 md:mt-0">
            <div className="">
              <h3 className="text-[16px] md:text-[20px] leading-[150%] md:leading-[30px] font-black mb-[24px] font-mulish">
                Donation Category
              </h3>

              <ul className="space-y-[16px]  text-[12px] md:text-[16px] md:leading-[18px]  leading-[100%] font-medium font-raleway">
                {isLoading ? (
                  <>
                    <li className="animate-pulse bg-gray-400/50 rounded h-4 w-28"></li>
                    <li className="animate-pulse bg-gray-400/50 rounded h-4 w-20"></li>
                    <li className="animate-pulse bg-gray-400/50 rounded h-4 w-32"></li>
                    <li className="animate-pulse bg-gray-400/50 rounded h-4 w-24"></li>
                  </>
                ) : (
                  categories.slice(0, 4).map((category) => (
                    <li key={category.id}>
                      <Link to={`/campaigns/${slugify(category.name)}`}>
                        {category.name}
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="">
              <h3 className="text-[20px] leading-[30px] font-[900] mb-[24px] font-mulish">
                Help
              </h3>
              <ul className="space-y-[16px]  text-[12px] md:text-[16px] leading-[18px] font-medium font-raleway">
                <li>
                  <Link to="/privacy">Privacy Policy</Link>
                </li>
                <li>
                  <Link to="/contact">Contact Us</Link>
                </li>
              </ul>
            </div>

            <div className="">
              <h3 className="text-[20px] leading-[30px] font-[900] mb-[24px] font-mulish">
                Company
              </h3>
              <ul className="space-y-[16px] text-[12px] md:text-[16px] leading-[18px] font-medium font-raleway">
                <li>
                  <Link to="/about">About Us</Link>
                </li>
                <li>
                  <Link to="/volunteers">Volunteers</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-[40px] pt-[16px] md:pt-[24px] border-t border-[#D6BBFB] flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
          <p className="text-[16px] font-raleway leading-[100%] md:leading-[18px] font-semibold">
            @Yiodara, {curentYear}. All Right Reserved
          </p>

          <div className="flex space-x-[24px] font-mulish">
            <Link
              to="#"
              className="border border-white px-3 py-2 md:px-[40px] md:py-[16px] flex items-center space-x-2"
            >
              <Instagram size={20} />{" "}
              <span className="hidden md:block text-[16px] leading-[24px] font-bold">
                Instagram
              </span>
            </Link>
            <Link
              to="#"
              className="border border-white px-3 py-2 md:px-[40px] md:py-[16px] flex items-center space-x-2"
            >
               <img src={X} alt="" />{" "}
               <span className="hidden md:block text-[16px] leading-[24px] font-bold">
                Twitter
              </span>
            </Link>
            <Link
              to="#"
              className="border border-white px-3 py-2 md:px-[40px] md:py-[16px] flex items-center space-x-2"
            >
               <img src={linkedin} alt="" />{" "}
              <span className="hidden md:block text-[16px] leading-[24px] font-bold">
                LinkedIn
              </span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;