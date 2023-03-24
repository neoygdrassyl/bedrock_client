import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import Modal from 'react-modal';
import { MDBBtn, MDBTooltip } from 'mdb-react-ui-kit';
import PQRS_Service from '../../../../services/pqrs_main.service';


const MySwal = withReactContent(Swal);
class PQRS_ACTION_REVIEW extends Component {
    constructor(props) {
        super(props);
        this.state = {
            review_modal: false,
            actionItem: null,
        };
    }
    componentDidMount() {

    }
    toggle = (item) => {
        this.setState({
            review_modal: !this.state.review_modal,
        });
        if(item){
            this.setState({
                actionItem: item,
                actionId_public: item.id_publico
            }); 
        }
    }
    getToggle = () => {
        return this.state.review_modal;
    }
    render() {
        const { translation, swaMsg, globals, currentItem } = this.props;
        const { } = this.state;

        // DATA GETTER

        // CUSTOM STYLES FOR THE MODAL
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
                top: '100px',
                left: '30%',
                right: '30%',
                bottom: '100px',
                border: '1px solid #ccc',
                overflow: 'auto',
                WebkitOverflowScrolling: 'touch',
                borderRadius: '4px',
                outline: 'none',
                padding: '20px',

            }
        };
        //DATA CONVERTERS

        // FUNCTIONS & APIS
        var formData = new FormData();

        let actioReview = (e) => {
            e.preventDefault();
            formData = new FormData();
            let action_review = document.getElementById("pqrs_action_review").value;
            formData.set('action_review', action_review);
            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            PQRS_Service.update(currentItem.id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        this.props.refreshList();
                        this.toggle(false);
                    }
                    else {
                        MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                })
                .catch(e => {
                    console.log(e);
                    MySwal.fire({
                        title: swaMsg.generic_eror_title,
                        text: swaMsg.generic_error_text,
                        icon: 'warning',
                        confirmButtonText: swaMsg.text_btn,
                    });
                });
        }

        return (
            <div className="">
                <MDBTooltip title='Accion de Mejora' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1" className="">
                    <button className="btn btn-sm btn-warning m-0 px-2 shadow-none"
                        onClick={() => this.toggle(currentItem)}>
                        <i class="fas fa-clipboard-check"></i></button></MDBTooltip>

                <Modal contentLabel="REVIEW ACTION"
                    isOpen={this.state.review_modal}
                    style={customStyles}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <label><i class="fas fa-th"></i> Accion de mejora {this.state.actionId_public}</label>
                        <MDBBtn className='btn-close' color='none' onClick={() => this.setState({ review_modal: !this.state.review_modal })}></MDBBtn>
                    </div>
                    <hr />
                    <form id="form_pqrs_action_review" onSubmit={actioReview} >
                        <div className="row">
                            <div className="col-12">
                                <label>Accion de Mejora (Máximo 2000 Caracteres)</label>
                                <textarea class="form-control mb-3" rows="3" maxlength="2000" id="pqrs_action_review"
                                defaultValue={currentItem.action_review}></textarea>
                            </div>
                        </div>
                        <div className="text-center">
                            <button className="btn btn-success my-3">
                                <i class="far fa-share-square"></i> GUARDAR INFORMACIÓN
                            </button>
                        </div>
                    </form>

                    <div className="text-end py-4 mt-3">
                        <button className="btn btn-lg btn-info" onClick={() => this.setState({ review_modal: !this.state.review_modal })}>
                            <i class="fas fa-times-circle"></i> CERRAR </button>
                    </div>
                </Modal>
            </div>
        );
    }
}

export default PQRS_ACTION_REVIEW;