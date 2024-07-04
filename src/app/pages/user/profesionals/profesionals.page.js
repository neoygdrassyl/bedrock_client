import { MDBBreadcrumb, MDBBreadcrumbItem, MDBBtn, MDBTooltip } from 'mdb-react-ui-kit';
import { useEffect, useState } from 'react';
import profesionalsService from '../../../services/profesionals.service';
import { Link } from "react-router-dom";
import DataTable from 'react-data-table-component';
import Modal from 'react-modal';
import PROFESIONALS_MANAGE from './manage.component';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const customStylesForModal = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 2,
  },
  content: {
    position: 'absolute',
    top: '10%',
    left: '25%',
    right: '25%',
    bottom: '%',
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

export default function PROFESIONALS(props) {
  const { translation, swaMsg, globals, breadCrums } = props;

  const [load, setLoad] = useState(0);
  const [data, setData] = useState([]);
  const [list, setList] = useState([]);
  const [modal, setModal] = useState(false);
  const [clearBtn, setClearBtn] = useState(false);
  const [id, setId] = useState(false);

  useEffect(() => {
    if (load == 0) getData();
    if (data) {
      if (document.getElementById('search_text').value) search();
    }
  }, [load, data.length]);
  // ***************************  DATA GETTERS *********************** //
  // *************************  DATA CONVERTERS ********************** //
  const columns = [
    {
      name: 'TITULO',
      selector: row => row.title || '',
      sortable: true,
      filterable: true,
      center: true,
      cell: row => {
        let title_str = {
          'arq': 'AQR.',
          'eng': 'ING.',
          'law': 'ABG.',
        }
        return title_str[row.title] || '';
      },
    },
    {
      name: 'NOMBRE',
      selector: row => `${row.name} ${row.name_2} ${row.surname} ${row.surname_2}`,
      sortable: true,
      filterable: true,
      center: true,
      cell: row => `${row.name} ${row.name_2} ${row.surname} ${row.surname_2}`,
    },
    {
      name: 'DOCUMENTO',
      selector: row => row.id_number,
      sortable: true,
      filterable: true,
      center: true,
      cell: row => row.id_number,
    },
    {
      name: 'EMAIL',
      selector: row => row.email,
      sortable: true,
      filterable: true,
      center: true,
      cell: row => row.email,
    },
    {
      name: 'NUMERO',
      selector: row => row.number,
      sortable: true,
      filterable: true,
      center: true,
      cell: row => row.number,
    },
    {
      name: 'MATRICULA',
      selector: row => row.registration,
      sortable: true,
      filterable: true,
      center: true,
      cell: row => row.registration,
    },
    {
      name: 'TRATO DE DATOS',
      center: true,
      cell: row => row.concent ? <i class="fas fa-check text-success"></i>: <i class="fas fa-times text-danger"></i>,
    },
    {
      name: 'ACCIÓN',
      center: true,
      omit: window.user.id != 1 && window.user.roleId != 3,
      cell: row => <>
        <MDBTooltip title='Modificar Profesional' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1">
          <MDBBtn color='secondary' size='sm' className='px-1 py-1' onClick={() => { setId(row.id); setModal(true) }}><i class="fas fa-edit"></i></MDBBtn>
        </MDBTooltip>
        {window.user.id == 1 || window.user.roleId == 3 ?
          <MDBTooltip title='Eliminar Profesional' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1">
            <MDBBtn color='danger' size='sm' className='px-1 py-1' onClick={() => { eliminate(row.id); }}><i class="far fa-trash-alt"></i></MDBBtn>
          </MDBTooltip>
          : null}
      </>,
    },
  ]
  function clear() {
    document.getElementById('search_text').value = "";
    setData(list);
    setClearBtn(false);
  }
  function search() {
    let search_text = document.getElementById('search_text').value;
    search_text = search_text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    search_text = search_text.toLowerCase();
    search_text = search_text.trim();
    if (!search_text) {
      setData(list);
      setClearBtn(false);
    }
    else {
      setClearBtn(true);
      let new_data = list;

      new_data = new_data.filter(row => {
        var name = `${row.name} ${row.name_2} ${row.surname} ${row.surname_2}`;
        name = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        name = name.toLowerCase();
        var name_2 = `${row.name} ${row.surname}`;
        name_2 = name_2.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        name_2 = name_2.toLowerCase();
        const id_number = row.id_number;
        const id_number_2 = row.id_number.replace(/\D/g, "");
        var email = row.email;
        email = email.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        email = email.toLowerCase();
        var registration = row.registration;
        registration = registration.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        registration = registration.toLowerCase();
        var number = row.number;
        number = number.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        number = number.toLowerCase();

        const cons = [
          name.includes(search_text),
          name_2.includes(search_text),
          id_number.includes(search_text),
          id_number_2.includes(search_text),
          email.includes(search_text),
          registration.includes(search_text),
          number.includes(search_text),
        ];
        return cons.some(c => c);
      })

      setData(new_data);
    }
  }
  // ******************************* JSX ***************************** // 
  let _BTNS_COMPONENT = () => {
    return <>
      <div className='row'>
        <div className='col-3'>
          { window.user.id == 1 || window.user.roleId == 1 ? <MDBBtn color='success' onClick={() => { setId(false); setModal(!modal) }}><i class="fas fa-plus-circle"></i> NUEVO PROFESIONAL</MDBBtn> : null }
        </div>
        <div className='col'>
          <div class="row">
            <div className='col px-0'>
              <div class="input-group row">
                <MDBBtn color='primary' className='col-2' onClick={() => search()}><i class="fas fa-search"></i> BUSCAR</MDBBtn>
                <input type="text" class="form-control col" id="search_text" placeholder="Buscar..." onKeyPress={(e) => e.key === 'Enter' ? search() : ''}></input>
                {clearBtn ? <MDBBtn color='danger' className='col-1' onClick={() => clear()}><i class="fas fa-times"></i> </MDBBtn> : ''}
              </div>
            </div>
          </div>
        </div>
      </div>



    </>
  }
  // ******************************* APIS **************************** // 
  function getData() {
    profesionalsService.getAll()
      .then(response => {
        setData(response.data);
        setList(response.data);
        setLoad(1);
      })
      .catch(e => {
        console.log(e);
      })
  }
  function eliminate(id) {
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
        profesionalsService.delete(id)
          .then(response => {
            if (response.data === 'OK') {
              MySwal.fire({
                title: swaMsg.publish_success_title,
                text: swaMsg.publish_success_text,
                footer: swaMsg.text_footer,
                icon: 'success',
                confirmButtonText: swaMsg.text_btn,
              });
              setLoad(0);
            }
            else {
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
  return (
    <div>
      <MDBBreadcrumb className="mx-5 my-2">
        <MDBBreadcrumbItem>
          <Link to={'/home'}><i class="fas fa-home"></i> <label className="text-uppercase">{breadCrums.bc_01}</label></Link>
        </MDBBreadcrumbItem>
        <MDBBreadcrumbItem>
          <Link to={'/dashboard'}><i class="far fa-bookmark"></i> <label className="text-uppercase">{breadCrums.bc_u1}</label></Link>
        </MDBBreadcrumbItem>
        <MDBBreadcrumbItem active><i class="fas fa-hard-hat"></i>  <label className="text-uppercase">{'Profesionals'}</label></MDBBreadcrumbItem>
      </MDBBreadcrumb>

      <div className='row my-3 d-flex justify-content-center'>
        <div className='col-10'>
          {_BTNS_COMPONENT()}
        </div>
      </div>

      <DataTable
        pagination
        paginationPerPage={20}
        paginationRowsPerPageOptions={[20, 50, 100]}
        paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}

        noDataComponent="NO HAY PROGESIONALES"
        striped="true"
        columns={columns}
        data={data}
        highlightOnHover
        dense
        title={<>LISTADO DE PROFESIONALES <i class="fas fa-hard-hat"></i></>}

        progressPending={!load}
        progressComponent={<label className='fw-normal lead text-muted'>CARGANDO...</label>}

        defaultSortFieldId={2}
      />

      <Modal contentLabel="MANAGE PROF"
        isOpen={modal}
        style={customStylesForModal}
        ariaHideApp={false}
      >
        <div className="my-2 d-flex justify-content-between ">
          <div className='row'>
            <div class="input-group">
              <label className=''><i class="fas fa-hard-hat"></i> PROFESIONALES</label>
            </div>
          </div>


          <MDBBtn className='btn-close' color='none' onClick={() => setModal(!modal)}></MDBBtn>
        </div>
        <hr />

        <PROFESIONALS_MANAGE
          translation={translation}
          swaMsg={swaMsg}
          globals={globals}
          id={id}
          CLOSE={() => { setModal(!modal); setLoad(0); }}
          UPDATE={() => { setLoad(0); }}
        />
        <hr />
        <div className="text-end py-2">
          <MDBBtn className="btn btn-sm btn-info" onClick={() => setModal(!modal)}><i class="fas fa-times-circle"></i> CERRAR</MDBBtn>
        </div>
      </Modal>

    </div >
  );
}
