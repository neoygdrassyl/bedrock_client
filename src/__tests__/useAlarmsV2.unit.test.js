import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

vi.mock('../app/services/alarm.service', () => {
  const mock = {
    list: vi.fn(),
    bell: vi.fn(),
    markRead: vi.fn(),
    archive: vi.fn(),
    attend: vi.fn(),
    hide: vi.fn(),
    refresh: vi.fn(),
  };
  return { default: mock };
});

import AlarmService from '../app/services/alarm.service';
import { useAlarmsV2, useAlarmsBell } from '../app/pages/user/fun_forms/hooks/useAlarmsV2';

describe('useAlarmsV2', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    AlarmService.list.mockResolvedValue({ data: { data: [] } });
    AlarmService.bell.mockResolvedValue({ data: { data: [], unread: 0 } });
  });

  it('pasa filtros level/actor/action al service', async () => {
    const { result } = renderHook(() =>
      useAlarmsV2({ level: 2, actor: 'CUR', action: 'show_alarm', phaseCode: 'EST' })
    );
    await waitFor(() => expect(AlarmService.list).toHaveBeenCalled());
    const args = AlarmService.list.mock.calls[0][0];
    expect(args.level).toBe(2);
    expect(args.actor).toBe('CUR');
    expect(args.action).toBe('show_alarm');
    expect(args.phaseCode).toBe('EST');
    expect(result.current.alarms).toEqual([]);
  });

  it('expone refetch y attend/hide/markRead/archive', async () => {
    AlarmService.attend.mockResolvedValue({});
    const { result } = renderHook(() => useAlarmsV2());
    await waitFor(() => expect(AlarmService.list).toHaveBeenCalled());
    await act(async () => { await result.current.attend(42); });
    expect(AlarmService.attend).toHaveBeenCalledWith(42);
  });
});

describe('useAlarmsBell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calcula unread desde respuesta bell', async () => {
    AlarmService.bell.mockResolvedValue({
      data: { data: [{ id: 1, readAt: null }, { id: 2, readAt: '2024-01-01' }], unread: 1 },
    });
    const { result } = renderHook(() => useAlarmsBell({ pollMs: 0 }));
    await waitFor(() => expect(result.current.alarms.length).toBe(2));
    expect(result.current.unread).toBe(1);
  });
});
