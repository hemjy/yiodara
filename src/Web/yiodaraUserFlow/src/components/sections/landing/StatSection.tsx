import { useStats } from "@/hooks/useStats";
import CountUp from "react-countup";

function StatSection() {
  const { stats, isLoading, error } = useStats();

  const statItems = stats
    ? [
        {
          value: stats.totalFundsRaised,
          label: "Funds Raised",
          prefix: "$",
          suffix: "",
        },
        {
          value: stats.monthlyDonors.toString(),
          label: "Monthly Donors",
          prefix: "",
          suffix: "+",
        },
        {
          value: stats.successfulCampaigns.toString(),
          label: "Successful Campaigns",
          prefix: "",
          suffix: "+",
        },
        {
          value: stats.peopleBenefited.toString(),
          label: "People Benefited",
          prefix: "",
          suffix: "+",
        },
      ]
    : [];

  return (
    <section className="bg-[#9F1AB1] py-8 md:py-10 lg:py-12 w-full">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20">
        <div className="flex flex-row flex-wrap justify-between text-white">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="w-1/2 md:w-auto p-4">
                <div className="animate-pulse bg-white/30 rounded-lg h-12 w-32 mb-2"></div>
                <div className="animate-pulse bg-white/30 rounded-lg h-6 w-24"></div>
              </div>
            ))
          ) : error ? (
            <div className="w-full text-center text-yellow-300">
              <p>Could not load statistics.</p>
            </div>
          ) : (
            statItems.map((stat, index) => (
              <div
                key={index}
                className={`w-1/2 md:w-auto flex flex-col items-center md:items-start ${
                  index % 2 === 0 ? "border-r md:border-r-0 border-white/30" : ""
                } ${index < 2 ? "mb-6 md:mb-0" : ""}`}
              >
                <div className="text-[16px] md:text-5xl lg:text-6xl font-extrabold font-raleway leading-tight">
                  <CountUp
                    prefix={stat.prefix}
                    end={parseInt(stat.value.replace(/,/g, ""))}
                    suffix={stat.suffix}
                    duration={2.75}
                    enableScrollSpy
                    scrollSpyDelay={300}
                  />
                </div>
                <div className="text-[12px] md:text-base font-medium font-mulish mt-1 text-center md:text-left">
                  {stat.label}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default StatSection;
