import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCrons,
  toggleCronState,
  triggerCronJob,
  createCronJobConfig,
  deleteCronJobConfig,
  reinitCronsSystem,
} from '@/features/Cron/controller/cronController';

export function useCrons() {
  return useQuery({
    queryKey: ['crons'],
    queryFn: getCrons,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
}

export function useToggleCron() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleCronState,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crons'] });
    },
  });
}

export function useTriggerCron() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: triggerCronJob,
    onSuccess: () => {
      // Update a few seconds later to get the log
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['crons'] });
      }, 2000);
    },
  });
}

export function useCreateCron() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCronJobConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crons'] });
    },
  });
}

export function useDeleteCron() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCronJobConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crons'] });
    },
  });
}

export function useReinitCrons() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reinitCronsSystem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crons'] });
    },
  });
}
