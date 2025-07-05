import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle 
} from "@/components/ui/dialog";
import { CompanyInfoStep } from "@/components/forms/steps/Companyinfostep";
import { ContactInfoStep } from "@/components/forms/steps/ContactinfoStep";
import { CollaborationStep } from "@/components/forms/steps/CollaborationStep";
import { partnerFormSchemas } from "@/schemas/partnerForm";
import { z } from "zod";
import partnerService from "../services/partnerService";
import { useToast } from "@/hooks/use-toast"

import check from "../assets/done-BezVd9SE1f.svg";

interface FormData {
  companyName: string;
  websiteUrl: string;
  industry: string;
  companySize: string;
  fullName: string;
  jobTitle: string;
  email: string;
  phoneNumber: string;
  campaign: string;
  supportTypes: ("Products/Services" | "financial" | "volunteer" | "Marketing/Promotion" | "Expertise" | "other")[];
  otherSupport: string;
  contribution: string;
  impact: string;
  comments: string;
  agreement: boolean;
}

const PartnerWithUs = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

   useEffect(()=>{
      window.scrollTo(0,0)
    },[])
  
  const [formData, setFormData] = useState<Partial<FormData>>({
    companyName: "",
    websiteUrl: "",
    industry: "",
    companySize: "",
    fullName: "",
    jobTitle: "",
    email: "",
    phoneNumber: "",
    campaign: "",
    supportTypes: [],
    otherSupport: "",
    contribution: "",
    impact: "",
    comments: "",
    agreement: false,
  });

  const methods = useForm<Partial<FormData>>({
    resolver: zodResolver(
      currentStep === 1
        ? partnerFormSchemas.company as z.ZodType<Partial<FormData>>
        : currentStep === 2
        ? partnerFormSchemas.contact as z.ZodType<Partial<FormData>>
        : partnerFormSchemas.collaboration as z.ZodType<Partial<FormData>>
    ),
    mode: "onChange",
    defaultValues: formData, // Use the stored form data
  });

  const {
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
    getValues,
    reset,
  } = methods;

  const isCurrentStepValid = () => {
    const currentValues = watch();
    if (currentStep === 1) {
      return (
        !!currentValues.companyName &&
        !!currentValues.websiteUrl &&
        !!currentValues.industry &&
        !!currentValues.companySize &&
        Object.keys(errors).length === 0
      );
    } else if (currentStep === 2) {
      return (
        !!currentValues.fullName &&
        !!currentValues.email &&
        Object.keys(errors).length === 0
      );
    } else if (currentStep === 3) {
      return (
        !!currentValues.campaign &&
        !!currentValues.supportTypes &&
        currentValues.supportTypes.length > 0 &&
        !!currentValues.contribution &&
        !!currentValues.impact &&
        !!currentValues.agreement &&
        Object.keys(errors).length === 0
      );
    }
    return false;
  };

  const onSubmit = async (data: Partial<FormData>) => {
    if (currentStep < 3) {
      const isStepValid = await trigger();
      if (isStepValid) {
        // Save the current step's data
        const currentValues = getValues();
        setFormData(prev => ({...prev, ...currentValues}));
        
        // Move to next step
        setCurrentStep((prev) => prev + 1);
      }
    } else {
      // Combine all steps' data
      const allFormData = {...formData, ...data};
      console.log("Starting form submission with data:", allFormData);
      
      // Check required fields
      const requiredFields = [
        'companyName', 
        'industry', 
        'companySize', 
        'fullName', 
        'email', 
        'campaign', 
        'supportTypes', 
        'agreement'
      ];
      
      const missingFields = requiredFields.filter(field => {
        if (field === 'supportTypes') {
          return !allFormData[field as keyof FormData] || (allFormData[field as keyof FormData] as string[]).length === 0;
        }
        return !allFormData[field as keyof FormData];
      });
      
      if (missingFields.length > 0) {
        console.error("Missing required fields:", missingFields);
        toast({
          title: "Missing Required Fields",
          description: `Please fill in all required fields: ${missingFields.join(', ')}`,
          variant: "destructive",
        });
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Map form data to API request format
        const partnerData = partnerService.mapFormDataToApiRequest(allFormData);
        
        // Call the API
        const response = await partnerService.createPartner(partnerData);
        console.log("API response received:", response);
        
        if (response.succeeded) {
          setIsSubmitted(true);
          reset(); // Reset the form
          setFormData({}); // Clear stored form data
        } else {
          console.error("API returned error:", response.message);
          toast({
            title: "Submission Failed",
            description: response.message || "Failed to submit partnership request",
            variant: "destructive",
          });
        }
      } catch (err: unknown) {
        console.error("Partner submission error:", err);
        
        const errorMessage = err instanceof Error 
          ? err.message 
          : "An error occurred while submitting your request";

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTitle className="sr-only">Partner With Us Form</DialogTitle>
        <DialogContent className="sm:max-w-[480px] font-mulish p-4">
          <div className="text-center">
            <div className="mx-auto rounded-full flex items-center justify-center mb-4">
              <img src={check} alt="" className="size-[80px] md:size-[105px]" />
            </div>
            <h2 className="font-bold font-raleway text-2xl md:text-4xl mb-4">
              Partnership Request Received
            </h2>
            <p className="text-[#98A2B3] text-start text-sm leading-7 mb-6 md:mb-[40px]">
              We're thrilled about the possibility of collaborating with your
              organization to create meaningful change. Our team has received
              your submission and will review it carefully. We'll get back to
              you within{" "}
              <span className="text-[#182230] font-bold">3–5 business days</span> to
              discuss the next steps. <br />
              In the meantime, feel free to explore our ongoing campaigns and
              see how we're making a difference together with partners like you.
            </p>
            <div className="flex flex-col md:flex-row gap-4">
              <Button
                variant="outline"
                className="flex-1 text-red-500 border-[#F04438]"
                onClick={() => {
                  setIsOpen(false);
                  setIsSubmitted(false);
                  setCurrentStep(1);
                  setFormData({
                    companyName: "",
                    websiteUrl: "",
                    industry: "",
                    companySize: "",
                    fullName: "",
                    jobTitle: "",
                    email: "",
                    phoneNumber: "",
                    campaign: "",
                    supportTypes: [],
                    otherSupport: "",
                    contribution: "",
                    impact: "",
                    comments: "",
                    agreement: false,
                  });
                }}
              >
                Return to Homepage
              </Button>
              <Button
                className="flex-1 bg-[#9F1AB1] hover:bg-[#8f179f]"
                onClick={() => (window.location.href = "/campaigns")}
              >
                Explore Our Campaigns
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }


  return (
    <>
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 pt-[60px] md:pt-[40px] pb-[66px]">
        <div className="text-center">
          <div className="relative text-center mt-0  md:mt-[40px] md:mb-[55px]">
            <h1 className="absolute w-full text-[35px] sm:text-5xl md:text-6xl lg:text-8xl font-black font-raleway leading-[144px] text-[#F6D0FE] left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              PARTNER WITH US{" "}
            </h1>
            <h2 className="relative text-[12px] sm:text-2xl md:text-[24px] leading-[36px] font-extrabold font-raleway text-[#9F1AB1] z-10">
              PARTNER WITH US{" "}
            </h2>
          </div>
          <h2 className="text-[25px] md:text-[48px] font-raleway font-bold leading-[150%] md:leading-[72px] pt-[8px]">
            Want to Collaborate With Us?
          </h2>
          <p className="mt-[8px] font-mulish max-w-4xl mx-auto text-gray-600 leading-[150%] md:leading-[32px] text-[14px] md:text-[16px] font-500">
            We believe that lasting change happens when passionate organizations
            come together for a shared purpose. By partnering with YIODARA, your
            company can help drive impactful campaigns that uplift communities,
            {/* protect our planet, and create a brighter future for all. Whether
            you want to contribute financially, offer your products or services,
            or volunteer your time, we're excited to explore how we can make a
            difference together. */}
          </p>
        </div>
        <div className="flex justify-center my-[20px] md:my-[32px]">
          <Button
            className="px-[24px] py-[16px] h-[56px] bg-[#9F1AB1] font-mulish hover:bg-[#9F1AB1] text-sm md:text-base font-bold"
            onClick={() => setIsOpen(true)}
          >
            Partner with Us Today
          </Button>
        </div>
      </section>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTitle className="sr-only">Partner With Us Form</DialogTitle>
        <DialogContent className="sm:max-w-[480px] px-3 md:p-6">
          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center py-10">
              <img src={check} alt="Success" className="w-16 h-16 mb-6" />
              <h2 className="text-2xl font-bold text-center mb-4">
                Partnership Request Received
              </h2>
              <p className="text-center text-gray-600 mb-6">
                We're thrilled about the possibility of collaborating with your
                organization to create meaningful change. Our team has received
                your submission and will review it carefully. We'll get back to you
                within 3-5 business days to discuss the next steps.
              </p>
              <Button
                onClick={() => {
                  setIsSubmitted(false);
                  setIsOpen(false);
                  setCurrentStep(1);
                  setFormData({
                    companyName: "",
                    websiteUrl: "",
                    industry: "",
                    companySize: "",
                    fullName: "",
                    jobTitle: "",
                    email: "",
                    phoneNumber: "",
                    campaign: "",
                    supportTypes: [],
                    otherSupport: "",
                    contribution: "",
                    impact: "",
                    comments: "",
                    agreement: false,
                  });
                }}
                className="bg-[#9F1AB1] hover:bg-[#8f179f]"
              >
                Return to Homepage
              </Button>
            </div>
          ) : (
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="relative">
                  <h2 className="text-2xl font-bold text-center mb-2 font-mulish text-black">
                    {currentStep === 1 && "Company Information"}
                    {currentStep === 2 && "Contact Person"}
                    {currentStep === 3 && "Collaboration Details"}
                  </h2>

                  <p
                    className={`text-center text-sm mb-6 font-mulish text-[#182230] font-bold`}
                  >
                    Step {currentStep} of{" "}
                    <span
                      className={` ${
                        currentStep === 3 ? "text-[#182230]" : "text-[#98A2B3]"
                      }`}
                    >
                      3
                    </span>
                  </p>

                  {currentStep === 1 && <CompanyInfoStep />}
                  {currentStep === 2 && <ContactInfoStep />}
                  {currentStep === 3 && <CollaborationStep />}

                  <div className="flex gap-4 pt-6">
                    {currentStep > 1 ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep((prev) => prev - 1)}
                        className="flex-1"
                      >
                        Back
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        className="flex-1 text-[#F04438] border-[#F04438]"
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      type="submit"
                      className="flex-1 bg-[#9F1AB1] hover:bg-[#8f179f] disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!isCurrentStepValid() || isLoading}
                    >
                      {isLoading 
                        ? "Submitting..." 
                        : currentStep === 3 
                          ? "Submit" 
                          : "Next"
                      }
                    </Button>
                  </div>
                </div>
              </form>
            </FormProvider>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PartnerWithUs;