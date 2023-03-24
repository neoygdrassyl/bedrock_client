import React, { useRef, useState } from 'react'
import { dateParser, dateParser_dateDiff } from '../../../../components/customClasses/typeParse'
import JoditEditor from "jodit-pro-react";
import Collapsible from 'react-collapsible';

export const PQRS_COMPONENT_REPLIES_TOSOLICITOR2 = (props) => {

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




    let _REPLIY_TO_SOLICITOR_COMPONENT = () => {
        var _COMPONENT = [];
        _COMPONENT.push(<>
            <div className="row m-2">
                <div className="col-6">
                    <div className="row">
                        <div className="col-6">
                            <lavel>Fecha de envio respuesta</lavel>
                        </div>
                        <div className="col-6">
                            <lavel className="fw-bold">{currentItem.pqrs_time.reply_formal
                                ? dateParser(currentItem.pqrs_time.reply_formal)
                                : <label className="text-danger fw-bold">NO SE HA DADO RESPUESTA FORMAL</label>}</lavel>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-6">
                            <lavel>Tiempo real de respuesta</lavel>
                        </div>
                        <div className="col-6">
                            <label className="fw-bold">{currentItem.pqrs_time.reply_formal
                                ? dateParser_dateDiff(currentItem.pqrs_time.legal, currentItem.pqrs_time.reply_formal) + " Dia(s) habiles"
                                : ""}</label>
                        </div>
                    </div>
                </div>
               <hr></hr>
                    <Collapsible className='bg-warning  border border-info text-center' openedClassName='bg-light text-center' trigger={<><label className="fw-normal text-dark text-center">RESPUESTA FORMAL DE LA PETICION</label></>}>
                    <div className="row">
                        <div className='text-start'>
                        <JoditEditor
                            ref={editor}
                            value={currentItem.pqrs_info.reply}
                            config={config()}
                            tabIndex={1} // tabIndex of textarea
                            onBlur={newContent => setContent(newContent)} // preferred to use only this option to update the content for performance reasons
                            onChange={newContent => { }}
                            class="form-control mb-3"
                            rows="5"
                            maxlength="409675"
                        />
                        </div>
                    </div>
                    </Collapsible>
                </div>
            
        </>)
        return <>{_COMPONENT}</>;
    }

    return (
        <div>
            {_REPLIY_TO_SOLICITOR_COMPONENT()}
        </div>
    )
}
