import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';

function PQRS_MODULE_NAV({ translation, currentItem, FROM, NAVIGATION }) {
    const isAdmin = window.user.name_short === "Luis Parra"

        let _GET_WORKER_VAR = (worker_id) => {
            let _WORKERS = currentItem.pqrs_workers;
            for (let i = 0; i < _WORKERS.length; i++) {
                if ((_WORKERS[i].worker_id === worker_id) || window.user.roleId === 1) {
                    return {
                        id: _WORKERS[i].id,
                        id_master: currentItem.id,
                        id_public: currentItem.id_publico,
                    }
                }
            }
            return false
        }

        let _GET_LOCK_FOR_WORKER = () => {
            if (window.user.roleId === 1 || window.user.roleId === 5 || window.user.roleId === 3 || window.user.roleId === 2) return true;
            for (let i = 0; i < currentItem.pqrs_workers.length; i++) {
                if (currentItem.pqrs_workers[i].worker_id === window.user.id) return true
            }
            return false
        }

        let _GET_WORKERS_REPLY = () => {
            const _COMPONENT = [];
            let _WORKERS = currentItem.pqrs_workers;
            for (let i = 0; i < _WORKERS.length; i++) {
                if ((_WORKERS[i].worker_id === window.user.id && !_WORKERS[i].date_reply) || window.user.roleId === 1) {
                    _COMPONENT.push(<div key={_WORKERS[i].id ?? _WORKERS[i].worker_id ?? `nav-worker-${i}`}>
                        {FROM === "informal"
                            ? <div>
                                <Button variant="ghost" size="sm" className="h-9">
                                    <Icon name="comment-dots" size={16} /> <span className="fs-6 align-top">RTA. {_WORKERS[i].name}</span></Button>
                            </div>
                            : <div>
                                <Button variant="outline" size="sm" className="h-9" onClick={() => NAVIGATION(_GET_WORKER_VAR(window.user.id), "informal", FROM)}>
                                    <Icon name="comment-dots" size={16} /> <span className="fs-6 align-top">RTA. {_WORKERS[i].name}</span></Button>
                            </div>}
                    </div>)
                }
            }

            return <>{_COMPONENT}</>

        }

        return (<>
            {currentItem
                ? <div className="btn-nav_module-pqr sticky top-0 z-20">
                    <div className="rounded-lg border border-border/70 bg-card/80 p-3">
                        <div className="flex flex-wrap items-center justify-start gap-2">

                                    <div>
                                        <Button variant="outline" size="sm" className="h-9 justify-start" onClick={() => NAVIGATION(currentItem, "close", FROM)}>
                                            <Icon name="times-circle" size={14} /> <span className="fs-6 align-top">CERRAR</span>
                                        </Button>
                                    </div>

                                    {FROM === "general"
                                        ?
                                        <div>
                                            <Button variant="ghost" size="sm" className="h-9">
                                                <Icon name="eye" size={14} /> <span className="fs-6 align-top">DETALLES</span></Button>
                                        </div>
                                        : <div>
                                            <Button size="sm" className="h-9 justify-start" onClick={() => NAVIGATION(currentItem, "general", FROM)}>
                                                <Icon name="eye" size={14} /> <span className="fs-6 align-top">DETALLES</span></Button>
                                        </div>}

                                    {currentItem.status === 1
                                        ? <>
                                            {FROM === "editable"
                                                ?
                                                <div>
                                                    <Button variant="ghost" size="sm" className="h-9">
                                                        <Icon name="edit" size={14} /> <span className="fs-6 align-top">EDITAR</span></Button>
                                                </div>
                                                : <div>
                                                    <Button variant="outline" size="sm" className="h-9" onClick={() => NAVIGATION(currentItem, "editable", FROM)}>
                                                        <Icon name="edit" size={14} /> <span className="fs-6 align-top">EDITAR</span></Button>
                                                </div>} </> : ""
                                    }
                                    {currentItem.status === 0
                                        ? <>
                                            {window.user.roleId === 5 || window.user.roleId === 1  || isAdmin || window.user.roleId === 2
                                                ? <>
                                                    {FROM === "manage"
                                                        ? <div>
                                                            <Button variant="ghost" size="sm" className="h-9">
                                                                <Icon name="cog" size={14} /> <span className="fs-6 align-top">GESTIONAR</span></Button>
                                                        </div>
                                                        : <div>
                                                            <Button size="sm" className="h-9" onClick={() => NAVIGATION(currentItem, "manage", FROM)}>
                                                                <Icon name="cog" size={14} /> <span className="fs-6 align-top">GESTIONAR</span></Button>
                                                        </div>}
                                                </> : ""}
                                        </>
                                        : ""}

                    </div>
                </div>
                </div>
                : ""} </>
    );
}

export default PQRS_MODULE_NAV;
