import { createFileRoute } from '@tanstack/react-router';
import { DeviceInfoScreen } from '@shared/core';

export const Route = createFileRoute('/device-info')({
  component: DeviceInfoScreen,
});
