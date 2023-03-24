import React, { Component } from 'react';

class PQRS_COMPONENT_ATTACH_PROFESIONAL extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { translation, swaMsg, globals, currentItem } = this.props;
        const { } = this.state;

        // COMPONENTS JSX
        let _ATTACHS_COMPONENT_OUTPUT = () => {
            var _COMPONENT = [];
            _COMPONENT.push(<>
            <div className='justify-content-center'>
                <div className="row mx-1 py-1 border">
                    <div className="col-5">
                        <label className="fw-bold">Nombre</label>
                    </div>
                    <div className="col-5">
                        <label className="fw-bold">Tipo</label>
                    </div>
                    <div className="col-2">
                        <label className="fw-bold">Acción</label>
                    </div>
                </div>
                </div>
            </>)
            for (var i = 0; i < currentItem.pqrs_attaches.length; i++) {
                if (currentItem.pqrs_attaches[i].class == 1) {
                    _COMPONENT.push(
                    <div className='justify-content-center'>
                    <div className="row mx-1  py-1 border">
                        <div className="col-5">
                            <label >{currentItem.pqrs_attaches[i].public_name}</label>
                        </div>
                        <div className="col-5">
                            <label >{currentItem.pqrs_attaches[i].type}</label>
                        </div>
                        <div className="col-2">
                            <label >
                                <a className="btn btn-sm btn-danger" target="_blank" href={process.env.REACT_APP_API_URL + '/files/pqrs/' + currentItem.pqrs_attaches[i].name}>
                                    <i class="fas fa-cloud-download-alt"></i></a></label>
                        </div>
                    </div></div>)
                }
            }
            return <>{_COMPONENT}</>;
        }

        return (
            <div>

                {_ATTACHS_COMPONENT_OUTPUT()}

            </div>
        );
    }
}

export default PQRS_COMPONENT_ATTACH_PROFESIONAL;