

function FUN_VERSION_NAV({ translation, currentItem, currentVersion, ON, _RECORD, NAVIGATION_VERSION }) {
        return (<>
            {currentItem
                ? <> {currentItem.version > 1
                    ? <div className="btn-nav_version">
                        <div className="fun_nav">
                            <div className="rounded-lg border bg-card p-4 container-primary">
                                <div>
                                    <div className="m-1 text-center">
                                        {ON
                                            ? <>
                                                {currentVersion > 1
                                                    ? <button type="button" className="btn btn-sm btn-info p-1" onClick={() => NAVIGATION_VERSION("minus")}><i className="fas fa-chevron-circle-left fa-2x"></i></button>
                                                    : <a className="btn btn-sm btn-light p-1"><i className="fas fa-chevron-circle-left fa-2x"></i></a>}
                                            </> : ""}

                                        <label className="mx-1 pb-1"> {_RECORD ? "REVISION: ": "VERSION: "} {currentVersion} de {currentItem.version} </label>
                                        {ON
                                            ? <>
                                                {currentVersion >= currentItem.version
                                                    ? <a className="btn btn-sm light-info p-1"><i className="fas fa-chevron-circle-right fa-2x"></i></a>
                                                    : <button type="button" className="btn btn-sm btn-info p-1" onClick={() => NAVIGATION_VERSION("plus")}><i className="fas fa-chevron-circle-right fa-2x"></i></button>}
                                            </> : ""}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    : ""}
                </> : ""} </>
        );
}

export default FUN_VERSION_NAV;