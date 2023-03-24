import React, { useState } from 'react';
import { Navbar, Nav } from 'rsuite';
import "rsuite/dist/rsuite.min.css";
import {
  Link,
} from "react-router-dom";

// Translations Services
import { useTranslation } from "react-i18next";
import "../translation/i18n";
import * as ReactDOM from 'react-dom';

// Ttransparency
//import TransparencyDD from './transparencyDD'

export default function Navbar1(props) {
  const { authBtn } = props
  const [showNav, setShowNav] = useState(false);
  const { t } = useTranslation();

  const MyLink = React.forwardRef((props, ref) => {
    const { href, as, ...rest } = props;
    return (
      <Link style={{ color: '#575757', textDecoration: 'none' }} to={href} as={as}>
        <a {...rest} />
      </Link>
    );
  });
  const NavBarInstance = ({ onSelect, activeKey, ...props }) => {
    return (
      <Navbar {...props} >
        <Navbar.Brand href="#"></Navbar.Brand>
        <Nav activeKey={activeKey} >
          <Nav.Item eventKey="1" as={MyLink} href="/home"> <i class="fas fa-home px-1"></i> Inicio</Nav.Item>
        </Nav>
        {authBtn}
      </Navbar>
    );
  };

  const Demo = () => {
    const [activeKey, setActiveKey] = useState(false);
    return (
      <div className="nav-wrapper">
        <hr />
        <NavBarInstance activeKey={activeKey} onSelect={setActiveKey} />
      </div>
    );
  };

  return <>
    {Demo()}
  </>

}
