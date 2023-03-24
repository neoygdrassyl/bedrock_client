import React, { Component } from 'react';
import PublishService from '../../services/publish.service'
import {
  MDBRow, MDBCol, MDBCard, MDBCardBody,
  MDBBtn,
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter, MDBBreadcrumb, MDBBreadcrumbItem, MDBTabs, MDBTabsItem, MDBTabsLink, MDBTabsPane, MDBTabsContent
} from 'mdb-react-ui-kit';
import { Link } from "react-router-dom";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import DataTable from 'react-data-table-component';
import Collapsible from 'react-collapsible';
import { PUBLISH_TYPE_ARRAY } from '../../components/vars.global'
import Modal from 'react-modal';
import publishService from '../../services/publish.service';


const moment = require('moment');


class Publish extends Component {
  constructor(props) {
    super(props);
    this.retrievePublish = this.retrievePublish.bind(this);
    this.refreshList = this.refreshList.bind(this);
    this.state = {
      selectedValue: "",
      error: null,
      isLoaded: false,
      items: [],
      currentItem: null,
      currentIndex: -1,
      fillActive: '1',
      modal: false,
      items_00: [], // Administrative Acts
      items_01: [], // Replies to neighbours
      items_02: [],
      items_03: [],
      items_04: [],
      items_05: [],
      items_06: [],
      items_07: [],
      items_08: [],
      items_09: [],
      items_10: [],
      items_11: [],
      items_12: [],
      Subtype: [
        'Negada',
        'Otorgada',
        'Desistida',
        'Aclaratoria',
        'Revocatoria',
        'Recurso',
        'Renuncia',
      ],
      Subtype2: [
        'Negada',
        'Otorgada',
        'Desistida',
        'Aclaratoria',
        'Revocatoria',
        'Recurso',
        'Renuncia',
      ],
      modalEdit: false,
      edit: false,

    };
  }



  componentDidMount() {
    this.retrievePublish();
  }

