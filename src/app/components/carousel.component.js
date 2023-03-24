import React, { Component } from 'react';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';

// Logos
import LGOG1 from '../img/contacts/amb1.jpg'
import LGOG2 from '../img/contacts/amb2.png'
import LGOG3 from '../img/contacts/asosismica.png'
import LGOG4 from '../img/contacts/bucaramanga.png'
import LGOG5 from '../img/contacts/CAMACOL.jpg'
import LGOG6 from '../img/contacts/cdmb.png'
import LGOG7 from '../img/contacts/colegiocuradores.png'
import LGOG8 from '../img/contacts/Colombia.png'
import LGOG9 from '../img/contacts/COPNIA.png'
import LGOG10 from '../img/contacts/CPNAA.png'
import LGOG11 from '../img/contacts/dane.png'
import LGOG12 from '../img/contacts/essa.png'
import LGOG13 from '../img/contacts/gobienodig.png'
import LGOG14 from '../img/contacts/LOGOSCI.png'
import LGOG15 from '../img/contacts/minvivienda.png'
import LGOG16 from '../img/contacts/pot.png'
import LGOG17 from '../img/contacts/puc.png'
import LGOG18 from '../img/contacts/santander.png'
import LGOG19 from '../img/contacts/SCA.png'
import LGOG20 from '../img/contacts/supernotariado.png'
import LGOG21 from '../img/contacts/vanti.png'
import { Button_navigation } from './button.component';

class CarouselITems extends Component {
  render() {
    const responsive = {
        superLargeDesktop: {
          // the naming can be any, depends on you.
          breakpoint: { max: 4000, min: 3000 },
          items: 16
        },
        desktop: {
          breakpoint: { max: 3000, min: 1024 },
          items: 12
        },
        tablet: {
          breakpoint: { max: 1024, min: 464 },
          items: 6
        },
        mobile: {
          breakpoint: { max: 464, min: 0 },
          items: 3
        }
      };

    let commonStyle = {backgroundColor: 'white'};
    return (
      <div className="Carousel Items">
        <h3 class="text-uppercase text-center m-3 mt-5">Entidades, agremaciones, asociaciones y otros grupos de interes {<Button_navigation Iddown={null} Idup={null} />}</h3>
            <Carousel responsive={responsive} infinite={true} className="my-3">
              <div style={commonStyle}><a class="" href="//www.amb.gov.co" target="_blank"><img src={LGOG1} class="logo-img" alt="..." /></a></div>
              <div style={commonStyle}><a class="" href="//camacol.co" target="_blank"><img src={LGOG5} class="logo-img" alt="..." /></a></div>
              <div style={commonStyle}><a class="" href="http://www.cdmb.gov.co/web/" target="_blank"><img src={LGOG6} class="logo-img" alt="..." /></a></div>
              <div style={commonStyle}><a class="" href="https://www.minvivienda.gov.co/" target="_blank"><img src={LGOG15} class="logo-img" alt="..." /></a></div>
              <div style={commonStyle}><a class="" href="https://gobiernodigital.mintic.gov.co/portal/" target="_blank"><img src={LGOG13} class="logo-img" alt="..." /></a></div>
              <div style={commonStyle}><a class="" href="//puc.com.co" target="_blank"><img src={LGOG17} class="logo-img" alt="..." /></a></div>
              <div style={commonStyle}><a class="" href="//www.supernotariado.gov.co" target="_blank"><img src={LGOG20} class="logo-img" alt="..." /></a></div>
              <div style={commonStyle}><a class="" href="//www.arcgis.com/apps/webappviewer/index.html?id=5c32765bb4d544d1a20182ca13fc16b1" target="_blank"><img src={LGOG16} class="logo-img" alt="..." /></a></div>
              <div style={commonStyle}><a class="" href="//www.asosismica.org.co" target="_blank"><img src={LGOG3} class="logo-img" alt="..." /></a></div>
              <div style={commonStyle}><a class="" href="//www.colombia.co" target="_blank"><img src={LGOG8} class="logo-img" alt="..." /></a></div>
              <div style={commonStyle}><a class="" href="//www.copnia.gov.co" target="_blank"><img src={LGOG9} class="logo-img" alt="..." /></a></div>
              <div style={commonStyle}><a class="" href="//sci.org.co" target="_blank"><img src={LGOG14} class="logo-img" alt="..." /></a></div>
              <div style={commonStyle}><a class="" href="//www.curadoresurbanos.org" target="_blank"><img src={LGOG7} class="logo-img" alt="..." /></a></div>
              <div style={commonStyle}><a class="" href="//www.essa.com.co/site/clientes/" target="_blank"><img src={LGOG12} class="logo-img" alt="..." /></a></div>
              <div style={commonStyle}><a class="" href="//www.amb.com.co:8443/inicio/" target="_blank"><img src={LGOG2} class="logo-img" width="96" height="96" alt="..." /></a></div>
              <div style={commonStyle}><a class="" href="//www.grupovanti.com" target="_blank"><img src={LGOG21} class="logo-img" width="96" height="96" alt="..." /></a></div>           
            </Carousel>
      </div >
    );
  }
}

export default CarouselITems;