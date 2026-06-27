import PropTypes from 'prop-types';
import DataTable from '@/components/data-table-bridge';

function expandSubLists(VRList) {
    const rows = [];
    (VRList || []).forEach(submit => {
        (submit.sub_lists || []).forEach(subList => {
            if (!subList.list_code) return;
            const codes = subList.list_code.split(',');
            const names = (subList.list_name || '').split(';');
            const pages = (subList.list_pages || '').split(',');
            const reviews = (subList.list_review || '').split(',');
            codes.forEach((code, i) => {
                rows.push({
                    vr: submit.id_public,
                    code: code.trim(),
                    name: (names[i] || '').trim(),
                    category: subList.list_title || '',
                    pages: (pages[i] || '').trim(),
                    reviewed: (reviews[i] || '').trim().toUpperCase(),
                });
            });
        });
    });
    return rows;
}

function KPICard({ label, value, variant = 'primary' }) {
    return (
        <div className={`card border-${variant} mb-3`} style={{ minWidth: 140 }}>
            <div className={`card-header bg-${variant} text-white py-1 px-2 text-sm fw-semibold`}>{label}</div>
            <div className="card-body py-2 px-3 text-center">
                <span className="fs-4 fw-bold">{value}</span>
            </div>
        </div>
    );
}

KPICard.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    variant: PropTypes.string,
};

function FunDocumentAuditTab({ digitalDocs = [], VRList = [] }) {
    const physicalRows = expandSubLists(VRList);

    // KPI 4: intersección por código
    const digitalCodes = new Set((digitalDocs || []).map(d => String(d.id_public || '').trim()));
    const physicalCodes = new Set(physicalRows.map(r => r.code));
    const crossCount = [...digitalCodes].filter(c => physicalCodes.has(c)).length;

    // Tabla 1: columnas de digitales
    const digitalColumns = [
        {
            name: 'CÓDIGO',
            selector: row => row.id_public,
            sortable: true,
            filterable: true,
            maxWidth: '80px',
            cell: row => <span className="text-sm">{row.id_public}</span>,
        },
        {
            name: 'DESCRIPCIÓN',
            selector: row => row.description,
            sortable: true,
            filterable: true,
            cell: row => <span className="text-sm">{row.description}</span>,
        },
        {
            name: 'VR',
            selector: row => row.id_replace,
            sortable: true,
            filterable: true,
            maxWidth: '150px',
            cell: row => <span className="text-sm">{row.id_replace || '—'}</span>,
        },
        {
            name: 'FOLIOS',
            selector: row => row.pages,
            sortable: true,
            maxWidth: '60px',
            cell: row => <span className="text-sm">{row.pages}</span>,
        },
        {
            name: 'FECHA RADICACIÓN',
            selector: row => row.date,
            sortable: true,
            maxWidth: '120px',
            cell: row => <span className="text-sm">{row.date}</span>,
        },
        {
            name: 'ORIGEN',
            selector: row => row.origin_state,
            sortable: true,
            maxWidth: '120px',
            cell: row => row.origin_state
                ? <span className={`badge bg-${row.origin_state === 'DIGITALIZADO' ? 'success' : row.origin_state === 'MEDIO_DIGITAL' ? 'info' : 'secondary'} text-sm`}>{row.origin_state}</span>
                : <span className="text-muted text-sm">—</span>,
        },
    ];

    // Tabla 2: columnas de físicos expandidos
    const physicalColumns = [
        {
            name: 'VR',
            selector: row => row.vr,
            sortable: true,
            filterable: true,
            maxWidth: '150px',
            cell: row => <span className="text-sm">{row.vr}</span>,
        },
        {
            name: 'CÓDIGO',
            selector: row => row.code,
            sortable: true,
            filterable: true,
            maxWidth: '80px',
            cell: row => <span className="text-sm">{row.code}</span>,
        },
        {
            name: 'NOMBRE',
            selector: row => row.name,
            sortable: true,
            filterable: true,
            cell: row => <span className="text-sm">{row.name}</span>,
        },
        {
            name: 'CATEGORÍA',
            selector: row => row.category,
            sortable: true,
            filterable: true,
            maxWidth: '200px',
            cell: row => <span className="text-sm">{row.category}</span>,
        },
        {
            name: 'FOLIOS',
            selector: row => row.pages,
            sortable: true,
            maxWidth: '60px',
            cell: row => <span className="text-sm">{row.pages || '—'}</span>,
        },
        {
            name: 'REVISADO',
            selector: row => row.reviewed,
            sortable: true,
            maxWidth: '90px',
            cell: row => {
                const isReviewed = ['SI', 'S', '1', 'TRUE'].includes(row.reviewed);
                return <span className={`badge bg-${isReviewed ? 'success' : 'secondary'} text-sm`}>{isReviewed ? 'SI' : 'NO'}</span>;
            },
        },
    ];

    return (
        <div className="p-2">
            {/* KPIs */}
            <div className="d-flex flex-wrap gap-2 mb-3">
                <KPICard label="Documentos Digitales" value={digitalDocs.length} variant="primary" />
                <KPICard label="Ítems Físicos (expandidos)" value={physicalRows.length} variant="warning" />
                <KPICard label="VRs Asociados" value={VRList.length} variant="secondary" />
                <KPICard label="Códigos en ambas fuentes" value={crossCount} variant="success" />
            </div>

            {/* Tabla 1: Digitales */}
            <h6 className="fw-semibold mb-1">📄 Documentos Digitalizados <small className="text-muted">(fun_6s)</small></h6>
            <DataTable
                paginationComponentOptions={{ rowsPerPageText: 'Por página:', rangeSeparatorText: 'de' }}
                noDataComponent="Sin documentos digitales"
                striped="true"
                columns={digitalColumns}
                data={digitalDocs}
                pagination
                paginationPerPage={20}
                dense
            />

            <hr className="my-3" />

            {/* Tabla 2: Físicos expandidos */}
            <h6 className="fw-semibold mb-1">📁 Documentos Físicos / Ventanilla <small className="text-muted">(sub_lists expandidos — {physicalRows.length} ítems)</small></h6>
            <DataTable
                paginationComponentOptions={{ rowsPerPageText: 'Por página:', rangeSeparatorText: 'de' }}
                noDataComponent="Sin documentos físicos de ventanilla"
                striped="true"
                columns={physicalColumns}
                data={physicalRows}
                pagination
                paginationPerPage={20}
                dense
            />
        </div>
    );
}

FunDocumentAuditTab.propTypes = {
    digitalDocs: PropTypes.array,
    VRList: PropTypes.array,
};

export default FunDocumentAuditTab;