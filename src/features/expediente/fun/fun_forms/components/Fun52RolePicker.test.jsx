import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Fun52RolePicker from './Fun52RolePicker';

const ELIGIBILITY = {
  registryId: 9,
  generalMonths: 120,
  roles: [
    { roleCode: 'ARQ_PROY', label: 'ARQUITECTO PROYECTISTA', requiredYears: 2, specificMonths: 40, specificSource: 'manual', specificExceedsGeneral: false, status: 'CUMPLE', selectable: true },
    { roleCode: 'DIR_CONSTR', label: 'DIRECTOR DE LA CONSTRUCCION', requiredYears: 3, specificMonths: 13, specificSource: 'expediente', specificExceedsGeneral: false, status: 'NO_CUMPLE', selectable: false },
    { roleCode: 'GEOTEC', label: 'INGENIERO CIVIL GEOTECNISTA', requiredYears: 2, specificMonths: null, specificSource: null, specificExceedsGeneral: false, status: 'SIN_REGISTRO', selectable: true },
    { roleCode: 'OTROS_ESP', label: 'OTROS PROFESIONALES ESPECIALISTAS', requiredYears: null, specificMonths: null, specificSource: null, specificExceedsGeneral: false, status: 'NO_EXIGE', selectable: true },
  ],
};

const renderPicker = (props = {}) => {
  const onSubmit = vi.fn();
  render(<Fun52RolePicker eligibility={ELIGIBILITY} busy={false} onSubmit={onSubmit} {...props} />);
  return { onSubmit, user: userEvent.setup() };
};
const row = (label) => screen.getByRole('row', { name: new RegExp(label) });
const submitButton = () => screen.getByRole('button', { name: /AÑADIR ROLES SELECCIONADOS/ });

