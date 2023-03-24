import NEW_3_ING from '../../img/news_certificate.jpg'
import NEW_2_ING from '../../img/news_inclusivity.jpg'
import NEW_ING from '../../img/news1.jpg'
import NEW_AVIS from '../../img/aviso.jpg'
import NEW_AVIS2 from '../../img/aviso2.jpg'
import REPARTO from '../../img/Reparto.png'

import { Link } from 'react-router-dom'
import { Button_navigation } from '../button.component'

export const _news = [
    {
        id: 'news7',
        title: 'AVISO IMPORTANTE',
        icon_folder: <i class="fas fa-folder " style={{ color: '#107ABC' }}></i>,
        icon_date: <i class="fas fa-clock " style={{ color: '#107ABC' }}></i>,
        category: 'Aviso',
        date: '19/12/2022',
        summary: 'Modificación del horario para el dia 23 y 30 de diciembre por las festividades.',
        link: 'Ver mas',
        image: NEW_AVIS,
        url: '/news/?newsId=news7',
        noticia:
            <div className='container'>
                <div class="row align-items-center py-1">
                    <div class="col-12 px-4 border border-info py-4 m-3" style={{ backgroundColor: ' #f9f9f9 ', borderRadius: '2px', border: '1px' }}>
                        <div className="px-4 py-1">
                            <h3 className="text-center" id='news7'>AVISO IMPORTANTE {<Button_navigation Iddown={'news6'} Idup={null} />}</h3>
                            <div className="py-1">
                                <label><label className="px-1" style={{ color: 'gray' }}><i class="fas fa-clock text-info"></i> 19/12/2022 </label> <label className="px-1" style={{ color: 'gray' }}><i class="fas fa-user text-info"></i> Curaduria 1 de Bucaramanga</label> <label className="px-1" style={{ color: 'gray' }}><i class="fas fa-folder text-info"></i> Noticias</label>   </label>
                            </div>
                            <div className='container'>
                                <div class="row justify-content-start">
                                    <div className='col-lg-12'>
                                        <p className='text-justify fw-normal'>
                                            Se informa a la comunidad en general que, con ocasión a las festividades de navidad y fin de año, se modifica temporalmente el horario de atención al público del despacho del curador urbano uno de Bucaramanga para los días <b>veintitrés (23) y treinta (30) de diciembre del dos mil veintidós (2022)</b>, el cual será de <b>seis de la mañana (6:00 a.m.) a dos de la tarde (2:00 p.m.) jornada continua</b>.
                                            <br />
                                            Bucaramanga, 19 de diciembre de 2022.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
    },
    {
        id: 'news6',
        title: 'Reparto de proyectos 2022',
        icon_folder: <i class="fas fa-folder " style={{ color: '#107ABC' }}></i>,
        icon_date: <i class="fas fa-clock " style={{ color: '#107ABC' }}></i>,
        category: 'Noticias',
        date: '20/09/2022',
        summary: 'Durante el año 2022 la curaduría urbana 1 de Bucaramanga está encargada hacer el reparto.',
        link: 'Ver mas',
        image: REPARTO,
        url: '/news/?newsId=news6',
        noticia:
            <div className='container'>
                <div class="row align-items-center py-1">
                    <div class="col-12 px-4 border border-info py-4 m-3" style={{ backgroundColor: ' #f9f9f9 ', borderRadius: '2px', border: '1px' }}>
                        <div className="px-4 py-1">
                            <h3 className="text-center" id='news6'>Reparto de proyectos 2022 {<Button_navigation Iddown={'news5'} Idup={'news7'} />}</h3>
                            <div className="py-1">
                                <label><label className="px-1" style={{ color: 'gray' }}><i class="fas fa-clock text-info"></i> 20/09/2022 </label> <label className="px-1" style={{ color: 'gray' }}><i class="fas fa-user text-info"></i> Curaduria 1 de Bucaramanga</label> <label className="px-1" style={{ color: 'gray' }}><i class="fas fa-folder text-info"></i> Noticias</label>   </label>
                            </div>
                            <div className='container'>
                                <div class="row justify-content-start">
                                    <div className='col-lg-10'>
                                        <p className='text-justify fw-normal'>
                                            Durante el año 2022, la curaduría urbana 1 de Bucaramanga está encargada de hacer el reparto de los proyectos institucionales de la ciudad de Bucaramanga.<br />
                                            Decreto 1077 de 2015 del Ministerio de Vivienda, Ciudad y Territorio.<br />
                                            <b>Artículo 2.2.6.6.6.1: </b> Reparto de las solicitudes de licencia o de actos de reconocimiento de proyectos de las entidades estatales y de vivienda de interés social individual. Las solicitudes de licencias o de actos de reconocimiento que presenten las entidades estatales o los particulares para proyectos de vivienda de interés social individual, deberán someterse a reparto entre los distintos curadores urbanos del municipio o distrito, en estricto orden de radicación de la solicitud ante el curador urbano responsable del reparto en los términos previstos en este artículo.

                                        </p>
                                    </div>
                                    <div class="col-lg-2">
                                        <img src={REPARTO} class="d-block w-100 mt-1" alt="..." />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
    },
    {
        id: 'news5',
        title: 'Modificación horario general',
        icon_folder: <i class="fas fa-folder " style={{ color: '#107ABC' }}></i>,
        icon_date: <i class="fas fa-clock " style={{ color: '#107ABC' }}></i>,
        category: 'Aviso',
        date: '6/06/2022',
        summary: 'El horario general de atención al público del despacho del curador urbano uno de Bucaramanga',
        link: 'Ver mas',
        image: NEW_AVIS2,
        url: '/news/?newsId=news5',
        noticia:
            <div className='container'>
                <div class="row align-items-start py-1">
                    <div class="col-12 px-4 border border-info py-4 m-3" style={{ backgroundColor: ' #f9f9f9 ', borderRadius: '2px', border: '1px' }}>
                        <div className="px-4 py-1">
                            <h3 className="text-center" id='news5'>¡ Aviso importante, Mediante la resolución 0172 del 06 de junio de 2022 se modifica el horario general de atención! {<Button_navigation Iddown={'news1'} Idup={'news6'} />}</h3>
                            <div className="py-1">
                                <label><label className="px-1" style={{ color: 'gray' }}><i class="fas fa-clock text-info"></i> 6/06/2022 </label> <label className="px-1" style={{ color: 'gray' }}><i class="fas fa-user text-info"></i> Curaduria 1 de Bucaramanga</label> <label className="px-1" style={{ color: 'gray' }}><i class="fas fa-folder text-info"></i> Avisos</label>   </label>
                            </div>
                            <p className="text-justify fw-normal ">
                                El horario general de atención al público del despacho del curador urbano uno de Bucaramanga, será de (07:00 am) a doce y media de la tarde (12:30pm) y de una de la tarde (1:00 pm) a cuatro de la tarde (4:00 pm).<br></br>

                                La radicación de la documentación realizada por fuera de este horario, independientemente del canal de radicación, se entenderá presentada al día hábil siguiente, por lo cual, si la radicación corresponde a un acto procesal con un término perentorio, tal como se consignó en la parte considerativa, la radicación será extemporánea dando lugar al desistimiento, rechazo del recurso, etc., según el caso.<br></br>

                                Así mismo se establecen los siguientes HORARIOS ESPECIALES, con el fin de prestar un mejor servicio,<br></br>
                                <ul>
                                    <li> CONSULTA CON EL CURADOR URBANO: lunes a viernes de 7 a.m. a 12:30 p.m.</li>
                                    <li> ATENCIÓN A VECINOS / TERCEROS INTERESADOS: lunes a viernes de 7 a.m. a 12:30 p.m.</li>
                                    <li> ENTREGA DE PLANOS PARA COPIAS Y EJECUTORIAS: martes y jueves de 7 a.m. a 12:30 p.m.</li>
                                    <li>ASISTENCIA TÉCNICA CON REVISOR ESTRUCTURAL / REVISORA JURÍDICA: miércoles y viernes de 2:00 p.m. a 4:00 p.m. </li>
                                    <li>ASISTENCIA TÉCNICA CON ARQUITECTO REVISOR (PROYECTOS RADICADOS): lunes, miércoles y viernes de 7:00 a.m. a 12:30 p.m.</li>
                                    <li> ASISTENCIA TÉCNICA CON ARQUITECTO REVISOR (PREVIO A RADICACIÓN): martes y jueves de 7:00 a.m. a 12:30 p.m.</li>
                                </ul>
                                SE INVITA a los usuarios a hacer uso del módulo de AGENDAMIENTO DE CITAS establecido para mejorar la prestación de nuestro servicio, al cual se puede acceder a través de la página institucional mediante el enlace https://www.curaduria1bucaramanga.com/scheduling o solicitándola a través de los canales de atención los cuales son ampliamente conocidos y en todo caso pueden ser consultados en la precitada página.<br></br>
                                EL CONTENIDO DE LA RESOLUCIÓN SE ENCUENTRA DISPONIBLE PARA SU CONSULTA EN “PUBLICACIONES” DE LA PÁGINA INSTITUCIONAL (En el enlace https://www.curaduria1bucaramanga.com/administrative) ASÍ MISMO EN LUGAR VISIBLE DE LA OFICINA.

                            </p>
                        </div>
                    </div>

                </div>
            </div>
    },
    {
        id: 'news1',
        title: 'Prórroga de licencias y revalidaciones',
        icon_folder: <i class="fas fa-folder " style={{ color: '#107ABC' }}></i>,
        icon_date: <i class="fas fa-clock " style={{ color: '#107ABC' }}></i>,
        category: 'Aviso',
        date: '12/05/2022',
        summary: 'El Decreto 1783 De 2021 que modificó el Decreto 1077 de 2015 en el artículo 2.2.6.1.2.4.1.',
        link: 'Ver mas',
        image: NEW_AVIS,
        url: '/news/?newsId=news1',
        noticia:
            <div className='container'>
                <div class="row align-items-start py-1">
                    <div class="col-12 px-4 border border-info py-4 m-3" style={{ backgroundColor: ' #f9f9f9 ', borderRadius: '2px', border: '1px' }}>
                        <div className="px-4 py-1">
                            <h3 className="text-center" id='news1'>¡Aviso importante prórroga de las licencias y revalidaciones! {<Button_navigation Iddown={'news2'} Idup={'news5'} />}</h3>
                            <div className="py-1">
                                <label><label className="px-1" style={{ color: 'gray' }}><i class="fas fa-clock text-info"></i> 12/05/2022 </label> <label className="px-1" style={{ color: 'gray' }}><i class="fas fa-user text-info"></i> Curaduria 1 de Bucaramanga</label> <label className="px-1" style={{ color: 'gray' }}><i class="fas fa-folder text-info"></i> Avisos</label>   </label>
                            </div>
                            <p className="text-justify fw-normal ">El Decreto 1783 De 2021 que modificó el Decreto 1077 de 2015 en el artículo 2.2.6.1.2.4.1. contempla (…) La solicitud de prórroga de una licencia urbanística deberá radicarse con la documentación completa a más tardar treinta (30) días hábiles antes del vencimiento de la respectiva licencia. <br></br>
                                La solicitud deberá acompañarse de la manifestación bajo la gravedad del juramento de la iniciación de obra por parte del urbanizador o constructor responsable.<br></br>

                                La prórroga de la revalidación se debe solicitar a más tardar treinta (30) días hábiles antes de su vencimiento y su expedición procede con la sola presentación de la solicitud por parte del interesado.<br></br>
                                Las solicitudes de prórroga de licencias urbanísticas y de prórroga de sus revalidaciones cuyo término de vigencia inicial se venza dentro de los tres meses (3) meses siguientes a la modificación del presente artículo, podrán presentarse cumpliendo con los términos establecidos en las normas vigentes antes de esta modificación (...)<br></br>

                                <b> POR LO ANTERIOR Y EN VIRTUD DE QUE EL DECRETO ESTÁ VIGENTE DESDE EL 20 DE DICIEMBRE DE 2022: SI SU LICENCIA O REVALIDACIÓN VENCE EL 21 DE MARZO DE 2022 O FECHA SIGUIENTE Y VA A RADICAR SOLICITUD DE PRÓRROGA, ESTA DEBE HACERSE DE FORMA COMPLETA 30 DÍAS HÁBILES ANTES DEL VENCIMIENTO, ES DECIR POR CITAR UN EJEMPLO, SI VENCE EL 21 DE MARZO DE 2022 DEBE RADICAR A MÁS TARDAR EL 07 DE FEBRERO DE 2022.LO ANTERIOR SÓLO APLICA PARA AQUELLAS LICENCIAS QUE PUEDEN SER PRORROGABLES.</b></p>
                        </div>
                    </div>

                </div>
            </div>
    },
    {
        id: 'news2',
        title: 'Certificación para profesionales',
        icon_folder: <i class="fas fa-folder " style={{ color: '#107ABC' }}></i>,
        icon_date: <i class="fas fa-clock " style={{ color: '#107ABC' }}></i>,
        category: 'Noticia',
        date: '15/12/2021',
        summary: 'La Curaduria Urbana N°1 de Bucaramanga ofrece a los profesionales que figuran en las',
        link: 'Ver mas',
        image: NEW_3_ING,
        url: '/news/?newsId=news2',
        noticia:
            <div className='container'>
                <div class="row align-items-start py-1">
                    <div class="col-12 px-4 border border-info py-4 m-3" style={{ backgroundColor: ' #f9f9f9 ', borderRadius: '2px', border: '1px' }}>
                        <div className="px-4 py-1">
                            <h3 className="text-center" id='news2'>Certificación para profesionales que actúan ante la Curaduría {<Button_navigation Iddown={'news3'} Idup={'news1'} />}</h3>
                            <div className="py-1">
                                <label><label className="px-1" style={{ color: 'gray' }}><i class="fas fa-clock text-info"></i> 15/12/2022 </label> <label className="px-1" style={{ color: 'gray' }}><i class="fas fa-user text-info"></i> Curaduria 1 de Bucaramanga</label> <label className="px-1" style={{ color: 'gray' }}><i class="fas fa-folder text-info"></i> Noticias</label>   </label>
                            </div>
                            <div className='container'>
                                <div class="row justify-content-start">
                                    <div class="col-3">
                                        <img src={NEW_3_ING} class="d-block w-100 mt-1" alt="..." />
                                    </div>
                                    <div class="col-8">
                                        <p className="text-justify fw-normal "> La Curaduria Urbana N°1 de Bucaramanga ofrece a los profesionales que figuran en las actuaciones urbanísticas, la certificación de participación y responsabilidad en la calidad profesional en la que haya actuado en los proyectos de licenciamiento. Para generar el certificado, asi como para verificar el expedidor dar <Link className='text-info' to={'/certificacion'}>Click aqui</Link>.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    },
    {
        id: 'news3',
        title: 'Curaduría Inclusiva - Ley 982 de 2005',
        icon_folder: <i class="fas fa-folder " style={{ color: '#107ABC' }}></i>,
        icon_date: <i class="fas fa-clock " style={{ color: '#107ABC' }}></i>,
        category: 'Noticia',
        date: '6/12/2021',
        summary: 'La Curaduria N° 1 de Bucaramanga usa la ayuda de las TIC para ofrecer un mejor',
        link: 'Ver mas',
        image: NEW_2_ING,
        url: '/news/?newsId=news3',
        noticia:
            <div className='container'>
                <div class="row align-items-start py-1">
                    <div class="col-12 px-4 border border-info py-4 m-3" style={{ backgroundColor: ' #f9f9f9 ', borderRadius: '2px', border: '1px' }}>
                        <div className="px-4 py-1">
                            <h3 className="text-center" id='news3'>Curaduría Inclusiva - Ley 982 de 2005 {<Button_navigation Iddown={'news4'} Idup={'news2'} />}</h3>
                            <div className="py-1">
                                <label><label className="px-1" style={{ color: 'gray' }}><i class="fas fa-clock text-info"></i> 6/12/2021 </label> <label className="px-1" style={{ color: 'gray' }}><i class="fas fa-user text-info"></i> Curaduria 1 de Bucaramanga</label> <label className="px-1" style={{ color: 'gray' }}><i class="fas fa-folder text-info"></i> Noticias</label>   </label>
                            </div>
                            <div className='container'>
                                <div class="row justify-content-start">
                                    <div class="col-8">
                                        <p className="text-justify fw-normal "> La Curaduria N° 1 de Bucaramanga usa la ayuda de las TIC para ofrecer un mejor servicio a quienes lo necesiten. Gracias al Ministerio de Tecnologías de la Información y las Comunicaciones- MINTIC en alianza con la Federación Nacional de Sordos de Colombia- FENASCOL, apoyándose en la tecnología ofrece servicios de forma gratuita mediante una aplicación de dispositivos móviles, de igual modo el ConVerTIC es el proyecto de inclusión del Ministerio TIC con el fin de promover la inclusión social, educativa, laboral y cultural a través de uso de las tecnologías para las personas ciegas o con baja visión. Conoce mas sobre estas alternativas dando <Link className='text-info' to={'/inclusivity'}>Click aqui</Link>.</p>
                                    </div>
                                    <div class="col-4">
                                        <img src={NEW_2_ING} class="d-block w-100 mt-1" alt="..." />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    },
    {
        id: 'news4',
        title: 'Nuestro Nuevo Punto de Atención',
        icon_folder: <i class="fas fa-folder" style={{ color: '#107ABC' }}></i>,
        icon_date: <i class="fas fa-clock " style={{ color: '#107ABC' }}></i>,
        category: 'Noticia',
        date: '15/06/2021',
        summary: 'Ya se encuentra en funcionamiento nuestro nuevo punto de atención. Nuestra nueva ubicación',
        link: 'Ver mas',
        image: NEW_ING,
        url: '/news/?newsId=news4',
        noticia:
            <div className='container'>
                <div class="row align-items-start py-1">
                    <div class="col-12 px-4 border border-info py-4 m-3" style={{ backgroundColor: ' #f9f9f9 ', borderRadius: '2px', border: '1px' }}>
                        <div className="px-4 py-1">
                            <h3 className="text-center" id='news4'>Punto de atención {<Button_navigation Iddown={null} Idup={'news3'} />}</h3>
                            <div className="py-1">
                                <label><label className="px-1" style={{ color: 'gray' }}><i class="fas fa-clock text-info"></i> 15/06/2021 </label> <label className="px-1" style={{ color: 'gray' }}><i class="fas fa-user text-info"></i> Curaduria 1 de Bucaramanga</label> <label className="px-1" style={{ color: 'gray' }}><i class="fas fa-folder text-info"></i> Noticias</label>   </label>
                            </div>
                            <div className='container'>
                                <div class="row justify-content-start">
                                    <div class="col-3">
                                        <img src={NEW_ING} class="d-block w-100 mt-1" alt="..." />
                                    </div>
                                    <div class="col-8">
                                        <p className="text-justify fw-normal "> Ya se encuentra en funcionamiento el nuevo punto de atención. se encuentra en la Calle 36 # 31-39 Centro Empresarial Chicamocha - Local 101, con parqueadero público en el Centro Empresarial Chicamocha. <br></br> Horario de atención permanece sin cambios, de Lunes a Viernes de 07:00 am a 12:30 pm y 1:00 pm a 5:00 pm.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    }]