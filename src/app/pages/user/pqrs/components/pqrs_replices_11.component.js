import React, { useRef, useState } from 'react'
import { dateParser, dateParser_finalDate } from '../../../../components/customClasses/typeParse'
import JoditEditor from "jodit-pro-react";
const moment = require('moment');
const momentB = require('moment-business-days');


export const PQRS_COMPONENT_REPLIES_PROFESIONAL1 = (props) => {

    const { translation, swaMsg, globals, currentItem } = props;
    const editor = useRef(null)
    const [content, setContent] = useState('')

    const config = () => {
        return {
            readonly: false, // all options from https://xdsoft.net/jodit/doc/,
            uploader: {
                url: 'https://xdsoft.net/jodit/finder/?action=fileUpload'
            },
            filebrowser: {
                ajax: {
                    url: 'https://xdsoft.net/jodit/finder/'
                },
                height: 580,
            },
            language: 'es',
            "readonly": true,
            "toolbar": false,
            "disablePlugins": "clipboard",
            "disablePlugins": "xpath",
            minHeight: 150,
            removeButtons: ['xpath'],
            controls: {
                lineHeight: {

                    list: ([0.5, 1, 1.1, 1.2, 1.3, 1.4, 1.5, 2, 3, 3.5])

                }
            }
        }
    }




    let _REPLIES_COMPONENT = () => {
        var _COMPONENT = [];
        for (var i = 0; i < currentItem.pqrs_workers.length; i++) {
            if ((currentItem.pqrs_workers[i].reply && currentItem.pqrs_workers[i].roleId == window.user.roleId) || (window.user.roleId == 1 && currentItem.pqrs_workers[i].reply)) {
                _COMPONENT.push(<>
                    <div className="row m-2">
                        <div className="col-6">
                            <div className="row">
                                <div className="col-6">
                                    <lavel>Profesional</lavel>
                                </div>
                                <div className="col-6">
                                    <lavel className="fw-bold">{currentItem.pqrs_workers[i].name}</lavel>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-6">
                                    <lavel>Competencia</lavel>
                                </div>
                                <div className="col-6">
                                    <label className="fw-bold">{currentItem.pqrs_workers[i].competence}</label>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-6">
                                    <lavel>Fecha de Asignación</lavel>
                                </div>
                                <div className="col-6">
                                    <label className="fw-bold">{dateParser(currentItem.pqrs_workers[i].asign)}</label>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-6">
                                    <lavel>Fecha limite de respuesta</lavel>
                                </div>
                                <div className="col-6">
                                    <label className="fw-bold">{dateParser(dateParser_finalDate(currentItem.pqrs_workers[i].asign, 5))}</label>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-6">
                                    <lavel>Fecha real respuesta </lavel>
                                </div>
                                <div className="col-6">
                                    <label className="fw-bold">{dateParser(currentItem.pqrs_workers[i].date_reply)}</label>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-6">
                                    <lavel>Tiempo real de respuesta</lavel>
                                </div>
                                <div className="col-6">
                                    <label className="fw-bold">{momentB(currentItem.pqrs_workers[i].asign, 'YYYY-MM-DD').businessDiff(moment(currentItem.pqrs_workers[i].date_reply, 'YYYY-MM-DD')) + " dia(s) habiles"}</label>
                                </div>
                            </div>
                        </div>
                        <hr className='col-20'></hr>
                        <label className="fw-bold">2.1. RESPUESTA</label>
                        <JoditEditor
                            ref={editor}
                            value={currentItem.pqrs_workers[i].reply}
                            config={config()}
                            tabIndex={1} // tabIndex of textarea
                            onBlur={newContent => setContent(newContent)} // preferred to use only this option to update the content for performance reasons
                            onChange={newContent => { }}
                            class="form-control mb-3"
                            rows="5"
                            maxlength="409675"

                        />
                    </div>


                </>)
            }

        }
        return <>{_COMPONENT}</>;
    }

    return (
        <div>
            {_REPLIES_COMPONENT()}
        </div>
    )
}
