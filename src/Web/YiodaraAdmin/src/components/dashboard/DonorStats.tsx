import { useDonorCount } from '../../hooks/useDonorCount';
import ErrorBoundary from '../ErrorBoundary';
import { Skeleton } from '@/components/ui/skeleton';

const DonorStats = () => {
  const { data, isLoading, isError } = useDonorCount();
  
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
          <div>
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Failed to load donor statistics</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Donor Statistics</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Total Donors</p>
          <p className="text-2xl font-bold">{data?.totalDonors || 0}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Total Donations</p>
          <p className="text-2xl font-bold">${data?.totalAmount?.toFixed(2) || 0}</p>
        </div>
      </div>
    </div>
  );
};

const DonorStatsWithErrorBoundary = () => (
  <ErrorBoundary fallback={
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-red-600">Something went wrong with donor statistics</p>
    </div>
  }>
    <DonorStats />
  </ErrorBoundary>
);

export default DonorStatsWithErrorBoundary; 