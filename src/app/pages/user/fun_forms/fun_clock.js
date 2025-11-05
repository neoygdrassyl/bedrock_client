import React, { Component } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import FUN_MODULE_NAV from './components/fun_moduleNav';
import FUN_SERVICE from '../../../services/fun.service';
import CLOCKS_CONTROL from './components/clocks_control.component';
import EMAILS_COMPONENT from '../../../components/emails.component';

const MySwal = withReactContent(Swal);

class FUNCLOCK extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentItem: null,
            load: false,
            pqrsxfun: false,
            email_users: false,
        };
    }

    componentDidMount() {
        this.retrieveItem(this.props.currentId);
    }

    retrieveItem = (id) => {
        FUN_SERVICE.get(id)
            .then(response => {
                this.setState({
                    currentItem: response.data,
                    load: true
                });
                this.setEmailUsers(response.data);
                this.retrievePQRSxFUN(response.data.id_public);
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: "ERROR AL CARGAR",
                    text: "No ha sido posible cargar este item, inténtelo nuevamente.",
                    icon: 'error',
                    confirmButtonText: this.props.swaMsg.text_btn,
                });
            });
    }

    retrievePQRSxFUN = (id_public) => {
        FUN_SERVICE.loadPQRSxFUN(id_public)
            .then(response => {
                this.setState({ pqrsxfun: response.data });
            })
            .catch(e => console.log(e));
    }

    requestRefresh = () => {
        this.props.requesRefresh();
    }
    
    requestUpdateItem = () => {
        this.retrieveItem(this.props.currentId);
    }

    setEmailUsers = (_currentItem) => {
        const users = {
            f52_names: null, f52_surnames: null, f52_emails: null,
            f53_name: null, f53_surname: null, f53_email: null,
        };

        const uniqueEmails = new Set();
        const names = [], surnames = [], emails = [];

        _currentItem.fun_52s.forEach(item => {
            if (item.email && !uniqueEmails.has(item.email)) {
                uniqueEmails.add(item.email);
                names.push(item.name);
                surnames.push(item.surname);
                emails.push(item.email);
            }
        });

        users.f52_names = names.join(';');
        users.f52_surnames = surnames.join(';');
        users.f52_emails = emails.join(';');

        if (_currentItem.fun_53s[0] && _currentItem.fun_53s[0].email) {
            users.f53_name = _currentItem.fun_53s[0].name;
            users.f53_surname = _currentItem.fun_53s[0].surname;
            users.f53_email = _currentItem.fun_53s[0].email;
        }

        this.setState({ email_users: users });
    }

    render() {
        const { translation, swaMsg, globals, currentVersion } = this.props;
        const { currentItem, email_users, pqrsxfun } = this.state;

        if (!currentItem) {
            return (
                <fieldset className="p-3 text-center">
                    <h3 className="fw-bold">CARGANDO INFORMACIÓN...</h3>
                </fieldset>
            );
        }

        return (
            <div>
                <div className="bg-info text-white p-2 mb-3 h5 text-center text-uppercase">
                    Control de Tiempos y Fechas
                </div>
                
                <CLOCKS_CONTROL 
                    translation={translation} 
                    swaMsg={swaMsg} 
                    globals={globals}
                    currentItem={currentItem}
                    currentVersion={currentVersion}
                    requestUpdate={this.requestUpdateItem}
                    requestRefresh={this.requestRefresh}
                    secondary // Prop para mostrar eventos secundarios
                />

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
                    pqrsxfun={pqrsxfun}
                />
            </div>
        );
    }
}

export default FUNCLOCK;