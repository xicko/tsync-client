import { createFileRoute } from '@tanstack/react-router';
import { SettingsScreen } from '@shared/core';

export const Route = createFileRoute('/settings')({
  component: SettingsScreen,
});
