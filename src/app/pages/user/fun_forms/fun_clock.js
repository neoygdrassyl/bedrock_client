import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import FUN_MODULE_NAV from './components/fun_moduleNav';
import FUN_SERVICE from '../../../services/fun.service';
import FUN_CLOCKS_NEGATIVE from './components/fun_clocks_negative.component';
import FUN_CLOCK_CHART from './components/func_clock_chart';
import CLOCKS_CONTROL from './components/clocks_control.component';
import FUN_CLOCK_EVENTS from './components/fun_clocks_events.component';
import { dateParser_timePassed } from '../../../components/customClasses/typeParse';

var momentB = require('moment-business-days');
const MySwal = withReactContent(Swal);

class FUNCLOCK extends Component {
    constructor(props) {
        super(props);
        this.retrieveItem = this.retrieveItem.bind(this);
        this.requestRefresh = this.requestRefresh.bind(this);
        this.state = {
            calendar_Data: [],
            pqrsxfun: false,
        };
    }
    componentDidMount() {
        this.retrieveItem(this.props.currentId);
    }
    retrieveItem(id) {
        FUN_SERVICE.get(id)
            .then(response => {
                this.setState({
                    currentItem: response.data,
                    load: true
                })
                this.retrievePQRSxFUN(response.data.id_public);
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: "ERROR AL CARGAR",
                    text: "No ha sido posible cargar este item, intentelo nuevamente.",
                    icon: 'error',
                    confirmButtonText: this.props.swaMsg.text_btn,
                });
            });
    }
    retrievePQRSxFUN(id_public) {
        FUN_SERVICE.loadPQRSxFUN(id_public)
            .then(response => {
                this.setState({
                    pqrsxfun: response.data,
                })
            })
            .catch(e => {
                console.log(e);
            });
    }
    requestRefresh() {
        this.props.requesRefresh();
    }
    render() {
        const { translation, swaMsg, globals, currentVersion } = this.props;
        const { currentItem, calendar_Data } = this.state;
        return (
            <div>
                {currentItem != null ? <>
                    <legend className="my-2 px-3 text-uppercase Collapsible" id="fung_c">
                        <label className="app-p lead text-center fw-normal text-uppercase">Anuncios de profesionales</label>
                    </legend>
                    <FUN_CLOCK_EVENTS
                        translation={translation} swaMsg={swaMsg}
                        currentItem={currentItem}
                        currentVersion={currentVersion}
                        requestUpdate={this.retrieveItem}
                    />


                    <legend className="my-2 px-3 text-uppercase Collapsible" id="fung_c">
                        <label className="app-p lead text-center fw-normal text-uppercase">Control de tiempos y fechas de la solicitud</label>
                    </legend>
                    <CLOCKS_CONTROL translation={translation} swaMsg={swaMsg} globals={globals}
                        currentItem={currentItem}
                        currentVersion={currentVersion}
                        secondary
                    />

                    <FUN_CLOCK_CHART
                        translation={translation}
                        currentItem={currentItem}
                        currentVersion={currentVersion}
                    />

                    <legend className="my-3 px-3 text-uppercase bg-danger" id="fung_c">
                        <label className="app-p lead text-center fw-normal text-uppercase text-light">CONTROL DE PROCESOS DE DESISTIMIENTOS</label>
                    </legend>
                    <fieldset className="p-3">
                        <FUN_CLOCKS_NEGATIVE
                            translation={translation} swaMsg={swaMsg}
                            currentItem={currentItem}
                            currentVersion={currentVersion}
                            requestUpdate={this.retrieveItem}
                            requestRefresh={this.requestRefresh}
                        />
                    </fieldset>

                    <FUN_MODULE_NAV
                        translation={translation}
                        currentItem={currentItem}
                        currentVersion={currentVersion}
                        FROM={"clock"}
                        NAVIGATION={this.props.NAVIGATION}
                        pqrsxfun={this.state.pqrsxfun}
                    />
                </> : <fieldset className="p-3" id="fung_0">
                    <div className="text-center"> <h3 className="fw-bold ">CARGANDO INFORMACION...</h3></div>
                </fieldset>}
            </div>
        );
    }
}

export default FUNCLOCK;