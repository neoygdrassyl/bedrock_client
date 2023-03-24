import React, { Component } from 'react';
import { regexChecker_isPh, regexChecker_movTierra } from '../../../../components/customClasses/typeParse';
//import VIZUALIZER from '../../../../components/vizualizer.component';

class FUN_G_REPORTS extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion, nomenclature, noLaw, noArc, noEng, id } = this.props;
        const { } = this.state;
        const empty_model = { version: '', worker_name: '', worker_id: '', date_asign: '', worker_prev: '' }
        const reviewStr = ['NO CUMPLE', 'CUMPLE', 'NO APLICA']
        // DATA GETTERS
        let _GET_CHILD_1 = () => {
            var _CHILD = currentItem.fun_1s;
            var _CURRENT_VERSION = currentVersion - 1;
            var _CHILD_VARS = {
                item_0: "",
                item_1: "",
                item_2: "",
                item_3: "",
                item_4: "",
                item_5: "",
                item_6: "",
                item_7: "",
                item_8: "",
                item_9: "",
                item_101: "",
                item_102: "",
            }
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD_VARS.item_0 = _CHILD[_CURRENT_VERSION].id;
                    _CHILD_VARS.item_1 = _CHILD[_CURRENT_VERSION].tipo ? _CHILD[_CURRENT_VERSION].tipo : "";
                    _CHILD_VARS.item_2 = _CHILD[_CURRENT_VERSION].tramite ? _CHILD[_CURRENT_VERSION].tramite : "";
                    _CHILD_VARS.item_3 = _CHILD[_CURRENT_VERSION].m_urb ? _CHILD[_CURRENT_VERSION].m_urb : "";
                    _CHILD_VARS.item_4 = _CHILD[_CURRENT_VERSION].m_sub ? _CHILD[_CURRENT_VERSION].m_sub : "";
                    _CHILD_VARS.item_5 = _CHILD[_CURRENT_VERSION].m_lic ? _CHILD[_CURRENT_VERSION].m_lic : "";
                    _CHILD_VARS.item_6 = _CHILD[_CURRENT_VERSION].usos ? _CHILD[_CURRENT_VERSION].usos : "";
                    _CHILD_VARS.item_7 = _CHILD[_CURRENT_VERSION].area ? _CHILD[_CURRENT_VERSION].area : "";
                    _CHILD_VARS.item_8 = _CHILD[_CURRENT_VERSION].vivienda ? _CHILD[_CURRENT_VERSION].vivienda : "";
                    _CHILD_VARS.item_9 = _CHILD[_CURRENT_VERSION].cultural ? _CHILD[_CURRENT_VERSION].cultural : "";
                    _CHILD_VARS.item_101 = _CHILD[_CURRENT_VERSION].regla_1 ? _CHILD[_CURRENT_VERSION].regla_1 : "";
                    _CHILD_VARS.item_102 = _CHILD[_CURRENT_VERSION].regla_2 ? _CHILD[_CURRENT_VERSION].regla_2 : "";
                }
            }
            return _CHILD_VARS;
        }
        let _GET_CHILD_CLOCK = () => {
            var _CHILD = currentItem.fun_clocks;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _GET_LAW = () => {
            let _CHILD = currentItem.record_law;
            return _CHILD ?? empty_model
        }
        let _GET_ARC = () => {
            let _CHILD = currentItem.record_arc;
            return _CHILD ?? empty_model
        }
        let _GET_ENG = () => {
            let _CHILD = currentItem.record_eng;
            return _CHILD ?? empty_model
        }
        let _GET_LAW_REVIEWS = () => {
            let _CHILD = currentItem.record_law;
            if (!_CHILD) return [];
            let _REVIEWS = _CHILD.record_law_reviews
            return _REVIEWS[currentVersion - 1] ?? {}
        }
        let _GET_REVIEW_PH = () => {
            let _REVIEW = currentItem.record_ph;
            return _REVIEW ?? []
        }
        let _GET_ARC_REVIEWS = () => {
            let _CHILD = currentItem.record_arc;
            if (!_CHILD) return [];
            let _REVIEWS = _CHILD.record_arc_38s
            return _REVIEWS[currentVersion - 1] ?? {}
        }
        let _GET_ENG_REVIEWS = () => {
            let _CHILD = currentItem.record_eng;
            if (!_CHILD) return [];
            let _REVIEWS = _CHILD.record_eng_reviews
            return _REVIEWS[currentVersion - 1] ?? {}
        }
        let _GET_RECORD_REV = () => {
            let _CHILD = currentItem.record_review;
            return _CHILD ?? {};
        }
        // DATA CONVERTERS
        let _GET_CLOCK_STATE = (_state) => {
            var _CLOCK = _GET_CHILD_CLOCK();
            if (_state == null) return false;
            for (var i = 0; i < _CLOCK.length; i++) {
                if (_CLOCK[i].state == _state) return _CLOCK[i];
            }
            return false;
        }
        let _GET_CLOCK_STATE_VERSION = (_state, version) => {
            var _CLOCK = _GET_CHILD_CLOCK();
            if (_state == null) return false;
            for (var i = 0; i < _CLOCK.length; i++) {
                if (_CLOCK[i].state == _state && _CLOCK[i].version == version) return _CLOCK[i];
            }
            return false;
        }
        let _GET_REVIEW = (_REVIEW, _REVIEW_CLOCK, REVIEWS) => {
            let res = {
                '-1': <label className=" me-1"><i class="far fa-dot-circle" style={{ fontSize: '125%' }}></i></label>,
                '0': <label className="fw-bold text-danger me-1"><i class="far fa-times-circle" style={{ fontSize: '125%' }}></i></label>,
                '1': <label className="fw-bold text-success  me-1"><i class="far fa-check-circle" style={{ fontSize: '125%' }}></i></label>,
                '2': <label className="fw-bold text-warning  me-1"><i class="far fa-stop-circle" style={{ fontSize: '125%' }}></i></label>,
            }

            if (REVIEWS) {
                let asigns = REVIEWS.split(';');
                let reviews = _REVIEW_CLOCK ? _REVIEW_CLOCK.split(';') : [_REVIEW];
                return asigns.map((value, index) => res[reviews[index]] ?? res['-1'])
            } else return res[_REVIEW] ?? res['-1']
        }
        let _GET_REVIEW_ENG = (_REVIEW, _REVIEW_CLOCK, REVIEWS) => {
            let revies = _REVIEW ?? [-1, -1]
            let res = {
                '-1': <label className=" me-1"><i class="far fa-dot-circle"></i></label>,
                '0': <label className="fw-bold text-danger  me-1"><i class="far fa-times-circle"></i></label>,
                '1': <label className="fw-bold text-success  me-1"><i class="far fa-check-circle"></i></label>,
                '2': <label className="fw-bold text-warning  me-1"><i class="far fa-stop-circle"></i></label>,
            }
            if (REVIEWS) {
                let asigns = REVIEWS.split(';');
                let reviews_c = _REVIEW_CLOCK ? _REVIEW_CLOCK.split(';') : [_REVIEW].join(',');
                return ['R1:', 'R2:'].map((value, index) =>
                    <>
                        <label>{value}
                            {asigns.map((value2, index2) => res[reviews_c[index2] ? reviews_c[index2].split(',')[index] : '-1'] ?? res['-1'])}
                        </label><br />
                    </>)
            } else return revies.map((value, index) => <><label>R{index + 1}: {res[value] ?? res['-1']}</label><br /></>)

        }
        let _TABLE_INFO = () => {
            let fun1 = _GET_CHILD_1();
            let rr = _GET_RECORD_REV();
            let isPh = regexChecker_isPh(fun1, true);
            let reviews = [];
            let review = null;
            let asign = null;
            if (!noLaw) {
                if (isPh) {
                    var clock_inform = _GET_CLOCK_STATE_VERSION(11, 300);
                    let informs = clock_inform.date_start ? clock_inform.date_start.split(';') : [];
                    review = _GET_REVIEW_PH();
                    reviews.push({
                        asign: review.worker_asign_law_name,
                        inform: informs[0],
                        asign_date: review.date_asign_law,
                        worker: review.worker_law_name,
                        review: review.check_law,
                        date: review.date_law_review,
                        icon: <i class="fas fa-balance-scale me-2"></i>,
                        type: 'JUR.',
                        process: 'Acta Observaciones',
                    })
                }
                else {
                    review = _GET_LAW_REVIEWS();
                    asign = _GET_LAW();
                    var clocks_asign = _GET_CLOCK_STATE_VERSION(11, 100);
                    var clocks_reviews = _GET_CLOCK_STATE_VERSION(11, 200);
                    var clock_inform = _GET_CLOCK_STATE_VERSION(11, 300);

                    let review_primal = review.check;
                    let date_primal = review.date;
                    let asgin_primal = asign.date_asign;


                    let asigns = clocks_asign.date_start ? clocks_asign.date_start.split(';') : [];
                    let informs = clock_inform.date_start ? clock_inform.date_start.split(';') : [];
                    let reviews_d = clocks_reviews.date_start ? clocks_reviews.date_start.split(';') : [];
                    let reviews_c = clocks_reviews.resolver_context ? clocks_reviews.resolver_context.split(';') : [];

                    let asign_f = [];
                    let review_f = [];
                    let revc_f = [];
                    let inform_f = [];

                    var clocks_process = ['Acta Observaciones',]
                    if (rr.check == 0) clocks_process = ['Acta Observaciones', 'Revision Técnica 1', 'Revision Técnica 2', 'Revision de Correcciones',]

                    for (let i = 0; i < clocks_process.length; i++) {
                        if (i == 0) {
                            asign_f.push(asigns[0] ? asigns[0] : asgin_primal);
                            review_f.push(reviews_d[0] ? reviews_d[0] : date_primal);
                            revc_f.push(reviews_c[0] ? reviews_c[0] : review_primal);
                        }
                        else {
                            asign_f.push(asigns[i]);
                            review_f.push(reviews_d[i]);
                            revc_f.push(reviews_c[i]);
                        }
                        inform_f.push(informs[i]);
                    }


                    clocks_process.map((value, i) => {
                        reviews.push({
                            asign: asign.worker_name,
                            inform: inform_f[i],
                            asign_date: asign_f[i],
                            worker: review.worker_name,
                            review: revc_f[i],
                            date: review_f[i],
                            icon: <i class="fas fa-balance-scale me-2"></i>,
                            type: 'JUR.',
                            process: value,
                        })
                    }
                    )
                }
            }
            if (!noArc) {
                if (isPh) {
                    var clock_inform = _GET_CLOCK_STATE_VERSION(13, 300);
                    let informs = clock_inform.date_start ? clock_inform.date_start.split(';') : [];
                    review = _GET_REVIEW_PH();
                    reviews.push({
                        asign: review.worker_asign_arc_name,
                        inform: informs[0],
                        asign_date: review.date_asign_arc,
                        worker: review.worker_arc_name,
                        review: review.check,
                        version: review.version,
                        icon: <i class="far fa-building me-2"></i>,
                        type: 'AEQ.',
                        process: 'Acta Observaciones',
                    })
                }
                else {
                    review = _GET_ARC_REVIEWS();
                    asign = _GET_ARC();

                    var clocks_asign = _GET_CLOCK_STATE_VERSION(13, 100);
                    var clocks_reviews = _GET_CLOCK_STATE_VERSION(13, 200);
                    var clock_inform = _GET_CLOCK_STATE_VERSION(13, 300);

                    let review_primal = review.check;
                    let date_primal = review.date;
                    let asgin_primal = asign.date_asign;


                    let asigns = clocks_asign.date_start ? clocks_asign.date_start.split(';') : [];
                    let informs = clock_inform.date_start ? clock_inform.date_start.split(';') : [];
                    let reviews_d = clocks_reviews.date_start ? clocks_reviews.date_start.split(';') : [];
                    let reviews_c = clocks_reviews.resolver_context ? clocks_reviews.resolver_context.split(';') : [];

                    let asign_f = [];
                    let review_f = [];
                    let revc_f = [];
                    let inform_f = [];

                    var clocks_process = ['Acta Observaciones',]
                    if (rr.check == 0) clocks_process = ['Acta Observaciones', 'Revision Técnica 1', 'Revision Técnica 2', 'Revision de Correcciones',]

                    for (let i = 0; i < clocks_process.length; i++) {
                        if (i == 0) {
                            asign_f.push(asigns[0] ? asigns[0] : asgin_primal);
                            review_f.push(reviews_d[0] ? reviews_d[0] : date_primal);
                            revc_f.push(review_primal ?? reviews_c[0]);
                        }
                        else {
                            asign_f.push(asigns[i]);
                            review_f.push(reviews_d[i]);
                            revc_f.push(reviews_c[i]);
                        }
                        inform_f.push(informs[i]);
                    }

                    clocks_process.map((value, i) => reviews.push({
                        asign: asign.worker_name,
                        inform: inform_f[i],
                        asign_date: asign_f[i],
                        worker: review.worker_name,
                        review: revc_f[i],
                        date: review_f[i],
                        icon: <i class="far fa-building me-2"></i>,
                        type: 'ARQ.',
                        process: value,
                    }))
                }
            } if (!noEng) {
                if (!isPh) {
                    review = _GET_ENG_REVIEWS();
                    asign = _GET_ENG();

                    var clocks_asign = _GET_CLOCK_STATE_VERSION(12, 100);
                    var clocks_reviews = _GET_CLOCK_STATE_VERSION(12, 200);
                    var clock_inform = _GET_CLOCK_STATE_VERSION(12, 300);

                    let review_primal = [review.check, review.check_2];
                    let date_primal = review.date;
                    let asgin_primal = asign.date_asign;

                    let asigns = clocks_asign.date_start ? clocks_asign.date_start.split(';') : [];
                    let informs = clock_inform.date_start ? clock_inform.date_start.split(';') : [];
                    let reviews_d = clocks_reviews.date_start ? clocks_reviews.date_start.split(';') : [];
                    let reviews_c = clocks_reviews.resolver_context ? clocks_reviews.resolver_context.split(';') : [];

                    let asign_f = [];
                    let review_f = [];
                    let revc_f = [];
                    let inform_f = [];

                    var clocks_process = ['Acta Observaciones',]
                    if (rr.check == 0) clocks_process = ['Acta Observaciones', 'Revision Técnica 1', 'Revision Técnica 2', 'Revision de Correcciones',]

                    for (let i = 0; i < clocks_process.length; i++) {
                        if (i == 0) {
                            asign_f.push(asigns[0] ? asigns[0] : asgin_primal);
                            review_f.push(reviews_d[0] ? reviews_d[0] : date_primal);
                            revc_f.push(reviews_c[0] ?  reviews_c[0].split(',') : review_primal);
                        }
                        else {
                            asign_f.push(asigns[i]);
                            review_f.push(reviews_d[i]);
                            revc_f.push( reviews_c[i] ?  reviews_c[i].split(',') : [null, null]);
                        }
                        inform_f.push(informs[i]);
                    }


                    clocks_process.map((value, i) => reviews.push({
                        asign: asign.worker_name,
                        inform: inform_f[i],
                        asign_date: asign_f[i],
                        worker: review.worker_name,
                        review: revc_f[i],
                        date: review_f[i],
                        icon: <i class="fas fa-cogs me-2"></i>,
                        type: 'EST.',
                        class: 'eng',
                        process: value,
                    }))
                }
            }
            return reviews;
        }
        // COMPONENT JSX
        let _TABLE = () => {
            let data = _TABLE_INFO();
            const HEAD = <div className="row text-light">
                <div className="col-2 border bg-info text-center">
                    <label className="fw-bold text-uppercase">INFORME</label>
                </div>
                <div className="col border bg-info py-1 text-center">
                    <label className="fw-bold text-uppercase">REVISOR</label>
                </div>
                <div className="col border bg-info py-1 text-center">
                    <label className="fw-bold text-uppercase">REVISIÓN</label>
                </div>
                <div className="col border bg-info py-1 text-center">
                    <label className="fw-bold text-uppercase">ASIGNACIÓN</label>
                </div>
                <div className="col border bg-info py-1 text-center">
                    <label className="fw-bold text-uppercase">REVISION</label>
                </div>
                <div className="col-1 border bg-info py-1 text-center">
                    <label className="fw-bold text-uppercase">RES.</label>
                </div>
                <div className="col border bg-info py-1 text-center">
                    <label className="fw-bold text-uppercase">INFORMAR</label>
                </div>
            </div>

            const BODY = data.map(value => {
                return <div className="row ">
                    <div className="col-2 border text-center">
                        <h5 className="text-uppercase">{value.icon} {value.type}</h5>
                    </div>
                    <div className="col border text-center">
                        <h5 className="text-uppercase fw-normal">{value.asign ||value.worker }</h5>
                    </div>
                    <div className="col border text-center">
                        <h5 className="fw-normal">{value.process}</h5>
                    </div>
                    <div className="col border text-center">
                        <label className="text-uppercase">{value.asign_date}</label>
                    </div>
                    <div className="col border text-center">
                        <label className="text-uppercase">{value.date}</label>
                    </div>
                    <div className="col-1 border text-center">
                        <label className="text-uppercase">{value.class == 'eng' ?
                            _GET_REVIEW_ENG(value.review)
                            : _GET_REVIEW(value.review)}
                        </label>
                    </div>
                    <div className="col border text-center">
                        <label className="text-uppercase">{value.inform}</label>
                    </div>
                </div>
            })
            return (
                <div className="row">
                    {HEAD}
                    {BODY}
                </div>
            );
        }
        return (
            <div className="fun_g_mix">

                <legend className={`my-2 px-3 text-uppercase Collapsible text-white ${this.props.textAlign ?? ''}`} id={id}>
                    <label className="app-p lead text-center fw-normal text-uppercase">{nomenclature} INFORMES</label>
                </legend>

                {_TABLE()}

            </div >
        );
    }
}

export default FUN_G_REPORTS;