import React, { useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ArrowLeft, Loader2, CheckCircle, XCircle } from "lucide-react";
import { usePartnershipDetail } from "../../hooks/usePartnershipDetail";
import { partnershipService } from "../../api/services/partnershipService";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface PartnershipDetailViewProps {
  partnershipId: string;
  onBack: () => void;
}

const PartnershipDetailView: React.FC<PartnershipDetailViewProps> = ({
  partnershipId,
  onBack,
}) => {
  const { toast } = useToast();

  const [isConfirming, setIsConfirming] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: partnershipResponse,
    isLoading,
    isError,
    error,
  } = usePartnershipDetail(partnershipId);

  const partnership = partnershipResponse?.data;

  const getInitials = (name: string) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2) || "NA"
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "text-[#BA24D5] font-raleway font-bold text-[16px] leading-[100%]";
      case "rejected":
        return "text-red-800";
      default:
        return "text-orange-800";
    }
  };

  const handleConfirmPartnership = async () => {
    try {
      setIsConfirming(true);
      await partnershipService.confirmPartnership(partnershipId);

      toast({
        title: "Partnership confirmed",
        description: "The partnership has been successfully confirmed.",
        variant: "default",
      });

      queryClient.invalidateQueries({
        queryKey: ["partnershipDetail", partnershipId],
      });
      queryClient.invalidateQueries({ queryKey: ["partnerships"] });

      onBack();
    } catch (error) {
      console.error("Error confirming partnership:", error);
      toast({
        title: "Error",
        description: "Failed to confirm partnership. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="font-raleway">
        <div className="mb-6">
          <Button
            variant="ghost"
            className="flex items-center text-gray-600 hover:text-gray-900 p-0"
            onClick={onBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-16 w-full rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="font-raleway">
        <div className="mb-6">
          <Button
            variant="ghost"
            className="flex items-center text-gray-600 hover:text-gray-900 p-0"
            onClick={onBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
        <div className="p-12 text-center text-red-500">
          Error loading partnership details: {error?.message || "Unknown error"}
        </div>
      </div>
    );
  }

  if (!partnership) {
    return (
      <div className="font-raleway">
        <div className="mb-6">
          <Button
            variant="ghost"
            className="flex items-center text-gray-600 hover:text-gray-900 p-0"
            onClick={onBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
        <div className="p-12 text-center text-gray-500">
          No partnership details found.
        </div>
      </div>
    );
  }

  return (
    <div className="font-raleway">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="flex items-center text-gray-600 hover:text-gray-900 p-0"
          onClick={onBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>

      <div className="flex items-center justify-between mb-6 bg-[#F9FAFB] border-[#EAECF0] border-[1px] p-6">
        <div className="flex items-center">
          <div className="bg-[#FBE8FF] text-[#9F1AB1] font-raleway font-extrabold text-[24px] rounded-full w-16 h-16 flex items-center justify-center text-lg mr-4">
            {getInitials(partnership.companyInformation.companyName)}
          </div>
          <div className="flex flex-col">
            <div className=" items-center mt-1 font-raleway">
              <div className="text-[16px] leading-[100%] font-normal text-[#000000]">
                <span className="mr-2">Category:</span>
                <span className=" font-bold">{partnership.categoryName}</span>
              </div>
              <div className="text-[16px] leading-[100%] font-normal text-[#000000] mt-4">
                <span className=" mr-2">Date Submitted:</span>
                <span className=" font-bold">
                  {new Date(partnership.dateSubmitted).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <span className="mr-2">Status:</span>
          <span className={getStatusColor(partnership.status)}>
            {partnership.status.charAt(0).toUpperCase() +
              partnership.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Company Information */}
        <div className="bg-[#FCFCFD] rounded-lg p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4 font-raleway leading-[150%] text-[#000000]">
            Company Information
          </h2>

          <div className="space-y-4">
            <div className="flex items-center font-mulish">
              <p className="text-[#667085] text-[15px] mr-4 font-bold">
                Company Name:
              </p>
              <p className="font-medium text-[#98A2B3] leading-[200%] text-[15px]">
                {partnership.companyInformation.companyName}
              </p>
            </div>

            <div className="flex items-center font-mulish">
              <p className="text-[#667085] text-[15px] mr-4 font-bold">
                Website URL:
              </p>
              <p className="font-medium text-[#98A2B3] leading-[200%] text-[15px]">
                {partnership.companyInformation.websiteUrl}
              </p>
            </div>

            <div className="flex items-center font-mulish">
              <p className="text-[#667085] text-[15px] mr-4 font-bold">
                Industry/Field:
              </p>
              <p className="font-medium text-[#98A2B3] leading-[200%] text-[15px]">
                {partnership.companyInformation.industry}
              </p>
            </div>

            <div className="flex items-center font-mulish">
              <p className="text-[#667085] text-[15px] mr-4 font-bold">
                Company Size:
              </p>
              <p className="font-medium text-[#98A2B3] leading-[200%] text-[15px]">
                {partnership.companyInformation.companySize}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Person Information */}
        <div className="bg-[#FCFCFD] rounded-lg p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4 font-raleway leading-[150%] text-[#000000] ">
            Contact Person Information
          </h2>

          <div className="space-y-4">
            <div className="flex items-center font-mulish">
              <p className="text-[#667085] text-[15px] mr-4 font-bold">
                Full Name:
              </p>
              <p className="font-medium text-[#98A2B3] leading-[200%] text-[15px]">
                {partnership.contactPerson.fullName}
              </p>
            </div>

            <div className="flex items-center font-mulish">
              <p className="text-[#667085] text-[15px] mr-4 font-bold">
                Job Title:
              </p>
              <p className="font-medium text-[#98A2B3] leading-[200%] text-[15px]">
                {partnership.contactPerson.jobTitle}
              </p>
            </div>

            <div className="flex items-center font-mulish">
              <p className="text-[#667085] text-[15px] mr-4 font-bold">
                Email Address:
              </p>
              <p className="font-medium text-[#98A2B3] leading-[200%] text-[15px]">
                {partnership.contactPerson.emailAddress}
              </p>
            </div>

            <div className="flex items-center font-mulish">
              <p className="text-[#667085] text-[15px] mr-4 font-bold">
                Phone Number:
              </p>
              <p className="font-medium text-[#98A2B3] leading-[200%] text-[15px]">
                {partnership.contactPerson.phoneNumber}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Collaboration Details */}
      <div className="bg-[#FCFCFD] rounded-lg p-6 shadow-sm border border-gray-100 mb-6">
        <h2 className="text-xl font-bold mb-4 font-raleway leading-[150%] text-[#000000]">
          Collaboration Details
        </h2>

        <div className="space-y-6">
          <div className="font-mulish">
            <p className="text-[#667085] text-[15px] font-bold">
              What Type of Support Can You Provide?
            </p>
            <p className="font-medium text-[#98A2B3] leading-[200%] text-[15px] mt-1">
              {partnership.partnershipDetails.supportType}
            </p>
          </div>

          <div className="font-mulish">
            <p className="text-[#667085] text-[15px] mr-4 font-bold">
              Which Campaign Are You Interested In Supporting?
            </p>
            <p className="font-medium text-[#98A2B3] leading-[200%] text-[15px] mt-1">
              {partnership.partnershipDetails.campaignInterested}
            </p>
          </div>

          <div className="font-mulish">
            <p className="text-[#667085] text-[15px] mr-4 font-bold">
              How Does Your Organization Aim to Contribute?
            </p>
            <p className="font-medium text-[#98A2B3] leading-[200%] text-[15px] mt-1">
              {
                partnership.partnershipDetails
                  .howDoesYourOrganizationAimToContribute
              }
            </p>
          </div>

          <div className="font-mulish">
            <p className="text-[#667085] text-[15px] mr-4 font-bold">
              What Impact Do You Hope to Achieve Through This Partnership?
            </p>
            <p className="font-medium text-[#98A2B3] leading-[200%] text-[15px] mt-1">
              {partnership.partnershipDetails.whatImpactDoYouHopeToAchieve}
            </p>
          </div>

          {partnership.partnershipDetails.anyOtherComments && (
            <div>
              <p className="text-[#667085] text-[15px] mr-4 font-bold">
                Any Other Comments or Questions?
              </p>
              <p className="font-medium text-[#98A2B3] leading-[200%] text-[15px] mt-1">
                {partnership.partnershipDetails.anyOtherComments}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex  space-x-4 font-mulish">
        <Button
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50 w-[50%] h-[56px]"
          onClick={onBack}
        >
          <XCircle className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button
          className="bg-[#8f179f] hover:bg-[#8f179f]/90 w-[50%] rounded-none h-[56px] py-4"
          onClick={handleConfirmPartnership}
          disabled={
            isConfirming ||
            isRejecting ||
            partnership.status.toLowerCase() !== "unconfirmed"
          }
        >
          {isConfirming ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Confirming...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Confirm Partnership
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PartnershipDetailView;