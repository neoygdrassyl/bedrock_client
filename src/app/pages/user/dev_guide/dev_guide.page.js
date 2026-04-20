import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import Markdown from 'markdown-to-jsx';
import { useLocation } from "react-router-dom"
import { Button } from '@/components/ui/button';

import DevIndexList from './guide/dev_index'
import guide_dev_01 from './guide/guide_dev_01.md'
import guide_dev_02 from './guide/guide_dev_02.md'
import guide_dev_03 from './guide/guide_dev_03.md'
import guide_dev_04 from './guide/guide_dev_04.md'
import guide_dev_05 from './guide/guide_dev_05.md'
import guide_dev_06 from './guide/guide_dev_06.md'
import guide_dev_07 from './guide/guide_dev_07.md'
import guide_dev_08 from './guide/guide_dev_08.md'
import guide_dev_09 from './guide/guide_dev_09.md'
import { PreBlock, CodeBlock } from '../../../components/MermaidDiagram.component'
import { Icon } from '@/components/icon';

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
            
            <div className="row mb-4 d-flex justify-content-center">
                <div className="col-lg-11 col-md-12">
                    <h1 className="text-center my-4">
                        <Icon name="code" size={16} className="me-2" />
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
            { num: 8, label: 'Licencias', md: guide_dev_08, icon: 'fa-id-card' },
            { num: 9, label: 'Revisiones', md: guide_dev_09, icon: 'fa-clipboard-check' },
        ];

        return (
            <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
                {sections.map(section => (
                    <Button
                        key={section.num}
                        variant={activeSection === section.num ? "default" : "outline"}
                        size="sm"
                        onClick={() => CHANGE_CONTENT(section.md, '', section.num)}
                    >
                        <Icon name={section.icon} size={16} className="me-1" />
                        {section.label}
                    </Button>
                ))}
            </div>
        );
    }

    let _INDEX_COMPONENT = () => {
        return (
            <div className='mx-3 p-3 bg-light rounded' style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <h5 className="mb-3"><Icon name="list" size={16} className="me-2" />Índice de Contenidos</h5>
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
                            <Icon name="file-code" size={16} className="mb-2" />
                            <h5 className="mb-0">9</h5>
                            <small>Secciones</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 col-6 mb-2">
                    <div className="card bg-success text-white">
                        <div className="card-body text-center py-3">
                            <Icon name="laptop-code" size={16} className="mb-2" />
                            <h5 className="mb-0">React</h5>
                            <small>Frontend</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 col-6 mb-2">
                    <div className="card bg-warning text-dark">
                        <div className="card-body text-center py-3">
                            <Icon name="server" size={16} className="mb-2" />
                            <h5 className="mb-0">Express</h5>
                            <small>Backend</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 col-6 mb-2">
                    <div className="card bg-primary text-primary-foreground">
                        <div className="card-body text-center py-3">
                            <Icon name="database" size={16} className="mb-2" />
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
                                                component: PreBlock
                                            },
                                            code: {
                                                component: CodeBlock
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
