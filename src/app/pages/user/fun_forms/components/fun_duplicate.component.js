import { useState } from 'react';
import { MDBBtn, MDBCard, MDBCardBody, MDBRow, MDBCol } from '../../../../components/ui';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import FUNService from '../../../../services/fun.service';

const MySwal = withReactContent(Swal);

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
            MySwal.fire({
                title: 'Campo requerido',
                text: 'Debe ingresar el nuevo ID público para el proyecto duplicado.',
                icon: 'warning',
                confirmButtonText: swaMsg.text_btn,
            });
            return;
        }

        // Confirm before duplicating
        MySwal.fire({
            title: '¿Duplicar proyecto?',
            html: `<p>Se creará un nuevo proyecto con ID público: <strong>${newIdPublic}</strong></p>
                   <p>Basado en: <strong>${currentItem.id_public}</strong></p>`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, duplicar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
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

        MySwal.fire({
            title: 'Duplicando proyecto...',
            text: 'Por favor espere mientras se crea el nuevo proyecto.',
            icon: 'info',
            showConfirmButton: false,
            allowOutsideClick: false,
        });

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

                    MySwal.fire({
                        title: '¡Proyecto duplicado exitosamente!',
                        html: `
                            <p>Nuevo ID público: <strong>${data.new_id_public}</strong></p>
                            <p>Duplicado desde: <strong>${data.duplicated_from}</strong></p>
                            ${detailLines ? `<hr/><p class="text-start"><strong>Resumen de lo copiado:</strong></p><ul class="text-start">${detailLines}</ul>` : ''}
                        `,
                        icon: 'success',
                        confirmButtonText: 'Ir al nuevo proyecto',
                        showCancelButton: true,
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
                    MySwal.fire({
                        title: 'ID público ya existe',
                        text: `El ID público "${newIdPublic}" ya está en uso. Por favor ingrese otro.`,
                        icon: 'error',
                        confirmButtonText: swaMsg.text_btn,
                    });
                } else if (status === 404) {
                    MySwal.fire({
                        title: 'Proyecto no encontrado',
                        text: msg || 'El proyecto origen no fue encontrado.',
                        icon: 'error',
                        confirmButtonText: swaMsg.text_btn,
                    });
                } else if (status === 400) {
                    MySwal.fire({
                        title: 'Datos incompletos',
                        text: msg || 'Faltan campos requeridos para la duplicación.',
                        icon: 'warning',
                        confirmButtonText: swaMsg.text_btn,
                    });
                } else {
                    MySwal.fire({
                        title: swaMsg.generic_eror_title,
                        text: msg || 'Ocurrió un error al duplicar el proyecto.',
                        icon: 'error',
                        confirmButtonText: swaMsg.text_btn,
                    });
                }
            });
    };

    const selectedCount = ALL_OPTION_KEYS.filter(key => options[key]).length;

    return (
        <MDBCard className="bg-card mb-3">
            <MDBCardBody>
                <h4 className="text-center mb-3">
                    <i className="fas fa-copy me-2"></i>
                    DUPLICAR PROYECTO
                </h4>
                <p className="text-muted text-center mb-3">
                    Crea un nuevo proyecto basado en <strong>{currentItem.id_public}</strong>. Seleccione las entidades que desea copiar.
                </p>

                <form onSubmit={handleSubmit}>
                    {/* New ID Public input */}
                    <div className="mb-3">
                        <label className="form-label fw-bold">
                            <i className="fas fa-hashtag me-1"></i> Nuevo ID Público (Radicación) *
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
                        <button
                            type="button"
                            className={`btn btn-sm ${allSelected ? 'btn-outline-secondary' : 'btn-outline-primary'}`}
                            onClick={toggleAll}
                            disabled={isSubmitting}
                        >
                            <i className={`fas ${allSelected ? 'fa-times' : 'fa-check-double'} me-1`}></i>
                            {allSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
                        </button>
                    </div>

                    {/* Option groups */}
                    <MDBRow>
                        {OPTION_GROUPS.map((group) => (
                            <MDBCol md="6" lg="4" key={group.label} className="mb-3">
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
                            </MDBCol>
                        ))}
                    </MDBRow>

                    {/* Submit button */}
                    <div className="text-center mt-3">
                        <MDBBtn
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
                                    <i className="fas fa-copy me-2"></i>
                                    Duplicar proyecto
                                </>
                            )}
                        </MDBBtn>
                    </div>
                </form>
            </MDBCardBody>
        </MDBCard>
    );
}

export default FUN_DUPLICATE;
