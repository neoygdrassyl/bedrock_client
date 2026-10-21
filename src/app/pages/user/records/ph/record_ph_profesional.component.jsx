import { useState } from 'react';
import DataTable from '@/components/data-table-bridge';
import VIZUALIZER from '../../../../components/vizualizer.component';
import RECORD_PH_SERVICE from '../../../../services/record_ph.service';

const REQUIRED_ROLES = ['ARQUITECTO PROYECTISTA'];

function RECORD_PH_PROFESIONAL({ _FUN_52 = [], _FUN_6 = [], currentRecord = {}, currentItem = {}, requestUpdateRecord }) {
    const professionals = Array.isArray(_FUN_52) ? _FUN_52 : [];
    const documents = Array.isArray(_FUN_6) ? _FUN_6 : [];

    const findProfessional = (role) => professionals.find(item => item?.role?.includes(role));
    const findDocument = (id) => documents.find(item => String(item.id) === String(id));

    const reviewCheck = currentRecord.review_check ? currentRecord.review_check.split(';') : [];
    const [vigente, setVigente] = useState(reviewCheck[0] || '1');

    const handleVigenteChange = async (value) => {
        setVigente(value);

        const nextReviewCheck = [...reviewCheck];
        while (nextReviewCheck.length < 9) nextReviewCheck.push('');
        nextReviewCheck[0] = value;

        const formData = new FormData();
        formData.set('review_check', nextReviewCheck.join(';'));

        const response = await RECORD_PH_SERVICE.update(currentRecord.id, formData);
        if (response?.data === 'OK') requestUpdateRecord?.(currentItem.id);
    };

    const getExperienceLabel = (role) => {
        const professional = findProfessional(role);
        if (!professional) return <span className="text-danger">FALTA INFORMACIÓN</span>;

        const years = Math.trunc(Number(professional.expirience || 0) / 12);
        if (role === 'ARQUITECTO PROYECTISTA') return <span className="text-warning">No requiere</span>;
        return <span>{years} año(s)</span>;
    };

    const renderDocuments = (docs) => {
        if (!docs) return <span className="text-muted">Sin soportes</span>;

        const [idCard, registration, copnia, resume] = docs.split(',');
        const items = [
            { id: idCard, title: 'CEDULA DE CIUDADANIA', icon: 'IdCard', color: 'DeepSkyBlue' },
            { id: registration, title: 'MATRICULA', icon: 'BadgeCheck', color: 'DarkOrchid' },
            { id: copnia, title: 'FICHA COPNIA', icon: 'BookOpen', color: 'GoldenRod' },
            { id: resume, title: 'HOJA DE VIDA Y CERTIFICADOS', icon: 'FileText', color: 'LimeGreen' },
        ];

        return <div className="d-flex flex-wrap gap-1 justify-content-center">
            {items.map(item => {
                const file = Number(item.id) > 0 ? findDocument(item.id) : null;
                if (!file?.path || !file?.filename) return null;
                return <span title={item.title} key={item.title}>
                    <VIZUALIZER url={`${file.path}/${file.filename}`} apipath="/files/" icon={item.icon} color={item.color} />
                </span>;
            })}
        </div>;
    };

    const rows = REQUIRED_ROLES.map(role => {
        const professional = findProfessional(role);
        return {
            id: role,
            role,
            professional,
            status: professional ? 'DILIGENCIADO' : 'SIN DILIGENCIAR',
        };
    });

    const columns = [
        {
            name: 'ROL',
            minWidth: '220px',
            cell: row => <span className="fw-semibold">{row.role}</span>,
        },
        {
            name: 'PROFESIONAL',
            minWidth: '260px',
            cell: row => row.professional
                ? <div className="text-start">
                    <div className="fw-semibold">{row.professional.name} {row.professional.surname}</div>
                    <div className="small text-muted">{row.professional.sanction ? 'Sancionado: SI' : 'Sancionado: NO'}</div>
                </div>
                : <span className="text-danger">Sin profesional asignado</span>,
        },
        {
            name: 'MATRICULA',
            minWidth: '130px',
            cell: row => <span>{row.professional?.registration_date || '-'}</span>,
        },
        {
            name: 'EXPERIENCIA',
            minWidth: '160px',
            cell: row => getExperienceLabel(row.role),
        },
        {
            name: '¿VIGENTE?',
            minWidth: '120px',
            cell: () => <select className="form-select form-select-sm" value={vigente} onChange={(e) => handleVigenteChange(e.target.value)}>
                <option value="1">SI</option>
                <option value="0">NO</option>
            </select>,
        },
        {
            name: 'SOPORTES',
            minWidth: '160px',
            cell: row => renderDocuments(row.professional?.docs),
        },
        {
            name: 'ESTADO',
            minWidth: '140px',
            cell: row => <span className={`badge ${row.professional ? 'bg-success' : 'bg-danger'}`}>{row.status}</span>,
        },
    ];

    return <div className="record_ph_profesional_evaluation container my-2">
        <div className="border rounded-3 bg-light p-3 mb-2">
            <div className="app-p lead fw-bold mb-1">PROFESIONAL RESPONSABLE DE LOS PLANOS</div>
            <p className="small text-muted mb-0">Datos recuperados desde el formulario FUN 5.2.</p>
        </div>
        <DataTable
            paginationComponentOptions={{ rowsPerPageText: 'Filas por pagina:', rangeSeparatorText: 'de' }}
            noDataComponent="No hay profesional configurado"
            striped="true"
            columns={columns}
            data={rows}
            dense
            highlightOnHover
            className="data-table-component"
            noHeader
        />
    </div>;
}

export default RECORD_PH_PROFESIONAL;
