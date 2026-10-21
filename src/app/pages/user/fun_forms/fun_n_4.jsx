import FUNService from '../../../services/fun.service'
import { Button } from '@/components/ui/button';
import DataTable from '@/components/data-table-bridge';
import { Icon } from '@/components/icon';
import { swalConfirm, swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';
import FunUpdateSectionLegend from './components/FunUpdateSectionLegend.jsx';

const BOUNDARY_TYPES = [
  { value: 'TRADICIONAL', title: 'Linderos Tradicionales', internal: false },
  { value: 'TECNICO', title: 'Linderos Técnicos', internal: true },
];
const DIRECTIONS = ['NORTE', 'SUR', 'ORIENTE', 'OCCIDENTE'];
const POINT_LABEL_PATTERN = /^[A-Za-z0-9]+$/;

const FUNN4 = ({ swaMsg, currentItem, requestUpdate }) => {
  const boundaries = [
    ...(Array.isArray(currentItem.fun_4s) ? currentItem.fun_4s : []).map(item => ({ ...item, tipo: 'TRADICIONAL', rowKey: `tradicional-${item.id}` })),
  ];
  const technicalBoundaries = (Array.isArray(currentItem.fun_4_technicals) ? currentItem.fun_4_technicals : [])
    .map(item => ({ ...item, rowKey: `tecnico-${item.id}` }));

  const createBoundary = (tipo) => {
    const suffix = tipo.toLowerCase();
    const coord = document.getElementById(`f_41_${suffix}`)?.value || '';
    const longitud = document.getElementById(`f_42_${suffix}`)?.value.trim() || '';
    const colinda = document.getElementById(`f_43_${suffix}`)?.value.trim() || '';
    const numericLength = Number(longitud.replace(',', '.'));

    if (!DIRECTIONS.includes(coord) || !Number.isFinite(numericLength) || numericLength <= 0 || !colinda) {
      swalError({ title: 'Campos incompletos', text: 'Indique un lindero, una longitud positiva y el predio colindante.' });
      return;
    }

    const formData = new FormData();
    formData.set('fun0Id', currentItem.id);
    formData.set('coord', coord);
    formData.set('longitud', longitud);
    formData.set('colinda', colinda);

    swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
    const request = tipo === 'TECNICO'
      ? FUNService.create_fun4Technical(formData)
      : FUNService.create_fun4(formData);
    request.then(response => {
      if (response.data === 'OK') {
        swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
        requestUpdate(currentItem.id);
      } else {
        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
      }
    }).catch(() => {
      swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
    });
  };

  const createTechnicalBoundary = () => {
    const values = ['lindero', 'puntoInicialEtiqueta', 'puntoInicialX', 'puntoInicialY', 'puntoFinalEtiqueta', 'puntoFinalX', 'puntoFinalY', 'distancia', 'rumbo', 'colindante']
      .reduce((payload, field) => ({ ...payload, [field]: document.getElementById(`f_4t_${field}`)?.value.trim() || '' }), {});
    const numericValues = ['puntoInicialX', 'puntoInicialY', 'puntoFinalX', 'puntoFinalY', 'distancia']
      .map(field => Number(values[field].replace(',', '.')));

    if (!values.lindero || !values.rumbo || !values.colindante || !POINT_LABEL_PATTERN.test(values.puntoInicialEtiqueta)
      || !POINT_LABEL_PATTERN.test(values.puntoFinalEtiqueta) || numericValues.some(value => !Number.isFinite(value)) || numericValues[4] <= 0) {
      swalError({ title: 'Campos incompletos', text: 'Ingrese etiquetas alfanuméricas, coordenadas válidas, distancia positiva, rumbo y colindante.' });
      return;
    }

    const formData = new FormData();
    formData.set('fun0Id', currentItem.id);
    Object.entries(values).forEach(([field, value]) => formData.set(field, value));

    swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
    FUNService.create_fun4Technical(formData).then(response => {
      if (response.data === 'OK') {
        swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
        requestUpdate(currentItem.id);
      } else {
        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
      }
    }).catch(() => {
      swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
    });
  };

  const deleteBoundary = (id, tipo) => {
    swalConfirm({
      title: 'ELIMINAR ESTE ITEM',
      text: '¿Esta seguro de eliminar de forma permanente este item?',
      icon: 'question',
      confirmButtonText: 'ELIMINAR',
    }).then(result => {
      if (!result.isConfirmed) return;
      swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
      const request = tipo === 'TECNICO' ? FUNService.delete_4Technical(id) : FUNService.delete_4(id);
      request.then(response => {
        if (response.data === 'OK') {
          swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
          requestUpdate(currentItem.id);
        } else {
          swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
        }
      }).catch(() => {
        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
      });
    });
  };

  const columns = [
    { name: 'LINDEROS', selector: row => row.coord, sortable: true, filterable: true, cell: row => <span className="text-sm">{row.coord}</span> },
    { name: 'LONGITUD', selector: row => row.longitud, sortable: true, filterable: true, cell: row => <span className="text-sm">{row.longitud}</span> },
    { name: 'COLINDA CON', selector: row => row.colinda, cell: row => <span className="text-sm">{row.colinda}</span> },
    { name: 'ACCIÓN', button: true, cell: row => <Button variant="destructive" size="sm" onClick={() => deleteBoundary(row.id, row.tipo)}><Icon name="trash-alt" size={16} /></Button> },
  ];

  const technicalColumns = [
    { name: 'LINDERO', selector: row => row.lindero || row.coord || '', cell: row => <span className="text-sm">{row.lindero || row.coord || '-'}</span> },
    { name: 'PUNTO INICIAL', selector: row => row.puntoInicialEtiqueta || '', cell: row => <span className="text-sm">{row.puntoInicialEtiqueta ? `${row.puntoInicialEtiqueta} (${row.puntoInicialX}, ${row.puntoInicialY})` : '-'}</span> },
    { name: 'PUNTO FINAL', selector: row => row.puntoFinalEtiqueta || '', cell: row => <span className="text-sm">{row.puntoFinalEtiqueta ? `${row.puntoFinalEtiqueta} (${row.puntoFinalX}, ${row.puntoFinalY})` : '-'}</span> },
    { name: 'DISTANCIA', selector: row => row.distancia || row.longitud || '', cell: row => <span className="text-sm">{row.distancia || row.longitud || '-'}</span> },
    { name: 'RUMBO', selector: row => row.rumbo || '', cell: row => <span className="text-sm">{row.rumbo || '-'}</span> },
    { name: 'COLINDA CON', selector: row => row.colindante || row.colinda || '', cell: row => <span className="text-sm">{row.colindante || row.colinda || '-'}</span> },
    { name: 'ACCIÓN', button: true, cell: row => <Button variant="destructive" size="sm" onClick={() => deleteBoundary(row.id, 'TECNICO')}><Icon name="trash-alt" size={16} /></Button> },
  ];

  const BoundaryBox = ({ value, title, internal }) => {
    const suffix = value.toLowerCase();
    return <section className="rounded-md border border-border bg-card p-3 shadow-sm" aria-label={title}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="mb-0 text-sm font-semibold">{title}</h3>
        {internal ? <span className="rounded bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground">CONTROL INTERNO</span> : null}
      </div>
      {internal ? <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <label htmlFor="f_4t_lindero">Lindero</label>
          <input type="text" className="form-control mt-1" id="f_4t_lindero" />
        </div>
        <div>
          <label htmlFor="f_4t_rumbo">Rumbo</label>
          <input type="text" className="form-control mt-1" id="f_4t_rumbo" />
        </div>
        <div>
          <label htmlFor="f_4t_colindante">Colindante</label>
          <input type="text" className="form-control mt-1" id="f_4t_colindante" />
        </div>
        <div>
          <label htmlFor="f_4t_puntoInicialEtiqueta">Etiqueta punto inicial</label>
          <input type="text" className="form-control mt-1" id="f_4t_puntoInicialEtiqueta" pattern="[A-Za-z0-9]+" />
        </div>
        <div>
          <label htmlFor="f_4t_puntoInicialX">Punto inicial X</label>
          <input type="text" inputMode="decimal" className="form-control mt-1" id="f_4t_puntoInicialX" />
        </div>
        <div>
          <label htmlFor="f_4t_puntoInicialY">Punto inicial Y</label>
          <input type="text" inputMode="decimal" className="form-control mt-1" id="f_4t_puntoInicialY" />
        </div>
        <div>
          <label htmlFor="f_4t_puntoFinalEtiqueta">Etiqueta punto final</label>
          <input type="text" className="form-control mt-1" id="f_4t_puntoFinalEtiqueta" pattern="[A-Za-z0-9]+" />
        </div>
        <div>
          <label htmlFor="f_4t_puntoFinalX">Punto final X</label>
          <input type="text" inputMode="decimal" className="form-control mt-1" id="f_4t_puntoFinalX" />
        </div>
        <div>
          <label htmlFor="f_4t_puntoFinalY">Punto final Y</label>
          <input type="text" inputMode="decimal" className="form-control mt-1" id="f_4t_puntoFinalY" />
        </div>
        <div>
          <label htmlFor="f_4t_distancia">Distancia (en m)</label>
          <input type="text" inputMode="decimal" className="form-control mt-1" id="f_4t_distancia" />
        </div>
      </div> : <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <label htmlFor={`f_41_${suffix}`}>4.1 Linderos</label>
          <div className="input-group mt-1">
            <span className="input-group-text bg-primary text-primary-foreground"><Icon name="compass" size={16} /></span>
            <select className="form-select" id={`f_41_${suffix}`} defaultValue="NORTE">
              {DIRECTIONS.map(direction => <option key={direction}>{direction}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor={`f_42_${suffix}`}>4.2 Longitud (en m)</label>
          <div className="input-group mt-1">
            <span className="input-group-text bg-primary text-primary-foreground"><Icon name="ruler" size={16} /></span>
            <input type="text" inputMode="decimal" className="form-control" id={`f_42_${suffix}`} />
          </div>
        </div>
        <div>
          <label htmlFor={`f_43_${suffix}`}>4.3 Colinda con</label>
          <div className="input-group mt-1">
            <span className="input-group-text bg-primary text-primary-foreground"><Icon name="home" size={16} /></span>
            <input type="text" className="form-control" id={`f_43_${suffix}`} />
          </div>
        </div>
      </div>}
      <div className="mt-3 text-right">
        <Button size="sm" onClick={internal ? createTechnicalBoundary : () => createBoundary(value)}><Icon name="file-alt" size={16} /> AÑADIR ITEM</Button>
      </div>
    </section>;
  };

  return <fieldset className="p-3">
    <FunUpdateSectionLegend id="funn_4" step="4">Linderos, Dimensiones y Áreas</FunUpdateSectionLegend>
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <BoundaryBox {...BOUNDARY_TYPES[0]} />
    </div>
    <div className="mt-4">
      <DataTable
        keyField="rowKey"
        paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
        noDataComponent="No hay Items"
        striped="true"
        columns={columns}
        data={boundaries}
        highlightOnHover
        pagination
        paginationPerPage={5}
        paginationRowsPerPageOptions={[5, 10, 15]}
        className="data-table-component"
        noHeader
      />
    </div>
    <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
      <BoundaryBox {...BOUNDARY_TYPES[1]} />
    </div>
    <div className="mt-4">
      <DataTable
        keyField="rowKey"
        paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
        noDataComponent="No hay linderos técnicos"
        striped="true"
        columns={technicalColumns}
        data={technicalBoundaries}
        highlightOnHover
        pagination
        paginationPerPage={5}
        paginationRowsPerPageOptions={[5, 10, 15]}
        className="data-table-component"
        noHeader
      />
    </div>
  </fieldset>;
};

export default FUNN4;
