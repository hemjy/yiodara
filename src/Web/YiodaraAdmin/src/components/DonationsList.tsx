import { useState } from 'react';
import { useAllDonations } from '../hooks/useAllDonations';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';

const DonationsList = () => {
  const [params, setParams] = useState({
    pageNumber: 1,
    pageSize: 10,
    searchTerm: '',
  });

  const { 
    donations, 
    pageNumber, 
    pageSize, 
    total, 
    hasPrevious, 
    hasNext, 
    succeeded, 
    message,
    isLoading,
    isError,
    error
  } = useAllDonations(params);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setParams(prev => ({ ...prev, pageNumber: 1 })); // Reset to first page on new search
  };

  const handlePageChange = (newPage: number) => {
    setParams(prev => ({ ...prev, pageNumber: newPage }));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Donations</h2>
        
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Search donations..."
            value={params.searchTerm}
            onChange={(e) => setParams(prev => ({ ...prev, searchTerm: e.target.value }))}
            className="w-64"
          />
          <Button type="submit">Search</Button>
        </form>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full mb-4" />
          <div className="rounded-md border overflow-hidden">
            <div className="bg-gray-50 p-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-[100px]" />
                <Skeleton className="h-5 w-[100px]" />
                <Skeleton className="h-5 w-[100px]" />
                <Skeleton className="h-5 w-[100px]" />
                <Skeleton className="h-5 w-[100px]" />
              </div>
            </div>
            <div className="divide-y">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-[120px]" />
                    <Skeleton className="h-5 w-[80px]" />
                    <Skeleton className="h-5 w-[100px]" />
                    <Skeleton className="h-5 w-[150px]" />
                    <Skeleton className="h-5 w-[100px]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : isError ? (
        <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-lg">
          Error loading donations: {error?.message || 'Unknown error'}
        </div>
      ) : !succeeded || donations.length === 0 ? (
        <div className="p-4 border border-gray-200 bg-gray-50 text-gray-700 rounded-lg text-center">
          {message || 'No donations found.'}
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Donor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donations.map((donation) => (
                <TableRow key={donation.id}>
                  <TableCell>{donation.donorName}</TableCell>
                  <TableCell>${donation.amount.toFixed(2)}</TableCell>
                  <TableCell>{new Date(donation.date).toLocaleDateString()}</TableCell>
                  <TableCell>{donation.campaignName || 'N/A'}</TableCell>
                  <TableCell>{donation.status || 'Completed'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(pageNumber - 1)} 
                  disabled={!hasPrevious} 
                />
              </PaginationItem>
              
              <PaginationItem>
                <span className="px-4">
                  Page {pageNumber} of {Math.ceil(total / pageSize) || 1}
                </span>
              </PaginationItem>
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(pageNumber + 1)} 
                  disabled={!hasNext} 
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
      )}
    </div>
  );
};

export default DonationsList; 