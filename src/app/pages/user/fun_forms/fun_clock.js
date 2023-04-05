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
import EMAILS_COMPONENT from '../../../components/emails.component';

var momentB = require('moment-business-days');
const MySwal = withReactContent(Swal);

class FUNCLOCK extends Component {
    constructor(props) {
        super(props);
        this.retrieveItem = this.retrieveItem.bind(this);
        this.requestRefresh = this.requestRefresh.bind(this);
        this.setEmailUsers = this.setEmailUsers.bind(this);
        this.state = {
            calendar_Data: [],
            pqrsxfun: false,
            email_users: false,
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
                this.setEmailUsers(response.data)
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
    setEmailUsers(_currentItem){
        let users = {
            f52_names: null, f52_surnames: null, f52_emails: null,
            f53_name: null, f53_surname: null, f53_email: null,
        };

        let fn = []
        let fs = []
        let fe = []

        _currentItem.fun_52s.map(item => {
            if(!fe.includes(item.email)){
                fn.push(item.name)
                fs.push(item.surname)
                fe.push(item.email)
            }
        })

        users.f52_names = fn.join(';');
        users.f52_surnames = fs.join(';');
        users.f52_emails = fe.join(';');

        if(_currentItem.fun_53s[0] && _currentItem.fun_53s[0].email){
            users.f53_name =_currentItem.fun_53s[0].name;
            users.f53_surname = _currentItem.fun_53s[0].surname;
            users.f53_email = _currentItem.fun_53s[0].email;
        }

        this.setState({email_users: users})
       
    }
    render() {
        const { translation, swaMsg, globals, currentVersion } = this.props;
        const { currentItem, calendar_Data, email_users } = this.state;
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

                    <EMAILS_COMPONENT  
                    translation={translation} 
                    swaMsg={swaMsg}
                    id_public={currentItem.id_public} 
                    process="lic" 
                    users={email_users}
                    />

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