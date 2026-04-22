import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
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
import { LegacyModal as Modal } from '@/components/legacy-modal';

import './home.css'
import { infoCud } from '../components/jsons/vars';
import Map from '../components/map';
import { _news } from '../components/jsons/_news';
import customService from '../services/custom.service';

import { Button_navigation } from '../components/button.component';
import { Icon } from '@/components/icon';
//import { useLocation } from 'react-router-dom';
//const location = useLocation();

function Home({ translation, history }) {
    const [modal, setModal] = useState(true);
    const inputSearchRef = useRef(null);
    const [statusResult, setStatusResult] = useState(null);
    const [statusError, setStatusError] = useState('');
    const [isSearching, setIsSearching] = useState(false);
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
    const getStatusLookup = (searchValue) => {
      const normalizedValue = searchValue.trim().toUpperCase();

      if (!normalizedValue) {
        return null;
      }

      if (normalizedValue.startsWith('68001-') || /^\d{5}-/.test(normalizedValue)) {
        return customService.checkStatus_Lc;
      }

      if (normalizedValue.startsWith('VR')) {
        return customService.checkStatus_vr;
      }

      if (normalizedValue.startsWith('N')) {
        return customService.checkStatus_Nr;
      }

      return customService.checkStatus_In;
    };

    const _CHECK_STATUS = async () => {
      const searchValue = inputSearchRef.current?.value?.trim() || '';
      const lookup = getStatusLookup(searchValue);

      if (!lookup) {
        setStatusResult(null);
        setStatusError('Ingrese un identificador o número de cédula para consultar el proceso.');
        return;
      }

      setIsSearching(true);
      setStatusError('');
      setStatusResult(null);

      try {
        const response = await lookup(searchValue);
        const firstResult = Array.isArray(response?.data) ? response.data[0] : null;

        if (!firstResult) {
          setStatusError('No encontramos resultados para el criterio ingresado.');
          return;
        }

        setStatusResult(firstResult);
      } catch (error) {
        setStatusError('No fue posible consultar el estado del proceso en este momento.');
      } finally {
        setIsSearching(false);
      }
    };



    const Redirect = (id) => {
      var element = document.getElementById(id);
      //console.log(element)
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

          <div className="container pt-2" id="hanging-icons">
            <div className='' style={{ backgroundColor: '#1b83c4', borderRadius: '2px' }}>
              <div className="row justify-content-center px-1 mx-2">
                <div className="col-5 text-start py-1" style={{ color: ' white ' }}>
                  <h5 className='px-4 py-0 fw-normal'><Icon name="Calendar" size={16} className="text-light" /> Horario: {infoCud.schedule}</h5>
                  <h5 className='px-4 py-0 fw-normal'><Icon name="Calendar" size={16} className="text-light" /> Consulta horarios especiales y atencion especializada, click <Link className='text-light' to={'/publicaciones'}>Aqui <Icon name="ArrowLeft" size={16} /></Link></h5>
                </div>
                <div className="col-7 py-1">
                  <div className="px-0">
                    <span className='col-lg-12'>
                      <h5 className='fw-normal'> <a style={{ color: 'white' }} href='https://www.google.es/maps/place/Curaduria+Urbana+No.+1+de+Bucaramanga/@7.1236512,-73.1155874,17z/data=!3m1!4b1!4m5!3m4!1s0x8e683f0ec6e6ea35:0xd99c4a977df44614!8m2!3d7.1236459!4d-73.1133987?hl=es' target="_blank" > <Icon name="MapPin" size={16} className="text-light" /> {infoCud.address}</a> </h5>
                    </span>
                  </div>
                  <h5 className='fw-normal' style={{ color: 'white' }}><a href="https://web.whatsapp.com/send?phone=+573162795010" style={{ color: 'white' }} target="_blank" > <Icon name="Smartphone" size={16} className="text-light" /> Whatsapp: {infoCud.number1}</a> <Icon name="Mail" size={16} className="text-light" /> Correo: curaduriaurbana1@gmail.com</h5>
                </div>
              </div>
            </div>

            <div className="container py-2">
              <div className="row align-items-start">
                <div className='col-lg-9 px-0 ' style={{ height: '280px' }}>
                  <div id="carouselExampleDark" className="carousel carousel-dark slide" data-bs-ride="carousel" style={{ height: '280px' }}>
                    <div className="carousel-indicators">
                      <button type="button" data-bs-target="#carouselExampleDark" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
                      <button type="button" data-bs-target="#carouselExampleDark" data-bs-slide-to="1" aria-label="Slide 2"></button>
                      <button type="button" data-bs-target="#carouselExampleDark" data-bs-slide-to="2" aria-label="Slide 3"></button>
                      <button type="button" data-bs-target="#carouselExampleDark" data-bs-slide-to="3" aria-label="Slide 4"></button>
                    </div>
                    <div className="carousel-inner ">
                      <div className="carousel-item active" data-bs-interval="11000">
                        <img src={COLOMBIA} className="d-block w-100" alt="Bucaramanga santander y sus hermosos paisajes." style={{ height: '275px' }} />
                        <div className="carousel-caption d-none d-md-block" style={{ height: '240px' }}>
                          <p className='text-light  text-end' style={{ width: '800px' }}>Creditos: Daniel Beltran.</p>
                        </div>
                      </div>
                      <div className="carousel-item" data-bs-interval="9000">
                        <img src={IMG1} className="d-block w-100" alt="Bucaramanga santander y sus hermosos paisajes." style={{ height: '275px' }} />
                        <div className="carousel-caption d-none d-md-block" style={{ height: '240px' }}>
                          <p className='text-light text-end ' style={{ width: '800px' }}>Creditos: David Alberto Arias</p>
                        </div>
                      </div>
                      <div className="carousel-item" data-bs-interval="9000">
                        <img src={IMG2} className="d-block w-100" alt="Bucaramanga santander la ciudad de los parques." style={{ height: '275px' }} />
                        <div className="carousel-caption d-none d-md-block" style={{ height: '240px' }}>
                          <p className='text-light text-end' style={{ width: '800px' }}>Creditos: David Alberto Arias</p>
                        </div>
                      </div>
                      <div className="carousel-item" data-bs-interval="9000">
                        <img src={IMG3} className="d-block w-100" alt="Bucaramanga santander la ciudad bonita." style={{ height: '275px' }} />
                        <div className="carousel-caption d-none d-md-block" style={{ height: '240px' }}>
                          <p className='text-light text-end' style={{ width: '800px' }}>Creditos: David Alberto Arias</p>
                        </div>
                      </div>

                    </div>
                    <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleDark" data-bs-slide="prev">
                      <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                      <span className="visually-hidden">Previous</span>
                    </button>
                    <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleDark" data-bs-slide="next">
                      <span className="carousel-control-next-icon" aria-hidden="true"></span>
                      <span className="visually-hidden">Next</span>
                    </button>
                  </div>
                </div>
                <div className='col-lg-3 py-1' >
                  <div className='py-1'>
                    <Link style={{ color: 'white', backgroundImage: 'white' }} to="/normas">
                      <div className='text-start px-4 border border-dark' style={{ backgroundColor: '#1B83C4 ', borderRadius: '20px' }}>
                        <div className='mx-0 px-0 py-2'>
                          <h4 className='fw-normal'><Icon name="FileText" size={24} />   Consulta Normatividad</h4>
                        </div>
                      </div>
                    </Link>
                  </div>
                  <div className='py-1'>
                    <a style={{ color: 'white', backgroundImage: 'white', textDecoration: 'none' }} href="#process">
                      <div className='text-start px-4 border border-dark' style={{ backgroundColor: '#1B83C4 ', borderRadius: '20px' }}>
                        <div className='mx-0 px-0 py-2'>
                          <h4 className='fw-normal'><Icon name="Search" size={24} />    Consulta Procesos</h4>
                        </div>
                      </div>
                    </a>
                  </div>
                  <div className='py-1'>
                    <Link style={{ color: 'white', backgroundImage: 'white' }} to="/publicaciones">
                      <div className='text-start px-4 border border-dark' style={{ backgroundColor: '#1B83C4 ', borderRadius: '20px' }}>
                        <div className='mx-0 px-0 py-2'>
                          <h4 className='fw-normal'><Icon name="List" size={24} />    Consulta publicaciones</h4>
                        </div>
                      </div>
                    </Link>
                  </div>
                  <div className='py-1'>
                    <Link style={{ color: 'white', backgroundImage: 'white' }} to="/archivo">
                      <div className='text-start px-4 border border-dark' style={{ backgroundColor: '#1B83C4 ', borderRadius: '20px' }}>
                        <div className='mx-0 px-0 py-2'>
                          <h4 className='fw-normal'><Icon name="FolderMinus" size={24} /> Consulta repositorio</h4>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <hr className='bg-primary py-0'></hr>
            <h2 className='text-center' id='services'>Servicios <Button_navigation Iddown={'process'} Idup={null} /> </h2>
            <div className='col-lg col-mb-10 justify-content-center d-flex mx-0 px-0 ' style={{ borderRadius: '8px' }}>
              <div className="row align-items-center py-0 my-0" style={{ borderRadius: '20px', }}>
                <div className="col-2  text-center  px-2 mx-2" style={{ backgroundColor: '#1B83C4', paddingTop: '20px', paddingBottom: '20px', borderRadius: '120px', width: '130px', height: '130px' }}>
                  <Link className='text-light' to={'/ventanilla'}>
                  <img src={LGOG13} className="d-block w-100" alt="pse." style={{ width: '8px', height: '70px'}} />
                  <h5 className='py-1 text-white fw-normal'>Pagos pse</h5>
                  </Link>
                </div>
                <div className="col-2  text-center border border-dark px-2 mx-2" style={{ backgroundColor: '#1B83C4', paddingTop: '20px', paddingBottom: '20px', borderRadius: '120px', width: '130px', height: '130px' }}>
                  <Link className='text-light' to={'/documentos'}>
                    <Icon name="HandMetal" size={36} />
                    <h5 className='py-1 text-white fw-normal'>Curaduria inclusiva</h5>
                  </Link>
                </div>
                <div className="col-2 text-center border border-dark  px-2 mx-2" style={{ backgroundColor: '#1B83C4', paddingTop: '20px', paddingBottom: '20px', borderRadius: '120px', width: '130px', height: '130px' }}>
                  <Link className='text-light' to={'/documentos'}>
                    <Icon name="FileText" size={36} />
                    <h5 className='py-1 text-white fw-normal'>Instrumentos de apoyo</h5>
                  </Link>
                </div>
                <div className="col-2 text-center border border-dark  px-2 mx-2" style={{ backgroundColor: '#1B83C4', paddingTop: '20px', paddingBottom: '20px', borderRadius: '120px', width: '130px', height: '130px' }}>
                  <Link className='text-light' to={'/calculadora'}>
                    <Icon name="Calculator" size={36} />
                    <h5 className='py-1 text-white fw-normal'>Calculadora liquidación expensa</h5>
                  </Link>
                </div>
                <div className="col-2 text-center  border border-dark  mx-2" style={{ backgroundColor: '#1B83C4', paddingTop: '20px', paddingBottom: '20px', borderRadius: '120px', width: '130px', height: '130px' }}>
                  <Link className='text-light' to={'/peticiones'}>
                    <Icon name="Mail" size={36} />
                    <h5 className='py-1 text-white fw-normal'>Radicacion (pqrs)</h5>
                  </Link>
                </div>
                <div className="col-2 text-center  border border-dark  mx-2" style={{ backgroundColor: '#1B83C4', paddingTop: '20px', paddingBottom: '20px', borderRadius: '120px', width: '130px', height: '130px' }}>
                  <Link className='text-light' to={'/calendario'}>
                    <Icon name="CalendarCheck" size={36} />
                    <h5 className='py-1 text-white fw-normal'>Agendamiento de citas</h5>
                  </Link>
                </div>
                <div className="col-2 text-center  border border-dark  mx-2" style={{ backgroundColor: '#1B83C4', paddingTop: '27px', paddingBottom: '15px', borderRadius: '120px', width: '130px', height: '130px' }}>
                  <Link className='text-light' to={'/certificados'}>
                    <Icon name="FileText" size={36} />
                    <h5 className='py-1 text-white fw-normal'>Certificacion en linea </h5>
                  </Link>
                </div>
              </div>
            </div>
            <hr className='bg-primary'></hr>
            <div className="px-0 py-0 my-0 text-center">
              <Icon name="MapPin" size={48} />
              <h3 className="" id='process'>Consulta de Procesos {<Button_navigation Iddown={'news'} Idup={'services'} />}  </h3>
              <div className="col-lg-8 mx-auto">
                <h5 className=" fw-normal">Ingrese el ID del proceso o el número de cédula para conocer el estado del proceso</h5>
                <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
                  <div style={{ width: '33rem' }}>
                    <div className="input-group mb-3">
                      <div className="dropdown">
                        <button type="button" className="btn dropdown-toggle" style={{ backgroundColor: '#107ABC', color: 'white' }} data-bs-toggle="dropdown">TIPO DE PROCESO</button>
                        <ul className="dropdown-menu">
                          <li><button type="button" className="dropdown-item" onClick={() => inputSearchRef.current.value = '68001-1-aa-0000'}>LICENCIA</button></li>
                          <li><button type="button" className="dropdown-item" onClick={() => inputSearchRef.current.value = 'OAaa-0000'}>OTRA ACTUACIÓN</button></li>
                          <li><button type="button" className="dropdown-item" onClick={() => inputSearchRef.current.value = 'VRaa-0000'}>PETICIÓN PQRS</button></li>
                          <li><button type="button" className="dropdown-item" onClick={() => inputSearchRef.current.value = 'VRaa-0000'}>NUMERO DE VENTANILLA ÚNICA (VR)</button></li>
                          <li><button type="button" className="dropdown-item" onClick={() => inputSearchRef.current.value = 'Naa-0000'}>NOMENCLATURA</button></li>
                          <li><button type="button" className="dropdown-item" onClick={() => inputSearchRef.current.value = ''}>BUSCAR POR CEDULA</button></li>
                        </ul>
                      </div>
                      <input type="text" className="form-control" placeholder="ID del proceso" ref={inputSearchRef} />
                      <Button onClick={_CHECK_STATUS} disabled={isSearching}>{isSearching ? 'BUSCANDO...' : 'BUSCAR'}</Button>
                    </div>
                  </div>
                </div>
                <p className="mb-0">
                  <span className="h5 d-block fw-normal">aa = los dos últimos dígitos del año del proceso, 0000 = consecutivo del proceso</span>
                </p>
                {statusError ? (
                  <div className="alert alert-warning mt-3 mb-0" role="alert">
                    {statusError}
                  </div>
                ) : null}
                {statusResult ? (
                  <div className="card mt-3 text-start shadow-sm">
                    <div className="card-body">
                      <h4 className="card-title mb-3">Resultado de la consulta</h4>
                      <p className="card-text mb-1"><strong>ID:</strong> {statusResult.id_public || inputSearchRef.current?.value}</p>
                      <p className="card-text mb-1"><strong>Trámite:</strong> {statusResult.tramite || statusResult.type || 'Sin información disponible'}</p>
                      <p className="card-text mb-1"><strong>Tipo:</strong> {statusResult.tipo || statusResult.legal || 'Sin información disponible'}</p>
                      <p className="card-text mb-0"><strong>Estado:</strong> {statusResult.state ?? statusResult.status ?? 'Sin información disponible'}</p>
                    </div>
                  </div>
                ) : null}
              </div>

              <hr className='bg-primary'></hr>
              <h2 className='text-center' id='news'>Noticias importantes {<Button_navigation Iddown={'ubicacion'} Idup={'process'} />}</h2>
              <div className='col-lg col-mb-10 justify-content-center d-flex mx-0 px-0 ' style={{ backgroundColor: ' ' }}>
                <div className="row align-items-center px-4 py-4 mx-">
                  {_news.filter((data, index) => index <= 3).map(function (value, index) {
                    return <div className="col-3 align-items-center" key={value.id || value.title || index}>
                        <div className="card align-items-center">
                          <img src={value.image} className="card-img-top" alt="Noticias y avisos importantes de la curaduria." style={{ height: '160px' }} />
                          <div className="card-body">
                            <label className="text-start fw-normal" style={{ color: 'gray' }}>{value.icon_folder} {value.category}</label>
                            <h5 className="card-title fw-normal "><b>{value.title}</b></h5>
                            <Link to={value.url} className="text-dark text-decoration-none">
                              <div className="card-text fw-normal">
                                <p className="mb-1">{value.summary}</p>
                                <span className='text-info'>{value.link}</span>
                              </div>
                            </Link>
                            <label className="px-1" style={{ color: 'gray' }}>{value.icon_date} {value.date}</label>
                          </div>
                        </div>
                      </div>
                  })}
                </div>
              </div>
              {/*
              <div className="row mt-5">
                <div className="col-md-4">
                  <Icon name="List" size={48} />
                  <h3 className="display-6 fw-bold">Listado de Publicaciones</h3>
                  <p className="lead">Encuentre todas las publicaciones expedidas por la Curaduría</p>
                  <Link to={'/administrative'}><Button variant="outline" size="sm">
                    <h4 className="pt-2"><Icon name="ChevronRight" size={16} /> Ver Listado</h4>
                  </Button></Link>
                </div>
                <div className="col-md-4">
                  <Icon name="file-invoice" size={16} />
                  <h3 className="display-6 fw-bold">Radicación de Licencias</h3>
                  <p className="lead">Inicie aquí su proceso para radicar una Licencia</p>
                  <Link to={'/file'}><Button size="sm">
                    <h4 className="pt-2"><Icon name="ChevronRight" size={16} /> Radicar</h4>
                  </Button></Link>
                </div>
                <div className="col-md-4">
                  <Icon name="Calculator" size={48} />
                  <h3 className="display-6 fw-bold">Calculadora de liquidación</h3>
                  <p className="lead">Determine un valor posible de su liquidación aquí</p>
                  <Link to={'/liquidator'}><Button size="sm">
                    <h4 className="pt-2"><Icon name="ChevronRight" size={16} /> Calculadora</h4>
                  </Button>
                  </Link>
                </div>
              </div> */}
            </div>

            {/*  <h2 className="mt-5">Ultimas Noticias</h2>
            <hr />
            <div className="row d-flex justify-content-center">
              <div className="col-md-10">

                <div id="news_4">
                  <p className="display-6 lead fw-bold">¡AVISO IMPORTANTE PRÓRROGA DE LAS LICENCIAS Y REVALIDACIONES!</p>
                  <div className="row">
                    <div className="col-md-12">
                      <p className="app-p lead text-justify">El Decreto 1783 De 2021 que modificó el Decreto 1077 de 2015 en el artículo 2.2.6.1.2.4.1. contempla (…) La solicitud de prórroga de una licencia urbanística deberá radicarse con la documentación completa a más tardar treinta (30) días hábiles antes del vencimiento de la respectiva licencia. La solicitud deberá acompañarse de la manifestación bajo la gravedad del juramento de la iniciación de obra por parte del urbanizador o constructor responsable.</p>
                      <p className="app-p lead text-justify">La prórroga de la revalidación se debe solicitar a más tardar treinta (30) días hábiles antes de su vencimiento y su expedición procede con la sola presentación de la solicitud por parte del interesado. Las solicitudes de prórroga de licencias urbanísticas y de prórroga de sus revalidaciones cuyo término de vigencia inicial se venza dentro de los tres meses (3) meses siguientes a la modificación del presente artículo, podrán presentarse cumpliendo con los términos establecidos en las normas vigentes antes de esta modificación (...)</p>
                      <p className="app-p lead text-justify">POR LO ANTERIOR Y EN VIRTUD DE QUE EL DECRETO ESTÁ VIGENTE DESDE EL 20 DE DICIEMBRE DE 2022: <b>SI SU LICENCIA O REVALIDACIÓN VENCE EL 21 DE MARZO DE 2022 O FECHA SIGUIENTE Y VA A RADICAR SOLICITUD DE PRÓRROGA, ESTA DEBE HACERSE DE FORMA COMPLETA 30 DÍAS HÁBILES ANTES DEL VENCIMIENTO, ES DECIR POR CITAR UN EJEMPLO, SI VENCE EL 21 DE MARZO DE 2022 DEBE RADICAR A MÁS TARDAR EL 07 DE FEBRERO DE 2022.LO ANTERIOR SÓLO APLICA PARA AQUELLAS LICENCIAS QUE PUEDEN SER PRORROGABLES</b>.</p>
                    </div>
                  </div>
                </div>

                <div id="news_3">
                  <p className="display-6 lead fw-bold">Ya disponible, certificación para profesionales que actúan ante la Curaduría</p>
                  <div className="row">
                    <div className="col-md-4">
                      <img src={NEW_3_ING} class="d-block w-100 mt-2" alt="..." />
                    </div>
                    <div className="col-md-8">
                      <p className="app-p lead text-justify">La Curaduria Urbana N°1 de Bucaramanga ofrece a los profesionales que figuran en las actuaciones
                        urbanísticas, la certificación de participación y responsabilidad en la calidad profesional en la que haya actuado
                        en los proyectos de licenciamiento. Para generar el certificado, asi como para verificar el expedidor dar <Link to={'/certificacion'}>click aqui</Link>.</p>
                    </div>
                  </div>
                </div>
                <div id="news_1">
                  <p className="display-6 lead fw-bold ">Curaduría Inclusiva - Ley 982 de 2005</p>
                  <div className="row">
                    <div className="col-md-8">
                      <p className="app-p lead text-justify">La Curaduria N° 1 de Bucaramanga usa la ayuda de las TIC para ofrecer un mejor servicio a quienes lo necesiten. Gracias al Ministerio de Tecnologías de la Información y las Comunicaciones- MINTIC en alianza con la Federación Nacional de Sordos de Colombia- FENASCOL, apoyándose en la tecnología ofrece servicios de forma gratuita mediante una aplicación de dispositivos móviles, de igual modo el ConVerTIC es el proyecto de inclusión del Ministerio TIC con el fin de promover la inclusión social, educativa, laboral y cultural a través de uso de las tecnologías para las personas ciegas o con baja visión. Conoce mas sobre estas alternativas
                        <Link to={'/inclusivity'}> dando click aqui</Link>. </p>
                    </div>
                    <div className="col-md-4">
                      <img src={NEW_2_ING} class="d-block w-100 mt-2" alt="..." />
                    </div>
                  </div>
                </div>

                <div id="news_2">
                  <p className="display-6 lead fw-bold">Nuestro Nuevo Punto de Atención</p>
                  <div className="row">
                    <div className="col-md-4">
                      <img src={NEW_ING} class="d-block w-100 mt-2" alt="..." />
                    </div>
                    <div className="col-md-8">
                      <p className="app-p lead text-justify">Ya se encuentra en funcionamiento nuestro nuevo punto de atención. Nuestra nueva ubicación se encuentra en la Calle 36 # 31-39 Centro Empresarial Chicamocha - Local 101, con parqueadero público en el Centro Empresarial Chicamocha. Nuestro horario de atención permanece sin cambios, de Lunes a Viernes de 07:00 am a 12:30 pm y 1:00 pm  a 5:00 pm.</p>
                    </div>
                  </div>
                </div>



              </div>
            </div>
            */}
          </div>
        </div>
        <hr className='bg-primary'></hr>
        <h2 className='text-center' id='ubicacion'> Ubicación {<Button_navigation Iddown={null} Idup={'news'} />}</h2>
        <div className="row justify-content-center px-4 mx-4 px-4 mb-5">
          <div className="col-lg-12 justify-content-center">
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
            <button type="button" className="btn-close" onClick={() => setModal(false)} />
          </div>

          <div className='border p-2'>
            {modalMessage.body}
          </div>

          <div className="text-end py-4 mt-3">
            <Button variant="outline" size="sm" onClick={() => setModal(false)}>
              <h4 className="pt-2"><Icon name="XCircle" size={16} /> CERRAR</h4>
            </Button>
          </div>

        </Modal> */}

      </div >
    );
}

export default Home;
