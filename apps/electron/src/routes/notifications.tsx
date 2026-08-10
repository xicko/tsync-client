import { createFileRoute } from '@tanstack/react-router';
import { NotificationsListScreen } from '@shared/core';

export const Route = createFileRoute('/notifications')({
  component: NotificationsListScreen,
});
