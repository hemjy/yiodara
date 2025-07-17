import { Card, CardContent } from "@/components/ui/card";
import { useStarContributors } from "@/hooks/useStarContributors";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const StarContributors = () => {
  const { contributors, isLoading, error } = useStarContributors();

  // Helper function to get initials from a name
  const getInitials = (name: string) => {
    if (!name) return "";
    const nameParts = name.split(" ");
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  if (isLoading) {
    return (
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 pt-[60px] md:pt-[40px] pb-[66px]">
        <div className="text-center mb-[56px]">
          <Skeleton className="h-12 w-1/2 mx-auto" />
          <Skeleton className="h-8 w-1/3 mx-auto mt-4" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-[24px]">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="shadow-lg">
              <CardContent className="py-[24px] px-[16px]">
                <div className="flex flex-col items-center">
                  <Skeleton className="w-16 h-16 rounded-full mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 pt-[60px] md:pt-[40px] pb-[66px]">
        <div className="text-center text-red-500">
          <h2 className="text-2xl font-bold">Failed to Load Contributors</h2>
          <p>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 pt-[60px] md:pt-[40px] pb-[66px]">
      <div className="text-center mb-[56px]">
        <div className="relative text-center mt-[0px] md:mt-[40px] md:mb-[55px] mb-3">
          <h1 className="absolute w-full text-[33px] sm:text-5xl md:text-6xl lg:text-8xl font-black font-raleway  leading-[150%] md:leading-[144px] text-[#F6D0FE] left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            STAR CONTRIBUTOR
          </h1>

          <h2 className="relative text-[12px] sm:text-2xl md:text-[24px] leading-[36px] font-extrabold font-raleway text-[#9F1AB1] z-10">
            STAR CONTRIBUTOR
          </h2>
        </div>
        <h2 className="text-[32px] md:text-[48px]  font-raleway font-bold leading-[150%] md:leading-[72px]">
          See Our Best Donors
        </h2>
        <p className=" font-mulish max-w-4xl mx-auto text-[#667085] leading-[150%] md:leading-[32px] text-[14px] md:text-[16px] font-500">
          Every donation, big or small, is a vital part of the story of
          change. Here, we celebrate the incredible generosity of our Star
          Contributors, whose unwavering support is fueling hope and
          transforming futures. Thank you for being the lifeline for so many
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-[24px]">
        {contributors.map((contributor) => (
            <Card
              key={contributor.id}
              className="cursor-pointer transition-all duration-300 hover:shadow-xl shadow-lg"
            >
              <CardContent className="py-[24px] px-[16px]">
                <div className="flex flex-col items-center">
                  {contributor.name.toLowerCase() === "anonymous" ? (
                    <div className="w-16 h-16 bg-[#FBE8FF] rounded-full mb-4" />
                  ) : (
                    <div className="w-16 h-16 bg-[#F6D0FE] text-[24px] rounded-full mb-4 flex items-center justify-center font-extrabold">
                      <span className="text-[#9F1AB1] font-bold text-xl">
                        {getInitials(contributor.name)}
                      </span>
                    </div>
                  )}

                  <h3 className="font-bold text-xl mb-[16px] font-raleway">
                    {contributor.name}
                  </h3>

                  <div className="w-full space-y-4 md:space-y-[24px]">
                    <div className="flex justify-between items-center">
                      <span className=" leading-[32px] text-base font-medium font-mulish text-black">
                        Donated:
                      </span>
                      <span className="font-bold text-[24px] leading-[28px] font-raleway">
                        $
                        {contributor.totalDonation.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-500">
                      <div className="flex-1 font-mulish">
                        <span className="text-[#98A2B3] font-normal text-base leading-[32px]">
                          From:{" "}
                        </span>
                        <span className="text-black  text-[14px] leading-[32px] font-bold">
                          {format(new Date(contributor.firstDonationDate), "MMM. dd, yyyy")}
                        </span>
                      </div>
                      <div className="flex-1 text-right font-mulish">
                        <span className="text-[#98A2B3] font-normal text-base leading-[32px]">
                          To:{" "}
                        </span>
                        <span className="text-black text-[14px]  leading-[32px] font-bold">
                          {format(new Date(contributor.lastDonationDate), "MMM. dd, yyyy")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </section>
  );
};

export default StarContributors;
