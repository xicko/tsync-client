import {
  getDenylistList,
  createDenylistItem,
  deleteDenylistItem,
} from '@/features/NotificationsSync/controller/notificationsSyncController';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useDenylistList() {
  return useInfiniteQuery({
    queryKey: ['notifications-sync-deny-list'],
    queryFn: async ({ pageParam }) => {
      const data = await getDenylistList({
        limit: 10,
        page: pageParam,
      });

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
}

export function useCreateDenylistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDenylistItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-sync-deny-list'] });
    },
  });
}

export function useDeleteDenylistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDenylistItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-sync-deny-list'] });
    },
  });
}
