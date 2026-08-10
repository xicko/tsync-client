export type NotificationsSyncDenylistType = 'text' | 'packageIdentifier';

export interface NotificationsSyncDenylist {
  _id: string;
  type: NotificationsSyncDenylistType;
  tailscaleId?: string;
  text?: string;
  packageIdentifier?: string;
  createdAt: string;
  updatedAt: string;
}
