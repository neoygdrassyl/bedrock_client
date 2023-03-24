import React from 'react';
import { MDBCard, MDBCardBody } from 'mdb-react-ui-kit';
import { func, string, int } from 'prop-types';
import { Link } from 'react-router-dom';

const BtnAccesibility = ({ theme, font, toggleTheme, changeFontsizePlus, changeFontsizeMinus }) =>  {
    const isLight = theme === 'light';
    const fontSize = font === 3;
    return (
        <div className="btn-accesibility">
            <MDBCard background='light' border='dark'>
                <MDBCardBody className="p-1">
                <a onClick={toggleTheme}>
                        <span class="fa-stack fa-1x">
                          <i class="fas fa-square fa-stack-2x text-info"></i>
                          <i class="fas fa-adjust fa-stack-1x fa-inverse"></i>
                        </span>
                      </a>
                      <br />
                      <a onClick={changeFontsizePlus}>
                        <span class="fa-stack fa-1x">
                          <i class="fas fa-square fa-stack-2x text-info"></i>
                          <i class="fas fa-plus fa-stack-1x fa-inverse"></i>
                        </span>
                      </a>
                      <br />
                      <a onClick={changeFontsizeMinus}>
                        <span class="fa-stack fa-1x">
                          <i class="fas fa-square fa-stack-2x text-info"></i>
                          <i class="fas fa-minus fa-stack-1x fa-inverse"></i>
                        </span>
                      </a>
                      <br />
                      <Link to="/inclusivity">
                        <span class="fa-stack fa-1x">
                          <i class="fas fa-square fa-stack-2x text-info"></i>
                          <i class="fas fa-sign-language fa-stack-1x fa-inverse"></i>
                        </span>
                      </Link>
                </MDBCardBody>
            </MDBCard>
        </div>
    );

  
}

export default BtnAccesibility;