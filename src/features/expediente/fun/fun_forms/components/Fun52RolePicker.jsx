import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/components/icon';
import { formatYearsMonths } from '@/shared/utils/specificExperience';
import {
  ROLE_STATUS, STATUS_TEXT, buildBatchRoles, disabledReason, draftOf, requiredYearsText, roleRowState, selectionProblem,
} from '../fun52RoleSelection';

const SOURCE_TEXT = { manual: 'Registrada en BD Profesionales', expediente: 'Tomada del 5.2.9 de un expediente' };
const STATUS_CLASS = {
  [ROLE_STATUS.CUMPLE]: 'text-success',
  [ROLE_STATUS.NO_CUMPLE]: 'text-danger',
  [ROLE_STATUS.SIN_REGISTRO]: 'text-warning',
  [ROLE_STATUS.NO_EXIGE]: 'text-muted',
};
const FIELDS = [['years', 'Años'], ['months', 'Meses']];

/**
 * FUN 5.2.5 and 5.2.9 for a professional picked from BD PROFESIONALES: every role with its required years, the
 * registered specific experience and its status. The user ticks the roles to add, types 5.2.9 where needed and
 * `onSubmit(roles)` receives the batch roles ([{ role, expirience }]). `eligibility` is the role-eligibility answer.
 */
export default function Fun52RolePicker({ eligibility, busy, onSubmit }) {
  const { roles, generalMonths } = eligibility;
  const [checked, setChecked] = useState({});
  const [drafts, setDrafts] = useState(() => Object.fromEntries(roles.map((role) => [role.roleCode, draftOf(role)])));
  const [problem, setProblem] = useState('');

  const selection = Object.fromEntries(roles.filter((role) => checked[role.roleCode]).map((role) => [role.roleCode, drafts[role.roleCode]]));
  const count = Object.keys(selection).length;

  const toggle = (code) => setChecked({ ...checked, [code]: !checked[code] });
  const type = (code, key, value) => setDrafts({ ...drafts, [code]: { ...drafts[code], [key]: value } });
  const submit = () => {
    const found = selectionProblem(selection, roles, generalMonths);
    setProblem(found);
    if (!found) onSubmit(buildBatchRoles(selection, roles));
  };

  return (
    <div className="mb-3">
      <label id="f_525_picker_title">5.2.5 Roles que desempeña y 5.2.9 Experiencia específica en cada rol</label>
      <small className="text-muted d-block mb-1">
        Seleccione uno o más roles. {generalMonths === null || generalMonths === undefined
          ? 'Experiencia general desconocida en BD Profesionales.'
          : `Experiencia general en BD Profesionales: ${formatYearsMonths(generalMonths)}.`}
      </small>
      <div className="table-responsive">
        <table className="table table-sm align-middle mb-1" aria-labelledby="f_525_picker_title">
          <thead>
            <tr>
              <th scope="col"><span className="visually-hidden">Seleccionar</span></th>
              <th scope="col">Rol</th>
              <th scope="col">Años exigidos</th>
              <th scope="col">Experiencia específica registrada</th>
              <th scope="col">Estado</th>
              <th scope="col">5.2.9 Experiencia específica</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => {
              const code = role.roleCode;
              const isChecked = Boolean(checked[code]);
              const state = roleRowState(role, drafts[code], generalMonths);
              const status = isChecked ? state.status : role.status;
              const reason = disabledReason(role);
              const describedBy = reason || (isChecked && state.error) ? `f_525_picker_note_${code}` : undefined;
              return (
                <tr key={code}>
                  <td>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`f_525_picker_${code}`}
                      checked={isChecked}
                      disabled={!role.selectable || busy}
                      aria-describedby={describedBy}
                      onChange={() => toggle(code)}
                    />
                  </td>
                  <td><label htmlFor={`f_525_picker_${code}`} className="mb-0">{role.label}</label></td>
                  <td>{requiredYearsText(role.requiredYears)}</td>
                  <td>
                    {role.specificMonths === null || role.specificMonths === undefined ? 'Sin registro' : formatYearsMonths(role.specificMonths)}
                    {SOURCE_TEXT[role.specificSource] ? <small className="text-muted d-block">{SOURCE_TEXT[role.specificSource]}</small> : null}
                    {role.specificExceedsGeneral ? <small className="text-danger d-block">Supera la experiencia general</small> : null}
                  </td>
                  <td className={`fw-bold ${STATUS_CLASS[status] || ''}`}>{STATUS_TEXT[status] || status}</td>
                  <td>
                    {isChecked ? (
                      <div className="input-group input-group-sm">
                        {FIELDS.map(([key, label]) => (
                          // Text with a numeric keyboard: no spinner arrows and no wheel changes.
                          <input
                            key={key}
                            type="text"
                            inputMode="numeric"
                            maxLength={2}
                            className="form-control"
                            placeholder={label}
                            aria-label={`${label} de experiencia específica en ${role.label}`}
                            aria-invalid={Boolean(state.error)}
                            value={drafts[code][key]}
                            disabled={busy}
                            onChange={(event) => type(code, key, event.target.value)}
                          />
                        ))}
                      </div>
                    ) : null}
                    {describedBy ? (
                      <small id={`f_525_picker_note_${code}`} className={`d-block ${reason ? 'text-muted' : 'text-danger'}`}>
                        {reason || state.error}
                      </small>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {problem ? <p className="text-danger small mb-1" role="alert">{problem}</p> : null}
      <div className="text-center">
        <Button type="button" size="sm" className="my-3" disabled={busy || !count} onClick={submit}>
          <Icon name="file-alt" size={16} /> AÑADIR ROLES SELECCIONADOS ({count})
        </Button>
      </div>
    </div>
  );
}
