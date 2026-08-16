import { createFileRoute } from '@tanstack/react-router';
import { CronsScreen } from '@shared/core';

export const Route = createFileRoute('/crons')({
  component: CronsScreen,
});
