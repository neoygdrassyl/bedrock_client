import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import ProfessionalVerificationGrid, { getExperienceStatus, getProfessionalQualityStatus, getProfessionalActiveStatus, getProfessionalActionRecognitionStatus } from '../app/pages/user/records/law/ProfessionalVerificationGrid';
import { getRequiredExperienceYears } from '../app/pages/user/records/law/professionalResponsibility.constants';

const professional = {
  id: 52,
  role: 'ARQUITECTO PROYECTISTA',
  name: 'JUAN FELIPE',
  surname: 'RESTREPO ORTIZ',
  id_number: '80.425.636',
  number: '3163961378',
  email: 'juan@example.com',
  registration: '25700-57918',
  registration_date: '1995-12-07',
  registration_validity: true,
  expirience: 360,
  required_experience: 144,
  postgraduate: 2,
  signature_original_fun: true,
  signature_matches_plans: false,
};

describe('ProfessionalVerificationGrid', () => {
  test('renders the approved grouped columns without persisting pending values', () => {
    const onEdit = vi.fn();
    render(<ProfessionalVerificationGrid professionals={[professional]} onEdit={onEdit} />);

    expect(screen.getByRole('columnheader', { name: 'Certificado vigencia' })).toHaveAttribute('colspan', '4');
    expect(screen.getByRole('columnheader', { name: 'Experiencia' })).toHaveAttribute('colspan', '4');
    expect(screen.getByRole('columnheader', { name: 'Se reconoce la calidad' })).toHaveAttribute('rowspan', '2');
    expect(screen.getByRole('columnheader', { name: 'Firmas' })).toHaveAttribute('colspan', '3');
    expect(screen.getAllByRole('columnheader', { name: 'Estado' }).find(header => header.getAttribute('rowspan') === '2')).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Acción' })).toHaveAttribute('rowspan', '2');
    expect(screen.getByRole('columnheader', { name: 'Se reconoce para la actuación' })).toBeTruthy();
    screen.getAllByRole('columnheader').forEach(header => expect(header).toHaveClass('border-slate-400'));
    expect(screen.getAllByText('Sin registro')).toHaveLength(2);
    expect(screen.getAllByText('Pendiente')).toHaveLength(2);
    expect(screen.getByText('30 año(s)')).toBeTruthy();
    expect(screen.getByText('No requiere experiencia')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Editar JUAN FELIPE RESTREPO ORTIZ' }));
    expect(onEdit).toHaveBeenCalledWith(professional);
  });

  test('renders an empty state across the full grid', () => {
    render(<ProfessionalVerificationGrid professionals={[]} onEdit={vi.fn()} />);

    expect(screen.getByText('No hay profesionales registrados. Añada un profesional para comenzar.')).toHaveAttribute('colspan', '21');
  });

  test('renders the registered validity certificate ID and date', () => {
    render(<ProfessionalVerificationGrid professionals={[{
      ...professional,
      registration_certificate_id: 'CPN-2026-123',
      registration_certificate_date: '2026-08-24',
    }]} onEdit={vi.fn()} />);

    expect(screen.getByText('CPN-2026-123')).toBeTruthy();
    expect(screen.getByText('2026-08-24')).toBeTruthy();
  });

  test('derives certificate validity from six calendar months and the legal filing date', () => {
    render(<ProfessionalVerificationGrid legalFilingDate="2026-02-28" professionals={[
      { ...professional, id: 1, role: 'VIGENCIA EXACTA', registration_certificate_date: '2025-08-31' },
      { ...professional, id: 2, role: 'VIGENCIA VENCIDA', registration_certificate_date: '2025-08-27' },
      { ...professional, id: 3, role: 'SIN CERTIFICADO', registration_certificate_date: '' },
      { ...professional, id: 4, role: 'CERTIFICADO INVÁLIDO', registration_certificate_date: 'fecha inválida' },
    ]} onEdit={vi.fn()} />);

    expect(screen.getByText('VIGENCIA EXACTA').closest('tr').cells[9]).toHaveTextContent('Sí');
    expect(screen.getByText('VIGENCIA VENCIDA').closest('tr').cells[9]).toHaveTextContent('No');
    expect(screen.getByText('SIN CERTIFICADO').closest('tr').cells[9]).toHaveTextContent('Pendiente');
    expect(screen.getByText('CERTIFICADO INVÁLIDO').closest('tr').cells[9]).toHaveTextContent('Pendiente');
  });

  test('shows Pending for an unknown persisted certificate status', () => {
    render(<ProfessionalVerificationGrid professionals={[
      { ...professional, registration_certificate_status: 'DESCONOCIDO' },
    ]} onEdit={vi.fn()} />);

    expect(screen.getByText(professional.role).closest('tr').cells[10]).toHaveTextContent('Pendiente');
  });

  test('shows the configured legal minimum for each role instead of the stored requirement', () => {
    render(<ProfessionalVerificationGrid professionals={[
      { ...professional, id: 1, role: 'DIRECTOR DE LA CONSTRUCCION', required_experience: 0 },
      { ...professional, id: 2, role: 'INGENIERO CIVIL DISEÑADOR ESTRUCTURAL', required_experience: 0 },
      { ...professional, id: 3, role: 'ARQUITECTO PROYECTISTA', required_experience: 120 },
      { ...professional, id: 4, role: 'CARGO NO CONFIGURADO', required_experience: 120 },
    ]} onEdit={vi.fn()} />);

    expect(screen.getByText('3 año(s)')).toBeTruthy();
    expect(screen.getByText('5 año(s)')).toBeTruthy();
    expect(screen.getByText('No requiere experiencia')).toBeTruthy();
    expect(screen.getByText('Sin regla configurada')).toBeTruthy();
  });

  test('normalizes every configured role requirement', () => {
    [
      ['URBANIZADOR/PARCELADOR', null],
      ['URBANIZADOR O CONSTRUCTOR RESPONSABLE', null],
      ['DIRECTOR DE LA CONSTRUCCION', 3],
      ['ARQUITECTO PROYECTISTA', null],
      ['INGENIERO CIVIL DISEÑADOR ESTRUCTURAL', 5],
      ['DISEÑADOR DE ELEMENTOS NO ESTRUCTURALES', 3],
      ['INGENIERO CIVIL GEOTECNISTA', 5],
      ['INGENIERO TOPOGRAFO Y/O TOPOGRAFO', null],
      ['REVISOR INDEPENDIENTE DE LOS DISENOS ESTRUCTURALES', 5],
      ['OTROS PROFESIONALES ESPECIALISTAS', null],
      ['ARQUITECTO PROYECTISTA, INGENIERO CIVIL DISEÑADOR ESTRUCTURAL', 5],
    ].forEach(([role, requiredYears]) => expect(getRequiredExperienceYears(role)).toBe(requiredYears));
  });

  test('accepts experience through postgraduate or the required accredited months', () => {
    expect(getExperienceStatus({ role: 'DIRECTOR DE LA CONSTRUCCION', postgraduate_applicable: true, expirience: 0 })).toBe('ACEPTADO');
    expect(getExperienceStatus({ role: 'DIRECTOR DE LA CONSTRUCCION', postgraduate_applicable: false, expirience: 36 })).toBe('ACEPTADO');
    expect(getExperienceStatus({ role: 'DIRECTOR DE LA CONSTRUCCION', postgraduate_applicable: false, expirience: 35 })).toBe('RECHAZADO');
    expect(getExperienceStatus({ role: 'URBANIZADOR/PARCELADOR', postgraduate_applicable: false, expirience: 0 })).toBe('ACEPTADO');
    expect(getExperienceStatus({ role: 'DIRECTOR DE LA CONSTRUCCION', postgraduate_applicable: false, expirience: 'inválida' })).toBe('RECHAZADO');
  });

  test('recognizes professional quality only with an enabled certificate and accepted experience', () => {
    expect(getProfessionalQualityStatus({ registration_certificate_status: 'HABILITADO', postgraduate_applicable: true })).toBe('SI');
    expect(getProfessionalQualityStatus({ registration_certificate_status: 'INHABILITADO', postgraduate_applicable: true })).toBe('NO');
    expect(getProfessionalQualityStatus({ registration_certificate_status: 'HABILITADO', postgraduate_applicable: false, role: 'DIRECTOR DE LA CONSTRUCCION', expirience: 0 })).toBe('NO');
    expect(getProfessionalQualityStatus({ registration_certificate_status: 'DESCONOCIDO', postgraduate_applicable: true })).toBe('NO');
  });

  test('derives the independent professional status from the API active value', () => {
    expect(getProfessionalActiveStatus({ active: true })).toBe('ACTIVO');
    expect(getProfessionalActiveStatus({ active: '1' })).toBe('ACTIVO');
    expect(getProfessionalActiveStatus({ active: 0 })).toBe('INACTIVO');
    expect(getProfessionalActiveStatus({ active: 'false' })).toBe('INACTIVO');
    expect(getProfessionalActiveStatus({})).toBe('INACTIVO');
  });

  test('recognizes professional action only with recognized quality and the original FUN signature', () => {
    expect(getProfessionalActionRecognitionStatus({ registration_certificate_status: 'HABILITADO', postgraduate_applicable: true, signature_original_fun: true })).toBe('SI');
    expect(getProfessionalActionRecognitionStatus({ registration_certificate_status: 'HABILITADO', postgraduate_applicable: true, signature_original_fun: false })).toBe('NO');
    expect(getProfessionalActionRecognitionStatus({ registration_certificate_status: 'INHABILITADO', postgraduate_applicable: true, signature_original_fun: true })).toBe('NO');
    expect(getProfessionalActionRecognitionStatus({})).toBe('NO');
  });
});
