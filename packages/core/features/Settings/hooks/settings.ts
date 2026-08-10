import { getAlertSettings, saveAlertSettings } from '@/features/Settings/controller/settingsController';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useAlertSettings() {
  return useQuery({
    queryKey: ['alert-settings'],
    queryFn: async () => {
      const data = await getAlertSettings();
      if (!data) return null;
      return data;
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
}

export function useSaveAlertSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveAlertSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-settings'] });
    },
  });
}
