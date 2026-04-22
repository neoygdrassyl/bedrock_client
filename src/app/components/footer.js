import { infoCud } from './jsons/vars';

function Footer({ translation }) {
  return (
    <div className="Footer mt-5 py-3 bg-body-tertiary text-body-secondary">
      <footer>
        <div className="container">
          <h2 className="text-uppercase text-center pb-2">{infoCud.name} DE {infoCud.city.toUpperCase()}</h2>
        </div>

        <div className="text-center">
          Desarrollado por: <a target="_blank" rel="noreferrer" href="//devnatriana.com" className="text-body-emphasis">Nestor Triana</a>
        </div>
      </footer>
    </div>
  );
}

export default Footer;