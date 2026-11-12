import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TooltipProvider } from '@/shared/ui/tooltip';
import { ExpedienteBinnacleLauncher } from './ExpedienteBinnacleLauncher';

function renderLauncher(props) {
  return render(
    <TooltipProvider>
      <ExpedienteBinnacleLauncher subtitle="68001-1-26-0231" onToggle={vi.fn()} onDock={vi.fn()} {...props}>
        <p>Contenido de bitácoras</p>
      </ExpedienteBinnacleLauncher>
    </TooltipProvider>
  );
}

describe('ExpedienteBinnacleLauncher', () => {
  it('shows only the round launcher while closed', async () => {
    const onToggle = vi.fn();
    renderLauncher({ open: false, onToggle });
    expect(screen.queryByRole('dialog', { name: 'Bitácoras del expediente' })).not.toBeInTheDocument();
    const launcher = screen.getByRole('button', { name: 'Abrir bitácoras' });
    expect(launcher).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(launcher);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('opens a floating window with the binnacles that can be docked or closed', async () => {
    const onToggle = vi.fn();
    const onDock = vi.fn();
    renderLauncher({ open: true, onToggle, onDock });
    const windowNode = screen.getByRole('dialog', { name: 'Bitácoras del expediente' });
    expect(windowNode).toHaveTextContent('Bitácoras profesionales');
    expect(windowNode).toHaveTextContent('68001-1-26-0231');
    expect(windowNode).toHaveTextContent('Contenido de bitácoras');
    await userEvent.click(screen.getByRole('button', { name: 'Acoplar bitácoras al costado' }));
    expect(onDock).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getAllByRole('button', { name: 'Cerrar bitácoras' })[0]);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('hides the launcher while the binnacles are docked in the side column', () => {
    renderLauncher({ open: false, hideLauncher: true });
    expect(screen.queryByTestId('binnacle-launcher')).not.toBeInTheDocument();
  });
});
