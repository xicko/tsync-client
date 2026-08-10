import { createFileRoute } from '@tanstack/react-router';
import { DevicesListScreen } from '@shared/core';

export const Route = createFileRoute('/')({
  component: DevicesListScreen,
});
