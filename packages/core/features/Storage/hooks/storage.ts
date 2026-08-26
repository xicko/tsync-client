import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteFile, getFilesList, uploadFile } from '../controller/storageController';
import { UploadFileInput } from '../types/upload-file-input';
import { useStorageDependencyStore } from '../store/storageDependencyStore';

export function useStorageFilesList(search?: string) {
  const query = useInfiniteQuery({
    queryKey: ['storage-files-list', search],
    queryFn: async ({ pageParam = 1 }) => {
      const data = await getFilesList(pageParam, 20, search);

      if (!data) return null;
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage?.pagination?.hasNext && typeof lastPage?.pagination?.page === 'number') {
        return lastPage.pagination.page + 1;
      }

      return undefined;
    },

    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,

    staleTime: 0,
    gcTime: 0,
  });

  return {
    ...query,
  };
}

export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fileInput: UploadFileInput) => {
      return await uploadFile(fileInput);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storage-files-list'] });
    },
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await deleteFile(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storage-files-list'] });
    },
  });
}
