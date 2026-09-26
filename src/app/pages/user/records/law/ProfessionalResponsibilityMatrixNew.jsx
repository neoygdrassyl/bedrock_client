import { memo, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';
import { LegacyModal as Modal } from '@/components/legacy-modal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import FUNN51 from '../../fun_forms/fun_n_52';
import { CHECK_COLUMNS, DOCUMENT_COLUMNS, PROFESSIONAL_RESPONSIBILITIES, REQUIRED_EXPERIENCE_YEARS, STATE_META } from './professionalResponsibility.constants';
import useProfessionalResponsibilityMatrix from './useProfessionalResponsibilityMatrix';
import styles from './ProfessionalResponsibilityMatrixNew.module.css';

const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();
const checkKey = (professionalId, criterionId) => `${professionalId}:${criterionId}`;

function documentState(value) {
    if (value === undefined || value === null || value === '' || String(value).toUpperCase() === 'N/A') return 'na';
    return Number(value) === 0 ? 'missing' : 'ok';
}

function ProfessionalRow({ responsibility, professional, index, density, matrix, onChange, onOpenEditor }) {
    const requiredYears = REQUIRED_EXPERIENCE_YEARS[responsibility.id];
    const years = Math.trunc(Number(professional?.expirience || 0) / 12);
    const docs = String(professional?.docs || '').split(',');
    const checks = CHECK_COLUMNS.map(criterion => matrix.checks[checkKey(professional?.id, criterion.id)] || 'pending');
    const documentStates = DOCUMENT_COLUMNS.map((label, documentIndex) => label === 'Matrícula' && professional?.sanction ? 'no_cumple' : documentState(docs[documentIndex]));
    const accepted = !professional ? 'na' : [...documentStates, ...checks].includes('no_cumple') ? 'no' : checks.includes('pending') ? 'pending' : 'yes';

    if (!professional) return <tr className={styles.unassignedRow}>
        <th scope="row" className={styles.rowHead}>
            <div className={styles.roleTag}>{index + 1}. {responsibility.label}</div>
            <p className={styles.noProfessional}>Sin profesional asignado</p>
            <Button type="button" size="sm" variant="outline" onClick={onOpenEditor}><Icon name="user-plus" size={13} className="me-1" />Asignar profesional</Button>
        </th>
        <td colSpan="10" className="px-3 py-2 text-center text-muted-foreground">No requerido para este trámite</td>
        <td className={`${styles.cell} ${styles.acceptedCell}`}><span className={`${styles.accepted} ${styles.acceptedPending}`}>N/A</span></td>
    </tr>;

    return <tr>
        <th scope="row" className={`${styles.rowHead} ${density === 'compact' ? styles.compact : ''}`}>
            <div className={styles.roleTag}>{index + 1}. {responsibility.label}</div>
            <div className={styles.professionalName}>{[professional.name, professional.surname].filter(Boolean).join(' ') || 'Profesional sin nombre'}<Button type="button" size="sm" variant="ghost" className="h-6 w-6 p-0" aria-label={`Editar ${responsibility.label}`} onClick={onOpenEditor}><Icon name="edit" size={13} /></Button></div>
            <div className={styles.details}>
                <span><span className={styles.detailLabel}>Cédula: </span><span className={styles.detailValue}>{professional.id_number || 'Sin registro'}</span></span>
                <span><span className={styles.detailLabel}>Sanciones: </span><span className={styles.detailValue}>{professional.sanction ? 'Sí' : 'No'}</span></span>
                <span><span className={styles.detailLabel}>Experiencia: </span><span className={`${styles.detailValue} ${requiredYears !== null && years < requiredYears ? styles.experienceWarning : ''}`}>{years} años {requiredYears === null ? '(no requiere)' : `(req. ${requiredYears})`}</span></span>
                <span><span className={styles.detailLabel}>Supervisión técnica: </span><span className={styles.detailValue}>{professional.supervision || 'N/A'}</span></span>
                <span><span className={styles.detailLabel}>Matrícula: </span><span className={styles.detailValue}>{professional.registration || 'Sin registro'} {professional.registration_date ? `· ${professional.registration_date}` : ''}</span></span>
                <span><span className={styles.detailLabel}>Correo: </span><span className={styles.detailValue}>{professional.email || 'Sin registro'}</span></span>
                <span><span className={styles.detailLabel}>Teléfono: </span><span className={styles.detailValue}>{professional.number || 'Sin registro'}</span></span>
            </div>
        </th>
        {DOCUMENT_COLUMNS.map((label, documentIndex) => {
            const state = documentStates[documentIndex];
            const meta = state === 'ok' ? ['✓', styles.documentOk, 'Aportado'] : state === 'no_cumple' ? ['✕', styles.documentMissing, 'No cumple'] : state === 'missing' ? ['✕', styles.documentMissing, 'No aportado'] : ['–', styles.documentNa, 'No aplica'];
            return <td key={label} className={`${styles.cell} ${styles.documentCell}`}><Tooltip><TooltipTrigger asChild><span className={`${styles.indicator} ${meta[1]}`} aria-label={`${label}: ${meta[2]}`}>{meta[0]}</span></TooltipTrigger><TooltipContent>{label}: {meta[2]}</TooltipContent></Tooltip></td>;
        })}
        {CHECK_COLUMNS.map(criterion => {
            const state = matrix.checks[checkKey(professional.id, criterion.id)] || 'pending';
            const meta = STATE_META[state];
            return <td key={criterion.id} className={`${styles.cell} ${styles.softColumn}`}><button type="button" className={`${styles.check} ${styles[meta.className] || ''}`} aria-label={`${criterion.label}, ${responsibility.label}: ${meta.label}`} title={meta.label} onClick={() => onChange(professional.id, criterion.id)}>{meta.glyph}</button></td>;
        })}
        <td className={`${styles.cell} ${styles.acceptedCell}`}><span className={`${styles.accepted} ${accepted === 'yes' ? styles.acceptedYes : accepted === 'no' ? styles.acceptedNo : styles.acceptedPending}`}>{accepted === 'yes' ? 'Sí' : accepted === 'no' ? 'No' : '—'}</span></td>
    </tr>;
}

const MemoProfessionalRow = memo(ProfessionalRow);

export default function ProfessionalResponsibilityMatrixNew({ translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, requestUpdate, requestUpdateRecord, quickModalStyle }) {
    const professionals = Array.isArray(currentItem?.fun_52s) ? currentItem.fun_52s : [];
    const state = useProfessionalResponsibilityMatrix({ professionals });
    const rows = useMemo(() => PROFESSIONAL_RESPONSIBILITIES.map((responsibility, index) => ({
        index,
        responsibility,
        professional: professionals.find(professional => responsibility.roles.some(role => normalize(String(professional.role || '').split(',').find(item => normalize(item) === normalize(role)))) || String(professional.role || '').split(',').some(role => responsibility.roles.includes(normalize(role)))),
    })), [professionals]);
    const visibleRows = rows.filter(({ professional }) => state.filter === 'all' || (professional && CHECK_COLUMNS.some(criterion => (state.matrix.checks[checkKey(professional.id, criterion.id)] || 'pending') === state.filter)));
    const total = professionals.length * CHECK_COLUMNS.length;
    const editorContext = state.editorOpen ? <Modal contentLabel="Profesionales responsables" isOpen onRequestClose={() => state.setEditorOpen(false)} ariaHideApp={false} style={quickModalStyle}><div className="p-2"><div className="mb-2 flex justify-end"><Button type="button" size="sm" variant="outline" onClick={() => state.setEditorOpen(false)}><Icon name="times-circle" size={14} /></Button></div><FUNN51 translation={translation} swaMsg={swaMsg} globals={globals} currentItem={currentItem} currentVersion={currentVersion} requestUpdate={requestUpdate} /></div></Modal> : null;

    return <TooltipProvider><section className={`${styles.root} ${state.density === 'compact' ? styles.compact : ''}`} aria-label="5.2 profesionales responsables nueva">
        <div className="border bg-primary text-primary-foreground text-center fw-bold py-1"><label>5.2. PROFESIONALES RESPONSABLES (NEW):</label></div>
        <div className={styles.summary}>{['cumple', 'no_cumple', 'no_aplica', 'pending'].map(status => <div key={status} className={styles.summaryCard}><strong>{state.counts[status]}</strong> {STATE_META[status].label}</div>)}</div>
        <div className="mt-2"><div className={styles.progress} role="progressbar" aria-valuemin="0" aria-valuemax={total} aria-valuenow={state.evaluated}><span style={{ width: `${total ? (state.evaluated / total) * 100 : 0}%` }} /></div><p className="mb-0 mt-1 text-center text-xs text-muted-foreground">{state.evaluated} de {total} verificaciones evaluadas</p></div>
        <div className="my-2 flex flex-wrap items-center justify-between gap-2"><div className="flex gap-1" aria-label="Filtrar profesionales">{[['all', 'Todos'], ['pending', 'Pendientes'], ['no_cumple', 'No cumple']].map(([value, label]) => <Button key={value} type="button" size="sm" variant={state.filter === value ? 'default' : 'outline'} onClick={() => state.setFilter(value)}>{label}</Button>)}</div><div className="flex gap-1"><Button type="button" size="sm" variant={state.density === 'complete' ? 'default' : 'outline'} onClick={() => state.setDensity('complete')}>Completa</Button><Button type="button" size="sm" variant={state.density === 'compact' ? 'default' : 'outline'} onClick={() => state.setDensity('compact')}>Compacta</Button></div></div>
        <div className={styles.tableWrap}><table className={styles.table}><colgroup><col className={styles.roleColumn} />{DOCUMENT_COLUMNS.map(label => <col key={label} className={styles.documentColumn} />)}{CHECK_COLUMNS.map(criterion => <col key={criterion.id} className={styles.checkColumn} />)}<col className={styles.acceptedColumn} /></colgroup><thead><tr><th rowSpan="2" className={styles.roleHead}>Profesional responsable</th><th colSpan="6" className={styles.groupHead}>Documentos aportados y consulta consejo profesional CP</th><th colSpan="2" className={`${styles.groupHead} ${styles.softHead}`}>Firmas</th><th colSpan="2" className={`${styles.groupHead} ${styles.softHead}`}>Verificación curaduría urbana</th><th rowSpan="2" className={`${styles.groupHead} ${styles.acceptedCell}`}>Aceptada</th></tr><tr>{DOCUMENT_COLUMNS.map(label => <th key={label} className={`${styles.vertical} ${styles.documentCell}`}><span>{label}</span></th>)}{CHECK_COLUMNS.map(criterion => <th key={criterion.id} className={`${styles.vertical} ${styles.softColumn}`}><span>{criterion.label}</span></th>)}</tr></thead><tbody>{visibleRows.map(({ responsibility, professional, index }) => <MemoProfessionalRow key={responsibility.id} responsibility={responsibility} professional={professional} index={index} density={state.density} matrix={state.matrix} onChange={state.changeCheck} onOpenEditor={() => state.setEditorOpen(true)} />)}</tbody></table></div>
        <Modal contentLabel="Observación del profesional" isOpen={Boolean(state.observationProfessionalId)} onRequestClose={() => state.setObservationProfessionalId(null)} ariaHideApp={false} style={quickModalStyle}><div className="p-3"><h2 className="text-sm font-semibold">Observación</h2><textarea className="form-control mt-2" rows="4" value={state.observationDraft} onChange={event => state.setObservationDraft(event.target.value)} placeholder="Escriba la observación" /><div className="mt-3 flex justify-end gap-2"><Button type="button" size="sm" variant="outline" onClick={() => state.setObservationProfessionalId(null)}>Cancelar</Button><Button type="button" size="sm" onClick={state.saveObservation} disabled={!state.observationDraft.trim()}>Guardar</Button></div></div></Modal>
        {editorContext}
    </section></TooltipProvider>;
}
