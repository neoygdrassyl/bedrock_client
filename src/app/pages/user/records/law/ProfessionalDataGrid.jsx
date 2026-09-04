import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';
import { LegacyModal as Modal } from '@/components/legacy-modal';
import FUNService from '../../../../services/fun.service';
import ProfessionalVerificationGrid from './ProfessionalVerificationGrid';

const DOCUMENTS = ['Cédula', 'Matrícula', 'Certificado matricula', 'Hoja de vida', 'Postgrado', 'Certificados'];
const TOGGLE_FIELDS = ['signature_original_fun', 'signature_original_plans', 'signature_matches_plans', 'registration_validity', 'postgraduate_applicable'];
const CERTIFICATE_STATUS_FIELD = 'registration_certificate_status';
const CERTIFICATE_STATUSES = ['HABILITADO', 'INHABILITADO'];
const POSTGRADUATE_APPLICABLE_FIELD = 'postgraduate_applicable';
const INLINE_FIELDS = [...TOGGLE_FIELDS, CERTIFICATE_STATUS_FIELD];
const EMPTY_FORM = {
    name: '', surname: '', id_number: '', number: '', email: '', role: '', registration: '',
    registration_date: '', registration_validity: false, registration_certificate_id: '', registration_certificate_date: '', registration_certificate_status: '', expirience: '', required_experience: '',
    postgraduate: '', postgraduate_applicable: false, sanction: false, supervision: '', signature_original_fun: false,
    signature_original_plans: false, signature_matches_plans: false, active: true, docs: Array(6).fill(''),
};

const isTrue = value => value === true || value === 1 || value === '1' || value === 'true';
const isActive = value => value !== false && value !== 0 && value !== '0';
const overrideKey = (id, field) => `${id}::${field}`;
const normalizeField = (field, raw) => {
    if (TOGGLE_FIELDS.includes(field)) return isTrue(raw);
    if (field === CERTIFICATE_STATUS_FIELD) return CERTIFICATE_STATUSES.includes(raw) ? raw : '';
    return Math.trunc(Number(raw || 0));
};
const documentIds = value => {
    const ids = String(value || '').split(',').slice(0, DOCUMENTS.length);
    return [...ids, ...Array(Math.max(0, DOCUMENTS.length - ids.length)).fill('')];
};

function formFromProfessional(professional) {
    return {
        name: professional?.name || '',
        surname: professional?.surname || '',
        id_number: professional?.id_number || '',
        number: professional?.number || '',
        email: professional?.email || '',
        role: professional?.role || '',
        registration: professional?.registration || '',
        registration_date: String(professional?.registration_date || '').slice(0, 10),
        registration_validity: isTrue(professional?.registration_validity),
        registration_certificate_id: professional?.registration_certificate_id || '',
        registration_certificate_date: String(professional?.registration_certificate_date || '').slice(0, 10),
        registration_certificate_status: CERTIFICATE_STATUSES.includes(professional?.registration_certificate_status) ? professional.registration_certificate_status : '',
        expirience: professional?.expirience ?? '',
        required_experience: professional?.required_experience ?? '',
        postgraduate: professional?.postgraduate ?? '',
        postgraduate_applicable: professional?.postgraduate_applicable === undefined || professional?.postgraduate_applicable === null ? Number(professional?.postgraduate) > 0 : isTrue(professional.postgraduate_applicable),
        sanction: isTrue(professional?.sanction),
        supervision: professional?.supervision || '',
        signature_original_fun: isTrue(professional?.signature_original_fun),
        signature_original_plans: isTrue(professional?.signature_original_plans),
        signature_matches_plans: isTrue(professional?.signature_matches_plans),
        active: isActive(professional?.active),
        docs: documentIds(professional?.docs),
    };
}

