import { useState } from 'react';
import { MDBTooltip } from './ui';
import { LegacyModal as Modal } from '@/components/legacy-modal';
import PDF_VIEWER from './pdfViewer.component';
import FUNService from '../services/fun.service'
import { Icon } from '@/components/icon';

function VIZUALIZER({ url, id, apipath, icon, color, iconWrapper, iconStyle }) {
    const [modal, setModal] = useState(false);
    const [localURL, setLocalURL] = useState('');
    const [localAPI, setLocalAPI] = useState(false);

    const toggle = () => {
        setModal(prev => !prev);
    };

    const customStyles = {
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.75)',
            zIndex: 1051
        },
        content: {
            position: 'absolute',
            top: '0px',
            left: '15%',
            right: 'auto',
            bottom: '0px',
            border: '1px solid #ccc',
            overflow: 'auto',
            WebkitOverflowScrolling: 'touch',
            borderRadius: '4px',
            outline: 'none',
            padding: '20px',
            marginRight: '12%',
        }
    };

    let _OPEN_WINDOW = (URL) => {
        var re = /(?:\.([^.]+))?$/;
        var ext = re.exec(URL)[1];
        if (ext == "pdf" || ext == "PDF" ) {
            setModal(true);
        } else if (ext == "png" || ext == "jpg" || ext == "jpeg") {
            var img = '<img src="' + URL + '">';
            var popup = window.open();
            popup.document.write(img);
        }
        else{
            _DOWNLOAD();
        }
    }

    let _DOWNLOAD = () => {
        window.open(import.meta.env.VITE_API_URL + apipath + url, '_blank');
    }
    let _LOAD_BY_ID = () => {
        FUNService.getFun6(id)
        .then(response => {
            setLocalURL(response.data.path + '/'+response.data.filename);
            _OPEN_WINDOW(import.meta.env.VITE_API_URL + apipath + response.data.path + '/'+response.data.filename)
        })
        .catch(e => {
            console.log(e);
        });
    }

    let aWrapper = iconWrapper ?? "btn btn-sm btn-light m-0 p-2 shadow-none"
    return (<>

        {icon
            ? <button type="button"  className={aWrapper} onClick={() => id ? _LOAD_BY_ID() :_OPEN_WINDOW(import.meta.env.VITE_API_URL + apipath + url)}><i className={icon} style={{...iconStyle, color: color }}></i></button>
            : <MDBTooltip title='Visualizar' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1" className="">
                <button type="button" className="btn btn-sm btn-info m-0 p-2 shadow-none" onClick={() => id ? _LOAD_BY_ID() : _OPEN_WINDOW(import.meta.env.VITE_API_URL + apipath + url)}>
                    <Icon name="search" size={16} /></button> </MDBTooltip>
        }


        <Modal contentLabel="PDF_VIEWER"
            isOpen={modal}
            style={customStyles}
            ariaHideApp={false}
        >
            <div className="my-4 d-flex justify-content-end">
                <div className='btn-close' color='none' onClick={() => toggle()}></div>
            </div>
            <hr />
            <PDF_VIEWER
                url={url || localURL} apipath={apipath || localAPI}
            />
            <hr />
            <div className="text-end py-4 mt-3">
                <button className="btn btn-lg btn-danger me-2" onClick={() => _DOWNLOAD()}><Icon name="cloud-download-alt" size={16} /> DESCARGAR </button>
                <button className="btn btn-lg btn-info" onClick={() => toggle()}><Icon name="times-circle" size={16} /> CERRAR </button>
            </div>
        </Modal>
    </>
    );
}

export default VIZUALIZER;