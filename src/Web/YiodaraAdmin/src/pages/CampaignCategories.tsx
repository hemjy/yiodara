import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { CampaignCategory, CampaignCategoryParams } from '@/types/campaignCategory';
import {
  useCampaignCategories,
  useCreateCampaignCategory,
  useUpdateCampaignCategory,
  useDeleteCampaignCategory,
} from '@/hooks/useCampaignCategories';
import { Pencil, Trash2, Plus, Search, RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

const CampaignCategories = () => {
  const [searchText, setSearchText] = useState('');
  const [params, setParams] = useState<CampaignCategoryParams>({
    pageNumber: 1,
    pageSize: 10,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CampaignCategory | null>(null);
  const [nameError, setNameError] = useState('');

  const queryClient = useQueryClient();
  
  const {
    data: categoriesData,
    isLoading,
    isError,
    error,
  } = useCampaignCategories(params);
  
  const createMutation = useCreateCampaignCategory();
  const updateMutation = useUpdateCampaignCategory();
  const deleteMutation = useDeleteCampaignCategory();

  // Handle search
  const handleSearch = () => {
    setParams((prev) => ({
      ...prev,
      searchText,
      pageNumber: 1, // Reset to first page on new search
    }));
  };

  // Handle refresh data
  const handleRefreshData = async () => {
    setIsRefreshing(true);
    
    try {
      await queryClient.invalidateQueries({ queryKey: ['campaignCategories'] });
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setParams((prev) => ({
      ...prev,
      pageNumber: page,
    }));
  };

  // Validate category name (alphabets only)
  const validateCategoryName = (name: string) => {
    if (!name.trim()) {
      setNameError('Category name is required');
      return false;
    }
    
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      setNameError('Category name should contain only alphabets');
      return false;
    }
    
    setNameError('');
    return true;
  };

  // Handle create category
  const handleCreateCategory = () => {
    if (!validateCategoryName(newCategoryName)) return;
    
    createMutation.mutate(
      { name: newCategoryName },
      {
        onSuccess: () => {
          setNewCategoryName('');
          setIsCreateDialogOpen(false);
        },
      }
    );
  };

  // Handle update category
  const handleUpdateCategory = () => {
    if (!selectedCategory) return;
    if (!validateCategoryName(newCategoryName)) return;
    
    updateMutation.mutate(
      { id: selectedCategory.id, name: newCategoryName },
      {
        onSuccess: () => {
          setSelectedCategory(null);
          setNewCategoryName('');
          setIsUpdateDialogOpen(false);
        },
      }
    );
  };

  // Handle delete category
  const handleDeleteCategory = () => {
    if (!selectedCategory) return;
    
    deleteMutation.mutate(
      { id: selectedCategory.id },
      {
        onSuccess: () => {
          setSelectedCategory(null);
          setIsDeleteDialogOpen(false);
        },
      }
    );
  };

  // Open update dialog
  const openUpdateDialog = (category: CampaignCategory) => {
    setSelectedCategory(category);
    setNewCategoryName(category.name);
    setIsUpdateDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (category: CampaignCategory) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  return (
    <section className="font-raleway p- max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-[36px] leading-[54px] font-bold text-gray-800 relative">
          Campaign Categories
          <span className="absolute bottom-0 left-0 w-1/4 h-1 bg-[#BA24D5] rounded-full"></span>
        </h1>
        <button
          onClick={handleRefreshData}
          disabled={isRefreshing}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          title="Refresh data"
        >
          <RefreshCw 
            className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-[#BA24D5]' : 'text-gray-600'}`} 
          />
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
        <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex gap-2 w-full max-w-sm">
            <Input
              placeholder="Search categories..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="border-gray-300 focus:border-[#BA24D5] focus:ring-[#BA24D5]/20"
            />
            <Button 
              onClick={handleSearch} 
              variant="outline"
              className="bg-white border-gray-300 hover:bg-gray-50 hover:border-[#BA24D5] transition-colors"
            >
              <Search className="h-4 w-4 text-gray-500" />
              <span className="ml-2">Search</span>
            </Button>
          </div>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="hover:bg-gray-800 text-white rounded-none transition-colors bg-[#BA24D5] hover:bg-[#BA24D5]/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2 py-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-lg">
            Error loading categories: {error?.message || 'Unknown error'}
          </div>
        ) : categoriesData?.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">No categories found</h3>
            <p className="text-gray-500 mb-4">Create your first campaign category to get started</p>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-[#BA24D5] hover:bg-[#BA24D5]/90 text-white"
            >
              Create Category
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow className="hover:bg-gray-50">
                    <TableHead className="font-semibold text-gray-700">Name</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoriesData?.data.map((category) => (
                    <TableRow key={category.id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="font-medium text-gray-800">{category.name}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openUpdateDialog(category)}
                            title="Edit category"
                            className="hover:bg-[#BA24D5]/10 hover:text-[#BA24D5] transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(category)}
                            title="Delete category"
                            className="hover:bg-red-50 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {categoriesData && categoriesData.total > categoriesData.pageSize && (
              <div className="flex justify-center mt-6 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(params.pageNumber! - 1)}
                  disabled={!categoriesData.hasPrevious}
                  className="border-gray-300 hover:border-[#BA24D5] hover:text-[#BA24D5] transition-colors"
                >
                  Previous
                </Button>
                <span className="py-2 px-4 bg-gray-50 rounded-md text-gray-700 border border-gray-200">
                  Page {categoriesData.pageNumber} of {Math.ceil(categoriesData.total / categoriesData.pageSize)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(params.pageNumber! + 1)}
                  disabled={!categoriesData.hasNext}
                  className="border-gray-300 hover:border-[#BA24D5] hover:text-[#BA24D5] transition-colors"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Category Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Create New Category</DialogTitle>
            <DialogDescription>
              Add a new campaign category to the system.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
            <Input
              placeholder="Enter category name"
              value={newCategoryName}
              onChange={(e) => {
                setNewCategoryName(e.target.value);
                validateCategoryName(e.target.value);
              }}
              className="border-gray-300 focus:border-[#BA24D5] focus:ring-[#BA24D5]/20"
            />
            {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setNewCategoryName('');
                setNameError('');
                setIsCreateDialogOpen(false);
              }}
              className="border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              className='bg-[#BA24D5] hover:bg-[#BA24D5]/90 transition-colors'
              onClick={handleCreateCategory}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Creating...
                </>
              ) : 'Create Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Category Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Update Category</DialogTitle>
            <DialogDescription>
              Edit the selected campaign category.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
            <Input
              placeholder="Enter category name"
              value={newCategoryName}
              onChange={(e) => {
                setNewCategoryName(e.target.value);
                validateCategoryName(e.target.value);
              }}
              className="border-gray-300 focus:border-[#BA24D5] focus:ring-[#BA24D5]/20"
            />
            {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCategory(null);
                setNewCategoryName('');
                setNameError('');
                setIsUpdateDialogOpen(false);
              }}
              className="border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              className='bg-[#BA24D5] hover:bg-[#BA24D5]/90 transition-colors'
              onClick={handleUpdateCategory}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Updating...
                </>
              ) : 'Update Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              This will permanently delete the category <span className="font-medium">"{selectedCategory?.name}"</span>. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setSelectedCategory(null);
                setIsDeleteDialogOpen(false);
              }}
              className="border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-red-500 hover:bg-red-600 transition-colors"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Deleting...
                </>
              ) : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};

export default CampaignCategories; 