export default function ProfessionalDataGrid({ currentItem, currentVersion, requestUpdate, quickModalStyle, viewModel }) {
    const sharedSection = viewModel?.sections?.find(section => section.id === 'professionals');
    const professionals = Array.isArray(sharedSection?.rows) ? sharedSection.rows : (Array.isArray(currentItem?.fun_52s) ? currentItem.fun_52s : []);
    const files = Array.isArray(currentItem?.fun_6s) ? currentItem.fun_6s : [];
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [saving, setSaving] = useState(false);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState('');
    const [inlineSavingIds, setInlineSavingIds] = useState(() => new Set());
    const [inlineOverrides, setInlineOverrides] = useState({});
    const [inlineError, setInlineError] = useState('');

    // Reconciliación: descarta el valor local en cuanto la prop lo confirma.
    useEffect(() => {
        const entries = Object.entries(inlineOverrides);
        if (!entries.length) return;
        const remaining = {};
        entries.forEach(([key, entry]) => {
            const [id, field] = key.split('::');
            const professional = professionals.find(item => String(item.id) === id);
            if (professional && normalizeField(field, professional[field]) === entry.value) return;
            remaining[key] = entry;
        });
        if (Object.keys(remaining).length !== entries.length) setInlineOverrides(remaining);
    }, [professionals, inlineOverrides]);

    const fieldValue = (professional, field) => {
        const entry = inlineOverrides[overrideKey(professional.id, field)];
        if (entry) return entry.value;
        if (field === POSTGRADUATE_APPLICABLE_FIELD && (professional[field] === undefined || professional[field] === null)) return Number(professional.postgraduate) > 0;
        return normalizeField(field, professional[field]);
    };

    const fileById = useMemo(() => new Map(files.map(file => [String(file.id), file])), [files]);
    const legalFilingDate = useMemo(() => {
        const clocks = Array.isArray(currentItem?.fun_clocks) ? currentItem.fun_clocks : [];
        const legalClock = clocks.find(clock => String(clock.state) === '5' && (currentVersion === undefined || currentVersion === null || String(clock.version) === String(currentVersion)));
        return legalClock?.date_start || null;
    }, [currentItem?.fun_clocks, currentVersion]);
    const openForm = professional => {
        setEditing(professional || {});
        setForm(professional ? formFromProfessional(professional) : { ...EMPTY_FORM, docs: [...EMPTY_FORM.docs] });
        setSearchTerm('');
        setResults([]);
        setError('');
    };
    const closeForm = () => {
        if (saving) return;
        setEditing(null);
    };
    const updateForm = (field, value) => setForm(previous => ({ ...previous, [field]: value }));
    const updateDocument = (index, value) => setForm(previous => ({
        ...previous,
        docs: previous.docs.map((document, documentIndex) => documentIndex === index ? value : document),
    }));
    const searchProfessionals = async () => {
        const query = searchTerm.trim();
        if (query.length < 2) {
            setResults([]);
            setError('Ingrese al menos dos caracteres para buscar un profesional.');
            return;
        }
        setSearching(true);
        setError('');
        try {
            const response = await FUNService.consult_Profesional(query);
            setResults(Array.isArray(response.data) ? response.data : []);
            if (!Array.isArray(response.data) || !response.data.length) setError('No se encontraron profesionales para la búsqueda indicada.');
        } catch {
            setResults([]);
            setError('No fue posible consultar profesionales. Intente nuevamente.');
        } finally {
            setSearching(false);
        }
    };
    const applyProfessional = index => {
        const professional = results[Number(index)];
        if (!professional) return;
        setForm(previous => ({
            ...previous,
            name: professional.name || previous.name,
            surname: professional.surname || previous.surname,
            id_number: professional.id_number || previous.id_number,
            number: professional.number || previous.number,
            email: professional.email || previous.email,
            registration: professional.registration || previous.registration,
            registration_date: professional.registration_date || previous.registration_date,
            registration_validity: isTrue(professional.registration_validity),
            registration_certificate_id: professional.registration_certificate_id || previous.registration_certificate_id,
            registration_certificate_date: professional.registration_certificate_date || previous.registration_certificate_date,
            postgraduate: professional.postgraduate ?? previous.postgraduate,
            postgraduate_applicable: professional.postgraduate_applicable === undefined || professional.postgraduate_applicable === null ? Number(professional.postgraduate) > 0 : isTrue(professional.postgraduate_applicable),
            sanction: isTrue(professional.sanction),
        }));
    };
    const save = async event => {
        event.preventDefault();
        const name = form.name.trim();
        const role = form.role.trim();
        const experience = Number(form.expirience || 0);
        const requiredExperience = Number(form.required_experience || 0);
        const postgraduate = Math.max(0, Math.trunc(Number(form.postgraduate) || 0));
        if (!currentItem?.id) {
            setError('No fue posible identificar el expediente para guardar el profesional.');
            return;
        }
        if (!name || !role) {
            setError('Nombre y profesión son obligatorios.');
            return;
        }
        if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
            setError('Ingrese un correo electrónico válido o déjelo vacío.');
            return;
        }
        if (!Number.isInteger(experience) || experience < 0) {
            setError('La experiencia debe ser un número entero de meses igual o mayor a cero.');
            return;
        }
        if (!Number.isInteger(requiredExperience) || requiredExperience < 0) {
            setError('La experiencia requerida debe ser un número entero de meses igual o mayor a cero.');
            return;
        }
        const data = new FormData();
        data.set('name', name);
        data.set('surname', form.surname.trim());
        data.set('id_number', form.id_number.trim());
        data.set('number', form.number.trim());
        data.set('email', form.email.trim());
        data.set('role', role);
        data.set('registration', form.registration.trim());
        data.set('registration_date', form.registration_date);
        data.set('registration_validity', form.registration_validity ? '1' : '0');
        data.set('registration_certificate_id', form.registration_certificate_id.trim());
        data.set('registration_certificate_date', form.registration_certificate_date);
        data.set(CERTIFICATE_STATUS_FIELD, form[CERTIFICATE_STATUS_FIELD] || '');
        data.set('expirience', String(experience));
        data.set('required_experience', String(requiredExperience));
        data.set('postgraduate', String(postgraduate));
        data.set(POSTGRADUATE_APPLICABLE_FIELD, form[POSTGRADUATE_APPLICABLE_FIELD] ? '1' : '0');
        data.set('sanction', form.sanction ? '1' : '0');
        data.set('supervision', form.supervision.trim());
        data.set('signature_original_fun', form.signature_original_fun ? '1' : '0');
        data.set('signature_original_plans', form.signature_original_plans ? '1' : '0');
        data.set('signature_matches_plans', form.signature_matches_plans ? '1' : '0');
        data.set('active', form.active ? '1' : '0');
        data.set('docs', form.docs.join(','));
        if (!editing?.id) data.set('fun0Id', String(currentItem.id));

        setSaving(true);
        setError('');
        try {
            const response = editing?.id
                ? await FUNService.update_52(editing.id, data)
                : await FUNService.create_fun52(data);
            if (response.data !== 'OK') throw new Error();
            if (editing?.id) {
                setInlineOverrides(previous => {
                    const next = { ...previous };
                    INLINE_FIELDS.forEach(field => delete next[overrideKey(editing.id, field)]);
                    return next;
                });
            }
            await requestUpdate?.(currentItem.id);
            setEditing(null);
        } catch {
            setError('No fue posible guardar el profesional. Verifique los datos e intente nuevamente.');
        } finally {
            setSaving(false);
        }
    };

    const persistField = async (professional, field, value) => {
        if (!professional?.id || !currentItem?.id) return;
        if (fieldValue(professional, field) === value) return;
        const key = overrideKey(professional.id, field);
        const resolved = target => target === field ? value : fieldValue(professional, target);

        const data = new FormData();
        data.set('name', professional.name || '');
        data.set('surname', professional.surname || '');
        data.set('id_number', professional.id_number || '');
        data.set('number', professional.number || '');
        data.set('email', professional.email || '');
        data.set('role', professional.role || '');
        data.set('registration', professional.registration || '');
        data.set('registration_date', String(professional.registration_date || '').slice(0, 10));
        data.set('registration_validity', resolved('registration_validity') ? '1' : '0');
        data.set('registration_certificate_id', professional.registration_certificate_id || '');
        data.set('registration_certificate_date', String(professional.registration_certificate_date || '').slice(0, 10));
        data.set(CERTIFICATE_STATUS_FIELD, resolved(CERTIFICATE_STATUS_FIELD));
        data.set('expirience', String(professional.expirience || 0));
        data.set('required_experience', String(professional.required_experience || 0));
        data.set('postgraduate', String(professional.postgraduate || 0));
        data.set(POSTGRADUATE_APPLICABLE_FIELD, resolved(POSTGRADUATE_APPLICABLE_FIELD) ? '1' : '0');
        data.set('sanction', isTrue(professional.sanction) ? '1' : '0');
        data.set('supervision', professional.supervision || '');
        data.set('signature_original_fun', resolved('signature_original_fun') ? '1' : '0');
        data.set('signature_original_plans', resolved('signature_original_plans') ? '1' : '0');
        data.set('signature_matches_plans', resolved('signature_matches_plans') ? '1' : '0');
        data.set('active', isActive(professional.active) ? '1' : '0');
        data.set('docs', documentIds(professional.docs).join(','));

        setInlineError('');
        setInlineOverrides(previous => ({ ...previous, [key]: { value, confirmed: false } }));
        setInlineSavingIds(previous => new Set(previous).add(professional.id));
        try {
            const response = await FUNService.update_52(professional.id, data);
            if (response.data !== 'OK') throw new Error();
            const refreshedItem = await requestUpdate?.(currentItem.id);
            const refreshedProfessional = Array.isArray(refreshedItem?.fun_52s)
                ? refreshedItem.fun_52s.find(item => String(item.id) === String(professional.id))
                : null;
            setInlineOverrides(previous => {
                const next = { ...previous };
                delete next[key];
                return next;
            });
            if (!refreshedProfessional) {
                setInlineError('No fue posible confirmar el cambio después de guardarlo. Actualice el expediente e intente nuevamente.');
                return;
            }
            if (normalizeField(field, refreshedProfessional[field]) !== value) {
                setInlineError('El servidor aceptó el cambio pero devolvió el valor anterior. Verifique que el backend acepte y guarde los campos de verificación profesional.');
            }
        } catch {
            setInlineOverrides(previous => {
                const next = { ...previous };
                delete next[key];
                return next;
            });
            setInlineError('No fue posible actualizar el dato. Intente nuevamente.');
        } finally {
            setInlineSavingIds(previous => {
                const next = new Set(previous);
                next.delete(professional.id);
                return next;
            });
        }
    };

    const renderToggleSelect = (professional, field, label) => {
        const checked = fieldValue(professional, field);
        const savingInline = inlineSavingIds.has(professional.id);
        return (
            <div className="relative inline-flex items-center">
                <select
                    aria-label={`${label} — ${professional.name || 'profesional'}`}
                    title={`${label}: ${checked ? 'Sí' : 'No'}`}
                    className={`h-7 w-auto cursor-pointer appearance-none rounded-md border border-border bg-background ps-2 pe-6 text-left text-[11px] font-semibold leading-none focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-wait disabled:opacity-60 ${checked ? 'text-emerald-700' : 'text-destructive'}`}
                    value={checked ? '1' : '0'}
                    disabled={savingInline}
                    aria-busy={savingInline}
                    onMouseDown={event => event.stopPropagation()}
                    onClick={event => event.stopPropagation()}
                    onKeyDown={event => event.stopPropagation()}
                    onChange={event => persistField(professional, field, event.target.value === '1')}
                >
                    <option value="0">No</option>
                    <option value="1">Sí</option>
                </select>
                <span aria-hidden="true" className="pointer-events-none absolute right-2 text-[9px] leading-none text-muted-foreground">▾</span>
            </div>
        );
    };

    const renderPostgraduateSelect = professional => {
        const applies = fieldValue(professional, POSTGRADUATE_APPLICABLE_FIELD);
        const savingInline = inlineSavingIds.has(professional.id);
        return <div className="relative inline-flex items-center">
            <select
                aria-label={`Postgrado — ${professional.name || 'profesional'}`}
                title={`Postgrado: ${applies ? 'APLICA' : 'NO APLICA'}`}
                className={`h-7 w-auto cursor-pointer appearance-none rounded-md border border-border bg-background ps-2 pe-6 text-left text-[11px] font-semibold leading-none focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-wait disabled:opacity-60 ${applies ? 'text-emerald-700' : 'text-muted-foreground'}`}
                value={applies ? '1' : '0'}
                disabled={savingInline}
                aria-busy={savingInline}
                onMouseDown={event => event.stopPropagation()}
                onClick={event => event.stopPropagation()}
                onKeyDown={event => event.stopPropagation()}
                onChange={event => persistField(professional, POSTGRADUATE_APPLICABLE_FIELD, event.target.value === '1')}
            >
                <option value="0">NO APLICA</option>
                <option value="1">APLICA</option>
            </select>
            <span aria-hidden="true" className="pointer-events-none absolute right-2 text-[9px] leading-none text-muted-foreground">▾</span>
        </div>;
    };

    const renderCertificateStatusSelect = professional => {
        const status = fieldValue(professional, CERTIFICATE_STATUS_FIELD);
        const savingInline = inlineSavingIds.has(professional.id);
        return <div className="relative inline-flex items-center">
            <select
                aria-label={`Estado certificado — ${professional.name || 'profesional'}`}
                title={`Estado certificado: ${status || 'Pendiente'}`}
                className={`h-7 w-auto cursor-pointer appearance-none rounded-md border border-border bg-background ps-2 pe-6 text-left text-[11px] font-semibold leading-none focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-wait disabled:opacity-60 ${status === 'HABILITADO' ? 'text-emerald-700' : status === 'INHABILITADO' ? 'text-destructive' : 'text-muted-foreground'}`}
                value={status}
                disabled={savingInline}
                aria-busy={savingInline}
                onMouseDown={event => event.stopPropagation()}
                onClick={event => event.stopPropagation()}
                onKeyDown={event => event.stopPropagation()}
                onChange={event => persistField(professional, CERTIFICATE_STATUS_FIELD, event.target.value)}
            >
                <option value="" disabled>Pendiente</option>
                {CERTIFICATE_STATUSES.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
            <span aria-hidden="true" className="pointer-events-none absolute right-2 text-[9px] leading-none text-muted-foreground">▾</span>
        </div>;
    };


    return <section className="mt-3 rounded-lg border border-border bg-card p-3" aria-label="Tabla de profesionales responsables">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
                <h3 className="mb-1 text-sm font-semibold">5.2. Profesionales responsables</h3>
                <p className="mb-0 text-xs text-muted-foreground">Información consolidada para consulta y actualización.</p>
            </div>
        </div>
        {inlineError ? <p className="mb-2 text-xs text-destructive" role="alert">{inlineError}</p> : null}
        <ProfessionalVerificationGrid
            professionals={professionals}
            legalFilingDate={legalFilingDate}
            onEdit={openForm}
            renderCertificateStatus={renderCertificateStatusSelect}
            renderPostgraduate={renderPostgraduateSelect}
            renderSignatureOriginal={professional => renderToggleSelect(professional, 'signature_original_fun', 'FUN')}
            renderSignaturePlans={professional => renderToggleSelect(professional, 'signature_original_plans', 'PLANOS')}
            renderSignatureMatches={professional => renderToggleSelect(professional, 'signature_matches_plans', 'COINCIDE')}
        />

        <Modal contentLabel={editing?.id ? 'Editar profesional' : 'Añadir profesional'} isOpen={Boolean(editing)} onRequestClose={closeForm} ariaHideApp={false} style={quickModalStyle}>
            <form className="p-3" onSubmit={save}>
                <div className="mb-3 flex items-center justify-between gap-2 border-b border-border pb-2">
                    <h2 className="mb-0 text-base font-semibold">{editing?.id ? 'Editar profesional' : 'Añadir profesional'}</h2>
                    <Button type="button" variant="ghost" size="sm" onClick={closeForm} disabled={saving} aria-label="Cerrar formulario"><Icon name="times-circle" size={16} /></Button>
                </div>
                <div className="mb-3 rounded-md border border-border bg-muted/30 p-2">
                    <label className="mb-1 block text-sm font-medium" htmlFor="professional-search">Buscar profesional existente</label>
                    <div className="flex gap-2"><input id="professional-search" className="form-control" value={searchTerm} onChange={event => setSearchTerm(event.target.value)} /><Button type="button" variant="outline" onClick={searchProfessionals} disabled={searching}>{searching ? 'Buscando...' : 'Buscar'}</Button></div>
                    {results.length ? <select className="form-select mt-2" defaultValue="" onChange={event => applyProfessional(event.target.value)}><option value="" disabled>Seleccione un resultado para completar el formulario</option>{results.map((professional, index) => <option key={`${professional.id || professional.id_number}-${index}`} value={index}>{[professional.name, professional.surname, professional.id_number].filter(Boolean).join(' - ')}</option>)}</select> : null}
                </div>
                {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
                <div className="row g-2">
                    {[['name', 'Nombre', true], ['surname', 'Apellido'], ['id_number', 'CC/NIT'], ['number', 'Teléfono'], ['email', 'Correo', false, 'email'], ['role', 'Actua en calidad de', true], ['registration', 'Matrícula'], ['registration_date', 'Fecha de matrícula', false, 'date'], ['registration_certificate_id', 'ID certificado vigencia'], ['registration_certificate_date', 'Fecha certificado vigencia', false, 'date'], ['expirience', 'Experiencia (meses)', false, 'number'], ['required_experience', 'Experiencia requerida (meses)', false, 'number'], ['supervision', 'Supervisión técnica']].map(([field, label, required, type = 'text']) => <div className="col-md-6" key={field}><label className="form-label" htmlFor={`professional-${field}`}>{label}{required ? ' *' : ''}</label><input id={`professional-${field}`} className="form-control" type={type} min={type === 'number' ? '0' : undefined} value={form[field]} required={Boolean(required)} onChange={event => updateForm(field, event.target.value)} /></div>)}
                    <div className="col-md-6"><label className="form-label" htmlFor="professional-sanction">Sanciones</label><select id="professional-sanction" className="form-select" value={form.sanction ? '1' : '0'} onChange={event => updateForm('sanction', event.target.value === '1')}><option value="0">No</option><option value="1">Sí</option></select></div>
                    <div className="col-md-6"><label className="form-label" htmlFor="professional-signature-original">Firma original FUN</label><select id="professional-signature-original" className="form-select" value={form.signature_original_fun ? '1' : '0'} onChange={event => updateForm('signature_original_fun', event.target.value === '1')}><option value="0">No</option><option value="1">Sí</option></select></div>
                    <div className="col-md-6"><label className="form-label" htmlFor="professional-signature-plans">Firma en planos</label><select id="professional-signature-plans" className="form-select" value={form.signature_original_plans ? '1' : '0'} onChange={event => updateForm('signature_original_plans', event.target.value === '1')}><option value="0">No</option><option value="1">Sí</option></select></div>
                    <div className="col-md-6"><label className="form-label" htmlFor="professional-signature-matches">Coincide FUN y planos</label><select id="professional-signature-matches" className="form-select" value={form.signature_matches_plans ? '1' : '0'} onChange={event => updateForm('signature_matches_plans', event.target.value === '1')}><option value="0">No</option><option value="1">Sí</option></select></div>
                    <div className="col-md-6 d-flex align-items-end"><div className="form-check mb-2"><input id="professional-active" className="form-check-input" type="checkbox" checked={form.active} onChange={event => updateForm('active', event.target.checked)} /><label className="form-check-label" htmlFor="professional-active">Profesional activo</label></div></div>
                </div>
                <fieldset className="mt-3 rounded-md border border-border p-2"><legend className="float-none w-auto px-1 text-sm font-semibold">Documentos</legend><div className="row g-2">{DOCUMENTS.map((label, index) => <div className="col-md-6" key={label}><label className="form-label" htmlFor={`professional-document-${index}`}>{label}</label><select id={`professional-document-${index}`} className="form-select" value={form.docs[index]} onChange={event => updateDocument(index, event.target.value)}><option value="">Sin documento</option>{form.docs[index] && !fileById.has(String(form.docs[index])) ? <option value={form.docs[index]}>Documento no disponible ({form.docs[index]})</option> : null}{files.map(file => <option key={file.id} value={file.id}>{file.description || file.filename || `Documento ${file.id}`}</option>)}</select></div>)}</div></fieldset>
                <div className="mt-3 flex justify-end gap-2"><Button type="button" variant="outline" onClick={closeForm} disabled={saving}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar profesional'}</Button></div>
            </form>
        </Modal>
    </section>;
}
