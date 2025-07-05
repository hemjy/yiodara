import { Skeleton } from "@/components/ui/skeleton";

export const EventCardSkeleton = () => {
  return (
    <div className="bg-white border-[1px] rounded-lg overflow-hidden flex flex-col">
      <Skeleton className="h-[230px] w-full" />
      <div className="p-4 flex flex-col flex-grow space-y-4">
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        </div>
        <Skeleton className="h-6 w-5/6" />
        <div className="flex-grow space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-10 w-full mt-auto" />
      </div>
    </div>
  );
}; 