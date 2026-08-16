import { createFileRoute } from '@tanstack/react-router';
import { MessageScreen } from '@shared/core';

export const Route = createFileRoute('/message')({
  component: MessageScreen,
});