describe('Fun52RolePicker', () => {
  it('shows every role with its required years, registered experience, origin and status', () => {
    renderPicker();
    expect(within(row('ARQUITECTO PROYECTISTA')).getByText('2 años')).toBeInTheDocument();
    expect(within(row('ARQUITECTO PROYECTISTA')).getByText('3 años 4 meses')).toBeInTheDocument();
    expect(within(row('ARQUITECTO PROYECTISTA')).getByText('Registrada en BD Profesionales')).toBeInTheDocument();
    expect(within(row('ARQUITECTO PROYECTISTA')).getByText('Cumple')).toBeInTheDocument();
    expect(within(row('OTROS PROFESIONALES')).getByText('No exige')).toBeInTheDocument();
    expect(within(row('INGENIERO CIVIL GEOTECNISTA')).getAllByText('Sin registro')).toHaveLength(2);
    expect(submitButton()).toHaveTextContent('AÑADIR ROLES SELECCIONADOS (0)');
    expect(submitButton()).toBeDisabled();
  });

  it('lets a NO_CUMPLE role be ticked and warns that the legal review will reject it', async () => {
    const { onSubmit, user } = renderPicker();
    const checkbox = screen.getByRole('checkbox', { name: 'DIRECTOR DE LA CONSTRUCCION' });
    expect(checkbox).toBeEnabled();
    await user.click(checkbox);
    expect(checkbox).toHaveAccessibleDescription(
      'La experiencia específica (1 año 1 mes) no alcanza los 3 años que exige el rol. '
      + 'Se puede añadir; la revisión jurídica lo marcará como RECHAZADO.',
    );
    await user.click(submitButton());
    expect(onSubmit).toHaveBeenCalledWith([{ role: 'DIRECTOR DE LA CONSTRUCCION', expirience: 13 }]);
  });

  it('requires 5.2.9 for a SIN_REGISTRO role before submitting', async () => {
    const { onSubmit, user } = renderPicker();
    await user.click(screen.getByRole('checkbox', { name: 'INGENIERO CIVIL GEOTECNISTA' }));
    expect(submitButton()).toHaveTextContent('(1)');
    await user.click(submitButton());

    expect(screen.getByRole('alert')).toHaveTextContent('Revise la experiencia específica de: INGENIERO CIVIL GEOTECNISTA.');
    expect(within(row('INGENIERO CIVIL GEOTECNISTA')).getByText(/Indique la experiencia específica/)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('recomputes the status live while 5.2.9 is typed', async () => {
    const { onSubmit, user } = renderPicker();
    await user.click(screen.getByRole('checkbox', { name: 'INGENIERO CIVIL GEOTECNISTA' }));
    const years = screen.getByRole('textbox', { name: 'Años de experiencia específica en INGENIERO CIVIL GEOTECNISTA' });

    await user.type(years, '1');
    expect(within(row('INGENIERO CIVIL GEOTECNISTA')).getByText('No cumple')).toBeInTheDocument();
    expect(within(row('INGENIERO CIVIL GEOTECNISTA')).getByText(/no alcanza los 2 años/)).toBeInTheDocument();
    await user.click(submitButton());
    expect(onSubmit).toHaveBeenCalledWith([{ role: 'INGENIERO CIVIL GEOTECNISTA', expirience: 12 }]);

    await user.clear(years);
    await user.type(years, '2');
    expect(within(row('INGENIERO CIVIL GEOTECNISTA')).getByText('Cumple')).toBeInTheDocument();
  });

  it('submits the ticked roles with the pre-filled and the typed 5.2.9 in months', async () => {
    const { onSubmit, user } = renderPicker();
    await user.click(screen.getByRole('checkbox', { name: 'ARQUITECTO PROYECTISTA' }));
    expect(screen.getByRole('textbox', { name: 'Años de experiencia específica en ARQUITECTO PROYECTISTA' })).toHaveValue('3');
    await user.click(screen.getByRole('checkbox', { name: 'INGENIERO CIVIL GEOTECNISTA' }));
    await user.type(screen.getByRole('textbox', { name: 'Años de experiencia específica en INGENIERO CIVIL GEOTECNISTA' }), '2');
    await user.type(screen.getByRole('textbox', { name: 'Meses de experiencia específica en INGENIERO CIVIL GEOTECNISTA' }), '6');
    await user.click(screen.getByRole('checkbox', { name: 'OTROS PROFESIONALES ESPECIALISTAS' }));
    await user.click(submitButton());

    expect(onSubmit).toHaveBeenCalledWith([
      { role: 'ARQUITECTO PROYECTISTA', expirience: 40 },
      { role: 'INGENIERO CIVIL GEOTECNISTA', expirience: 30 },
      { role: 'OTROS PROFESIONALES ESPECIALISTAS', expirience: null },
    ]);
  });

  it('refuses a 5.2.9 above the general experience', async () => {
    const { onSubmit, user } = renderPicker({ eligibility: { ...ELIGIBILITY, generalMonths: 24 } });
    await user.click(screen.getByRole('checkbox', { name: 'ARQUITECTO PROYECTISTA' }));
    expect(within(row('ARQUITECTO PROYECTISTA')).getByText(/no puede superar la experiencia general \(2 años\)/)).toBeInTheDocument();
    await user.click(submitButton());
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('locks the choices while busy', () => {
    renderPicker({ busy: true });
    expect(screen.getByRole('checkbox', { name: 'ARQUITECTO PROYECTISTA' })).toBeDisabled();
    expect(submitButton()).toBeDisabled();
  });

  describe('5.2.9 from the certified experiences of BD PROFESIONALES', () => {
    const CERTIFIED = {
      registryId: 9,
      generalMonths: 120,
      roles: [
        { roleCode: 'GEOTEC', label: 'INGENIERO CIVIL GEOTECNISTA', requiredYears: 5, specificMonths: 78, specificSource: 'certificados', specificExperience: { years: 6, months: 6, days: 15 }, certificateCount: 3, specificExceedsGeneral: false, status: 'CUMPLE', selectable: true },
        { roleCode: 'ING_ESTR', label: 'INGENIERO CIVIL DISEÑADOR ESTRUCTURAL', requiredYears: 5, specificMonths: null, specificSource: null, specificExperience: null, certificateCount: 0, specificExceedsGeneral: false, status: 'SIN_REGISTRO', selectable: true },
      ],
    };
    const yearsBox = (label) => screen.getByRole('textbox', { name: `Años de experiencia específica en ${label}` });
    const monthsBox = (label) => screen.getByRole('textbox', { name: `Meses de experiencia específica en ${label}` });

    it('fills 5.2.9 with the certified sum, read only, and says where it comes from', async () => {
      const { onSubmit, user } = renderPicker({ eligibility: CERTIFIED });
      expect(within(row('INGENIERO CIVIL GEOTECNISTA')).getByText('Según 3 certificaciones')).toBeInTheDocument();
      await user.click(screen.getByRole('checkbox', { name: 'INGENIERO CIVIL GEOTECNISTA' }));

      expect([yearsBox('INGENIERO CIVIL GEOTECNISTA').value, monthsBox('INGENIERO CIVIL GEOTECNISTA').value]).toEqual(['6', '6']);
      expect(yearsBox('INGENIERO CIVIL GEOTECNISTA')).toHaveAttribute('readonly');
      expect(monthsBox('INGENIERO CIVIL GEOTECNISTA')).toHaveAttribute('readonly');
      expect(screen.getByTestId('f_529_source_GEOTEC')).toHaveTextContent('Tomada de BD Profesionales (3 certificaciones).');
      await user.type(yearsBox('INGENIERO CIVIL GEOTECNISTA'), '9');
      expect(yearsBox('INGENIERO CIVIL GEOTECNISTA').value).toBe('6');

      await user.click(submitButton());
      expect(onSubmit).toHaveBeenCalledWith([{ role: 'INGENIERO CIVIL GEOTECNISTA', expirience: 78 }]);
    });

    it('keeps 5.2.9 typed for a role without certificates and says it does not go to BD PROFESIONALES', async () => {
      const { onSubmit, user } = renderPicker({ eligibility: CERTIFIED });
      await user.click(screen.getByRole('checkbox', { name: 'INGENIERO CIVIL DISEÑADOR ESTRUCTURAL' }));

      expect(yearsBox('INGENIERO CIVIL DISEÑADOR ESTRUCTURAL')).not.toHaveAttribute('readonly');
      expect(screen.getByTestId('f_529_source_ING_ESTR')).toHaveTextContent('solo se usa para continuar la radicación; no se registra en BD Profesionales');
      await user.type(yearsBox('INGENIERO CIVIL DISEÑADOR ESTRUCTURAL'), '5');
      await user.click(submitButton());
      expect(onSubmit).toHaveBeenCalledWith([{ role: 'INGENIERO CIVIL DISEÑADOR ESTRUCTURAL', expirience: 60 }]);
    });

    it('a value from an older server (manual or expediente) stays editable as before', async () => {
      const { user } = renderPicker();
      await user.click(screen.getByRole('checkbox', { name: 'ARQUITECTO PROYECTISTA' }));
      expect(yearsBox('ARQUITECTO PROYECTISTA')).not.toHaveAttribute('readonly');
      expect(yearsBox('ARQUITECTO PROYECTISTA').value).toBe('3');
    });
  });
});
