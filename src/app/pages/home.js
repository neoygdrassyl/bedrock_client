import React, { Component } from 'react';
import { MDBBtn, MDBInput, MDBRow, MDBCol, MDBTypography, MDBBadge, MDBInputGroup, MDBDropdown, MDBDropdownToggle, MDBDropdownMenu, MDBDropdownItem, MDBDropdownLink, MDBInputGroupElement } from 'mdb-react-ui-kit';
import { Link } from "react-router-dom";
// Carousel IMGS
import NEW_ING from '../img/news1.jpg'
import NEW_2_ING from '../img/news_inclusivity.jpg'
import NEW_3_ING from '../img/news_certificate.jpg'
import LGOG16 from '../img/contacts/Icon2.png'
import LGOG15 from '../img/contacts/Icon.png'
import LGOG13 from '../img/pse.jpg'
import IMG1 from '../img/slider/img1.jpg'
import IMG2 from '../img/slider/img2.jpg'
import IMG3 from '../img/slider/img3.jpg'
import COLOMBIA from '../img/img6.jpg'



// Logos Carousel
import CarouselLogos from '../components/carousel.component'

// FRONT PAGE MODAL
import Modal from 'react-modal';

import './home.css'
import { infoCud } from '../components/jsons/vars';
import Map from '../components/map';
import { _news } from '../components/jsons/_news';

