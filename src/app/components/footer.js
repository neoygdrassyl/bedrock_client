import React, { Component } from 'react';
import { infoCud } from './jsons/vars';

class Footer extends Component {
  render() {
    const { translation } = this.props;
    return (
      <div className="Footer mt-5 py-3" style={{ backgroundColor: '#7A7A7A', color: '#e5e5e5'}}>
        <footer class="">
          <div class="container">
            <h2 class="text-uppercase text-center pb-2">  {infoCud.name} DE {infoCud.city.toUpperCase()}</h2>
          </div>

          <div class="text-center">
          Desarrollado por: <a target="_blank" href="//devnatriana.com" className="text-white"> Nestor Triana</a>
          </div>
        </footer>
      </div >
    );
  }
}

export default Footer;