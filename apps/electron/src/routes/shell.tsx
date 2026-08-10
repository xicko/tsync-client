import { createFileRoute } from '@tanstack/react-router';
import { ShellScreen } from '@shared/core';

export const Route = createFileRoute('/shell')({
  component: ShellScreen,
});
