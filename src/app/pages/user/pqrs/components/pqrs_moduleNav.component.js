import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';

function PQRS_MODULE_NAV({ translation, currentItem, FROM, NAVIGATION }) {
    const isAdmin = window.user.name_short === "Luis Parra"

        let _GET_WORKER_VAR = (worker_id) => {
            let _WORKERS = currentItem.pqrs_workers;
            for (var i = 0; i < _WORKERS.length; i++) {
                if ((_WORKERS[i].worker_id == worker_id) || window.user.roleId == 1) {
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
            if (window.user.roleId == 1 || window.user.roleId == 5 || window.user.roleId == 3 || window.user.roleId == 2) return true;
            for (var i = 0; i < currentItem.pqrs_workers.length; i++) {
                if (currentItem.pqrs_workers[i].worker_id == window.user.id) return true
            }
            return false
        }

        let _GET_WORKERS_REPLY = () => {
            var _COMPONENT = [];
            let _WORKERS = currentItem.pqrs_workers;
            for (var i = 0; i < _WORKERS.length; i++) {
                if ((_WORKERS[i].worker_id == window.user.id && !_WORKERS[i].date_reply) || window.user.roleId == 1) {
                    _COMPONENT.push(<>
                        {FROM == "informal"
                            ? <div className="row mx-2 mb-1">
                                <Button variant="ghost" size="sm" className="m-0 p-2">
                                    <Icon name="comment-dots" size={16} /> <label className="fs-6 align-top">RTA. {_WORKERS[i].name}</label></Button>
                            </div>
                            : <div className="row mx-2 mb-1">
                                <Button variant="outline" size="sm" className="m-0 p-2" onClick={() => NAVIGATION(_GET_WORKER_VAR(window.user.id), "informal", FROM)}>
                                    <Icon name="comment-dots" size={16} /> <label className="fs-6 align-top">RTA. {_WORKERS[i].name}</label></Button>
                            </div>}
                    </>)
                }
            }

            return <>{_COMPONENT}</>

        }

        return (<>
            {currentItem
                ? <div className="btn-nav_module-pqr">
                    <div className="">
                        <div className="rounded-lg border bg-card p-4 container-primary m-1">
                            <div>
                                <div className="m-1 text-center">

                                    <div className="row mx-2 mb-1">
                                        <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => NAVIGATION(currentItem, "close", FROM)}>
                                            <Icon name="times-circle" size={16} /> <label className="fs-6 align-top">CERRAR</label>
                                        </Button>
                                    </div>

                                    {FROM == "general"
                                        ?
                                        <div className="row mx-2 mb-1">
                                            <Button variant="ghost" size="sm" className="m-0 p-2">
                                                <Icon name="eye" size={16} /> <label className="fs-6 align-top">DETALLES</label></Button>
                                        </div>
                                        : <div className="row mx-2 mb-1">
                                            <Button size="sm" className="w-full justify-start" onClick={() => NAVIGATION(currentItem, "general", FROM)}>
                                                <Icon name="eye" size={16} /> <label className="fs-6 align-top">DETALLES</label></Button>
                                        </div>}

                                    {currentItem.status == 1
                                        ? <>
                                            {FROM == "editable"
                                                ?
                                                <div className="row mx-2 mb-1">
                                                    <Button variant="ghost" size="sm" className="m-0 p-2">
                                                        <Icon name="edit" size={16} /> <label className="fs-6 align-top">EDITAR</label></Button>
                                                </div>
                                                : <div className="row mx-2 mb-1">
                                                    <Button variant="outline" size="sm" className="m-0 p-2" onClick={() => NAVIGATION(currentItem, "editable", FROM)}>
                                                        <Icon name="edit" size={16} /> <label className="fs-6 align-top">EDITAR</label></Button>
                                                </div>} </> : ""
                                    }
                                    {currentItem.status == 0
                                        ? <>
                                            {window.user.roleId == 5 || window.user.roleId == 1  || isAdmin || window.user.roleId == 2
                                                ? <>
                                                    {FROM == "manage"
                                                        ? <div className="row mx-2 mb-1">
                                                            <Button variant="ghost" size="sm" className="m-0 p-2">
                                                                <Icon name="cog" size={16} /> <label className="fs-6 align-top">GESTIONAR</label></Button>
                                                        </div>
                                                        : <div className="row mx-2 mb-1">
                                                            <Button size="sm" className="m-0 p-2" onClick={() => NAVIGATION(currentItem, "manage", FROM)}>
                                                                <Icon name="cog" size={16} /> <label className="fs-6 align-top">GESTIONAR</label></Button>
                                                        </div>}
                                                </> : ""}
                                        </>
                                        : ""}

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                : ""} </>
    );
}

export default PQRS_MODULE_NAV;