  retrievePublish() {
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
        this.setState({
          items: response.data,
          items_00: list_00,
          items_01: list_01,
          items_02: list_02,
          items_03: list_03,
          items_04: list_04,
          items_05: list_05,
          items_06: list_06,
          items_07: list_07,
          items_08: list_08,
          items_08: list_08,
          items_09: list_09,
          items_10: list_10,
          items_11: list_11,
          items_12: list_12,
          isLoaded: true,
        });
      })
      .catch(e => {
        console.log(e);
      });
  }
  refreshList() {
    this.retrievePublish();
    this.setState({
      currentItem: null,
      currentIndex: -1,

    });
  }
  toggle = () => {
    this.setState({
      modal: !this.state.modal
    });
  }
  getToggle = () => {
    return this.state.modal;
  }
  setItem(item) {
    this.setState({
      currentItem: item,
      modal: !this.state.modal,
    });
  }

  toggleManage = (item) => {
    if (item) this.setItem(item);
    this.setState({
      edit: !this.state.edit
    });
  }


  render() {
    const { translation, swaMsg, breadCrums } = this.props;
    const { currentItem, isLoaded, items, items_00, items_01, items_02, items_03, items_04, items_05,
      items_06, items_07, items_08, items_09, items_10, items_11, items_12, } = this.state;
    const selectTypePublish = PUBLISH_TYPE_ARRAY.map(function (item, i) {
      return <option>{item}</option>
    })

    const handleChange = (e) => {
      this.setState({ selectedValue: e.target.value })
    }

    const Selector = () => {
      if (this.state.selectedValue == 'oa' || this.state.selectedValue == 'lu' || this.state.selectedValue == 'mpr') {
        return <>
          <option value={'neg'}>Negada</option>
          <option value={'oto'}>Otorgada</option>
          <option value={'des'}>Desistida</option>
          <option value={'acl'}>Aclaratoria</option>
          <option value={'rev'}>Revocatoria</option>
          <option value={'rec'}>Recurso</option>
          <option value={'ren'}>Renuncia</option>
        </>
      } else if (this.state.selectedValue != 'oa' || this.state.selectedValue != 'lu' || this.state.selectedValue != 'mpr') {
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
        cell: row => <label>{row.id_publico}</label>
      },
      {
        name: <h4>Fecha</h4>,
        selector: row => row.date,
        sortable: true,
        minWidth: '100px',
        cell: row => <label>{row.date}</label>
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
        cell: row => <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" defaultChecked={row.publish} role="switch" id="checkbox1" onChange={(e) => handleCheck(e, row)} />
        </div>
      },
      {
        name: <h4>Acción</h4>,
        button: true,
        minWidth: '170px',
        cell: row => <>
          <button className="btn btn-secondary btn-sm m-0 px-2 shadow-none" onClick={() => { this.toggleManage(); this.setState({ edit: row }) }}><i class="fas fa-edit"></i></button>
          <div className='px-1'>
            <button className="btn btn-danger btn-sm m-0 px-2 shadow-none" onClick={() => handleDelete(row)}><i class="fas fa-trash"></i></button>
          </div>
          <div className='px-0'></div>
          <a className="btn btn-sm btn-danger px-1" target="_blank"
            href={process.env.REACT_APP_API_URL + '/files/publish/' + _PARSE_URL(row.type) + '/publish_' + _PARSE_URL(row.type) + '_' + row.pdf_path} ><i class="fas fa-cloud-download-alt"></i> Descargar</a></>
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

    const MySwal = withReactContent(Swal);
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

      MySwal.fire({
        title: swaMsg.title_wait,
        text: swaMsg.text_wait,
        icon: 'info',
        showConfirmButton: false,
      });

      PublishService.create(formData)
        .then(response => {
          if (response.data === 'OK') {
            MySwal.fire({
              title: swaMsg.publish_success_title,
              text: swaMsg.publish_success_text,
              footer: swaMsg.text_footer,
              icon: 'success',
              confirmButtonText: swaMsg.text_btn,
            });
            document.getElementById("app-form").reset();
            formData = new FormData();
            formData.set('type', 0);
            formData.set('file', null);
            this.refreshList();
          } else {
            // TODO
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

      MySwal.fire({
        title: swaMsg.title_wait,
        text: swaMsg.text_wait,
        icon: 'info',
        showConfirmButton: false,
      });

      PublishService.update(this.state.edit.id, formData)
        .then(response => {
          if (response.data === 'OK') {
            MySwal.fire({
              title: swaMsg.publish_success_title,
              text: swaMsg.publish_success_text,
              footer: swaMsg.text_footer,
              icon: 'success',
              confirmButtonText: swaMsg.text_btn,
            });
            document.getElementById("app-form").reset();
            formData = new FormData();
            formData.set('type', 0);
            formData.set('file', null);
            this.refreshList();
            this.toggleManage()
          } else {
            // TODO
          }
        })
        .catch(e => {
          console.log(e);
        });


    }

    const handleDelete = (row) => {

      MySwal.fire({
        title: "ELIMINAR ESTE ITEM",
        text: "¿Esta seguro de eliminar de forma permanente este item?",
        icon: 'question',
        confirmButtonText: "ELIMINAR",
        showCancelButton: true,
        cancelButtonText: "CANCELAR"
      }).then(SweetAlertResult => {
        if (SweetAlertResult.isConfirmed) {
          MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
          });
          publishService.delete(row.id)
            .then(response => {
              if (response.data === 'OK') {
                MySwal.fire({
                  title: swaMsg.publish_success_title,
                  text: swaMsg.publish_success_text,
                  footer: swaMsg.text_footer,
                  icon: 'success',
                  confirmButtonText: swaMsg.text_btn,
                });
                this.refreshList();
                this.setState({ edit: false });
              } else {
                MySwal.fire({
                  title: swaMsg.generic_eror_title,
                  text: swaMsg.generic_error_text,
                  icon: 'warning',
                  confirmButtonText: swaMsg.text_btn,
                });
              }
            })
            .catch(e => {
              console.log(e);
              MySwal.fire({
                title: swaMsg.generic_eror_title,
                text: swaMsg.generic_error_text,
                icon: 'warning',
                confirmButtonText: swaMsg.text_btn,
              });
            });
        }
      });
    }


    let LIISTS = (datas, ID) => {

      const subHeaderComponentMemo = () => {
        return (
          <div class="input-group mb-2">
            <span class="input-group-text bg-info text-white">
              <i class="fas fa-search"></i>
            </span>
            <input type='text' className='form-control' placeholder='Busqueda...' onChange={(e) => this.setState({ [ID]: e.target.value })} />
          </div>
        );
      }

      if (datas.length > 0) return <DataTable
        paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
        noDataComponent="No hay publicaciones en estos momentos"
        striped="true"
        columns={columns}
        data={datas.filter(item => item.id_publico && item.id_publico.toLowerCase().includes((this.state[ID] ?? '').toLowerCase()))}
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
          <button className="btn btn-primary btn-sm"><i class="fas fa-plus"></i> Ver Lista</button></>}>
          {LIISTS(data, ID)}
        </Collapsible>
      </>
    }

    let PUBLIC_FORM = () => {
      return <>
        <MDBCard className="bg-card my-2">
          <MDBCardBody>
            <form onSubmit={handleSubmit} id="app-form">
              <MDBRow>
                <MDBCol md="6">
                  <label>Id publico</label><br />
                  <div class="input-group mb-3">
                    <span class="input-group-text bg-info text-white">
                      <i class="fas fa-file-signature"></i>
                    </span>
                    <input type="text" class="form-control" placeholder="ID Documento" required id="publish_1" />
                  </div>
                  <label>Tipo de documento</label><br />
                  <div class="input-group mb-3">
                    <span class="input-group-text bg-info text-white" id="type-pqrs">
                      <i class="fas fa-id-card"></i>
                    </span>
                    <select class="form-select" id="publish_2" required onChange={(e) => handleChange(e)}>
                      <option selected disabled >Tipo de Documento</option>
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
                  <div class="input-group mb-3">
                    <span class="input-group-text bg-info text-white" id="type-pqrs">
                      <i class="fas fa-id-card"></i>
                    </span>
                    <select class="form-select" id="publish_4" >
                      {Selector()}
                    </select>
                  </div>
                  <label>Fecha</label><br />
                  <div class="input-group mb-3">
                    <span class="input-group-text bg-info text-white">
                      <i class="fas fa-file-signature"></i>
                    </span>
                    <input type="date" class="form-control" required id="publish_date" />
                  </div>
                </MDBCol>
                <MDBCol md="6">
                  <label>Documento a subir</label><br />
                  <div class="input-group my-2">
                    <label class="input-group-text bg-info  text-white" for="file"><i class="fas fa-paperclip"></i></label>
                    <input type="file" class="form-control" id="file" accept="application/pdf" required />
                  </div>
                  <label>Tipo de actuacion</label>
                  <div class="input-group mb-3">
                    <span class="input-group-text bg-info text-white" id="type-pqrs">
                      <i class="fas fa-id-card"></i>
                    </span>
                    <select class="form-select" required id="publish_3">
                      <option>Otros</option>
                      <option selected disabled className='fw-bold'> LICENCIAS URBANÍSTICAS O RECONOCIMIENTOS</option>
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
                  <div class="input-group mb-3">
                    <span class="input-group-text bg-info text-white">
                      <i class="fas fa-file-signature"></i>
                    </span>
                    <input type="text" class="form-control" placeholder="Detalles de la publicacion..." id="publish_5" />
                  </div>
                </MDBCol>
                <div className="text-center py-1 mt-1">
                  <button className="btn btn-lg btn-info"> Enviar </button>
                </div>


              </MDBRow>
            </form>
          </MDBCardBody>
        </MDBCard>

      </>
    }

    let Edit_components = () => {
      var _ITEM = this.state.edit;

      return <>
        <MDBCard className="bg- my-4 py-4">
          <MDBCardBody>
            <form onSubmit={handleEdit} id="app-form">
              <MDBRow>
                <MDBCol md="6">
                  <label>Id publico</label><br />
                  <div class="input-group mb-3">
                    <span class="input-group-text bg-info text-white">
                      <i class="fas fa-file-signature"></i>
                    </span>
                    <input type="text" class="form-control" placeholder="ID Documento" defaultValue={_ITEM.id_publico} required id="edit_id" disabled />
                  </div>
                  <label>Tipo de documento</label><br />
                  <div class="input-group mb-3">
                    <span class="input-group-text bg-info text-white" id="type-pqrs">
                      <i class="fas fa-id-card"></i>
                    </span>
                    <select class="form-select" id="type_edit" defaultValue={_ITEM.type} required onChange={(e) => handleChange(e)}>
                      <option selected disabled >Tipo de Documento</option>
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
                  <div class="input-group mb-3">
                    <span class="input-group-text bg-info text-white" id="type-pqrs">
                      <i class="fas fa-id-card"></i>
                    </span>
                    <select class="form-select" id="estate_edit" defaultValue={_ITEM.subtype} >
                      <option value={'neg'}>Negada</option>
                      <option value={'oto'}>Otorgada</option>
                      <option value={'des'}>Desistida</option>
                      <option value={'acl'}>Aclaratoria</option>
                      <option value={'rev'}>Revocatoria</option>
                      <option value={'rec'}>Recurso</option>
                      <option value={'ren'}>Renuncia</option>
                    </select>
                  </div>
                </MDBCol>
                <MDBCol md="6">
                  <label>Fecha</label><br />
                  <div class="input-group my-2">
                    <label class="input-group-text bg-info  text-white" for="date"><i class="fas fa-paperclip"></i></label>
                    <input type="date" class="form-control" id="date_edit" defaultValue={_ITEM.date} required />
                  </div>
                  <label>Tipo de actuacion</label>
                  <div class="input-group mb-3">
                    <span class="input-group-text bg-info text-white" id="type-pqrs">
                      <i class="fas fa-id-card"></i>
                    </span>
                    <select class="form-select" defaultValue={_ITEM.detail} required id="detail_edit">
                      <option>Otros</option>
                      <option selected disabled className='fw-bold'> LICENCIAS URBANÍSTICAS O RECONOCIMIENTOS</option>
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
                  <div class="input-group mb-3">
                    <span class="input-group-text bg-info text-white">
                      <i class="fas fa-file-signature"></i>
                    </span>
                    <input type="text" class="form-control" defaultValue={_ITEM.subdetail}  id="sub_edit" />
                  </div>
                </MDBCol>
                <div className="text-center py-1 mt-1">
                  <button className="btn btn-sm btn-success"> Enviar </button>
                </div>
              </MDBRow>
            </form>
          </MDBCardBody>
        </MDBCard>
      </>
    }

    return (

      <div className="Publish container">
        <div className="row my-4 d-flex justify-content-center">
          <MDBBreadcrumb className="mx-5">
            <MDBBreadcrumbItem>
              <Link to={'/home'}><i class="fas fa-home"></i> <label className="text-uppercase">{breadCrums.bc_01}</label></Link>
            </MDBBreadcrumbItem>
            <MDBBreadcrumbItem>
              <Link to={'/dashboard'}><i class="far fa-bookmark"></i> <label className="text-uppercase">{breadCrums.bc_u1}</label></Link>
            </MDBBreadcrumbItem>
            <MDBBreadcrumbItem active><i class="fas fa-file-alt"></i>  <label className="text-uppercase">{breadCrums.bc_u3}</label></MDBBreadcrumbItem>
          </MDBBreadcrumb>
          <div className="col-lg-11 col-md-12">
            <h1 className="text-center my-4">Publicar</h1>
            <hr />
            <MDBRow center>
              <MDBCol md="9" >
                <h4>Publicacion de documentos de la Curaduria N°1 de Bucaramanga</h4>
                {PUBLIC_FORM()}
              </MDBCol>
            </MDBRow>

            <MDBRow>

              <MDBCol md="12">
                <div className="text-center">
                  {COLLAPSIBLE_JSX(PUBLISH_TYPE_ARRAY[0], items_00, 'ID00')}
                  {COLLAPSIBLE_JSX(PUBLISH_TYPE_ARRAY[1], items_01, 'ID02')}
                  {COLLAPSIBLE_JSX(PUBLISH_TYPE_ARRAY[2], items_02, 'ID03')}
                  {COLLAPSIBLE_JSX(PUBLISH_TYPE_ARRAY[3], items_03, 'ID04')}
                  {COLLAPSIBLE_JSX(PUBLISH_TYPE_ARRAY[4], items_04, 'ID05')}
                  {COLLAPSIBLE_JSX(PUBLISH_TYPE_ARRAY[5], items_05, 'ID06')}
                  {COLLAPSIBLE_JSX(PUBLISH_TYPE_ARRAY[6], items_06, 'ID07')}
                  {/* {COLLAPSIBLE_JSX(PUBLISH_TYPE_ARRAY[7], items_07, 'ID08')}*/}
                </div>
              </MDBCol>
            </MDBRow>
          </div>
        </div>
        <Modal contentLabel="MANAGE EDIT"
          isOpen={this.state.edit}
          style={customStyles}
          ariaHideApp={false}
        >
          <div className="my-4 d-flex justify-content-between">
            <h3>MODIFICAR PETICION</h3>
            <div className='btn-close' color='none' onClick={() => { this.toggleManage() }}></div>
          </div>
          <hr />
          {Edit_components()}

          <div className="text-end py-4 mt-3">
            <button className="btn btn-lg btn-info" onClick={() => this.toggleManage()}><i class="fas fa-times-circle"></i> CERRAR </button>
          </div>
        </Modal>
      </div >
    );
  }
}

export default Publish;