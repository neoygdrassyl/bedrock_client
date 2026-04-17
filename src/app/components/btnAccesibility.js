import { MDBCard, MDBCardBody } from './ui';
import { Link } from 'react-router-dom';

const BtnAccesibility = ({ theme, font, toggleTheme, changeFontsizePlus, changeFontsizeMinus }) =>  {
    const isLight = theme === 'light';
    const fontSize = font === 3;
    return (
        <div className="btn-accesibility">
            <MDBCard background='light' border='dark'>
                <MDBCardBody className="p-1">
                <a onClick={toggleTheme}>
                        <span className="fa-stack fa-1x">
                          <i className="fas fa-square fa-stack-2x text-info"></i>
                          <i className="fas fa-adjust fa-stack-1x fa-inverse"></i>
                        </span>
                      </a>
                      <br />
                      <a onClick={changeFontsizePlus}>
                        <span className="fa-stack fa-1x">
                          <i className="fas fa-square fa-stack-2x text-info"></i>
                          <i className="fas fa-plus fa-stack-1x fa-inverse"></i>
                        </span>
                      </a>
                      <br />
                      <a onClick={changeFontsizeMinus}>
                        <span className="fa-stack fa-1x">
                          <i className="fas fa-square fa-stack-2x text-info"></i>
                          <i className="fas fa-minus fa-stack-1x fa-inverse"></i>
                        </span>
                      </a>
                      <br />
                      <Link to="/inclusivity">
                        <span className="fa-stack fa-1x">
                          <i className="fas fa-square fa-stack-2x text-info"></i>
                          <i className="fas fa-sign-language fa-stack-1x fa-inverse"></i>
                        </span>
                      </Link>
                </MDBCardBody>
            </MDBCard>
        </div>
    );

  
}

export default BtnAccesibility;