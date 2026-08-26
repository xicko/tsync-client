import { SheetRegister, SheetDefinition } from 'react-native-actions-sheet';
import DeviceControlSheet from '../../features/Devices/components/Sheets/DeviceControlSheet';
import { DeviceListItem, TailscaleDevice } from '@shared/types';
import DomainChangeSheet from './DomainChangeSheet';
import ShellDeviceSelectorSheet from './ShellDeviceSelectorSheet';
import SetAdbDeviceIdentifierSheet from '../../features/Devices/components/Sheets/SetAdbDeviceIdentifierSheet';
import SetWindowsMacAddressSheet from '../../features/Devices/components/Sheets/SetWindowsMacAddressSheet';
import IgnoreBatteryOptimizationsSheet from './IgnoreBatteryOptimizationsSheet';
import CronCreateSheet from '../../features/Cron/components/Sheets/CronCreateSheet';
import NotificationsSyncListFilterSheet from '../../features/NotificationsSync/components/Sheets/NotificationsSyncListFilterSheet';
import DenylistListSheet from '@/features/NotificationsSync/components/Sheets/DenylistListSheet';
import { NotificationsSyncDenylist } from '@/features/NotificationsSync/types/denylist.interface';
import DenylistCreationSheet from '@/features/NotificationsSync/components/Sheets/DenylistCreationSheet';
import AlertToggleSheet from '../../features/Settings/components/Sheets/AlertToggleSheet';
import AlertDenylistEditorSheet from '../../features/Settings/components/Sheets/AlertDenylistEditorSheet';
import InstalledAppsSheet from './InstalledAppsSheet';
import StorageFileActionsSheet from '../../features/Storage/components/Sheets/StorageFileActionsSheet';
import StorageFileUploadSheet from '../../features/Storage/components/Sheets/StorageFileUploadSheet';
import { StorageFile } from '@/features/Storage/types/storage-file.interface';

declare module 'react-native-actions-sheet' {
  interface Sheets {
    'cron-create-sheet': SheetDefinition<{
      payload: {};
    }>;

    'device-control-sheet': SheetDefinition<{
      payload: {
        device: DeviceListItem;
      };
    }>;

    'domain-change-sheet': SheetDefinition<{
      payload: {};
    }>;

    'shell-device-selector-sheet': SheetDefinition<{
      payload: {
        onSelect: (device: TailscaleDevice) => void;
        selectedDeviceId: string | undefined;
      };
    }>;

    'set-adb-device-identifier-sheet': SheetDefinition<{
      payload: {
        selectedDeviceId: string;
        onSelect: (device: string | null) => void;
      };
    }>;

    'set-windows-mac-address-sheet': SheetDefinition<{
      payload: {
        selectedDeviceId: string;
        onSelect: (macAddress: string | null) => void;
      };
    }>;

    'ignore-battery-optimizations-sheet': SheetDefinition<{
      payload: {};
    }>;

    'notifications-sync-list-filter-sheet': SheetDefinition<{
      payload: {};
    }>;

    'denylist-list-sheet': SheetDefinition<{
      payload: {};
    }>;

    'denylist-creation-sheet': SheetDefinition<{
      payload: {
        editData?: NotificationsSyncDenylist;
      };
    }>;

    'alert-toggle-sheet': SheetDefinition<{
      payload: {};
    }>;

    'alert-denylist-editor-sheet': SheetDefinition<{
      payload: {};
    }>;

    'installed-apps-sheet': SheetDefinition<{
      payload: {};
    }>;

    'storage-file-actions-sheet': SheetDefinition<{
      payload: {
        file: StorageFile;
      };
    }>;

    'storage-file-upload-sheet': SheetDefinition<{
      payload: {};
    }>;
  }
}

export const Sheets = () => {
  return (
    <SheetRegister
      sheets={{
        'cron-create-sheet': CronCreateSheet,
        'device-control-sheet': DeviceControlSheet,
        'domain-change-sheet': DomainChangeSheet,
        'shell-device-selector-sheet': ShellDeviceSelectorSheet,
        'set-adb-device-identifier-sheet': SetAdbDeviceIdentifierSheet,
        'set-windows-mac-address-sheet': SetWindowsMacAddressSheet,
        'ignore-battery-optimizations-sheet': IgnoreBatteryOptimizationsSheet,
        'notifications-sync-list-filter-sheet': NotificationsSyncListFilterSheet,
        'denylist-list-sheet': DenylistListSheet,
        'denylist-creation-sheet': DenylistCreationSheet,
        'alert-toggle-sheet': AlertToggleSheet,
        'alert-denylist-editor-sheet': AlertDenylistEditorSheet,
        'installed-apps-sheet': InstalledAppsSheet,
        'storage-file-actions-sheet': StorageFileActionsSheet,
        'storage-file-upload-sheet': StorageFileUploadSheet,
      }}
    />
  );
};
