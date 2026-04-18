import { MDBCard, MDBCardBody } from './ui';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/icon';

const BtnAccesibility = ({ theme, font, toggleTheme, changeFontsizePlus, changeFontsizeMinus }) =>  {
    const isLight = theme === 'light';
    const fontSize = font === 3;
    return (
        <div className="btn-accesibility">
            <MDBCard background='light' border='dark'>
                <MDBCardBody className="p-1">
                <button type="button" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }} onClick={toggleTheme}>
                        <span className="fa-stack fa-1x">
                          <Icon name="square" size={16} className="text-info" />
                          <Icon name="adjust" size={16} />
                        </span>
                      </button>
                      <br />
                      <button type="button" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }} onClick={changeFontsizePlus}>
                        <span className="fa-stack fa-1x">
                          <Icon name="square" size={16} className="text-info" />
                          <Icon name="plus" size={16} />
                        </span>
                      </button>
                      <br />
                      <button type="button" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }} onClick={changeFontsizeMinus}>
                        <span className="fa-stack fa-1x">
                          <Icon name="square" size={16} className="text-info" />
                          <Icon name="minus" size={16} />
                        </span>
                      </button>
                      <br />
                      <Link to="/inclusivity">
                        <span className="fa-stack fa-1x">
                          <Icon name="square" size={16} className="text-info" />
                          <Icon name="sign-language" size={16} />
                        </span>
                      </Link>
                </MDBCardBody>
            </MDBCard>
        </div>
    );

  
}

export default BtnAccesibility;