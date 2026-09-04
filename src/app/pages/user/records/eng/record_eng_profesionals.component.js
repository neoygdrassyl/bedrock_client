import VIZUALIZER from '../../../../components/vizualizer.component';
import RECORD_ENG_SERVICE from '../../../../services/record_eng.service'
import DataTable from '@/components/data-table-bridge';
import { useEffect, useState } from 'react';
const profs = [
    ['URBANIZADOR O CONSTRUCTOR RESPONSABLE', 'DIRECTOR DE LA CONSTRUCCION'],
    ['ARQUITECTO PROYECTISTA'],

    ['INGENIERO CIVIL DISEÑADOR ESTRUCTURAL'],
    ['DISEÑADOR DE ELEMENTOS NO ESTRUCTURALES'],
    ['INGENIERO CIVIL GEOTECNISTA'],
    ['INGENIERO TOPOGRAFO Y/O TOPÓGRAFO'],
]

function RECORD_ENG_PROFESIONALS(props) {
        const { translation, swaMsg, globals, _FUN_52, _FUN_6, currentItem, currentRecord, profs, useCB, requestUpdateRecord } = props;
        const [checkedRoles, setCheckedRoles] = useState([]);
        const [isSaving, setIsSaving] = useState(false);
        const [selectionError, setSelectionError] = useState('');

        // DATA GETTERS
        /*  ROLES LIST
            URBANIZADOR O CONSTRUCTOR RESPONSABLE (2021)
            DIRECTOR DE LA CONSTRUCCION (2022)
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
        let LOAD_STEP = (_id_public) => {
            var _CHILD = currentRecord.record_eng_steps || [];
            for (var i = 0; i < _CHILD.length; i++) {
                if (_CHILD[i].id_public == _id_public) return _CHILD[i]
            }
            return []
        }
        useEffect(() => {
            const step = (currentRecord?.record_eng_steps || []).find(item => item.id_public === 'cb_profs');
            const checks = String(step?.check || '').split(';');
            setCheckedRoles(profs.map((_, index) => checks[index] === '1'));
            setSelectionError('');
        }, [currentRecord, profs]);
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
                if (_role == 'URBANIZADOR O CONSTRUCTOR RESPONSABLE' || _role == 'DIRECTOR DE LA CONSTRUCCION') {
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
            return <label className="text-danger">FALTA INFORMACION</label>;
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
                ? <span title="HOJA DE VIDA Y CERTIFICADOS"><VIZUALIZER url={_FIND_6(_array[3]).path + "/" + _FIND_6(_array[3]).filename} apipath={'/files/'}
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
        let _GET_STEP_TYPE = (_id_public, _type) => {
            var STEP = LOAD_STEP(_id_public);
            if (!STEP.id) return [];
            var value = STEP[_type] ?? []
            if (!value.length) return [];
            value = value.split(';');
            return value
        }
        const resolveRole = (roles) => {
            const roleList = Array.isArray(roles) ? roles : [roles];
            const matchingRole = roleList.find((role) => _FIND_PROFESIOANL(role));
            return matchingRole || roleList[0];
        }
        const getStatusClass = (isCompleted) => isCompleted
            ? 'border-accent/20 bg-accent/10 text-accent'
            : 'border-destructive/20 bg-destructive/10 text-destructive';
        const buildProfessionalRows = () => {
            return profs.map((roles, index) => {
                const role = resolveRole(roles);
                const professional = _FIND_PROFESIOANL(role);

                return {
                    id: `${role}-${index}`,
                    index,
                    role,
                    professional,
                    checked: Boolean(checkedRoles[index]),
                    statusText: professional ? 'DILIGENCIADO' : 'SIN DILIGENCIAR',
                };
            });
        }
        const columns = [
            {
                name: 'OK',
                omit: !useCB,
                minWidth: '56px',
                cell: (row) => <input className="form-check-input" type="checkbox" value={row.role} name="cb_profs"
                    checked={row.checked} disabled={!row.professional || isSaving}
                    onChange={(event) => manage_step(row.index, event.target.checked)} />
            },
            {
                name: 'ROL',
                minWidth: '240px',
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
                minWidth: '140px',
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

        // APIS
        let manage_step = (index, checked) => {
            const previousChecks = checkedRoles;
            const nextChecks = checkedRoles.map((value, currentIndex) => currentIndex === index ? checked : value);
            const values = profs.map(roles => resolveRole(roles));

            if (!currentRecord?.id) {
                setSelectionError('No fue posible guardar la selección porque el informe estructural no está disponible.');
                return;
            }

            setCheckedRoles(nextChecks);
            setSelectionError('');
            var formData = new FormData();
            formData.set('check', nextChecks.map(value => value ? 1 : 0).join(';'));
            formData.set('value', values.join(';'));
            formData.set('version', currentRecord.version);
            formData.set('recordEngId', currentRecord.id);
            formData.set('id_public', 'cb_profs');
            save_step('cb_profs', formData, previousChecks);

        }
        let save_step = (_id_public, formData, previousChecks) => {
            var STEP = LOAD_STEP(_id_public);
            const request = STEP.id
                ? RECORD_ENG_SERVICE.update_step(STEP.id, formData)
                : RECORD_ENG_SERVICE.create_step(formData);

            setIsSaving(true);
            request
                .then(response => {
                    if (response.data !== 'OK') throw new Error('La API no confirmó el guardado.');
                    requestUpdateRecord?.(currentItem.id);
                })
                .catch(() => {
                    setCheckedRoles(previousChecks);
                    setSelectionError('No fue posible guardar la selección. Se restauró el estado anterior.');
                })
                .finally(() => setIsSaving(false));
        }
        return (
            <div className="record_ph_profesional_evaluation container space-y-3">
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                    <p className="text-sm font-semibold text-foreground">Profesionales de la solicitud</p>
                    <p className="text-xs text-muted-foreground">Tabla compacta para validar responsables, experiencia y soportes visibles en el informe.</p>
                </div>

                <DataTable
                    paginationComponentOptions={{ rowsPerPageText: 'Filas por pagina:', rangeSeparatorText: 'de' }}
                    noDataComponent="No hay profesionales configurados"
                    striped="true"
                    columns={columns}
                    data={buildProfessionalRows()}
                    dense
                    highlightOnHover
                    className="data-table-component"
                    noHeader
                />
                {selectionError ? <p className="mb-0 text-sm text-destructive" role="alert">{selectionError}</p> : null}
            </div >
        );
}

export default RECORD_ENG_PROFESIONALS;
