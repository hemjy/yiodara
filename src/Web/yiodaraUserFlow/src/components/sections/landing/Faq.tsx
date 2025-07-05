import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
    question: string; // The FAQ question
    answer: string; // The FAQ answer
    id: number; // Unique identifier for each FAQ
  }

function Faq() {
    // State to track which FAQ is currently open
  // null means no FAQ is open, number represents the open FAQ's id
  const [openFAQ, setOpenFAQ] = useState<number | null>(1);

  // Array of FAQ data
  const faqData: FAQItem[] = [
    {
      id: 1,
      question: "What is YIODARA?",
      answer:
        "YIODARA is a charitable platform that connects donors with various causes and projects. We facilitate donations and volunteering opportunities to help make a positive impact in communities worldwide.",
    },
    {
      id: 2,
      question: "How can I make a donation?",
      answer:
        "Making a donation is simple. Choose a campaign, select your donation amount, and follow the secure payment process. We accept various payment methods including credit cards and digital payments.",
    },
    {
      id: 3,
      question: "Are my donations tax-deductible?",
      answer:
        "Yes, donations made through YIODARA are generally tax-deductible. We provide donation receipts for tax purposes. Please consult with your tax advisor for specific guidance.",
    },
    {
      id: 4,
      question: "Can I choose a specific project or organization?",
      answer:
        "Yes, you can browse through our various campaigns and choose specific projects that align with your interests and values.",
    },
    {
      id: 5,
      question: "How is my donation used?",
      answer:
        "Your donations go directly to the selected campaigns minus a small processing fee. We ensure transparency by providing regular updates on project progress and impact.",
    },
  ];

  const FAQAccordion = ({
    item,
    isOpen,
    onToggle,
  }: {
    item: FAQItem;
    isOpen: boolean;
    onToggle: () => void;
  }) => {
    return (
      <div className="border-b-[2px] border-[#EEAAFD]">
        <button
          className="w-full py-4 md:py-6 flex justify-between items-center text-left hover:bg-[#FDF4FF] transition-colors duration-200"
          onClick={onToggle}
        >
          <span className="font-raleway font-semibold text-lg md:text-xl lg:text-[24px] leading-tight lg:leading-[36px] text-[#101828]">
            {item.question}
          </span>
          <ChevronDown
            className={`w-5 h-5 md:w-6 md:h-6 text-[#9F1AB1] transition-transform duration-200 ease-out ${
              isOpen ? "transform rotate-180" : ""
            }`}
          />
        </button>
        <div
          className={`grid transition-[grid-template-rows] duration-200 ease-out ${
            isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden">
            <div className="pt-2 pb-4 font-mulish text-sm md:text-base lg:text-[16px] leading-[200%] md:leading-[32px] text-[#000000]">
              {item.answer}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="bg-[#FDF4FF] py-10 md:py-12 lg:pt-[50px] lg:pb-[80px]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 lg:space-x-[64px]">
          <div className="space-y-4 md:space-y-[24px]">
            <div className="relative">
              <h1 className=" absolute w-full text-4xl sm:text-5xl md:text-6xl lg:text-[80px] font-black font-raleway leading-[100%] lg:leading-[90px] text-[#F6D0FE] opacity-50">
                FREQUENTLY <br />
                ASKED <br /> QUESTIONS
              </h1>
              <h2 className="relative text-[10px] sm:text-2xl md:text-[24px] leading-tight md:leading-[36px] font-extrabold font-raleway text-[#9F1AB1] z-10 pt-4 md:pt-[35px]">
                FREQUENTLY ASKED QUESTIONS
              </h2>
            </div>
          </div>

          <div className="space-y-4 mt-[76px] md:mt-0">
            {faqData.map((faq) => (
              <FAQAccordion
                key={faq.id}
                item={faq}
                isOpen={openFAQ === faq.id} // Check if this FAQ is currently open
                onToggle={
                  () => setOpenFAQ(openFAQ === faq.id ? null : faq.id) // Toggle FAQ open/closed
                }
              />
            ))}
          </div>
        </div>

        <div className="mt-8 md:mt-12 text-center py-4 md:py-[16px]">
          <p className="font-mulish text-sm md:text-base lg:text-[16px] leading-tight md:leading-[24px] font-semibold text-[#000000]">
            Have other questions? Email us at:{" "}
            <a
              href="mailto:yiodara@gmail.com"
              className="text-[#2970FF] font-semibold hover:underline"
            >
              yiodare@gmail.com
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}

export default Faq
