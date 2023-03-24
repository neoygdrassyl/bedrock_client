import React, { Component } from 'react';
import { MDBTooltip } from 'mdb-react-ui-kit';
import Modal from 'react-modal';
import PDF_VIEWER from './pdfViewer.component';
import FUNService from '../services/fun.service'

class VIZUALIZER extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            localURL: '',
            localAPI: false,
        };
    }
    toggle = () => {
        this.setState({
            modal: !this.state.modal
        });
    }
    getToggle = () => {
        return this.state.modal;
    }
    render() {
        const { url, id, apipath, icon, color, iconWrapper, iconStyle } = this.props;
        const { localURL, localAPI} = this.state;

        const customStyles = {
            overlay: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.75)',
                zIndex: 2
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
                this.setState({ modal: true })
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
            window.open(process.env.REACT_APP_API_URL + apipath + url, '_blank');
        }
        let _LOAD_BY_ID = () => {
            FUNService.getFun6(id)
            .then(response => {
                this.setState({localURL: response.data.path + '/'+response.data.filename})
                _OPEN_WINDOW(process.env.REACT_APP_API_URL + apipath + response.data.path + '/'+response.data.filename)
            })
            .catch(e => {
                console.log(e);
            });
        }

        let aWrapper = iconWrapper ?? "btn btn-sm btn-light m-0 p-2 shadow-none"
        return (<>

            {icon
                ? <a  className={aWrapper} onClick={() => id ? _LOAD_BY_ID() :_OPEN_WINDOW(process.env.REACT_APP_API_URL + apipath + url)}><i class={icon} style={{...iconStyle, color: color }}></i></a>
                : <MDBTooltip title='Visualizar' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1" className="">
                    <a className="btn btn-sm btn-info m-0 p-2 shadow-none" onClick={() => id ? _LOAD_BY_ID() : _OPEN_WINDOW(process.env.REACT_APP_API_URL + apipath + url)}>
                        <i class="fas fa-search"></i></a> </MDBTooltip>
            }


            <Modal contentLabel="PDF_VIEWER"
                isOpen={this.state.modal}
                style={customStyles}
                ariaHideApp={false}
            >
                <div className="my-4 d-flex justify-content-end">
                    <div className='btn-close' color='none' onClick={() => this.toggle()}></div>
                </div>
                <hr />
                <PDF_VIEWER
                    url={url || localURL} apipath={apipath || localAPI}
                />
                <hr />
                <div className="text-end py-4 mt-3">
                    <button className="btn btn-lg btn-danger me-2" onClick={() => _DOWNLOAD()}><i class="fas fa-cloud-download-alt"></i> DESCARGAR </button>
                    <button className="btn btn-lg btn-info" onClick={() => this.toggle()}><i class="fas fa-times-circle"></i> CERRAR </button>
                </div>
            </Modal>
        </>
        );
    }
}

export default VIZUALIZER;