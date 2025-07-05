import { useCategories } from "@/hooks/useCategories";
import { Link } from "react-router-dom";
import communityserviceIcon from "../assets/landingimg/commnityservice.svg";
import educationIcon from "../assets/landingimg/education.svg";
import healthcareIcon from "../assets/landingimg/healthcare.svg";
import medicalcareIcon from "../assets/landingimg/medicalcare.svg";
import environmentIcon from "../assets/landingimg/donation.svg"; // Placeholder

const categoryIcons: { [key: string]: string } = {
  "Medical Care": medicalcareIcon,
  "Education": educationIcon,
  "Healthy Food": healthcareIcon,
  "Community Service": communityserviceIcon,
  "Healthcare": healthcareIcon,
  "Environment": environmentIcon,
};

const AllCategories = () => {
    const { categoryData: categories, isLoading, error } = useCategories({ autoFetch: true, includeAll: false });

    const slugify = (text: string) => {
      return text.toLowerCase().replace(/\s+/g, '-');
    };

    return (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 py-16">
            <h1 className="text-3xl font-bold text-center mb-12 font-raleway">All Categories</h1>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {isLoading ? (
                    Array.from({ length: 8 }).map((_, index) => (
                        <div key={index} className="animate-pulse bg-gray-200 rounded-lg h-48"></div>
                    ))
                ) : error ? (
                    <div className="col-span-full text-center text-red-500">
                        <p>Error loading categories: {error}</p>
                    </div>
                ) : (
                    categories.map((category) => (
                        <Link to={`/campaigns?category=${slugify(category.name)}`} key={category.id}>
                            <div className="group pt-4 md:pt-[24px] justify-center items-center text-center transition-all duration-200 hover:shadow-lg flex flex-col cursor-pointer border rounded-lg h-full">
                                <div className="flex-grow flex items-center justify-center w-16 h-16 md:w-24 md:h-24">
                                    <img src={categoryIcons[category.name] || communityserviceIcon} alt={category.name} className="w-full h-full object-contain" />
                                </div>
                                <h3 className="text-lg md:text-xl font-bold font-raleway text-[#475467] pt-4 pb-6">
                                    {category.name}
                                </h3>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

export default AllCategories; 