import { IconButton, ButtonToolbar, ButtonGroup } from 'rsuite';
import ArrowDownIcon from '@rsuite/icons/ArrowDown';
import { Button_navigation } from '../components/button.component';
//import { useLocation } from 'react-router-dom';
//const location = useLocation();

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: true
    };
  }


  render() {

    const { translation, } = this.props;
    const { modal } = this.state
    //const { location: { pathname }}= this.props
    {/*const modalMessage = {
      title: <h2>¡AVISO IMPORTANTE!</h2>,
      body: <dic>
        <p className='fw-bold'>MEDIANTE LA RESOLUCIÓN 0172 DEL 06 DE JUNIO DE 2022 SE MODIFICA EL HORARIO GENERAL DE ATENCIÓN AL PUBLICO Y SE ESTABLECEN HORARIOS ESPECIALES EN EL DESPACHO DEL CURADOR URBANO UNO DE BUCARAMANGA, ASÍ</p>
        <p>El horario general de atención al público del despacho del curador urbano uno de Bucaramanga, será de (07:00 am) a doce y media de la tarde (12:30pm) y de una de la tarde (1:00 pm) a cuatro de la tarde (4:00 pm). </p>
        <p>La radicación de la documentación realizada por fuera de este horario, independientemente del canal de radicación, se entenderá presentada al día hábil siguiente, por lo cual, si la radicación corresponde a un acto procesal con un término perentorio, tal como se consignó en la parte considerativa, la radicación será extemporánea dando lugar al desistimiento, rechazo del recurso, etc., según el caso.</p>
        <p>Así mismo se establecen los siguientes HORARIOS ESPECIALES, con el fin de prestar un mejor servicio,</p>
        <ul>
          <li>CONSULTA CON EL CURADOR URBANO: lunes a viernes de 7 a.m. a 12:30 p.m.</li>
          <li>ATENCIÓN A VECINOS / TERCEROS INTERESADOS: lunes a viernes de 7 a.m. a 12:30 p.m.</li>
          <li>ENTREGA DE PLANOS PARA COPIAS Y EJECUTORIAS: martes y jueves de 7 a.m. a 12:30 p.m.</li>
          <li>ASISTENCIA TÉCNICA CON REVISOR ESTRUCTURAL / REVISORA JURÍDICA: miércoles y viernes de 2:00 p.m. a 4:00 p.m.</li>
          <li>ASISTENCIA TÉCNICA CON ARQUITECTO REVISOR (PROYECTOS RADICADOS): lunes, miércoles y viernes de 7:00 a.m. a 12:30 p.m.</li>
          <li>ASISTENCIA TÉCNICA CON ARQUITECTO REVISOR (PREVIO A RADICACIÓN): martes y jueves de 7:00 a.m. a 12:30 p.m.</li>
        </ul>
        <p>SE INVITA a los usuarios a hacer uso del módulo de AGENDAMIENTO DE CITAS establecido para mejorar la prestación de nuestro servicio, al cual se puede acceder a través de la página institucional mediante el enlace https://www.curaduria1bucaramanga.com/scheduling o solicitándola a través de nuestros canales de atención los cuales son ampliamente conocidos y en todo caso pueden ser consultados en la precitada página.</p>
        <p>EL CONTENIDO DE LA RESOLUCIÓN SE ENCUENTRA DISPONIBLE PARA SU CONSULTA EN “PUBLICACIONES” DE LA PÁGINA INSTITUCIONAL (En el enlace https://www.curaduria1bucaramanga.com/administrative) ASÍ MISMO EN LUGAR VISIBLE DE LA OFICINA.</p>
      </dic>
    } */}

    const modalStyle = {
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
        top: '12%',
        left: '25%',
        right: '25%',
        bottom: '5%',
        border: '1px solid #ccc',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        borderRadius: '4px',
        outline: 'none',
        padding: '20px',
        marginRight: 'auto',

      }
    };
    let _CHECK_STATUS = () => {
      let searchValue = this.inputSearch.value;
      this.props.history.push('/status/' + searchValue);
    }



    const Redirect = (id) => {
      var element = document.getElementById(id);
      //console.log(element)
      element.scrollIntoView();
    }
    //console.log(Redirect())




    // let location = this.props.location
    // const Redirect = (id)=> {
    //   return location.hash = '#'+id
    //   }
    //console.log(Redirect('1'))
    return (
      <div className="Home" id='1'>
        <div className="">

          {/** 
         * 
         * <div id="myCarousel" class="carousel slide my-2 " data-bs-ride="carousel">
            <div class="carousel-indicators">
              
              <button type="button" data-bs-target="#myCarousel" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>
              
              <button type="button" data-bs-target="#myCarousel" data-bs-slide-to="1" aria-label="Slide 2"></button>
              <button type="button" data-bs-target="#myCarousel" data-bs-slide-to="2" aria-label="Slide 3"></button>
            </div>
            <div class="carousel-inner">
            <div class="carousel-item active">
                <img src={NEW_2_ING} class="d-block w-80" alt="..." />
                <div class="container">
                  <div class="carousel-caption text-start">
                  <h2 style={{textShadow: "1px 0 0 #000, 0 -1px 0 #000, 0 1px 0 #000, -1px 0 0 #000"}}>CURADURÍA INCLUSIVA - LEY 982 DE 2005</h2>
                    <p><a class="btn btn-lg btn-info" href="#news_1">Conocer Mas</a></p>
                  </div>
                </div>
              </div>
              <div class="carousel-item">
                <img src={NEW_ING} class="d-block w-100" alt="..." />
                <div class="container">
                  <div class="carousel-caption text-end">
                    <p><a class="btn btn-lg btn-info" href="#news_2">Conocer Mas</a></p>
                  </div>
                </div>
              </div>
              <div class="carousel-item">
                <img src={NEW_3_ING} class="d-block w-80" alt="..." />
                <div class="container">
                  <div class="carousel-caption text-end">
                  <h2 style={{textShadow: "1px 0 0 #000, 0 -1px 0 #000, 0 1px 0 #000, -1px 0 0 #000", color:'lightgray'}}>¡YA DISPONIBLE LA CERTIFICACIÓN EN LINEA!</h2>
                    <p><a class="btn btn-lg btn-info" href="#news_3">Conocer Mas</a></p>
                  </div>
                </div>
              </div>
            </div>
            <button class="carousel-control-prev" type="button" data-bs-target="#myCarousel" data-bs-slide="prev">
              <span class="carousel-control-prev-icon text-info" aria-hidden="true"></span>
              <span class="visually-hidden">Previous</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#myCarousel" data-bs-slide="next">
              <span class="carousel-control-next-icon text-info" aria-hidden="true"></span>
              <span class="visually-hidden">Next</span>
            </button>
          </div>
         * 
        */}

          <div class="container pt-2" id="hanging-icons">
            <div className='' style={{ backgroundColor: '#1b83c4', borderRadius: '2px' }}>
              <div class="row justify-content-center px-1 mx-2">
                <div class="col-5 text-start py-1" style={{ color: ' white ' }}>
                  <h5 className='px-4 py-0 fw-normal'><i class="fas fa-calendar-alt text-light"></i> Horario: {infoCud.schedule}</h5>
                  <h5 className='px-4 py-0 fw-normal'><i class="fas fa-calendar-alt text-light"></i> Consulta horarios especiales y atencion especializada, click <Link className='text-light' to={'/mailbox'}>Aqui <i class="far fa-hand-point-left"></i></Link></h5>
                </div>
                <div class="col-7 py-1">
                  <div class="px-0">
                    <span className='col-lg-12 bg-white'>
                      <h5 className='fw-normal'> <a style={{ color: 'white' }} href='https://www.google.es/maps/place/Curaduria+Urbana+No.+1+de+Bucaramanga/@7.1236512,-73.1155874,17z/data=!3m1!4b1!4m5!3m4!1s0x8e683f0ec6e6ea35:0xd99c4a977df44614!8m2!3d7.1236459!4d-73.1133987?hl=es' target="_blank" > <i class="fas fa-map-marker-alt text-light"></i> {infoCud.address}</a> </h5>
                    </span>
                  </div>
                  <h5 className='fw-normal' style={{ color: 'white' }}><a href="https://web.whatsapp.com/send?phone=+573162795010" style={{ color: 'white' }} target="_blank" > <i class="fas fa-mobile-alt text-light"></i> Whatsapp: {infoCud.number1}</a> <i class="fas fa-envelope text-light"></i> Correo: curaduriaurbana1@gmail.com</h5>
                </div>
              </div>
            </div>

            <div class="container py-2">
              <div class="row align-items-start">
                <div className='col-lg-9 px-0 ' style={{ height: '280px' }}>
                  <div id="carouselExampleDark" class="carousel carousel-dark slide" data-bs-ride="carousel" style={{ height: '280px' }}>
                    <div class="carousel-indicators">
                      <button type="button" data-bs-target="#carouselExampleDark" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>
                      <button type="button" data-bs-target="#carouselExampleDark" data-bs-slide-to="1" aria-label="Slide 2"></button>
                      <button type="button" data-bs-target="#carouselExampleDark" data-bs-slide-to="2" aria-label="Slide 3"></button>
                      <button type="button" data-bs-target="#carouselExampleDark" data-bs-slide-to="3" aria-label="Slide 4"></button>
                    </div>
                    <div class="carousel-inner ">
                      <div class="carousel-item active" data-bs-interval="11000">
                        <img src={COLOMBIA} class="d-block w-100" alt="Bucaramanga santander y sus hermosos paisajes." style={{ height: '275px' }} />
                        <div class="carousel-caption d-none d-md-block" style={{ height: '240px' }}>
                          <p className='text-light  text-end' style={{ width: '800px' }}>Creditos: Daniel Beltran.</p>
                        </div>
                      </div>
                      <div class="carousel-item" data-bs-interval="9000">
                        <img src={IMG1} class="d-block w-100" alt="Bucaramanga santander y sus hermosos paisajes." style={{ height: '275px' }} />
                        <div class="carousel-caption d-none d-md-block" style={{ height: '240px' }}>
                          <p className='text-light text-end ' style={{ width: '800px' }}>Creditos: David Alberto Arias</p>
                        </div>
                      </div>
                      <div class="carousel-item" data-bs-interval="9000">
                        <img src={IMG2} class="d-block w-100" alt="Bucaramanga santander la ciudad de los parques." style={{ height: '275px' }} />
                        <div class="carousel-caption d-none d-md-block" style={{ height: '240px' }}>
                          <p className='text-light text-end' style={{ width: '800px' }}>Creditos: David Alberto Arias</p>
                        </div>
                      </div>
                      <div class="carousel-item" data-bs-interval="9000">
                        <img src={IMG3} class="d-block w-100" alt="Bucaramanga santander la ciudad bonita." style={{ height: '275px' }} />
                        <div class="carousel-caption d-none d-md-block" style={{ height: '240px' }}>
                          <p className='text-light text-end' style={{ width: '800px' }}>Creditos: David Alberto Arias</p>
                        </div>
                      </div>

                    </div>
                    <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleDark" data-bs-slide="prev">
                      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                      <span class="visually-hidden">Previous</span>
                    </button>
                    <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleDark" data-bs-slide="next">
                      <span class="carousel-control-next-icon" aria-hidden="true"></span>
                      <span class="visually-hidden">Next</span>
                    </button>
                  </div>
                </div>
                <div className='col-lg-3 py-1' >
                  <div className='py-1'>
                    <Link style={{ color: 'white', backgroundImage: 'white' }} to="/normogram">
                      <div className='text-start px-4 border border-dark' style={{ backgroundColor: '#1B83C4 ', borderRadius: '20px' }}>
                        <div className='mx-0 px-0 py-2'>
                          <h4 className='fw-normal'><i class="fas fa-file-invoice fa-2x"></i>   Consulta Normatividad</h4>
                        </div>
                      </div>
                    </Link>
                  </div>
                  <div className='py-1'>
                    <Link style={{ color: 'white', backgroundImage: 'white' }} to="/status">
                      <div className='text-start px-4 border border-dark' style={{ backgroundColor: '#1B83C4 ', borderRadius: '20px' }}>
                        <div className='mx-0 px-0 py-2'>
                          <h4 className='fw-normal'><i class="fas fa-search fa-2x"></i>    Consulta Procesos</h4>
                        </div>
                      </div>
                    </Link>
                  </div>
                  <div className='py-1'>
                    <Link style={{ color: 'white', backgroundImage: 'white' }} to="/administrative">
                      <div className='text-start px-4 border border-dark' style={{ backgroundColor: '#1B83C4 ', borderRadius: '20px' }}>
                        <div className='mx-0 px-0 py-2'>
                          <h4 className='fw-normal'><i class="fas fa-list-alt fa-2x"></i>    Consulta publicaciones</h4>
                        </div>
                      </div>
                    </Link>
                  </div>
                  <div className='py-1'>
                    <Link style={{ color: 'white', backgroundImage: 'white' }} to="/old">
                      <div className='text-start px-4 border border-dark' style={{ backgroundColor: '#1B83C4 ', borderRadius: '20px' }}>
                        <div className='mx-0 px-0 py-2'>
                          <h4 className='fw-normal'><i class="fas fa-folder-minus fa-2x"></i> Consulta repositorio</h4>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <hr className='bg-info py-0'></hr>
            <h2 className='text-center' id='services'>Servicios <Button_navigation Iddown={'process'} Idup={null} /> </h2>
            <div className='col-lg col-mb-10 justify-content-center d-flex mx-0 px-0 ' style={{ borderRadius: '8px' }}>
              <div class="row align-items-center py-0 my-0" style={{ borderRadius: '20px', }}>
                <div class="col-2  text-center  px-2 mx-2" style={{ backgroundColor: '#1B83C4', paddingTop: '20px', paddingBottom: '20px', borderRadius: '120px', width: '130px', height: '130px' }}>
                  <Link className='text-light' to={'/payments'}>
                  <img src={LGOG13} class="d-block w-100" alt="pse." style={{ width: '8px', height: '70px'}} />
                  <h5 className='py-1 text-white fw-normal'>Pagos pse</h5>
                  </Link>
                </div>
                <div class="col-2  text-center border border-dark px-2 mx-2" style={{ backgroundColor: '#1B83C4', paddingTop: '20px', paddingBottom: '20px', borderRadius: '120px', width: '130px', height: '130px' }}>
                  <Link className='text-light' to={'/inclusivity'}>
                    <i class="fas fa-sign-language fa-3x fa-lg-4"></i>
                    <h5 className='py-1 text-white fw-normal'>Curaduria inclusiva</h5>
                  </Link>
                </div>
                <div class="col-2 text-center border border-dark  px-2 mx-2" style={{ backgroundColor: '#1B83C4', paddingTop: '20px', paddingBottom: '20px', borderRadius: '120px', width: '130px', height: '130px' }}>
                  <Link className='text-light' to={'/file'}>
                    <i class="fas fa-file-alt fa-3x fa-lg-4"></i>
                    <h5 className='py-1 text-white fw-normal'>Instrumentos de apoyo</h5>
                  </Link>
                </div>
                <div class="col-2 text-center border border-dark  px-2 mx-2" style={{ backgroundColor: '#1B83C4', paddingTop: '20px', paddingBottom: '20px', borderRadius: '120px', width: '130px', height: '130px' }}>
                  <Link className='text-light' to={'/liquidator'}>
                    <i class="fas fa-calculator fa-3x fa-lg-4"></i>
                    <h5 className='py-1 text-white fw-normal'>Calculadora liquidación expensa</h5>
                  </Link>
                </div>
                <div class="col-2 text-center  border border-dark  mx-2" style={{ backgroundColor: '#1B83C4', paddingTop: '20px', paddingBottom: '20px', borderRadius: '120px', width: '130px', height: '130px' }}>
                  <Link className='text-light' to={'/pqrs'}>
                    <i class="fas fa-envelope-square fa-3x fa-lg-4"></i>
                    <h5 className='py-1 text-white fw-normal'>Radicacion (pqrs)</h5>
                  </Link>
                </div>
                <div class="col-2 text-center  border border-dark  mx-2" style={{ backgroundColor: '#1B83C4', paddingTop: '20px', paddingBottom: '20px', borderRadius: '120px', width: '130px', height: '130px' }}>
                  <Link className='text-light' to={'/scheduling'}>
                    <i class="fas fa-calendar-check fa-3x fa-lg-4"></i>
                    <h5 className='py-1 text-white fw-normal'>Agendamiento de citas</h5>
                  </Link>
                </div>
                <div class="col-2 text-center  border border-dark  mx-2" style={{ backgroundColor: '#1B83C4', paddingTop: '27px', paddingBottom: '15px', borderRadius: '120px', width: '130px', height: '130px' }}>
                  <Link className='text-light' to={'/certificacion'}>
                    <i class="fas fa-file-pdf fa-3x fa-lg-4"></i>
                    <h5 className='py-1 text-white fw-normal'>Certificacion en linea </h5>
                  </Link>
                </div>
              </div>
            </div>
            <hr className='bg-info'></hr>
            <div class="px-0 py-0 my-0 text-center">
              <i class="fas fa-search-location fa-4x"></i>
              <h3 class="" id='process'>Consulta de Procesos {<Button_navigation Iddown={'news'} Idup={'services'} />}  </h3>
              <div class="col-lg-8 mx-auto">
                <h5 class=" fw-normal">Ingrese el ID del proceso o el número de cédula para conocer el estado del proceso</h5>
                <div class="d-grid gap-2 d-sm-flex justify-content-sm-center">
                  <div style={{ width: '33rem' }}>
                    <MDBInputGroup className='mb-3'>
                      <MDBDropdown>
                        <MDBDropdownToggle style={{ backgroundColor: '#107ABC' }}>TIPO DE PROCESO</MDBDropdownToggle>
                        <MDBDropdownMenu>
                          <MDBDropdownItem>
                            <MDBDropdownLink onClick={() => this.inputSearch.value = '68001-1-aa-0000'}>LICENCIA</MDBDropdownLink>
                          </MDBDropdownItem>
                          <MDBDropdownItem>
                            <MDBDropdownLink onClick={() => this.inputSearch.value = 'OAaa-0000'}>OTRA ACTUACIÓN</MDBDropdownLink>
                          </MDBDropdownItem>
                          <MDBDropdownItem>
                            <MDBDropdownLink onClick={() => this.inputSearch.value = 'VRaa-0000'}>PETICIÓN PQRS</MDBDropdownLink>
                          </MDBDropdownItem>
                          <MDBDropdownItem>
                            <MDBDropdownLink onClick={() => this.inputSearch.value = 'VRaa-0000'}>NUMERO DE VENTANILLA ÚNICA (VR)</MDBDropdownLink>
                          </MDBDropdownItem>
                          <MDBDropdownItem>
                            <MDBDropdownLink onClick={() => this.inputSearch.value = 'Naa-0000'}>NOMENCLATURA</MDBDropdownLink>
                          </MDBDropdownItem>
                          <MDBDropdownItem>
                            <MDBDropdownLink onClick={() => this.inputSearch.value = ''}>BUSCAR POR CEDULA</MDBDropdownLink>
                          </MDBDropdownItem>
                        </MDBDropdownMenu>
                      </MDBDropdown>
                      <MDBInputGroupElement type='text' label='ID del proceso' inputRef={ref => this.inputSearch = ref} />
                      <MDBBtn style={{ backgroundColor: '#107ABC' }} onClick={() => _CHECK_STATUS()}>BUSCAR</MDBBtn>
                    </MDBInputGroup>
                  </div>
                </div>
                <p class=""><h5>aa = los dos últimos dígitos del año del proceso, 0000 = consecutivo del proceso</h5></p>
              </div>

              <hr className='bg-info'></hr>
              <h2 className='text-center' id='news'>Noticias importantes {<Button_navigation Iddown={'ubicacion'} Idup={'process'} />}</h2>
              <div className='col-lg col-mb-10 justify-content-center d-flex mx-0 px-0 ' style={{ backgroundColor: ' ' }}>
                <div class="row align-items-center px-4 py-4 mx-">
                  {_news.filter((data, index) => index <= 3).map(function (value) {
                    return <>
                      <div class="col-3 align-items-center">
                        <div class="card align-items-center">
                          <img src={value.image} class="card-img-top" alt="Noticias y avisos importantes de la curaduria." style={{ height: '160px' }} />
                          <div class="card-body">
                            <label className="text-start fw-normal" style={{ color: 'gray' }}>{value.icon_folder} {value.category}</label>
                            <h5 class="card-title fw-normal "><b>{value.title}</b></h5>
                            <Link to={value.url} class="text-dark"><p class="card-text fw-normal">{value.summary} <p className='text-info'> {value.link}</p></p></Link>
                            <label className="px-1" style={{ color: 'gray' }}>{value.icon_date} {value.date}</label>
                          </div>
                        </div>
                      </div>
                    </>
                  })}
                </div>
              </div>
              {/*
              <MDBRow className="mt-5">
                <MDBCol md="4">
                  <i class="far fa-list-alt fa-4x"></i>
                  <h3 className="display-6 fw-bold">Listado de Publicaciones</h3>
                  <p className="lead">Encuentre todas las publicaciones expedidas por la Curaduría</p>
                  <Link to={'/administrative'}><MDBBtn color='secondary'>
                    <h4 className="pt-2"><i class="fas fa-chevron-right"></i> Ver Listado</h4>
                  </MDBBtn></Link>
                </MDBCol>
                <MDBCol md="4">
                  <i className="fas fa-file-invoice fa-4x"></i>
                  <h3 className="display-6 fw-bold">Radicación de Licencias</h3>
                  <p className="lead">Inicie aquí su proceso para radicar una Licencia</p>
                  <Link to={'/file'}><MDBBtn color='info'>
                    <h4 className="pt-2"><i class="fas fa-chevron-right"></i> Radicar</h4>
                  </MDBBtn></Link>
                </MDBCol>
                <MDBCol md="4">
                  <i class="fas fa-calculator fa-4x"></i>
                  <h3 className="display-6 fw-bold">Calculadora de liquidación</h3>
                  <p className="lead">Determine un valor posible de su liquidación aquí</p>
                  <Link to={'/liquidator'}><MDBBtn color='success'>
                    <h4 className="pt-2"><i class="fas fa-chevron-right"></i> Calculadora</h4>
                  </MDBBtn>
                  </Link>
                </MDBCol>
              </MDBRow> */}
            </div>

            {/*  <h2 className="mt-5">Ultimas Noticias</h2>
            <hr />
            <MDBRow className="d-flex justify-content-center">
              <MDBCol md="10">

                <div id="news_4">
                  <p className="display-6 lead fw-bold">¡AVISO IMPORTANTE PRÓRROGA DE LAS LICENCIAS Y REVALIDACIONES!</p>
                  <MDBRow>
                    <MDBCol md="12">
                      <p className="app-p lead text-justify">El Decreto 1783 De 2021 que modificó el Decreto 1077 de 2015 en el artículo 2.2.6.1.2.4.1. contempla (…) La solicitud de prórroga de una licencia urbanística deberá radicarse con la documentación completa a más tardar treinta (30) días hábiles antes del vencimiento de la respectiva licencia. La solicitud deberá acompañarse de la manifestación bajo la gravedad del juramento de la iniciación de obra por parte del urbanizador o constructor responsable.</p>
                      <p className="app-p lead text-justify">La prórroga de la revalidación se debe solicitar a más tardar treinta (30) días hábiles antes de su vencimiento y su expedición procede con la sola presentación de la solicitud por parte del interesado. Las solicitudes de prórroga de licencias urbanísticas y de prórroga de sus revalidaciones cuyo término de vigencia inicial se venza dentro de los tres meses (3) meses siguientes a la modificación del presente artículo, podrán presentarse cumpliendo con los términos establecidos en las normas vigentes antes de esta modificación (...)</p>
                      <p className="app-p lead text-justify">POR LO ANTERIOR Y EN VIRTUD DE QUE EL DECRETO ESTÁ VIGENTE DESDE EL 20 DE DICIEMBRE DE 2022: <b>SI SU LICENCIA O REVALIDACIÓN VENCE EL 21 DE MARZO DE 2022 O FECHA SIGUIENTE Y VA A RADICAR SOLICITUD DE PRÓRROGA, ESTA DEBE HACERSE DE FORMA COMPLETA 30 DÍAS HÁBILES ANTES DEL VENCIMIENTO, ES DECIR POR CITAR UN EJEMPLO, SI VENCE EL 21 DE MARZO DE 2022 DEBE RADICAR A MÁS TARDAR EL 07 DE FEBRERO DE 2022.LO ANTERIOR SÓLO APLICA PARA AQUELLAS LICENCIAS QUE PUEDEN SER PRORROGABLES</b>.</p>
                    </MDBCol>
                  </MDBRow>
                </div>

                <div id="news_3">
                  <p className="display-6 lead fw-bold">Ya disponible, certificación para profesionales que actúan ante la Curaduría</p>
                  <MDBRow>
                    <MDBCol md="4">
                      <img src={NEW_3_ING} class="d-block w-100 mt-2" alt="..." />
                    </MDBCol>
                    <MDBCol md="8">
                      <p className="app-p lead text-justify">La Curaduria Urbana N°1 de Bucaramanga ofrece a los profesionales que figuran en las actuaciones
                        urbanísticas, la certificación de participación y responsabilidad en la calidad profesional en la que haya actuado
                        en los proyectos de licenciamiento. Para generar el certificado, asi como para verificar el expedidor dar <Link to={'/certificacion'}>click aqui</Link>.</p>
                    </MDBCol>
                  </MDBRow>
                </div>
                <div id="news_1">
                  <p className="display-6 lead fw-bold ">Curaduría Inclusiva - Ley 982 de 2005</p>
                  <MDBRow>
                    <MDBCol md="8">
                      <p className="app-p lead text-justify">La Curaduria N° 1 de Bucaramanga usa la ayuda de las TIC para ofrecer un mejor servicio a quienes lo necesiten. Gracias al Ministerio de Tecnologías de la Información y las Comunicaciones- MINTIC en alianza con la Federación Nacional de Sordos de Colombia- FENASCOL, apoyándose en la tecnología ofrece servicios de forma gratuita mediante una aplicación de dispositivos móviles, de igual modo el ConVerTIC es el proyecto de inclusión del Ministerio TIC con el fin de promover la inclusión social, educativa, laboral y cultural a través de uso de las tecnologías para las personas ciegas o con baja visión. Conoce mas sobre estas alternativas
                        <Link to={'/inclusivity'}> dando click aqui</Link>. </p>
                    </MDBCol>
                    <MDBCol md="4">
                      <img src={NEW_2_ING} class="d-block w-100 mt-2" alt="..." />
                    </MDBCol>
                  </MDBRow>
                </div>

                <div id="news_2">
                  <p className="display-6 lead fw-bold">Nuestro Nuevo Punto de Atención</p>
                  <MDBRow>
                    <MDBCol md="4">
                      <img src={NEW_ING} class="d-block w-100 mt-2" alt="..." />
                    </MDBCol>
                    <MDBCol md="8">
                      <p className="app-p lead text-justify">Ya se encuentra en funcionamiento nuestro nuevo punto de atención. Nuestra nueva ubicación se encuentra en la Calle 36 # 31-39 Centro Empresarial Chicamocha - Local 101, con parqueadero público en el Centro Empresarial Chicamocha. Nuestro horario de atención permanece sin cambios, de Lunes a Viernes de 07:00 am a 12:30 pm y 1:00 pm  a 5:00 pm.</p>
                    </MDBCol>
                  </MDBRow>
                </div>



              </MDBCol>
            </MDBRow>
            */}
          </div>
        </div>
        <hr className='bg-info'></hr>
        <h2 className='text-center' id='ubicacion'> Ubicación {<Button_navigation Iddown={null} Idup={'news'} />}</h2>
        <div class="row justify-content-center px-4 mx-4 px-4 mb-5">
          <div class="col-lg-12 justify-content-center">
            <Map></Map>
          </div>
        </div>

       
        {/*<Modal contentLabel="FRONT PAGE MODAL"
          isOpen={modal}
          style={modalStyle}
          ariaHideApp={false}
        >
          <div className="my-4 d-flex justify-content-between">
            {modalMessage.title}
            <MDBBtn className='btn-close' color='none' onClick={() => this.setState({ modal: false })}></MDBBtn>
          </div>

          <div className='border p-2'>
            {modalMessage.body}
          </div>

          <div className="text-end py-4 mt-3">
            <MDBBtn color='info' size='sm' onClick={() => this.setState({ modal: false })}>
              <h4 className="pt-2"><i class="fas fa-times-circle"></i> CERRAR</h4>
            </MDBBtn>
          </div>

        </Modal> */}

      </div >
    );
  }
}

export default Home;