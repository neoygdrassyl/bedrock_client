import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';

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
                                                    ? <Button size="sm" className="p-1" onClick={() => NAVIGATION_VERSION("minus")}><Icon name="chevron-circle-left" size={16} /></Button>
                                                    : <a className="btn btn-sm btn-light p-1"><Icon name="chevron-circle-left" size={16} /></a>}
                                            </> : ""}

                                        <label className="mx-1 pb-1"> {_RECORD ? "REVISION: ": "VERSION: "} {currentVersion} de {currentItem.version} </label>
                                        {ON
                                            ? <>
                                                {currentVersion >= currentItem.version
                                                    ? <a className="btn btn-sm light-info p-1"><Icon name="chevron-circle-right" size={16} /></a>
                                                    : <Button size="sm" className="p-1" onClick={() => NAVIGATION_VERSION("plus")}><Icon name="chevron-circle-right" size={16} /></Button>}
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