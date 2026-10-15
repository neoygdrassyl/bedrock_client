import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Tag, TAG_TONES } from './Tag';

describe('Tag', () => {
    it('renders the neutral tone with the base class only', () => {
        render(<Tag>Requisito</Tag>);
        const tag = screen.getByText('Requisito');
        expect(tag).toHaveClass('d-tag');
        expect(tag).toHaveAttribute('data-tone', 'neutral');
        expect(tag.className).not.toMatch(/d-tag--(info|success|warning|danger|code)/);
    });

    it.each(TAG_TONES.filter((tone) => tone !== 'neutral'))('applies the %s tone class', (tone) => {
        render(<Tag tone={tone}>x</Tag>);
        expect(screen.getByText('x')).toHaveClass(`d-tag--${tone}`);
    });

    it('supports mono and pill modifiers and never uses the Bootstrap badge class', () => {
        render(<Tag mono pill>68001</Tag>);
        const tag = screen.getByText('68001');
        expect(tag).toHaveClass('d-tag--mono', 'd-tag--pill');
        expect(tag).not.toHaveClass('badge');
    });
});
