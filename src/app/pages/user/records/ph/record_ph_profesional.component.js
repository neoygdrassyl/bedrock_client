
import VIZUALIZER from '../../../../components/vizualizer.component';
import DataTable from '@/components/data-table-bridge';

function RECORD_PH_PROFESIONALS(props) {
        const { translation, swaMsg, globals, _FUN_52, _FUN_6, currentRecord } = props;

        // DATA GETTERS
        /*  ROLES LIST
            URBANIZADOR O CONSTRUCTOR RESPONSABLE
            ARQUITECTO PROYECTISTA
            INGENIERO CIVIL DISEÑADOR ESTRUCTURAL
            DISEÑADOR DE ELEMENTOS NO ESTRUCTURALES
            INGENIERO CIVIL GEOTECNISTA
            INGENIERO TOPOGRAFO Y/O TOPÓGRAFO
            REVISOR INDEPENDIENTE DE LOS DISEÑOS ESTRUCTURALES
            OTROS PROFESIONALES ESPECIALISTAS
        */
            let _GET_CHILD_6 = () => {
                var _CHILD = _FUN_6;
                var _LIST = [];
                if (_CHILD) {
                    _LIST = _CHILD;
                }
                return _LIST;
            }
            let _GET_CHILD_REVIEW_GEN = () => {
                var _CHILD = currentRecord.review_check;
                var _LIST = [];
                if (_CHILD) {
                    _LIST = _CHILD.split(';');
                }
                return _LIST;
            }

        //  DATA CONVERTES
        let _FIND_PROFESIOANL = (_role) => {
            for (var i = 0; i < _FUN_52.length; i++) {
                if (_FUN_52[i].role.includes(_role)) return _FUN_52[i];
            }
            return false;
        }
        let _FIND_EXPERIENCE = (_role) => {
            for (var i = 0; i < _FUN_52.length; i++) {
                if (_FUN_52[i].role.includes(_role)) return _FUN_52[i].expirience;
            }
            return false;
        }
        let _CECK_EXPERIENCE = (_role) => {
            let experience = _FIND_EXPERIENCE(_role);
            if (experience) {
                let years = Math.trunc(experience / 12);
                if (_role == 'URBANIZADOR O CONSTRUCTOR RESPONSABLE') {
                    return years >= 3
                        ? <label className="text-success">{years} año(s) de 3 años requeridos - CUMPLE</label>
                        : <label className="text-danger">{years} año(s) de 3 años requeridos - NO CUMPLE</label>
                }
                else if (_role == 'INGENIERO CIVIL DISEÑADOR ESTRUCTURAL') {
                    return years >= 5
                        ? <label className="text-success">{years} año(s) de 5 años requeridos - CUMPLE</label>
                        : <label className="text-danger">{years} año(s) de 5 años requeridos - NO CUMPLE</label>
                }
                else if (_role == 'DISEÑADOR DE ELEMENTOS NO ESTRUCTURALES') {
                    return years >= 3
                        ? <label className="text-success">{years} año(s) de 3 años requeridos - CUMPLE</label>
                        : <label className="text-danger">{years} año(s) de 3 años requeridos - NO CUMPLE</label>
                }
                else if (_role == 'INGENIERO CIVIL GEOTECNISTA') {
                    return years >= 5
                        ? <label className="text-success">{years} año(s) de 5 años requeridos - CUMPLE</label>
                        : <label className="text-danger">{years} año(s) de 5 años requeridos - NO CUMPLE</label>
                }
                else if (_role == 'REVISOR INDEPENDIENTE DE LOS DISEÑOS ESTRUCTURALES') {
                    return years >= 5
                        ? <label className="text-success">{years} año(s) de 5 años requeridos - Suficiente</label>
                        : <label className="text-danger">{years} año(s) de 5 años requeridos - Insuficiente</label>
                }
                else return <label className="text-warning">No requiere</label>
            }
            return <label className="text-danger">FALTA INFORMACIÓN</label>;
        }
        let _GET_DOCS_BTNS = (_item) => {
            if (!_item) return "";
            var _array = _item.split(',');
            var _COMPONENT = [];

            _COMPONENT.push(<>{_array[0] > 0
                ?
                <span title="CEDULA DE CIUDADANIA"><VIZUALIZER url={_FIND_6(_array[0]).path + "/" + _FIND_6(_array[0]).filename} apipath={'/files/'}
                    icon={'IdCard'} color={'DeepSkyBlue'} /></span>
                : ""}</>)

            _COMPONENT.push(<>{_array[1] > 0
                ?
                <span title="MATRICULA"><VIZUALIZER url={_FIND_6(_array[1]).path + "/" + _FIND_6(_array[1]).filename} apipath={'/files/'}
                    icon={'BadgeCheck'} color={'DarkOrchid'} /></span>
                : ""}</>)

            _COMPONENT.push(<>{_array[2] > 0
                ?
                <span title="FICHA COPNIA"><VIZUALIZER url={_FIND_6(_array[2]).path + "/" + _FIND_6(_array[2]).filename} apipath={'/files/'}
                    icon={'BookOpen'} color={'GoldenRod'} /></span>
                : ""}</>)

            _COMPONENT.push(<>{_array[2] > 0
                ?   <span title="HOJA DE VIDA Y CERTIFICADOS"><VIZUALIZER url={_FIND_6(_array[3]).path + "/" + _FIND_6(_array[3]).filename} apipath={'/files/'}
                    icon={'FileText'} color={'LimeGreen'} /></span>
                : ""}</>)

            return <>{_COMPONENT}</>
        }
        let _FIND_6 = (_ID) => {
            let _LIST = _GET_CHILD_6();
            let _CHILD = [];
            for (var i = 0; i < _LIST.length; i++) {
                if (_LIST[i].id == _ID) {
                    return _LIST[i];
                }
            }
            return _CHILD;
        }

        const getStatusClass = (isCompleted) => isCompleted
            ? 'border-accent/20 bg-accent/10 text-accent'
            : 'border-destructive/20 bg-destructive/10 text-destructive';
        const buildRows = () => ['ARQUITECTO PROYECTISTA'].map((role) => {
            const professional = _FIND_PROFESIOANL(role);

            return {
                id: role,
                role,
                professional,
                statusText: professional ? 'DILIGENCIADO' : 'SIN DILIGENCIAR',
            };
        });
        const columns = [
            {
                name: 'ROL',
                minWidth: '220px',
                cell: (row) => <span className="text-sm font-medium">{row.role}</span>
            },
            {
                name: 'PROFESIONAL',
                minWidth: '220px',
                cell: (row) => row.professional
                    ? <div>
                        <div className="text-sm font-medium">{row.professional.name} {row.professional.surname}</div>
                        <div className="text-xs text-muted-foreground">{row.professional.sanction ? 'Con sanciones registradas' : 'Sin sanciones registradas'}</div>
                    </div>
                    : <span className="text-sm text-muted-foreground">Sin profesional asignado</span>
            },
            {
                name: 'MATRICULA',
                minWidth: '120px',
                cell: (row) => <span className="text-xs font-mono">{row.professional?.registration_date || '—'}</span>
            },
            {
                name: 'EXPERIENCIA',
                minWidth: '220px',
                cell: (row) => _CECK_EXPERIENCE(row.role)
            },
            {
                name: 'SOPORTES',
                minWidth: '120px',
                cell: (row) => row.professional?.docs
                    ? <div className="flex flex-wrap gap-1">{_GET_DOCS_BTNS(row.professional.docs)}</div>
                    : <span className="text-xs text-muted-foreground">Sin soportes</span>
            },
            {
                name: 'ESTADO',
                minWidth: '120px',
                cell: (row) => <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${getStatusClass(Boolean(row.professional))}`}>
                    {row.statusText}
                </span>
            },
        ]

        return (
            <div className="record_ph_profesional_evaluation container space-y-3">
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                    <p className="text-sm font-semibold text-foreground">Profesional responsable de los planos</p>
                    <p className="text-xs text-muted-foreground">Recuperado como tabla compacta para mantener jerarquía visual y lectura operativa.</p>
                </div>

                <DataTable
                    paginationComponentOptions={{ rowsPerPageText: 'Filas por pagina:', rangeSeparatorText: 'de' }}
                    noDataComponent="No hay profesional configurado"
                    striped="true"
                    columns={columns}
                    data={buildRows()}
                    dense
                    highlightOnHover
                    className="data-table-component"
                    noHeader
                />
            </div >
        );
}

export default RECORD_PH_PROFESIONALS;