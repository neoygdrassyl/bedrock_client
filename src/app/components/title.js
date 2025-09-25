import React, { Component } from 'react';
import { infoCud } from './jsons/vars';

class Title extends Component {
  render() {
    return (
      <>
        <div className="Title">
          <div>
            <div className="row align-items-center flex-nowrap g-2" style={{ overflowX: 'auto' }}>
              <div className="col-auto d-flex justify-content-center flex-shrink-0">
                <a href="/home" className="d-inline-block">
                  <img
                    src={infoCud.icon}
                    alt="Curaduria Urbana N°1 Logo"
                    style={{ height: 32, display: 'block', objectFit: 'contain' }}
                  />
                </a>
              </div>

              <div className="col min-w-0" style={{ minWidth: 0 }}>
                <div
                  className="text-uppercase text-truncate"
                  style={{
                    // antes: clamp(0.82rem, 1.6vw, 0.9rem)
                    fontSize: 'clamp(0.74rem, 1.35vw, 0.82rem)',
                    lineHeight: 1.15,
                    fontWeight: 600,
                  }}
                  title={`${infoCud.titles} ${infoCud.dir}`}
                >
                  {infoCud.titles} {infoCud.dir}
                </div>
                <div
                  className="text-truncate"
                  style={{
                    // antes: clamp(0.76rem, 1.4vw, 0.84rem)
                    fontSize: 'clamp(0.68rem, 1.2vw, 0.76rem)',
                    lineHeight: 1.15,
                    fontWeight: 400,
                  }}
                  title={`Curador Urbano N°${infoCud.nomens} de ${infoCud.city}`}
                >
                  Curador Urbano N°{infoCud.nomens} de {infoCud.city}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default Title;
