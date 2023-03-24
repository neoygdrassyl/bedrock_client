import React, { Component } from 'react';
import LanguageSwitcher from './languageSwitcher';
import { infoCud } from './jsons/vars';
import Logo from '../img/logo.png'
import { Input, InputGroup, Whisper, Tooltip, IconButton } from 'rsuite';
import SearchIcon from '@rsuite/icons/Search'
import { Link } from 'react-router-dom';

class Title extends Component {
    constructor(props) {
        super(props);
        this.state = {
          //modal: true
        };
      }
    render() {
        const { translation } = this.props;
        const styles = {
            width: 230,
            marginBottom: 0
        };
        let _CHECK_STATUS = () => {
            let searchValue = this.inputSearch.value;
            this.props.history.push('/search/'+ searchValue );
          }
        return <>

            <div className="Title container-primary">
                <div>
                    <div className='col-lg col-mb-8 justify-content-around d-flex mx-0 px-0 py-2' style={{ backgroundColor: '#3366CC' }}>
                        <div className='text-center'>
                            <label className='text-light fw-bold'>DOVELA</label>
                        </div>
                    </div>
                    <div class="row justify-content-md-center d-flex align-items-center mb-3">
                        <div class="col-lg-1  d-flex justify-content-center">
                            <a href='/home'>
                                <img src={infoCud.icon} height="66px" />
                            </a>
                        </div>
                        <div class="col-lg-4 col-md-2 mb-4 mt-3 mb-md-0">
                            <h3 class="text-uppercase text-center pb-0" >{infoCud.titles} {infoCud.dir}</h3>
                            <h3 class="text-uppercase text-center pb-0" >CURADOR URBANO N°{infoCud.nomens} DE {infoCud.city}</h3>
                        </div>
                        {/*  <div class="col-lg-12 col-md-8 mb-0 mt-0 mb-md-0 d-flex justify-content-center">
                            <span className='col-lg-12 bg-white col-mb-8 text-center  mx-0 px-0 py-2'>
                                <h5 className='text-dark'><b> <a href='https://www.google.es/maps/place/Curaduria+Urbana+No.+1+de+Bucaramanga/@7.1236512,-73.1155874,17z/data=!3m1!4b1!4m5!3m4!1s0x8e683f0ec6e6ea35:0xd99c4a977df44614!8m2!3d7.1236459!4d-73.1133987?hl=es' target="_blank" > <i class="fas fa-map-marker-alt text-success"></i></a> {infoCud.address} - <a href="https://web.whatsapp.com/send?phone=+573162795010" className='text-dark' target="_blank" > <i class="fas fa-mobile-alt text-success"></i> {infoCud.number1}</a> </b></h5>
                            </span>
                        </div>*/}
                    </div>
                </div>
            </div >
        </>;
    }
}

export default Title;
