import { createFileRoute } from '@tanstack/react-router';
import { StorageScreen } from '@shared/core';

export const Route = createFileRoute('/storage')({
  component: StorageScreen,
});
