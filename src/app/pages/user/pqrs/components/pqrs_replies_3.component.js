import { dateParser, dateParser_finalDate, dateParser_dateDiff } from '../../../../components/customClasses/typeParse'

function PQRS_COMPONENT_REPLIES_PROFESIONAL_2({ translation, swaMsg, globals, currentItem }) {

        let _REPLIES_COMPONENT = () => {
            var _COMPONENT = [];
            for (var i = 0; i < currentItem.pqrs_workers.length; i++) {
                _COMPONENT.push(<>
                    <div className="row m-2">
                        <div className="col-6">
                            <div className="row">
                                <div className="col-6">
                                    <lavel>Profesional</lavel>
                                </div>
                                <div className="col-6">
                                    <lavel className="fw-bold">{currentItem.pqrs_workers[i].name}</lavel>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-6">
                                    <lavel>Competencia</lavel>
                                </div>
                                <div className="col-6">
                                    <label className="fw-bold">{currentItem.pqrs_workers[i].competence}</label>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-6">
                                    <lavel>Fecha de Asignación</lavel>
                                </div>
                                <div className="col-6">
                                    <label className="fw-bold">{dateParser(currentItem.pqrs_workers[i].asign)}</label>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-6">
                                    <lavel>Fecha Respuesta Real</lavel>
                                </div>
                                <div className="col-6">
                                    <label className="fw-bold">{dateParser(currentItem.pqrs_workers[i].date_reply)}</label>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-6">
                                    <lavel>Tiempo de Respuesta</lavel>
                                </div>
                                <div className="col-6">
                                    <label className="fw-bold">{dateParser_dateDiff(currentItem.pqrs_workers[i].asign, currentItem.pqrs_workers[i].date_reply, true) + " dia(s) habiles"}</label>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-6">
                                    <lavel>Fecha Respuesta Esperada</lavel>
                                </div>
                                <div className="col-6">
                                    <label className="fw-bold">{dateParser(dateParser_finalDate(currentItem.pqrs_time.legal, currentItem.pqrs_time.time / 2))}</label>
                                </div>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="row">
                                <label className="fw-bold">Respuesta</label>
                            </div>
                            <div className="row">
                                <label className="">
                                    {currentItem.pqrs_workers[i].reply
                                        ? <>{currentItem.pqrs_workers[i].reply}</>
                                        : <label className="fw-bold text-danger">EL PROFESIONAL NO HA DADO RESPUESTA</label>}
                                </label>
                            </div>
                        </div>
                    </div>
                </>)
            }
            return <>{_COMPONENT}</>;
        }
    return (
        <div>
            {_REPLIES_COMPONENT()}
        </div>
    );
}

export default PQRS_COMPONENT_REPLIES_PROFESIONAL_2;