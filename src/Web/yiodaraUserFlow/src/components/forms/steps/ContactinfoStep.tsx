import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";

export const ContactInfoStep = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-6 font-mulish">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <label className="block  text-base text-[#182230] font-bold">Full Name</label>
        </div>
        <Input
          {...register("fullName")}
          placeholder="e.g. Gloria Philips, Emmanuel Brian, .."
          className="w-full border-gray-200"
          aria-invalid={errors.fullName ? "true" : "false"}
        />
        {errors.fullName && (
          <p className="text-sm text-red-500" role="alert">
            {errors.fullName.message as string}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <label className="block  text-base text-[#182230] font-bold">Job Title</label>
        </div>
        <Input
          {...register("jobTitle")}
          placeholder="e.g. Manager, Intern, ..."
          className="w-full border-gray-200"
          aria-invalid={errors.jobTitle ? "true" : "false"}
        />
        {errors.jobTitle && (
          <p className="text-sm text-red-500" role="alert">
            {errors.jobTitle.message as string}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <label className="block  text-base text-[#182230] font-bold">Email</label>
        </div>
        <Input
          {...register("email")}
          type="email"
          placeholder="e.g. example@gmail.com"
          className="w-full border-gray-200"
          aria-invalid={errors.email ? "true" : "false"}
        />
        {errors.email && (
          <p className="text-sm text-red-500" role="alert">
            {errors.email.message as string}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <label className="block  text-base text-[#182230] font-bold">Phone Number</label>
        </div>
        <Input
          {...register("phoneNumber")}
          type="tel"
          placeholder="e.g. +234 812-344-8290, +234 812-344-8290, ...."
          className="w-full border-gray-200"
          aria-invalid={errors.phoneNumber ? "true" : "false"}
        />
        {errors.phoneNumber && (
          <p className="text-sm text-red-500" role="alert">
            {errors.phoneNumber.message as string}
          </p>
        )}
      </div>
    </div>
  );
};
