import { useState } from 'react';
import { Button } from '@/components/ui/button';

import FUNService from '../../../../services/fun.service';
import { Icon } from '@/components/icon';
import { swalConfirm, swalError, swalLoading } from '@/app/utils/swalAdapter';


// Options grouped for UI display
const OPTION_GROUPS = [
    {
        label: 'Datos del formulario',
        icon: 'fas fa-file-alt',
        options: [
            { key: 'fun_1', label: 'Tipo y trámite' },
            { key: 'fun_2', label: 'Datos del predio' },
            { key: 'fun_3', label: 'Citaciones / Profesionales' },
            { key: 'fun_4', label: 'Áreas y linderos' },
        ],
    },
    {
        label: 'Intervinientes',
        icon: 'fas fa-users',
        options: [
            { key: 'fun_51', label: 'Propietarios' },
            { key: 'fun_52', label: 'Profesionales responsables' },
            { key: 'fun_53', label: 'Apoderados / Terceros' },
        ],
    },
    {
        label: 'Documentos',
        icon: 'fas fa-folder-open',
        options: [
            { key: 'fun_6', label: 'Documentos del expediente' },
            { key: 'fun_c', label: 'Checklist información' },
            { key: 'fun_r', label: 'Checklist documentos' },
        ],
    },
    {
        label: 'Tiempos',
        icon: 'far fa-clock',
        options: [
            { key: 'fun_law', label: 'Control de tiempos jurídico' },
            { key: 'fun_clock', label: 'Cronómetros' },
        ],
    },
    {
        label: 'Records de revisión',
        icon: 'fas fa-clipboard-check',
        options: [
            { key: 'record_law', label: 'Revisión jurídica' },
            { key: 'record_eng', label: 'Revisión ingeniería' },
            { key: 'record_arc', label: 'Revisión arquitectura' },
            { key: 'record_ph', label: 'Revisión propiedad horizontal' },
            { key: 'record_review', label: 'Revisión general' },
        ],
    },
    {
        label: 'Expedición',
        icon: 'fas fa-stamp',
        options: [
            { key: 'expedition', label: 'Expedición y áreas' },
        ],
    },
];

// All option keys for select/deselect all
const ALL_OPTION_KEYS = OPTION_GROUPS.flatMap(g => g.options.map(o => o.key));

// Labels map for showing details
const OPTION_LABELS = {};
OPTION_GROUPS.forEach(g => g.options.forEach(o => { OPTION_LABELS[o.key] = o.label; }));

