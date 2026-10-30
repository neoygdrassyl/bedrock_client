import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Search } from 'lucide-react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { ColumnFilterField } from './ColumnFilterField';

// jsdom does not implement pointer capture or scrollIntoView, both used by
// Radix Select when an item is selected — polyfill them so interaction
// tests below can actually open the popup and pick an option.
beforeAll(() => {
    if (!Element.prototype.hasPointerCapture) {
        Element.prototype.hasPointerCapture = () => false;
    }
    if (!Element.prototype.releasePointerCapture) {
        Element.prototype.releasePointerCapture = () => {};
    }
    if (!Element.prototype.scrollIntoView) {
        Element.prototype.scrollIntoView = () => {};
    }
});

describe('ColumnFilterField — text variant', () => {
    it('renders the current value and forwards changes', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<ColumnFilterField type="text" value="cert" placeholder="Buscar..." onChange={onChange} />);

        const input = screen.getByTestId('column-filter-input');
        expect(input).toHaveValue('cert');

        await user.type(input, 'i');
        expect(onChange).toHaveBeenLastCalledWith('certi');
    });

    it('renders a leading icon when provided', () => {
        render(<ColumnFilterField type="text" icon={Search} placeholder="Buscar..." />);

        expect(document.querySelector('svg')).toBeInTheDocument();
    });
});

describe('ColumnFilterField — select variant', () => {
    it('shows the placeholder when no value is selected', () => {
        render(<ColumnFilterField
            type="select"
            value=""
            placeholder="Todos"
            options={[{ value: 'physical', label: 'Físico' }, { value: 'digital', label: 'Digital' }]}
        />);

        expect(screen.getByRole('combobox')).toHaveTextContent('Todos');
    });

    it('maps the sentinel "all" option back to an empty string', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<ColumnFilterField
            type="select"
            value="physical"
            allLabel="Todos"
            options={[{ value: 'physical', label: 'Físico' }, { value: 'digital', label: 'Digital', count: 3 }]}
            onChange={onChange}
        />);

        await user.click(screen.getByRole('combobox'));
        await user.click(await screen.findByRole('option', { name: 'Todos' }));

        expect(onChange).toHaveBeenCalledWith('');
    });

    it('forwards the selected option value and renders counts', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<ColumnFilterField
            type="select"
            value=""
            allLabel="Todos"
            options={[{ value: 'digital', label: 'Digital', count: 3 }]}
            onChange={onChange}
        />);

        await user.click(screen.getByRole('combobox'));
        expect(await screen.findByRole('option', { name: 'Digital (3)' })).toBeInTheDocument();

        await user.click(screen.getByRole('option', { name: 'Digital (3)' }));
        expect(onChange).toHaveBeenCalledWith('digital');
    });
});
