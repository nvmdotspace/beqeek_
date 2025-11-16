import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Table } from '@workspace/active-tables-core';
import { apiRequest } from '@/shared/api/http-client';

interface DeleteRecordOptions {
  workspaceId: string;
  tableId: string;
  table: Table | null;
  onSuccess?: () => void;
}

/**
 * Hook to delete a record with confirmation dialog
 */
export function useDeleteRecord({ workspaceId, tableId, table, onSuccess }: DeleteRecordOptions) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (recordId: string) => {
      if (!table) {
        throw new Error('Table configuration not loaded');
      }

      // Call delete record API
      const response = await apiRequest<{ message: string }>({
        url: `/api/workspace/${workspaceId}/workflow/delete/active_tables/${tableId}/records/${recordId}`,
        method: 'POST',
        data: {},
      });

      return response;
    },
    onSuccess: () => {
      // Invalidate queries to refetch records
      queryClient.invalidateQueries({
        queryKey: ['active-tables', workspaceId, tableId, 'records'],
      });

      // Simple success notification (can be enhanced with toast later)
      console.log('Record deleted successfully');

      onSuccess?.();
    },
    onError: (error: Error) => {
      // Simple error notification (can be enhanced with toast later)
      console.error('Failed to delete record:', error.message);
      alert(error.message || 'Không thể xóa bản ghi');
    },
  });

  /**
   * Show confirmation dialog and delete record if confirmed
   */
  const deleteRecord = (recordId: string) => {
    // Use native confirm for now - can be replaced with custom dialog component
    const confirmed = window.confirm('Bạn có chắc chắn muốn xóa bản ghi này?');

    if (confirmed) {
      deleteMutation.mutate(recordId);
    }
  };

  return {
    deleteRecord,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
  };
}
