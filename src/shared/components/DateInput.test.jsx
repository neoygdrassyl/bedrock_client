import { createRef } from 'react';
import { act, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DateInput, formatDateInputValue } from './DateInput';

const parts = (container) => ({
  input: container.querySelector('input'),
  display: container.querySelector('[aria-hidden="true"]'),
  wrapper: container.firstElementChild,
});

afterEach(() => {
  vi.useRealTimers();
});

describe('formatDateInputValue', () => {
  it('turns an ISO date into dd/mm/yyyy', () => {
    expect(formatDateInputValue('2026-11-11')).toBe('11/11/2026');
    expect(formatDateInputValue('2026-01-09')).toBe('09/01/2026');
  });

  it.each([null, undefined, '', '11/11/2026', '2026-11-11T10:00:00', '2026-1-9', 'abc', 0])('returns an empty text for %j', (value) => {
    expect(formatDateInputValue(value)).toBe('');
  });
});

describe('DateInput', () => {
  it('keeps the native ISO value while drawing it as dd/mm/yyyy', () => {
    const { container } = render(<DateInput id="fecha" name="fecha" defaultValue="2026-07-24" className="form-control" />);
    const { input, display, wrapper } = parts(container);

    expect(input).toHaveAttribute('type', 'date');
    expect(input).toHaveAttribute('id', 'fecha');
    expect(input).toHaveAttribute('name', 'fecha');
    expect(input).toHaveClass('form-control');
    expect(input.value).toBe('2026-07-24');
    expect(display).toHaveTextContent('24/07/2026');
    expect(wrapper).not.toHaveAttribute('data-empty');
  });

  it('shows the dd/mm/aaaa hint and flags the field as empty without a value', () => {
    const { container } = render(<DateInput defaultValue="" />);
    const { input, display, wrapper } = parts(container);

    expect(input.value).toBe('');
    expect(display).toHaveTextContent('dd/mm/aaaa');
    expect(wrapper).toHaveAttribute('data-empty', 'true');
  });

  it('follows what the user picks and reports the ISO value to onChange', () => {
    const onChange = vi.fn();
    const { container } = render(<DateInput defaultValue="2026-07-24" onChange={onChange} />);
    const { input, display, wrapper } = parts(container);

    fireEvent.change(input, { target: { value: '2026-12-01' } });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].target.value).toBe('2026-12-01');
    expect(display).toHaveTextContent('01/12/2026');

    fireEvent.change(input, { target: { value: '' } });

    expect(display).toHaveTextContent('dd/mm/aaaa');
    expect(wrapper).toHaveAttribute('data-empty', 'true');
  });

  it('follows a controlled value', () => {
    const { container, rerender } = render(<DateInput value="2026-07-24" onChange={() => {}} />);
    expect(parts(container).display).toHaveTextContent('24/07/2026');

    rerender(<DateInput value="2026-08-02" onChange={() => {}} />);

    expect(parts(container).input.value).toBe('2026-08-02');
    expect(parts(container).display).toHaveTextContent('02/08/2026');
  });

  it('picks up a value written imperatively by a legacy form (no event fired)', () => {
    vi.useFakeTimers();
    const { container } = render(<DateInput id="legacy-date" defaultValue="" />);
    const { display } = parts(container);

    document.getElementById('legacy-date').value = '2026-03-15';
    expect(display).toHaveTextContent('dd/mm/aaaa');

    act(() => { vi.advanceTimersByTime(600); });

    expect(display).toHaveTextContent('15/03/2026');
  });

  it('goes back to the default text when its form is reset', () => {
    vi.useFakeTimers();
    const { container } = render(<form><DateInput defaultValue="2026-07-24" /></form>);
    const { input, display } = parts(container);

    fireEvent.change(input, { target: { value: '2026-12-01' } });
    expect(display).toHaveTextContent('01/12/2026');

    act(() => {
      container.querySelector('form').reset();
      vi.advanceTimersByTime(600);
    });

    expect(input.value).toBe('2026-07-24');
    expect(display).toHaveTextContent('24/07/2026');
  });

  it('hands the native input to object and callback refs', () => {
    const objectRef = createRef();
    const callbackRef = vi.fn();
    const first = render(<DateInput ref={objectRef} defaultValue="2026-07-24" />);
    expect(objectRef.current).toBe(parts(first.container).input);

    const second = render(<DateInput ref={callbackRef} />);
    expect(callbackRef).toHaveBeenCalledWith(parts(second.container).input);
  });

  it('stops polling after unmount', () => {
    vi.useFakeTimers();
    const { unmount } = render(<DateInput defaultValue="2026-07-24" />);
    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });
});
