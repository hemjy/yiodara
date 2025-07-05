import { Skeleton } from "@/components/ui/skeleton";

interface CampaignSkeletonProps {
  variant?: 'landing' | 'full';
}

export const CampaignSkeleton = ({ variant = 'full' }: CampaignSkeletonProps) => {
  return (
    <div className="border">
      <Skeleton className={variant === 'landing' ? "w-full aspect-[4/3]" : "w-full h-[200px]"} />
      <div className="px-4 pb-6 md:pb-[24px]">
        <Skeleton className="h-6 w-20 my-4 md:my-[16px]" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4 mb-4 md:mb-[24px]" />
        
        <div className="space-y-2">
          <div className="flex justify-center space-x-1 md:space-x-[4px] items-center">
            <Skeleton className="h-2 w-[90%] rounded" />
            <Skeleton className="h-4 w-[10%]" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-[45%]" />
            <Skeleton className="h-4 w-[45%]" />
          </div>
        </div>
        
        <Skeleton className="h-10 w-full mt-4 md:mt-[24px]" />
      </div>
    </div>
  );
}; 