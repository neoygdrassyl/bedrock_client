import { MDBBreadcrumb, MDBBreadcrumbItem, } from 'mdb-react-ui-kit';
import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import Markdown from 'markdown-to-jsx';
import { useLocation } from "react-router-dom"

import DevIndexList from './guide/dev_index'
import guide_dev_01 from './guide/guide_dev_01.md'
import guide_dev_02 from './guide/guide_dev_02.md'
import guide_dev_03 from './guide/guide_dev_03.md'
import guide_dev_04 from './guide/guide_dev_04.md'
import guide_dev_05 from './guide/guide_dev_05.md'
import guide_dev_06 from './guide/guide_dev_06.md'
import guide_dev_07 from './guide/guide_dev_07.md'

export default function DEV_GUIDE(props) {
    const { translation, swaMsg, globals, breadCrums } = props;
    const location = useLocation();

    var [currentMd, setCurrentMd] = useState(null);
    var [introMd, setIntroMd] = useState(null);
    var [indexArray, setIndex] = useState([]);
    var [load, setLoad] = useState(0);
    var [activeSection, setActiveSection] = useState(1);

    useEffect(() => {
        if (load === 0) {
            window.scrollTo({ top: 0 });
            setIndex(DevIndexList);
            fetch(guide_dev_01).then((response) => response.text()).then((text) => {
                setIntroMd(text);
                setCurrentMd(text);
            });
            setLoad(1);
        }
    }, [load]);

    // ***************************  DATA CONVERTER *********************** //
    let CHANGE_CONTENT = (md, ref, section) => {
        fetch(md).then((response) => response.text()).then((text) => {
            setCurrentMd(text);
            setActiveSection(section);
        });
    }

    let getSectionNumber = (ref) => {
        const match = ref.match(/^(\d+)/);
        return match ? parseInt(match[1]) : 1;
    }

    // ***************************  JXS *********************** //
    let _HEADER_COMPONENT = () => {
        return <>
            <div className="col-12 d-flex justify-content-start p-0">
                <MDBBreadcrumb className="mb-0 p-0 ms-0">
                    <MDBBreadcrumbItem>
                        <Link to={'/home'}><i className="fas fa-home"></i> <label className="text-uppercase">INICIO</label></Link>
                    </MDBBreadcrumbItem>
                    <MDBBreadcrumbItem>
                        <Link to={'/dashboard'}><i className="far fa-bookmark"></i> <label className="text-uppercase">DASHBOARD</label></Link>
                    </MDBBreadcrumbItem>
                    <MDBBreadcrumbItem active><i className="fas fa-code"></i> <label className="text-uppercase">GUÍA DE DESARROLLO</label></MDBBreadcrumbItem>
                </MDBBreadcrumb>
            </div>
            <div className="row mb-4 d-flex justify-content-center">
                <div className="col-lg-11 col-md-12">
                    <h1 className="text-center my-4">
                        <i className="fas fa-code me-2"></i>
                        GUÍA DE DESARROLLO - DOVELA
                    </h1>
                    <p className="text-center text-muted lead">
                        Documentación técnica exhaustiva del sistema Frontend (React) + Backend (Express/Sequelize)
                    </p>
                    <hr />
                </div>
            </div>
        </>
    }

    let _NAVIGATION_BUTTONS = () => {
        const sections = [
            { num: 1, label: 'Visión General', md: guide_dev_01, icon: 'fa-eye' },
            { num: 2, label: 'Arquitectura', md: guide_dev_02, icon: 'fa-sitemap' },
            { num: 3, label: 'Frontend', md: guide_dev_03, icon: 'fa-laptop-code' },
            { num: 4, label: 'Backend', md: guide_dev_04, icon: 'fa-server' },
            { num: 5, label: 'APIs', md: guide_dev_05, icon: 'fa-plug' },
            { num: 6, label: 'Configuración', md: guide_dev_06, icon: 'fa-cogs' },
            { num: 7, label: 'Extensibilidad', md: guide_dev_07, icon: 'fa-puzzle-piece' },
        ];

        return (
            <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
                {sections.map(section => (
                    <button
                        key={section.num}
                        className={`btn ${activeSection === section.num ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                        onClick={() => CHANGE_CONTENT(section.md, '', section.num)}
                    >
                        <i className={`fas ${section.icon} me-1`}></i>
                        {section.label}
                    </button>
                ))}
            </div>
        );
    }

    let _INDEX_COMPONENT = () => {
        return (
            <div className='mx-3 p-3 bg-light rounded' style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <h5 className="mb-3"><i className="fas fa-list me-2"></i>Índice de Contenidos</h5>
                {indexArray.map((item, idx) => {
                    if (item.br) return <hr key={idx} className="my-2" />;
                    const isMainSection = !item.pre.includes('.');
                    const sectionNum = getSectionNumber(item.pre);
                    return (
                        <div key={idx} className={isMainSection ? 'mt-2' : 'ms-3'}>
                            <span className={`${isMainSection ? 'fw-bold' : ''}`}>{item.pre}</span>
                            <a
                                href={'#' + item.ref}
                                className={`ms-2 text-decoration-none ${activeSection === sectionNum ? 'text-primary' : 'text-dark'}`}
                                onClick={() => CHANGE_CONTENT(item.md, item.ref, sectionNum)}
                            >
                                {item.label}
                            </a>
                        </div>
                    );
                })}
            </div>
        );
    }

    let _STATS_COMPONENT = () => {
        return (
            <div className="row mb-4">
                <div className="col-md-3 col-6 mb-2">
                    <div className="card bg-primary text-white">
                        <div className="card-body text-center py-3">
                            <i className="fas fa-file-code fa-2x mb-2"></i>
                            <h5 className="mb-0">7</h5>
                            <small>Secciones</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 col-6 mb-2">
                    <div className="card bg-success text-white">
                        <div className="card-body text-center py-3">
                            <i className="fas fa-laptop-code fa-2x mb-2"></i>
                            <h5 className="mb-0">React</h5>
                            <small>Frontend</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 col-6 mb-2">
                    <div className="card bg-warning text-dark">
                        <div className="card-body text-center py-3">
                            <i className="fas fa-server fa-2x mb-2"></i>
                            <h5 className="mb-0">Express</h5>
                            <small>Backend</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 col-6 mb-2">
                    <div className="card bg-info text-white">
                        <div className="card-body text-center py-3">
                            <i className="fas fa-database fa-2x mb-2"></i>
                            <h5 className="mb-0">MySQL</h5>
                            <small>Database</small>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid px-4">
            {_HEADER_COMPONENT()}
            {_STATS_COMPONENT()}
            {_NAVIGATION_BUTTONS()}
            
            {currentMd ? (
                <div className="row">
                    <div className="col-lg-3 col-md-4 mb-4">
                        {_INDEX_COMPONENT()}
                    </div>
                    <div className="col-lg-9 col-md-8">
                        <div className="card">
                            <div className="card-body">
                                <Markdown 
                                    children={currentMd} 
                                    className="markdown-content"
                                    options={{
                                        overrides: {
                                            pre: {
                                                props: {
                                                    className: 'bg-dark text-light p-3 rounded'
                                                }
                                            },
                                            code: {
                                                props: {
                                                    className: 'text-danger'
                                                }
                                            },
                                            table: {
                                                props: {
                                                    className: 'table table-bordered table-striped table-sm'
                                                }
                                            },
                                            h1: {
                                                props: {
                                                    className: 'border-bottom pb-2 mb-4'
                                                }
                                            },
                                            h2: {
                                                props: {
                                                    className: 'border-bottom pb-2 mb-3 mt-4'
                                                }
                                            },
                                            h3: {
                                                props: {
                                                    className: 'mt-4 mb-3'
                                                }
                                            },
                                            blockquote: {
                                                props: {
                                                    className: 'border-start border-4 border-warning ps-3 py-2 bg-light'
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mt-3 text-muted">Cargando documentación...</p>
                </div>
            )}
        </div>
    );
}
