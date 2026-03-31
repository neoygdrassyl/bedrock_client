import { MDBCard, MDBCardBody, MDBBreadcrumb, MDBBreadcrumbItem } from '../../components/ui';
import { Link } from "react-router-dom";
import { DashBoardCard } from '../../components/dashBoardCards/dashBoardCard.js';

const _GLOBAL_ID = import.meta.env.VITE_GLOBAL_ID;

function Dashboard({ breadCrums }) {
    const workModules = [
        { title: "Buzón de Mensajes", image: "fas fa-envelope-open-text fa-3x", link: "/mail" },
        { title: "Calendario de Citas", image: "fas fa-calendar-alt fa-3x", link: "/appointments" },
        { title: "Ventanilla Única", image: "fas fa-file-import fa-3x", link: "/submit" },
        { title: "Publicaciones", image: "fas fa-newspaper fa-3x", link: "/publish" },
        { title: "Peticiones PQRS", image: "fas fa-file-invoice fa-3x", link: "/pqrsadmin" },
        { title: "Nomenclaturas", image: "fas fa-signature fa-3x", link: "/nomenclature" },
        { title: "Archivo", image: "fas fa-folder-open fa-3x", link: "/archive" },
        { title: "Radicar Licencias", image: "fas fa-file-alt fa-3x", link: "/fun" },
        { title: "Gestionar Licencias", image: "fas fa-folder fa-3x", link: "/funmanage" },
        { title: "Gestion Licencias Nuevo", image: "fas fa-layer-group fa-3x", link: "/funmanage-new" },
    ];

    if (_GLOBAL_ID == "cb1") {
        workModules.push({ title: "Normas Urbanas", image: "fas fa-home fa-3x", link: "/norms" });
        workModules.push({ title: "Uso de Suelo", image: "fas fa-cube fa-3x", link: "/zone_use" });
    }

    const utilityModules = [
        { title: "Documentos", image: "far fa-file-alt fa-3x", link: "/osha" },
        { title: "Calculadora de Expensas", image: "fas fa-calculator fa-3x", link: "/calculator" },
        { title: "Diccionario de Consecutivos", image: "fas fa-book fa-3x", link: "/dictionary" },
        { title: "Manual de Usuario", image: "fas fa-atlas fa-3x", link: "/guide_user" },
        { title: "Base de Datos Profesionales", image: "fas fa-hard-hat fa-3x", link: "/profesionals" },
        { title: "Historial de Profesionales", image: "fas fa-address-book fa-4x", link: "/certs" },
    ];

    return (
        <div className="Dashboard container container-fluid p-0">

            <div className="col-12 d-flex justify-content-start p-0">
                <MDBBreadcrumb>
                    <MDBBreadcrumbItem>
                        <Link to={'/home'}><i className="fas fa-home"></i> <label className="text-uppercase">{breadCrums.bc_01}</label></Link>
                    </MDBBreadcrumbItem>
                    <MDBBreadcrumbItem active><i className="far fa-bookmark"></i> <label className="text-uppercase">{breadCrums.bc_u1}</label></MDBBreadcrumbItem>
                </MDBBreadcrumb>
            </div>

            <div className="row d-flex justify-content-center">
                <div className="col-12 col-xl-11">
                    <h1 className="text-center mt-2 mb-3">Panel de Control</h1>
                    <div className="row g-3 g-xl-4">
                        <div className="col-12">
                            <MDBCard className="border-0 shadow-sm">
                                <MDBCardBody className="p-3 p-md-4">
                                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                                        <h2 className="h5 mb-0">Operacion y Gestion</h2>
                                        <small className="text-secondary">Accesos principales</small>
                                    </div>

                                    <div className="row row-cols-2 row-cols-md-4 row-cols-xl-6 g-2 g-md-3 justify-content-center">
                                        {workModules.map((module) => (
                                            <div className="col d-flex justify-content-center" key={module.link}>
                                                <DashBoardCard
                                                    title={module.title}
                                                    image={module.image}
                                                    link={module.link}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </MDBCardBody>
                            </MDBCard>
                        </div>

                        <div className="col-12">
                            <MDBCard className="border-0 shadow-sm">
                                <MDBCardBody className="p-3 p-md-4">
                                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                                        <h2 className="h5 mb-0">Utilidades y Documentacion</h2>
                                        <small className="text-secondary">Soporte y consulta</small>
                                    </div>

                                    <div className="row row-cols-2 row-cols-md-3 row-cols-xl-6 g-2 g-md-3 justify-content-center">
                                        {utilityModules.map((module) => (
                                            <div className="col d-flex justify-content-center" key={module.link}>
                                                <DashBoardCard
                                                    title={module.title}
                                                    image={module.image}
                                                    link={module.link}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </MDBCardBody>
                            </MDBCard>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;