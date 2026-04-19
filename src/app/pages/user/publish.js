import { useState, useEffect, useCallback } from 'react';
import PublishService from '../../services/publish.service'
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/icon';
import DataTable from '@/components/data-table-bridge';
import Collapsible from '../../components/Collapsible';
import { PUBLISH_TYPE_ARRAY } from '../../components/vars.global'
import { LegacyModal as Modal } from '@/components/legacy-modal';
import publishService from '../../services/publish.service';


import dayjs from 'dayjs';
import { swalConfirm, swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';


function Publish({ translation, swaMsg, breadCrums }) {
  const [selectedValue, setSelectedValue] = useState("");
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [fillActive, setFillActive] = useState('1');
  const [modal, setModal] = useState(false);
  const [items_00, setItems_00] = useState([]);
  const [items_01, setItems_01] = useState([]);
  const [items_02, setItems_02] = useState([]);
  const [items_03, setItems_03] = useState([]);
  const [items_04, setItems_04] = useState([]);
  const [items_05, setItems_05] = useState([]);
  const [items_06, setItems_06] = useState([]);
  const [items_07, setItems_07] = useState([]);
  const [items_08, setItems_08] = useState([]);
  const [items_09, setItems_09] = useState([]);
  const [items_10, setItems_10] = useState([]);
  const [items_11, setItems_11] = useState([]);
  const [items_12, setItems_12] = useState([]);
  const [modalEdit, setModalEdit] = useState(false);
  const [edit, setEdit] = useState(false);
  const [filterStates, setFilterStates] = useState({});

  const retrievePublish = useCallback(() => {
    PublishService.getAll()
      .then(response => {
        let list_00 = [];
        let list_01 = [];
        let list_02 = [];
        let list_03 = [];
        let list_04 = [];
        let list_05 = [];
        let list_06 = [];
        let list_07 = [];
        let list_08 = [];
        let list_09 = [];
        let list_10 = [];
        let list_11 = [];
        let list_12 = [];
        response.data.map((item, i) => {
          if (item.type == 'lu' || item.type == 'Actos administrativos' || item.type == 'Resoluciones' || item.type == 'res') {
            list_00.push(item);
          }
          if (item.type == 'Otras actuaciones' || item.type == 'oa') {
            list_01.push(item);
          }
          if (item.type == 'mpr' || item.type == 'MPR') {
            list_02.push(item);
          }
          if (item.type == 'nv' || item.type == 'Notificacion a vecinos') {
            list_03.push(item);
          }
          if (item.type == 'pp' || item.type == 'Publicaciones de prensa') {
            list_04.push(item);
          }
          if (item.type == 'na' || item.type == 'Notificaciones de avisos') {
            list_05.push(item);
          }
          if (item.type == 'rp' || item.type == 'Respuesta de Derecho de Petición' || item.type == 'Respuesta PQRS') {
            list_06.push(item);
          }
          if (item.type == 'res') {
            list_07.push(item);
          }
          if (item.type == PUBLISH_TYPE_ARRAY[8]) {
            list_08.push(item);
          }
          if (item.type == PUBLISH_TYPE_ARRAY[9]) {
            list_08.push(item);
          }
          if (item.type == PUBLISH_TYPE_ARRAY[10]) {
            list_10.push(item);
          }
          if (item.type == PUBLISH_TYPE_ARRAY[11]) {
            list_11.push(item);
          }
          if (item.type == PUBLISH_TYPE_ARRAY[12]) {
            list_12.push(item);
          }
        });
        setItems(response.data);
        setItems_00(list_00);
        setItems_01(list_01);
        setItems_02(list_02);
        setItems_03(list_03);
        setItems_04(list_04);
        setItems_05(list_05);
        setItems_06(list_06);
        setItems_07(list_07);
        setItems_08(list_08);
        setItems_09(list_09);
        setItems_10(list_10);
        setItems_11(list_11);
        setItems_12(list_12);
        setIsLoaded(true);
      })
      .catch(e => {
        console.log(e);
      });
  }, []);

  const refreshList = useCallback(() => {
    retrievePublish();
    setCurrentItem(null);
    setCurrentIndex(-1);
  }, [retrievePublish]);

  const toggle = useCallback(() => {
    setModal(prev => !prev);
  }, []);

  const setItemFn = useCallback((item) => {
    setCurrentItem(item);
    setModal(prev => !prev);
  }, []);

  const toggleManage = useCallback((item) => {
    if (item) setItemFn(item);
    setEdit(prev => !prev);
  }, [setItemFn]);

  useEffect(() => {
    retrievePublish();
  }, [retrievePublish]);

    const selectTypePublish = PUBLISH_TYPE_ARRAY.map(function (item, i) {
      return <option>{item}</option>
    })

    const handleChange = (e) => {
      setSelectedValue(e.target.value);
    }

    const Selector = () => {
      if (selectedValue == 'oa' || selectedValue == 'lu' || selectedValue == 'mpr') {
        return <>
          <option value={'neg'}>Negada</option>
          <option value={'oto'}>Otorgada</option>
          <option value={'des'}>Desistida</option>
          <option value={'acl'}>Aclaratoria</option>
          <option value={'rev'}>Revocatoria</option>
          <option value={'rec'}>Recurso</option>
          <option value={'ren'}>Renuncia</option>
        </>
      } else if (selectedValue != 'oa' || selectedValue != 'lu' || selectedValue != 'mpr') {
        return <option value={'publicado'}>Publicado</option>
      }
    }

    const handleCheck = (e, row) => {
      // console.log(e.target.checked)
      var formData = new FormData();
      var publish = e.target.checked
      formData.set('publish', publish)

      PublishService.update(row.id, formData)
        .then(response => {
          if (response.data === 'OK') {
            console.log('exitoso')
          } else {
            console.log('fatall error')
          }
        })
        .catch(e => {
          console.log(e);
        });

    }



    const Type = (row) => {
      if (row.type == 'lu') {
        return 'Licencias urbanisticas'
      } else if (row.type == 'oa') {
        return 'Otras actuaciones'
      } else if (row.type == 'Licencias urbanisticas') {
        return 'Licencias urbanisticas'
      } else if (row.type == 'mpr') {
        return 'MPR'
      } else if (row.type == 'nv') {
        return 'Aviso vecinos colindantes' 
      } else if (row.type == 'pp') {
        return 'Citación para notificación personal'
      } else if (row.type == 'na') {
        return 'Notificaciones de avisos'
      } else if (row.type == 'rp') {
        return 'Respuesta de Derecho de Petición'
      } else if (row.type == 'res') {
        return 'Resoluciones'
      } else if (row.type == 'Otras actuaciones') {
        return 'Otras actuaciones'
      } else if (row.type == 'MPR') {
        return 'MPR'
      } else if (row.type == 'Resoluciones') {
        return 'Resoluciones'
      }
    }

    const SubType = (row) => {
      if (row.subtype == '') {
        return
      } else if (row.subtype == 'neg') {
        return 'Negada'
      } else if (row.subtype == 'oto') {
        return 'Otorgada'
      } else if (row.subtype == 'des') {
        return 'Desistida'
      } else if (row.subtype == 'acl') {
        return 'Aclaratoria'
      } else if (row.subtype == 'rev') {
        return 'Revocatoria'
      } else if (row.subtype == 'rec') {
        return 'Recurso'
      } else if (row.subtype == 'ren') {
        return 'Renuncia'
      } else if (row.subtype == 'publicado') {
        return 'Publicado'
      }
    }

    let _PARSE_URL = (_path) => {
      var new_path = _path;
      new_path = new_path.toLowerCase();
      new_path = new_path.replace(/ /g, "");
      return new_path;
    }

    const columns = [
      {
        name: <h4>ID Publico</h4>,
        selector: row => row.id_publico,
        sortable: true,
        filterable: true,
        minWidth: '100px',
        cell: row => <span className="text-sm">{row.id_publico}</span>
      },
      {
        name: <h4>Fecha</h4>,
        selector: row => row.date,
        sortable: true,
        minWidth: '100px',
        cell: row => <span className="text-sm">{row.date}</span>
      },
      {
        name: <h4>Tipo</h4>,
        minWidth: '100px',
        cell: row => <label className='text-justify'>{Type(row)}</label>
      },
      {
        name: <h4>Estado</h4>,
        minWidth: '100px',
        cell: row => <label className='text-justify'>{SubType(row)}</label>
      },
      {
        name: <h4>Tipo actuacion</h4>,
        minWidth: '140px',
        cell: row => <label className='text-justify'>{row.detail}</label>
      },
      {
        name: <h4>Modalidad y/o detalle</h4>,
        minWidth: '205px',
        cell: row => <label className='text-justify'>{row.subdetail}</label>
      },
      {
        name: <h4>Publicado</h4>,
        minWidth: '100px',
        cell: row => <div className="form-check form-switch">
          <input className="form-check-input" type="checkbox" defaultChecked={row.publish} role="switch" id="checkbox1" onChange={(e) => handleCheck(e, row)} />
        </div>
      },
      {
        name: <h4>Acción</h4>,
        button: true,
        minWidth: '170px',
        cell: row => <>
          <button className="btn btn-secondary btn-sm m-0 px-2 shadow-none" onClick={() => { toggleManage(); setEdit(row); }}><Icon name="edit" size={16} /></button>
          <div className='px-1'>
            <button className="btn btn-danger btn-sm m-0 px-2 shadow-none" onClick={() => handleDelete(row)}><Icon name="trash" size={16} /></button>
          </div>
          <div className='px-0'></div>
          <a className="btn btn-sm btn-danger px-1" target="_blank"
            href={import.meta.env.VITE_API_URL + '/files/publish/' + _PARSE_URL(row.type) + '/publish_' + _PARSE_URL(row.type) + '_' + row.pdf_path} ><Icon name="cloud-download-alt" size={16} /> Descargar</a></>
        ,
      },
    ]

    const customStyles = {
      overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
        zIndex: 2
      },
      content: {
        position: 'absolute',
        top: '40px',
        left: '15%',
        right: '15%',
        bottom: '40px',
        border: '1px solid #ccc',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        borderRadius: '4px',
        outline: 'none',
        padding: '20px',
        marginRight: 'auto',
      }
    };

    var formData = new FormData();

    let handleSubmit = (event) => {
      event.preventDefault();
      let id_publico = document.getElementById('publish_1').value;
      formData.set('id_publico', id_publico);
      let type = document.getElementById('publish_2').value;
      formData.set('type', type);
      let subtype = document.getElementById('publish_4').value;
      formData.set('subtype', subtype);
      let detail = document.getElementById('publish_3').value;
      formData.set('detail', detail);
      let subdetail = document.getElementById('publish_5').value;
      formData.set('subdetail', subdetail);
      formData.set('publish', true)
      let date = document.getElementById('publish_date').value;
      formData.set('date', date);
      let type_string = type.toLowerCase();
      type_string = type_string.replace(/ /g, "");
      let attach = document.getElementById('file').files[0];
      if (attach) {
        formData.append('file', attach, "publish_" + type_string + "_" + attach.name);
      }

      swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });

      PublishService.create(formData)
        .then(response => {
          if (response.data === 'OK') {
            swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
            document.getElementById("app-form").reset();
            formData = new FormData();
            formData.set('type', 0);
            formData.set('file', null);
            refreshList();
          }
        })
        .catch(e => {
          console.log(e);
        });

    };

    let handleEdit = (event) => {
      event.preventDefault();
      let id_publico = document.getElementById('edit_id').value;
      formData.set('id_publico', id_publico);
      let type = document.getElementById('type_edit').value;
      formData.set('type', type);
      let subtype = document.getElementById('estate_edit').value;
      formData.set('subtype', subtype);
      let date = document.getElementById('date_edit').value;
      formData.set('date', date);
      let detail = document.getElementById('detail_edit').value;
      formData.set('detail', detail);
      let subdetail = document.getElementById('sub_edit').value;
      formData.set('subdetail', subdetail);
      //formData.set('publish', true)

      swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });

      PublishService.update(edit.id, formData)
        .then(response => {
          if (response.data === 'OK') {
            swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
            document.getElementById("app-form").reset();
            formData = new FormData();
            formData.set('type', 0);
            formData.set('file', null);
            refreshList();
            toggleManage();
          }
        })
        .catch(e => {
          console.log(e);
        });


    }

    const handleDelete = (row) => {

      swalConfirm({ title: "ELIMINAR ESTE ITEM", text: "¿Esta seguro de eliminar de forma permanente este item?", icon: 'question', confirmButtonText: "ELIMINAR" }).then(SweetAlertResult => {
        if (SweetAlertResult.isConfirmed) {
          swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
          publishService.delete(row.id)
            .then(response => {
              if (response.data === 'OK') {
                swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                refreshList();
                setEdit(false);
              } else {
                swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
              }
            })
            .catch(e => {
              console.log(e);
              swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
            });
        }
      });
    }


    let LIISTS = (datas, ID) => {

      const subHeaderComponentMemo = () => {
        return (
          <div className="input-group mb-2">
            <span className="input-group-text bg-info text-white">
              <Icon name="search" size={16} />
            </span>
            <input type='text' className='form-control' placeholder='Busqueda...' onChange={(e) => setFilterStates(prev => ({ ...prev, [ID]: e.target.value }))} />
          </div>
        );
      }

      if (datas.length > 0) return <DataTable
        paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
        noDataComponent="No hay publicaciones en estos momentos"
        striped="true"
        columns={columns}
        data={datas.filter(item => item.id_publico && item.id_publico.toLowerCase().includes((filterStates[ID] ?? '').toLowerCase()))}
        highlightOnHover

        pagination
        paginationPerPage={20}
        paginationRowsPerPageOptions={[20, 50, 100]}
        className="data-table-component"
        noHeader
        dense
        defaultSortFieldId={1}
        defaultSortAsc={false}

        progressPending={!isLoaded}
        progressComponent={<label className='fw-normal lead text-muted'>CARGANDO...</label>}

        subHeader
        subHeaderComponent={subHeaderComponentMemo()}
      />
      else return <label className='fw-normal lead text-muted'>NO HAY INFORMACIÓN</label>

    }

    let COLLAPSIBLE_JSX = (title, data, ID) => {
      return <>
        <Collapsible trigger={<><label className="mx-2"> {title} ({data.length})</label>
          <button className="btn btn-primary btn-sm"><Icon name="plus" size={16} /> Ver Lista</button></>}>
          {LIISTS(data, ID)}
        </Collapsible>
      </>
    }

    let PUBLIC_FORM = () => {
      return <>
        <Card className="my-2">
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} id="app-form">
              <div className="row">
                <div className="col-md-6">
                  <label>Identificador público</label><br />
                  <div className="input-group mb-3">
                    <span className="input-group-text bg-info text-white">
                      <Icon name="file-signature" size={16} />
                    </span>
                    <input type="text" className="form-control" placeholder="ID Documento" required id="publish_1" />
                  </div>
                  <label>Tipo de documento</label><br />
                  <div className="input-group mb-3">
                    <span className="input-group-text bg-info text-white" id="type-pqrs">
                      <Icon name="id-card" size={16} />
                    </span>
                    <select className="form-select" id="publish_2" required onChange={(e) => handleChange(e)}>
                      <option value="lu">Licencias urbanísticas</option>
                      <option value="oa">Otras actuaciones</option>
                      <option value="mpr">MPR</option>
                      <option value="nv">Aviso a vecinos colindantes</option>
                      <option value="pp">Citación para notificación personal</option>
                      <option value="na">Notificaciones de avisos</option>
                      <option value="rp">Actos generales y respuestas PQRS</option>
                      <option value="res">Resoluciones</option>
                    </select>
                  </div>
                  <label>Estado documento</label><br />
                  <div className="input-group mb-3">
                    <span className="input-group-text bg-info text-white" id="type-pqrs">
                      <Icon name="id-card" size={16} />
                    </span>
                    <select className="form-select" id="publish_4" >
                      {Selector()}
                    </select>
                  </div>
                  <label>Fecha</label><br />
                  <div className="input-group mb-3">
                    <span className="input-group-text bg-info text-white">
                      <Icon name="file-signature" size={16} />
                    </span>
                    <input type="date" className="form-control" required id="publish_date" />
                  </div>
                </div>
                <div className="col-md-6">
                  <label>Documento a subir</label><br />
                  <div className="input-group my-2">
                    <label className="input-group-text bg-info  text-white" htmlFor="file"><Icon name="paperclip" size={16} /></label>
                    <input type="file" className="form-control" id="file" accept="application/pdf" required />
                  </div>
                  <label>Tipo de actuación</label>
                  <div className="input-group mb-3">
                    <span className="input-group-text bg-info text-white" id="type-pqrs">
                      <Icon name="id-card" size={16} />
                    </span>
                    <select className="form-select" required id="publish_3">
                      <option>Otros</option>
                      <option disabled className='fw-bold'> LICENCIAS URBANÍSTICAS O RECONOCIMIENTOS</option>
                        <option>Licencias de construcción</option>
                        <option>Reconocimientos de edificación</option>
                        <option>Licencias de urbanización</option>
                        <option>Licencias de subdivisión</option>
                        <option>Licencias de parcelación</option>
                      <hr></hr>
                      <option disabled className='fw-bold'> OTRAS ACTUACIONES </option>
                        <option>Aprobación de planos PH</option>
                        <option>Concepto de norma urbanística</option>
                        <option>Concepto de uso de suelo</option>
                        <option>Ajustes de cotas de áreas</option>
                        <option>Autorización de movimientos de tierras</option>
                        <option>Aprobación de piscinas</option>
                        <option>Copia certificada de planos</option>
                      <option disabled className='fw-bold'> MLV - PRO - REV</option>
                      <option>Modificación de licencias vigentes </option>
                      <option>Prorroga de licencias y revalidaciones </option>
                      <option>Revalidación de licencias </option>
                    </select>
                  </div>
                  <label>Modalidad y/o detalle</label>
                  <div className="input-group mb-3">
                    <span className="input-group-text bg-info text-white">
                      <Icon name="file-signature" size={16} />
                    </span>
                    <input type="text" className="form-control" placeholder="Detalles de la publicacion..." id="publish_5" />
                  </div>
                </div>
                <div className="text-center py-1 mt-1">
                  <button className="btn btn-lg btn-info"> Enviar </button>
                </div>


              </div>
            </form>
          </CardContent>
        </Card>

      </>
    }

    let Edit_components = () => {
      var _ITEM = edit;

      return <>
        <Card className="my-4 py-4">
          <CardContent className="pt-4">
            <form onSubmit={handleEdit} id="app-form">
              <div className="row">
                <div className="col-md-6">
                  <label>Id publico</label><br />
                  <div className="input-group mb-3">
                    <span className="input-group-text bg-info text-white">
                      <Icon name="file-signature" size={16} />
                    </span>
                    <input type="text" className="form-control" placeholder="ID Documento" defaultValue={_ITEM.id_publico} required id="edit_id" disabled />
                  </div>
                  <label>Tipo de documento</label><br />
                  <div className="input-group mb-3">
                    <span className="input-group-text bg-info text-white" id="type-pqrs">
                      <Icon name="id-card" size={16} />
                    </span>
                    <select className="form-select" id="type_edit" defaultValue={_ITEM.type} required onChange={(e) => handleChange(e)}>
                      <option disabled >Tipo de Documento</option>
                      <option value={'lu'}>Licencias urbanisticas</option>
                      <option value={'oa'}>Otras actuaciones</option>
                      <option value={'mpr'}>MPR</option>
                      <option value={'nv'}>Aviso vecinos colindantes </option>
                      <option value={'pp'}>Citación para notificación personal</option>
                      <option value={'na'}>Notificaciones de avisos</option>
                      <option value={'rp'}>Actos generales y respuestas pqrs</option>
                      <option value={'res'}>Resoluciones</option>
                    </select>
                  </div>
                  <label>Estado documento</label><br />
                  <div className="input-group mb-3">
                    <span className="input-group-text bg-info text-white" id="type-pqrs">
                      <Icon name="id-card" size={16} />
                    </span>
                    <select className="form-select" id="estate_edit" defaultValue={_ITEM.subtype} >
                      <option value={'neg'}>Negada</option>
                      <option value={'oto'}>Otorgada</option>
                      <option value={'des'}>Desistida</option>
                      <option value={'acl'}>Aclaratoria</option>
                      <option value={'rev'}>Revocatoria</option>
                      <option value={'rec'}>Recurso</option>
                      <option value={'ren'}>Renuncia</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <label>Fecha</label><br />
                  <div className="input-group my-2">
                    <label className="input-group-text bg-info  text-white" htmlFor="date"><Icon name="paperclip" size={16} /></label>
                    <input type="date" className="form-control" id="date_edit" defaultValue={_ITEM.date} required />
                  </div>
                  <label>Tipo de actuacion</label>
                  <div className="input-group mb-3">
                    <span className="input-group-text bg-info text-white" id="type-pqrs">
                      <Icon name="id-card" size={16} />
                    </span>
                    <select className="form-select" defaultValue={_ITEM.detail} required id="detail_edit">
                      <option>Otros</option>
                      <option disabled className='fw-bold'> LICENCIAS URBANÍSTICAS O RECONOCIMIENTOS</option>
                      <option >Licencias de construcción</option>
                      <option >Reconocimientos de edificación</option>
                      <option >Licencias de urbanización </option>
                      <option >Licencias de subdivisión </option>
                      <option >Licencias de parcelación </option>
                      <hr></hr>
                      <option disabled className='fw-bold'> OTRAS ACTUACIONES </option>
                      <option >Aprobación de planos ph</option>
                      <option >Concepto de norma urbanística</option>
                      <option >Concepto uso de suelo</option>
                      <option >Ajustes de cotas de áreas </option>
                      <option >Autorización movimientos de tierras </option>
                      <option >Aprobación de piscinas</option>
                      <option >Copia certificada planos</option>
                      <option disabled className='fw-bold'> MLV - PRO - REV</option>
                      <option>Modificación de licencias vigentes </option>
                      <option>Prorroga de licencias y revalidaciones </option>
                      <option>Revalidación de licencias </option>
                    </select>
                  </div>
                  <label>Modalidad y/o detalle</label>
                  <div className="input-group mb-3">
                    <span className="input-group-text bg-info text-white">
                      <Icon name="file-signature" size={16} />
                    </span>
                    <input type="text" className="form-control" defaultValue={_ITEM.subdetail}  id="sub_edit" />
                  </div>
                </div>
                <div className="text-center py-1 mt-1">
                  <button className="btn btn-sm btn-success"> Enviar </button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </>
    }

    return (

      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Publicar</h1>
          <p className="text-sm text-muted-foreground mt-1">Publicación de documentos de la Curaduría</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {PUBLIC_FORM()}
        </div>

        <div>
          {COLLAPSIBLE_JSX(PUBLISH_TYPE_ARRAY[0], items_00, 'ID00')}
          {COLLAPSIBLE_JSX(PUBLISH_TYPE_ARRAY[1], items_01, 'ID02')}
          {COLLAPSIBLE_JSX(PUBLISH_TYPE_ARRAY[2], items_02, 'ID03')}
          {COLLAPSIBLE_JSX(PUBLISH_TYPE_ARRAY[3], items_03, 'ID04')}
          {COLLAPSIBLE_JSX(PUBLISH_TYPE_ARRAY[4], items_04, 'ID05')}
          {COLLAPSIBLE_JSX(PUBLISH_TYPE_ARRAY[5], items_05, 'ID06')}
          {COLLAPSIBLE_JSX(PUBLISH_TYPE_ARRAY[6], items_06, 'ID07')}
          {/* {COLLAPSIBLE_JSX(PUBLISH_TYPE_ARRAY[7], items_07, 'ID08')}*/}
        </div>

        <Modal contentLabel="MANAGE EDIT"
          isOpen={edit}
          style={customStyles}
          ariaHideApp={false}
        >
          <div className="my-4 d-flex justify-content-between">
            <h3>MODIFICAR PETICION</h3>
            <button type="button" className='btn-close' onClick={() => { toggleManage() }} />
          </div>
          <hr />
          {Edit_components()}

          <div className="text-end py-4 mt-3">
            <button className="btn btn-lg btn-info" onClick={() => toggleManage()}><Icon name="times-circle" size={16} /> CERRAR </button>
          </div>
        </Modal>
      </div>
    );
}

export default Publish;