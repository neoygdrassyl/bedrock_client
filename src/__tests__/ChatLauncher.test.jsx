import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { inboxMock } = vi.hoisted(() => ({
  inboxMock: vi.fn(),
}));

vi.mock('../features/messaging/api/chat.service', () => ({
  __esModule: true,
  default: {
    inbox: inboxMock,
  },
}));

vi.mock('../features/messaging/chat/InternalChatPanel', () => ({
  __esModule: true,
  default: () => <div data-testid="internal-chat-panel" />,
}));

vi.mock('@/shared/ui/button', () => ({
  Button: ({ children, ...props }) => <button type="button" {...props}>{children}</button>,
}));

vi.mock('@/shared/ui/badge', () => ({
  Badge: ({ children, ...props }) => <span {...props}>{children}</span>,
}));

vi.mock('@/shared/components/icon', () => ({
  Icon: () => <span aria-hidden="true" />,
}));

import ChatLauncher from '../features/messaging/chat/ChatLauncher';

describe('ChatLauncher', () => {
  it('no consulta el inbox hasta que el usuario abre el panel', async () => {
    const user = userEvent.setup();
    inboxMock.mockResolvedValue({ data: [] });

    render(<ChatLauncher />);

    expect(inboxMock).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /abrir chat interno/i }));

    expect(inboxMock).toHaveBeenCalledTimes(1);
    expect(await screen.findByTestId('internal-chat-panel')).toBeInTheDocument();
  });
});
