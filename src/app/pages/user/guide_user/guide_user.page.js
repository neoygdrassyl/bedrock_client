import { MDBBreadcrumb, MDBBreadcrumbItem, } from 'mdb-react-ui-kit';
import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import Markdown from 'markdown-to-jsx';
import { useLocation } from "react-router-dom"

import IndexList from './guide/var_index'
import indexMd from './guide/guide_index.md'
import guide_00 from './guide/guide_00.md'
import guide_01 from './guide/guide_01.md'

export default function GUIDE_USER(props) {
    const { translation, swaMsg, globals, breadCrums } = props;
    const location = useLocation();

    var [md01, setMd01] = useState(null);
    var [md00, setMd00] = useState(null);
    var [indexArray, setIndex] = useState([]);
    var [mdIndex, setMdIndex] = useState(null);
    var [load, setLoad] = useState(0);

    useEffect(() => {
        // DONT QUESTION THIS, THIS IS HOW MD WORKSs
        if (load == 0) {
            window.scrollTo({ top: 0 });
            setIndex(IndexList)
            fetch(indexMd).then((response) => response.text()).then((text) => setMdIndex(text))
            fetch(guide_00).then((response) => response.text()).then((text) => setMd00(text))
            fetch(guide_01).then((response) => response.text()).then((text) => setMd01(text))
            setLoad(1)
        }
    }, [load]);

    // ***************************  DATA CONVERTER *********************** //
    let CHANGE_CONTENT = (md, ref) => {
        fetch(md).then((response) => response.text()).then((text) => {
            setMd01(text);
        })
    }
    // ***************************  JXS *********************** //
    let _HEADER_COMPONENET = () => {
        return <>
            <div className="col-12 d-flex justify-content-start p-0">
                <MDBBreadcrumb className="mb-0 p-0 ms-0">
                    <MDBBreadcrumbItem>
                        <Link to={'/home'}><i class="fas fa-home"></i> <label className="text-uppercase">{breadCrums.bc_01}</label></Link>
                    </MDBBreadcrumbItem>
                    <MDBBreadcrumbItem>
                        <Link to={'/dashboard'}><i class="far fa-bookmark"></i> <label className="text-uppercase">{breadCrums.bc_u1}</label></Link>
                    </MDBBreadcrumbItem>
                    <MDBBreadcrumbItem active><i class="fas fa-atlas"></i>  <label className="text-uppercase">MANUAL DEL USUARIO</label></MDBBreadcrumbItem>
                </MDBBreadcrumb>
            </div>
            <div className="row mb-4 d-flex justify-content-center">
                <div className="col-lg-11 col-md-12">
                    <h2 className='text-center text-danger'>EN CONSTRUCCIÓN...</h2>
                    <h1 className="text-center my-4">MANUAL DEL USUARIO</h1>
                    <hr />
                </div>
            </div>
        </>
    }

    let _INDEX_COMPONENT = () => {
        return <div className='mx-5' style={{height: '500px', overflowY: 'scroll'}}>
            {indexArray.map(i => {
                if (i.br) return <br />
                return <div><label className='fw-bold'>{i.pre}</label> <a href={'#' + i.ref} onClick={() => CHANGE_CONTENT(i.md, i.ref)}>{i.label}</a></div>
            })}
        </div>
    }
    // ***************************  DATATABLES *********************** //

    // ***************************  APIS *********************** //

    return (
        <>
            {_HEADER_COMPONENET()}
            {md01 ?
                <div>
                    <Markdown children={md00} className="m-3" />
                    <h2 id="indice" className='ms-5'>Indice</h2>
                    <hr />
                    {_INDEX_COMPONENT()}
                    <hr />
                    <Markdown children={md01} className="m-3" id="md-content" />
                </div>
                : <label className='fw-normal lead text-muted'>CARGANDO...</label>}
        </>
    );
}
