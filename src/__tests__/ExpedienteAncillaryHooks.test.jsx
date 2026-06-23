import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

const { alarmListMock, bookmarkListMock } = vi.hoisted(() => ({
  alarmListMock: vi.fn(),
  bookmarkListMock: vi.fn(),
}));

vi.mock('../app/services/alarm.service', () => ({
  __esModule: true,
  default: {
    list: alarmListMock,
    attend: vi.fn(),
    hide: vi.fn(),
  },
}));

vi.mock('../app/services/bookmark.service', () => ({
  __esModule: true,
  default: {
    list: bookmarkListMock,
    create: vi.fn(),
    remove: vi.fn(),
  },
}));

import { useAlarms } from '../app/pages/user/fun_forms/hooks/useAlarms';
import { useBookmarks } from '../app/pages/user/fun_forms/hooks/useBookmarks';

describe('expediente ancillary hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    alarmListMock.mockResolvedValue({ data: { data: [] } });
    bookmarkListMock.mockResolvedValue({ data: { data: [] } });
  });

  it('permite desactivar la carga eager de alarmas', async () => {
    renderHook(() => useAlarms({ enabled: false }));
    await Promise.resolve();
    expect(alarmListMock).not.toHaveBeenCalled();
  });

  it('permite desactivar la carga eager de bookmarks', async () => {
    renderHook(() => useBookmarks({ enabled: false }));
    await Promise.resolve();
    expect(bookmarkListMock).not.toHaveBeenCalled();
  });

  it('mantiene la carga normal cuando el hook queda habilitado', async () => {
    renderHook(() => useBookmarks());
    await waitFor(() => expect(bookmarkListMock).toHaveBeenCalledTimes(1));
  });
});
