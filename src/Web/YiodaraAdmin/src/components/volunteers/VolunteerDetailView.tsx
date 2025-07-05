import React from 'react';
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ArrowLeft } from "lucide-react";

interface VolunteerDetailProps {
  volunteer: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    location: string;
    registrationDate: string;
    initials: string;
    // Additional fields that would come from the API
    age?: string;
    gender?: string;
    occupation?: string;
    skills?: string[];
    availability?: string;
    interests?: string[];
    experience?: string;
    motivation?: string;
    status?: "Active" | "Inactive" | "Pending";
  };
  onBack: () => void;
}

const VolunteerDetailView: React.FC<VolunteerDetailProps> = ({
  volunteer,
  onBack
}) => {
  // Format status for display
  const getStatusColor = (status: string = "Pending") => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-orange-100 text-orange-800";
    }
  };

  return (
    <div className="font-raleway">
      {/* Header with back button */}
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

      {/* Volunteer overview */}
      <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-[#BA24D5] rounded-full flex items-center justify-center text-white mr-4 font-bold">
              {volunteer.initials}
            </div>
            <div>
              <h2 className="text-xl font-bold">{volunteer.name}</h2>
              <p className="text-gray-600">{volunteer.email}</p>
            </div>
          </div>
          <div className="flex items-center">
            <p className="text-gray-600 mr-2">Status:</p>
            <Badge className={`${getStatusColor(volunteer.status)} font-medium px-3 py-1`}>
              {volunteer.status || "Pending"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main content in two columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Personal Information */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4">Personal Information</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-gray-600 text-sm">Phone Number:</p>
              <p className="font-medium">{volunteer.phoneNumber}</p>
            </div>
            
            <div>
              <p className="text-gray-600 text-sm">Location:</p>
              <p className="font-medium">{volunteer.location}</p>
            </div>
            
            <div>
              <p className="text-gray-600 text-sm">Registration Date:</p>
              <p className="font-medium">{volunteer.registrationDate}</p>
            </div>
            
            <div>
              <p className="text-gray-600 text-sm">Age:</p>
              <p className="font-medium">{volunteer.age || "Not specified"}</p>
            </div>
            
            <div>
              <p className="text-gray-600 text-sm">Gender:</p>
              <p className="font-medium">{volunteer.gender || "Not specified"}</p>
            </div>
            
            <div>
              <p className="text-gray-600 text-sm">Occupation:</p>
              <p className="font-medium">{volunteer.occupation || "Not specified"}</p>
            </div>
          </div>
        </div>

        {/* Volunteer Information */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4">Volunteer Information</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-gray-600 text-sm">Skills:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {volunteer.skills ? volunteer.skills.map((skill, index) => (
                  <Badge key={index} className="bg-purple-100 text-purple-800 font-medium">
                    {skill}
                  </Badge>
                )) : <p className="text-gray-500">No skills specified</p>}
              </div>
            </div>
            
            <div>
              <p className="text-gray-600 text-sm">Availability:</p>
              <p className="font-medium">{volunteer.availability || "Not specified"}</p>
            </div>
            
            <div>
              <p className="text-gray-600 text-sm">Interests:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {volunteer.interests ? volunteer.interests.map((interest, index) => (
                  <Badge key={index} className="bg-blue-100 text-blue-800 font-medium">
                    {interest}
                  </Badge>
                )) : <p className="text-gray-500">No interests specified</p>}
              </div>
            </div>
            
            <div>
              <p className="text-gray-600 text-sm">Previous Experience:</p>
              <p className="text-gray-600 text-sm mt-1">{volunteer.experience || "No previous experience"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Motivation */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mb-6">
        <h2 className="text-xl font-bold mb-4">Motivation for Volunteering</h2>
        <p className="text-gray-600">
          {volunteer.motivation || 
           "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur tempus urna at turpis condimentum lobortis."}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-50">
          Deactivate Volunteer
        </Button>
        <Button className="bg-[#9F1AB1] hover:bg-[#8f179f]">
          Assign to Campaign
        </Button>
      </div>
    </div>
  );
};

export default VolunteerDetailView; 