import HeroSection from "@/components/sections/landing/HeroSection";
import StatSection from "@/components/sections/landing/StatSection";
import AboutYiodara from "@/components/sections/landing/AboutYiodara";
import HowItWorks from "@/components/sections/landing/HowItWorks";
import Categories from "@/components/sections/landing/Categories";
import CampaignList from "@/components/sections/landing/CampaignList";
import Gallery from "@/components/sections/landing/Gallery";
import Faq from "@/components/sections/landing/Faq";

function Landing() {
  return (
    <main>
      <HeroSection />
      <StatSection />
      <AboutYiodara />
      <HowItWorks />
      <Categories />
      <CampaignList />
      <Gallery />
      <Faq />
    </main>
  );
}

export default Landing;