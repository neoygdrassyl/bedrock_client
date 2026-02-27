import { MDBCard, MDBCardBody } from '../../../../components/ui';

function FUN_VERSION_NAV({ translation, currentItem, currentVersion, ON, _RECORD, NAVIGATION_VERSION }) {
        return (<>
            {currentItem
                ? <> {currentItem.version > 1
                    ? <div className="btn-nav_version">
                        <div className="fun_nav">
                            <MDBCard className="container-primary" border='dark' >
                                <MDBCardBody className="p-1">
                                    <div className="m-1 text-center">
                                        {ON
                                            ? <>
                                                {currentVersion > 1
                                                    ? <a className="btn btn-sm btn-info p-1" onClick={() => NAVIGATION_VERSION("minus")}><i class="fas fa-chevron-circle-left fa-2x"></i></a>
                                                    : <a className="btn btn-sm btn-light p-1"><i class="fas fa-chevron-circle-left fa-2x"></i></a>}
                                            </> : ""}

                                        <label className="mx-1 pb-1"> {_RECORD ? "REVISION: ": "VERSION: "} {currentVersion} de {currentItem.version} </label>
                                        {ON
                                            ? <>
                                                {currentVersion >= currentItem.version
                                                    ? <a className="btn btn-sm light-info p-1"><i class="fas fa-chevron-circle-right fa-2x"></i></a>
                                                    : <a className="btn btn-sm btn-info p-1" onClick={() => NAVIGATION_VERSION("plus")}><i class="fas fa-chevron-circle-right fa-2x"></i></a>}
                                            </> : ""}
                                    </div>
                                </MDBCardBody>
                            </MDBCard>
                        </div>
                    </div>
                    : ""}
                </> : ""} </>
        );
}

export default FUN_VERSION_NAV;