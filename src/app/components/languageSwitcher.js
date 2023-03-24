import React from "react";
import { MDBBtn } from 'mdb-react-ui-kit';
import US_Flag from "../translation/flags/US.png"
import ES_Flag from "../translation/flags/CO.png"

// Translation Services
import { useTranslation } from "react-i18next";
import "../translation/i18n";

function LanguageSwitcher() {
    const { i18n } = useTranslation();

    function handleClick(e) {
        e.preventDefault();
        //console.log(e.target.id);
        var lang = e.target.id;
        i18n.changeLanguage(lang);
    }
    return (
        <div>
            <MDBBtn color='link'  id="es" onClick={handleClick}><img src={ES_Flag} height="30px" id="es" onClick={handleClick}/></MDBBtn>
            <MDBBtn color='link'  id="en" onClick={handleClick}><img src={US_Flag} height="30px" id="en" onClick={handleClick}/></MDBBtn>
        </div>
    );
}
export default LanguageSwitcher;