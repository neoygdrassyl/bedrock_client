import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import InternalChatPanel from './InternalChatPanel';

const { chatServiceMock } = vi.hoisted(() => ({
  chatServiceMock: {
    users: vi.fn(),
    inbox: vi.fn(),
    messages: vi.fn(),
    send: vi.fn(),
    markThreadRead: vi.fn(),
  },
}));

vi.mock('../api/chat.service', () => ({ default: chatServiceMock }));
vi.mock('@/shared/components/icon', () => ({ Icon: () => <span aria-hidden="true" /> }));

const USERS = [
  { id: 2, name: 'Ana', surname: 'Pérez', roleName: 'Abogada', active: true },
  { id: 3, name: 'Bruno', surname: 'Díaz', roleName: 'Arquitecto' }, // no flag: treated as active
  { id: 4, name: 'Carla', surname: 'Ruiz', active: false },
  { id: 5, name: 'Diego', surname: 'Mora', active: 0 },
  { name: 'Sin id' },
];

const INBOX = [
  // Thread with a deactivated user: must not appear.
  { user: { id: 4, name: 'Carla' }, unread: 7, lastMessage: { body: 'Hola desde inactiva', senderId: 4, createdAt: '2026-10-29T10:00:00Z' } },
  // Thread with a user who is no longer in the directory at all.
  { user: { id: 9, name: 'Eva' }, unread: 2, lastMessage: { body: 'Usuario retirado', senderId: 9, createdAt: '2026-10-29T11:00:00Z' } },
  { user: { id: 3, name: 'Bruno' }, unread: 3, lastMessage: { body: 'Revisa el expediente', senderId: 3, createdAt: '2026-10-29T09:00:00Z' } },
];

function conversationList() {
  return within(screen.getByRole('complementary', { name: 'Conversaciones' })).getByRole('list');
}

describe('InternalChatPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.user = { id: 1, name: 'Yo' };
    chatServiceMock.users.mockResolvedValue({ data: USERS });
    chatServiceMock.inbox.mockResolvedValue({ data: INBOX });
    chatServiceMock.messages.mockResolvedValue({ data: [] });
    chatServiceMock.markThreadRead.mockResolvedValue({});
    chatServiceMock.send.mockResolvedValue({});
  });

  afterEach(() => {
    window.user = null;
  });

  it('lists only active users from the directory', async () => {
    render(<InternalChatPanel />);

    expect(await screen.findByText('2 activos')).toBeInTheDocument();
    const list = conversationList();
    expect(within(list).getAllByRole('button')).toHaveLength(2);
    expect(within(list).getByText('Ana Pérez')).toBeInTheDocument();
    expect(within(list).getByText('Bruno Díaz')).toBeInTheDocument();
    expect(within(list).queryByText(/Carla|Diego|Sin id/)).not.toBeInTheDocument();
  });

  it('hides inbox threads with inactive or unknown users but keeps unread counts of active ones', async () => {
    render(<InternalChatPanel />);
    await screen.findByText('2 activos');

    expect(screen.queryByText('Hola desde inactiva')).not.toBeInTheDocument();
    expect(screen.queryByText('Usuario retirado')).not.toBeInTheDocument();
    expect(screen.queryByText('Eva')).not.toBeInTheDocument();

    // Unread conversations sort first and show their badge and last message.
    const [first, second] = within(conversationList()).getAllByRole('button');
    expect(first).toHaveTextContent('Bruno Díaz');
    expect(first).toHaveTextContent('Revisa el expediente');
    expect(first).toHaveTextContent('Sin leer: 3');
    expect(second).toHaveTextContent('Ana Pérez');
    expect(second).toHaveTextContent('Abogada');
  });

  it('opens the first conversation and marks it read', async () => {
    render(<InternalChatPanel />);

    expect(await screen.findByLabelText('Conversación con Bruno Díaz')).toBeInTheDocument();
    expect(within(conversationList()).getByRole('button', { name: /Bruno Díaz/ })).toHaveAttribute('aria-current', 'true');
    await waitFor(() => expect(chatServiceMock.messages).toHaveBeenCalledWith(3, { limit: 100 }));
    await waitFor(() => expect(chatServiceMock.markThreadRead).toHaveBeenCalledWith(3));
  });

  it('shows the empty state when no other user is active', async () => {
    chatServiceMock.users.mockResolvedValue({ data: [{ id: 4, name: 'Carla', active: false }] });

    render(<InternalChatPanel />);

    expect(await screen.findByText('No hay otros usuarios activos.')).toBeInTheDocument();
    expect(screen.getByText('0 activos')).toBeInTheDocument();
    expect(chatServiceMock.messages).not.toHaveBeenCalled();
  });

  it('filters conversations by name, role or last message', async () => {
    render(<InternalChatPanel />);
    await screen.findByText('2 activos');

    await userEvent.type(screen.getByRole('searchbox', { name: 'Buscar usuario o conversación' }), 'abog');

    const buttons = within(conversationList()).getAllByRole('button');
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveTextContent('Ana Pérez');
  });

  it('shows the directory error when the users request fails', async () => {
    chatServiceMock.users.mockRejectedValue({ response: { data: { message: 'Sin permiso' } } });

    render(<InternalChatPanel />);

    expect(await screen.findByText('Sin permiso')).toBeInTheDocument();
  });
});