function FUN_DUPLICATE({ swaMsg, currentItem, onDuplicateSuccess }) {
    const [newIdPublic, setNewIdPublic] = useState('');
    const [options, setOptions] = useState(() => {
        const initial = {};
        ALL_OPTION_KEYS.forEach(key => { initial[key] = false; });
        return initial;
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const allSelected = ALL_OPTION_KEYS.every(key => options[key]);
    const noneSelected = ALL_OPTION_KEYS.every(key => !options[key]);

    const toggleOption = (key) => {
        setOptions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleAll = () => {
        const newValue = !allSelected;
        const updated = {};
        ALL_OPTION_KEYS.forEach(key => { updated[key] = newValue; });
        setOptions(updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!newIdPublic.trim()) {
            swalError({ title: 'Campo requerido', text: 'Debe ingresar el nuevo ID público para el proyecto duplicado.' });
            return;
        }

        // Confirm before duplicating
        swalConfirm({
            title: '¿Duplicar proyecto?',
            html: `<p>Se creará un nuevo proyecto con ID público: <strong>${newIdPublic}</strong></p>
                   <p>Basado en: <strong>${currentItem.id_public}</strong></p>`,
            icon: 'question',
            confirmButtonText: 'Sí, duplicar',
        }).then((result) => {
            if (result.isConfirmed) {
                executeDuplicate();
            }
        });
    };

    const executeDuplicate = () => {
        setIsSubmitting(true);

        const payload = {
            source_id: currentItem.id,
            new_id_public: newIdPublic.trim(),
            options: { ...options },
        };

        swalLoading({ title: 'Duplicando proyecto...', text: 'Por favor espere mientras se crea el nuevo proyecto.' });

        FUNService.duplicate(payload)
            .then(response => {
                setIsSubmitting(false);
                const data = response.data;

                if (data.message === 'OK') {
                    // Build details summary
                    const detailLines = Object.entries(data.details || {})
                        .filter(([key]) => key !== 'fun_0')
                        .map(([key, count]) => {
                            const label = OPTION_LABELS[key] || key;
                            return `<li><strong>${label}:</strong> ${count} registro(s) copiado(s)</li>`;
                        })
                        .join('');

                    swalConfirm({
                        title: '¡Proyecto duplicado exitosamente!',
                        html: `
                            <p>Nuevo ID público: <strong>${data.new_id_public}</strong></p>
                            <p>Duplicado desde: <strong>${data.duplicated_from}</strong></p>
                            ${detailLines ? `<hr/><p class="text-start"><strong>Resumen de lo copiado:</strong></p><ul class="text-start">${detailLines}</ul>` : ''}
                        `,
                        icon: 'success',
                        confirmButtonText: 'Ir al nuevo proyecto',
                        cancelButtonText: 'Cerrar',
                    }).then((result) => {
                        if (result.isConfirmed && onDuplicateSuccess) {
                            onDuplicateSuccess(data.new_id);
                        }
                    });
                }
            })
            .catch(err => {
                setIsSubmitting(false);
                const status = err.response?.status;
                const msg = err.response?.data?.message || '';
                const detail = err.response?.data?.detail || '';

                if (status === 409) {
                    swalError({ title: 'ID público ya existe' });
                } else if (status === 404) {
                    swalError({ title: 'Proyecto no encontrado', text: msg });
                } else if (status === 400) {
                    swalError({ title: 'Datos incompletos', text: msg });
                } else {
                    swalError({ title: swaMsg.generic_eror_title, text: msg });
                }
            });
    };

    const selectedCount = ALL_OPTION_KEYS.filter(key => options[key]).length;

    return (
        <div className="rounded-lg border bg-card p-4 bg-card mb-3">
            <div>
                <h4 className="text-center mb-3">
                    <Icon name="copy" size={16} className="me-2" />
                    DUPLICAR PROYECTO
                </h4>
                <p className="text-muted text-center mb-3">
                    Crea un nuevo proyecto basado en <strong>{currentItem.id_public}</strong>. Seleccione las entidades que desea copiar.
                </p>

                <form onSubmit={handleSubmit}>
                    {/* New ID Public input */}
                    <div className="mb-3">
                        <label className="form-label fw-bold">
                            <Icon name="hashtag" size={16} className="me-1" /> Nuevo ID Público (Radicación) *
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Ej: LC-2026-0045"
                            value={newIdPublic}
                            onChange={(e) => setNewIdPublic(e.target.value)}
                            required
                            disabled={isSubmitting}
                        />
                        <small className="text-muted">Ingrese el nuevo número de radicación para el proyecto duplicado.</small>
                    </div>

                    {/* Select all / Deselect all */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="text-muted">
                            {selectedCount} de {ALL_OPTION_KEYS.length} entidades seleccionadas
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleAll}
                            disabled={isSubmitting}
                        >
                            <Icon name={allSelected ? 'times' : 'check-double'} size={16} className="me-1" />
                            {allSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
                        </Button>
                    </div>

                    {/* Option groups */}
                    <div className="row">
                        {OPTION_GROUPS.map((group) => (
                            <div className="col-md-6">
                                <div className="border rounded p-2 h-100">
                                    <h6 className="fw-bold mb-2">
                                        <i className={`${group.icon} me-1`}></i> {group.label}
                                    </h6>
                                    {group.options.map((opt) => (
                                        <div className="form-check mb-1" key={opt.key}>
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id={`dup_opt_${opt.key}`}
                                                checked={options[opt.key]}
                                                onChange={() => toggleOption(opt.key)}
                                                disabled={isSubmitting}
                                            />
                                            <label
                                                className="form-check-label"
                                                htmlFor={`dup_opt_${opt.key}`}
                                            >
                                                {opt.label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Submit button */}
                    <div className="text-center mt-3">
                        <button type="button"
                            color="primary"
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Duplicando...
                                </>
                            ) : (
                                <>
                                    <Icon name="copy" size={16} className="me-2" />
                                    Duplicar proyecto
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default FUN_DUPLICATE;
