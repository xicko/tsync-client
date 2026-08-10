import { TailscaleDevice } from '@shared/types';

export interface MessageType {
  id: string;
  message: string;
  timestamp: number;
  tailscaleDeviceData: Partial<TailscaleDevice>;
}
