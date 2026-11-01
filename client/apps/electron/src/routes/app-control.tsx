import { createFileRoute } from '@tanstack/react-router';
import { AppControlScreen } from '@shared/core';

export const Route = createFileRoute('/app-control')({
  component: AppControlScreen,
});
