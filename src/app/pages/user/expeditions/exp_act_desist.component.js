import React, { useState, useEffect, useCallback, useMemo, useRef, useLayoutEffect } from "react";
import SubmitService from '../../../services/submit.service';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import Collapsible from 'react-collapsible';


import EXPEDITION_SERVICE from '../../../services/expedition.service';
import PQRS_Service from '../../../services/pqrs_main.service';
import FUN_SERVICE from '../../../services/fun.service';
import '../../../../styles/docs-expediente.css';

import { cities, domains_number, infoCud, zonesTable } from '../../../components/jsons/vars';
import { MDBBtn } from 'mdb-react-ui-kit';
import { dateParser, regexChecker_isOA_2, _ADDRESS_SET_FULL, _MANAGE_IDS } from '../../../components/customClasses/typeParse';
import { _FUN_1_PARSER, _FUN_4_PARSER, _FUN_6_PARSER } from '../../../components/customClasses/funCustomArrays';
import EXP_RES_2 from './exp_res_2.component';

const MySwal = withReactContent(Swal);
const _GLOBAL_ID = process.env.REACT_APP_GLOBAL_ID;
export default function EXP_ACT_DESIST(props) {
    const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, recordArc } = props;
    const [resDocData, setResDocData] = useState(null);

      // ========================= Utilities =========================
  const ensureArray = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === "string") {
      try {
        const p = JSON.parse(val);
        return Array.isArray(p) ? p : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const normalizeLD = (items, idPublicFallback) =>
    (items || []).map((r, i) => {
      const id_public = r?.id_public ?? idPublicFallback ?? "x";
      const baseKey = `${id_public}-${r?.code || r?.name || "row"}`;
      const uid = r?.uid || `${baseKey}-${i}`;
      const pages = r?.pages != null ? r.pages : r?.page != null ? r.page : "";
      return { ...r, uid, id_public, pages, page: pages, show: r?.show !== false };
    });

  const model = useMemo(() => currentRecord?.model_des || "delete", [currentRecord?.model_des]);

  // ========================= Remote loader =========================
  const fetchRemoteListDocs = useCallback(async (idPublic) => {
    const response = await SubmitService.getIdRelated(idPublic);
    const List = response.data || [];
    const remoteList = [];

    List.forEach((value) => {
      (value.sub_lists || []).forEach((valuej) => {
        const name = valuej.list_name ? valuej.list_name.split(";") : [];
        const category = valuej.list_category ? valuej.list_category.split(",") : [];
        const code = valuej.list_code ? valuej.list_code.split(",") : [];
        const page = valuej.list_pages ? valuej.list_pages.split(",") : [];
        const review = valuej.list_review ? valuej.list_review.split(",") : [];

        review.forEach((v, k) => {
          if (v === "SI") {
            remoteList.push({
              id_public: value.id_public,
              date: value.date,
              time: value.time,
              name: name[k],
              category: category[k],
              code: code[k],
              page: page[k],
              pages: page[k],
              show: true,
            });
          }
        });
      });
    });

    return normalizeLD(remoteList, idPublic);
  }, []);

  // ========================= State =========================
  const [listDocuments, setListDocuments] = useState([]); // (array) documentos del expediente (remotos/editables)
  const [documents, setDocuments] = useState({}); // (objeto) soportes de curaduría

  const [showHiddenLD, setShowHiddenLD] = useState(false);
  const [showHiddenDocs, setShowHiddenDocs] = useState(false);

  const [listDocsOpen, setListDocsOpen] = useState(true);
  const [docsOpen, setDocsOpen] = useState(true);

  // ========================= Build Local Docs =========================
  const getValueByName = useCallback(
    (nameToFind, property) => {
      if (!listDocuments || listDocuments.length === 0) return null;
      const found = listDocuments.find((item) => item.name?.includes(nameToFind));
      return found ? found[property] ?? null : null;
    },
    [listDocuments]
  );

  const buildLocalDocs = useCallback(() => {
    const makeDoc = (name, { date = "", pages = "", show = true } = {}) => ({ name, date, pages, show });
    const acta_observaciones = _GET_CLOCK_STATE(49).date_start || _GET_CLOCK_STATE(30).date_start || "";
    const date_desist = _GET_CLOCK_STATE(-6).date_start || "";
    const citacion = _GET_CLOCK_STATE(-5).date_start || "";

    return {
      factura_cargo_fijo: makeDoc("Factura de Cargo Fijo", {
        date: getValueByName("Factura Cargo Fijo.", "date") || "",
        pages: getValueByName("Factura Cargo Fijo.", "page") || "",
        show: getValueByName("Factura Cargo Fijo.", "date") !== null,
      }),
      factura_cargo_variable: makeDoc("Factura de Cargo Variable", {
        date: getValueByName("Factura Cargo Variable.", "date") || "",
        pages: getValueByName("Factura Cargo Variable.", "page") || "",
        show: getValueByName("Factura Cargo Variable.", "date") !== null,
      }),
      acta_observacion: makeDoc("Acta de Observación y Correcciones", {
        date: acta_observaciones,
        pages: "",
        show: true,
      }),
      acto_desistimiento: makeDoc("Acto administrativo de Desistimiento", {
        date: date_desist,
        pages: "",
        show: true,
      }),
      citacion: makeDoc("Citación", { date: citacion, pages: "", show: true }),
      notificacion_personal: makeDoc("Notificación Personal", {
        date: _GET_CLOCK_STATE(-7).date_start || "",
        pages: "",
        show: true,
      }),
      notificacion_aviso: makeDoc("Notificación por Aviso", {
        date: _GET_CLOCK_STATE(-8).date_start || "",
        pages: "",
        show: true,
      }),
      ejecutoria: makeDoc("Ejecutoria de la Resolución de Desistimiento", {
        date: _GET_CLOCK_STATE(99).date_start || _GET_CLOCK_STATE(-30).date_start || "",
        pages: "",
        show: true,
      }),
      correo: makeDoc("Notificación de eliminacion documental"),
    };
  }, [getValueByName]);

  // ========================= Hydration =========================
  const hydrateDocuments = useCallback(() => {
    const reso = _GET_EXPEDITION_JSON("reso");
    const localDocs = buildLocalDocs();

    if (model === "delete") {
      if (!reso.documents) reso.documents = {};
      for (const [id, doc] of Object.entries(localDocs)) {
        const tgt = reso.documents[id] || {};
        reso.documents[id] = {
          name: tgt.name || doc.name,
          date: tgt.date || doc.date || "",
          pages: tgt.pages || doc.pages || "",
          show: tgt.show !== undefined ? tgt.show : doc.show ?? true,
        };
      }
    }
    setDocuments(reso.documents || {});
  }, [buildLocalDocs, model]);

  // ========================= Effects =========================
  // Carga lista documentos: usa guardado local si existe; si no, remoto
  useEffect(() => {
    (async () => {
      try {
        const reso = _GET_EXPEDITION_JSON("reso");
        const saved = normalizeLD(ensureArray(reso?.list_docs_exp), currentItem.id_public);
        if (saved.length > 0) {
          setListDocuments(saved);
        } else {
          const remoteNorm = await fetchRemoteListDocs(currentItem.id_public);
          setListDocuments(remoteNorm);
        }
      } catch (err) {
        console.error("Error en getListDocuments:", err);
      }
    })();
  }, [currentItem.id_public, fetchRemoteListDocs]);

  // Rehidratar soportes cada vez que cambie la lista o el modelo
  useEffect(() => {
    hydrateDocuments();
  }, [hydrateDocuments]);

  // ========================= Restore helpers =========================
  const restoreLD = useCallback(async () => {
    const reso = _GET_EXPEDITION_JSON("reso");
    delete reso.list_docs_exp;
    const remoteNorm = await fetchRemoteListDocs(currentItem.id_public);
    setListDocuments(remoteNorm);
  }, [fetchRemoteListDocs, currentItem.id_public]);

const restoreDocs = useCallback(() => {
    const reso = _GET_EXPEDITION_JSON('reso');
    const localDocs = buildLocalDocs();
    reso.documents = { ...localDocs };
    setDocuments(reso.documents);
}, [buildLocalDocs]);

  // ========================= Sorting / filtering =========================
  const sortHelpers = {
    cmp: (a, b) => (a > b) - (a < b),
    num: (v) => {
      const n = parseInt(v, 10);
      return Number.isNaN(n) ? 0 : n;
    },
    dts: (v) => (v ? new Date(v).getTime() : 0),
    vis: (v) => (v !== false ? 1 : 0),
  };

  const [sortLD, setSortLD] = useState({ key: "name", dir: "asc" });
  const [sortDocs, setSortDocs] = useState({ key: "name", dir: "asc" });

  const rowsLD = useMemo(() => {
    const src = Array.isArray(listDocuments) ? listDocuments : [];
    const filtered = showHiddenLD ? src : src.filter((r) => r?.show !== false);
    const dir = sortLD.dir === "asc" ? 1 : -1;
    const { cmp, dts, num, vis } = sortHelpers;

    return filtered.slice().sort((a, b) => {
      switch (sortLD.key) {
        case "vr":
          return dir * cmp(a?.id_public || "", b?.id_public || "");
        case "date":
          return dir * cmp(dts(a?.date), dts(b?.date));
        case "pages":
          return dir * cmp(num(a?.pages ?? a?.page), num(b?.pages ?? b?.page));
        case "show":
          return dir * cmp(vis(a?.show), vis(b?.show));
        default:
          return dir * cmp((a?.name || "").toLowerCase(), (b?.name || "").toLowerCase());
      }
    });
  }, [listDocuments, showHiddenLD, sortLD]);

  const rowsDocs = useMemo(() => {
    const entries = Object.entries(documents || {});
    const filtered = showHiddenDocs ? entries : entries.filter(([, d]) => d?.show !== false);
    const dir = sortDocs.dir === "asc" ? 1 : -1;
    const { cmp, dts, num, vis } = sortHelpers;

    return filtered.slice().sort(([idA, a], [idB, b]) => {
      switch (sortDocs.key) {
        case "date":
          return dir * cmp(dts(a?.date), dts(b?.date));
        case "pages":
          return dir * cmp(num(a?.pages), num(b?.pages));
        case "show":
          return dir * cmp(vis(a?.show), vis(b?.show));
        case "name":
        default:
          return dir * cmp((a?.name || idA).toLowerCase(), (b?.name || idB).toLowerCase());
      }
    });
  }, [documents, showHiddenDocs, sortDocs]);

  // ========================= Scroll persist =========================
  const pageScrollRef = useRef(0);
  const toggleListDocs = () => {
    pageScrollRef.current = window.scrollY;
    setListDocsOpen((o) => !o);
  };
  const toggleDocs = () => {
    pageScrollRef.current = window.scrollY;
    setDocsOpen((o) => !o);
  };
  
//   useLayoutEffect(() => {
//     window.scrollTo(0, pageScrollRef.current);
//   }, [listDocsOpen, docsOpen, showHiddenDocs, showHiddenLD]);

  // ========================= UI helpers =========================
  const thBtn = { background: "transparent", border: 0, padding: 0, font: "inherit", cursor: "pointer", width: "100%", textAlign: "center" };
  const tightInput = { width: "100%", height: 28, padding: "2px 6px", lineHeight: 1.1, borderRadius: 4 };
  const tightChk = { transform: "scale(0.95)", cursor: "pointer" };
  const tableTight = { fontSize: "0.86rem" };
  const sortIcon = (active, dir) => <i className={`ms-1 fas ${!active ? "fa-sort" : dir === "asc" ? "fa-sort-up" : "fa-sort-down"}`} />;

  const confirmRestore = (msg, action) => {
    MySwal.fire({
      title: msg.title,
      text: msg.text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: msg.confirm,
      cancelButtonText: "Cancelar",
    }).then((res) => {
      if (res.isConfirmed) action();
    });
  };

  // ========================= Add new doc (documents objeto) =========================
  const addNewDoc = (e) => {
    e?.stopPropagation?.();
    const id = `custom_${Date.now()}`;
    setDocuments((prev) => ({ ...(prev || {}), [id]: { name: "", date: "", pages: "", show: true } }));
  };

    // ***************************  DATA GETTERS *********************** //
    let _GET_EXPEDITION_JSON = (field) => {
      let json = currentRecord[field];
      if (!json) return {};

      try {
        // Caso 1: ya es objeto
        if (typeof json === "object") return json;

        // Caso 2: es string
        if (typeof json === "string") {
          let parsed = JSON.parse(json);

          // Si aún queda string dentro → intentar parsear otra vez
          if (typeof parsed === "string") {
            try {
              parsed = JSON.parse(parsed);
            } catch {
              // si falla, devolvemos objeto vacío
              return {};
            }
          }

          return parsed && typeof parsed === "object" ? parsed : {};
        }

        // Si no es ni objeto ni string, devolvemos objeto vacío
        return {};
      } catch (err) {
        console.error("Error en _GET_EXPEDITION_JSON:", err);
        return {};
      }
    };

    let _GET_CHILD_1 = () => {
        var _CHILD = currentItem.fun_1s;
        var _CURRENT_VERSION = currentVersion - 1;
        if (!_CHILD[_CURRENT_VERSION]) return { tipo: '' };
        var _CHILD_VARS = {
            item_0: _CHILD[_CURRENT_VERSION].id,
            tipo: _CHILD[_CURRENT_VERSION].tipo ? _CHILD[_CURRENT_VERSION].tipo : "",
            tramite: _CHILD[_CURRENT_VERSION].tramite ? _CHILD[_CURRENT_VERSION].tramite : "",
            m_urb: _CHILD[_CURRENT_VERSION].m_urb ? _CHILD[_CURRENT_VERSION].m_urb : "",
            m_sub: _CHILD[_CURRENT_VERSION].m_sub ? _CHILD[_CURRENT_VERSION].m_sub : "",
            m_lic: _CHILD[_CURRENT_VERSION].m_lic ? _CHILD[_CURRENT_VERSION].m_lic : "",
            item_6: _CHILD[_CURRENT_VERSION].usos ? _CHILD[_CURRENT_VERSION].usos : "",
            item_7: _CHILD[_CURRENT_VERSION].area ? _CHILD[_CURRENT_VERSION].area : "",
            item_8: _CHILD[_CURRENT_VERSION].vivienda ? _CHILD[_CURRENT_VERSION].vivienda : "",
            item_9: _CHILD[_CURRENT_VERSION].cultural ? _CHILD[_CURRENT_VERSION].cultural : "",
            item_101: _CHILD[_CURRENT_VERSION].regla_1 ? _CHILD[_CURRENT_VERSION].regla_1 : "",
            item_102: _CHILD[_CURRENT_VERSION].regla_2 ? _CHILD[_CURRENT_VERSION].regla_2 : "",
        }
        return _CHILD_VARS;
    }
    let _GET_CHILD_2 = () => {
        var _CHILD = currentItem.fun_2;
        if (!_CHILD) return {
            item_20: false,
            item_211: '',
            item_212: '',
            item_22: '',
            item_23: '',
            item_232: '',
            item_24: '',// PARSER
            item_25: '',// PARSER

            item_261: '',
            item_262: '',
            item_263: '',
            item_264: '',
            item_265: '',
            item_266: '',
            item_267: '',
            item_268: '',
        };
        var _CHILD_VARS = {
            item_20: _CHILD.id ?? false,
            item_211: _CHILD.direccion || '',
            item_212: _CHILD.direccion_ant ?? '',
            item_22: _CHILD.matricula || '',
            item_23: _CHILD.catastral || '',
            item_232: _CHILD.catastral2 || '',
            item_24: _CHILD.suelo ?? '',// PARSER
            item_25: _CHILD.lote_pla ?? '',// PARSER

            item_261: _CHILD.barrio ?? '',
            item_262: _CHILD.vereda ?? '',
            item_263: _CHILD.comuna ?? '',
            item_264: _CHILD.sector ?? '',
            item_265: _CHILD.corregimiento ?? '',
            item_266: _CHILD.lote ?? '',
            item_267: _CHILD.estrato ?? '',
            item_268: _CHILD.manzana ?? '',
        }
        return _CHILD_VARS;
    }
    let _GET_CLOCK = () => {
        var _CHILD = currentItem.fun_clocks;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }
    // *************************  DATA CONVERTERS ********************** //
    let _GET_CLOCK_STATE = (_state, _version) => {
        var _CLOCK = _GET_CLOCK();
        if (_state === null) return false;
        for (var i = 0; i < _CLOCK.length; i++) {
            if (_CLOCK[i].state === _state) return _CLOCK[i];
        }
        return false;
    }
    let _GET_LAST_ID_RES = (_id) => {
        let new_id = "";
        FUN_SERVICE.getLastIdPublicRes()
            .then(response => {
                new_id = response.data[0].id;
                new_id = new_id.includes('-') ? new_id.split('-')[1] : new_id;
                let pre = new_id.includes('-') ? new_id.split('-')[0] + '-' : '';
                let concecutive = Number(new_id) + 1
                if (concecutive < 1000) concecutive = "0" + concecutive
                if (concecutive < 100) concecutive = "0" + concecutive
                if (concecutive < 10) concecutive = "0" + concecutive
                document.getElementById(_id).value = pre + concecutive;
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: "ERROR AL CARGAR",
                    text: "No ha sido posible cargar el consecutivo, inténtelo nuevamente.",
                    icon: 'error',
                    confirmButtonText: this.props.swaMsg.text_btn,
                });
            });

    }
    let _RES_PARSER_1 = (fun_1) => {
        let parse = [];
        let licences = [];
        let mods = [];
        const _FUN_1_P = {
            'A': 'URBANIZACION',
            'B': 'PARCELACION',
            'C': 'SUBDIVISION',
            'D': 'CONSTRUCCION',
            'E': 'INTERVENCION Y OCUPACION DEL ESPACIO PUBLICO',
            'G': 'OTRAS ACTUACIONES',
        };
        const _FUN_1_3_p = {
            'A': 'DESARROLLO',
            'B': 'SANEAMIENTO',
            'C': 'RECUPERACION'
        };
        const _FUN_1_4_P = {
            'A': 'SUBDIVISION RURAL',
            'B': 'SUBDIVISION URBANA',
            'C': 'RELOTEO'
        };
        const _FUN_1_5 = {
            'A': 'OBRA NUEVA',
            'B': 'AMPLIACION',
            'C': 'ADECUACION',
            'D': 'MODIFICACION',
            'E': 'RESTAURACION',
            'F': 'REFORZAMIENTO ESTRUCTURAL',
            'G': 'DEMOLICION TOTAL',
            'g': 'DEMOLICION PARCIAL',
            'H': 'RECONSTRUCCION',
            'I': 'CERRAMIENTO'
        };
        let tipoArray = fun_1.tipo ? fun_1.tipo.split(',') : [];
        let fun_13_Array = fun_1.tipo ? fun_1.m_urb.split(',') : [];
        let fun_14_Array = fun_1.tipo ? fun_1.m_sub.split(',') : [];
        let fun_15_Array = fun_1.tipo ? fun_1.m_lic.split(',') : [];

        if (tipoArray.includes('F')) {
            parse.push('RECONOCIMIENTO DE LA EXISTENCIA DE UNA EDIFICACION')
        }
        if (tipoArray.length > 1) parse.push('JUNTO CON LICENCIA DE')
        else { parse.push('LICENCIA DE') }

        tipoArray.map(value => { if (_FUN_1_P[value]) licences.push(_FUN_1_P[value]) });
        licences = licences.join(', ')
        parse.push(licences);

        parse.push('EN LA MODALIDAD DE')

        fun_13_Array.map(value => { if (_FUN_1_3_p[value]) mods.push(_FUN_1_3_p[value]) });
        fun_14_Array.map(value => { if (_FUN_1_4_P[value]) mods.push(_FUN_1_4_P[value]) });
        fun_15_Array.map(value => { if (_FUN_1_5[value]) mods.push(_FUN_1_5[value]) });
        mods = mods.join(', ')
        parse.push(mods);

        return parse.join(' ')
    }

    // ******************************* JSX ***************************** // 
    let _COMPONENT_DOC_RES = () => {
        var model = currentRecord.model_des || 'delete';
        let canSave = (window.user.id === 1 || window.user.roleId === 3 || window.user.roleId === 5 || window.user.roleId === 2) || _GLOBAL_ID === 'cb1';

        var reso = _GET_EXPEDITION_JSON('reso');
        var _CHILD_1 = _GET_CHILD_1();
        let type = reso.type || _RES_PARSER_1(_CHILD_1);

        const reso_date_dv = _GET_CLOCK_STATE(-6).date_start || _GET_CLOCK_STATE(70).date_start;
        const reso_state_dv = reso.state ?? '';
        const reso_pot_dv = reso.pot ?? infoCud.pot;

        return (
            <>
                <div className="row">
                    <div className="col">
                        <label className="mt-2">Modalidad</label>
                        <input type="text" className="form-control" id="expedition_doc_res_1"
                            defaultValue={type} />
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <label className="mt-1">Fecha Radicación</label>
                        <div className="input-group">
                            <input type="date" className="form-control" id="expedition_doc_res_2_des"
                                defaultValue={reso_date_dv} readOnly />
                        </div>
                    </div>
                    <div className="col-3">
                        <label className="mt-1">Consecutivo</label>
                        <div className="input-group">
                            <input type="text" className="form-control" id="expedition_doc_res_id"
                                defaultValue={currentRecord.id_public} readOnly/>
                        </div>
                    </div>
                    <div className="col">
                        <label className="mt-1">POT</label>
                        <div className="input-group">
                            <input type="text" className="form-control" id="expedition_doc_res_pot" required
                                defaultValue={reso_pot_dv} />
                        </div>
                    </div>
                    <div className="col">
                        <label className="mt-1"># Radicacion</label>
                        <div className="input-group">
                            <input type="text" className="form-control" id="expedition_doc_res_3" disabled
                                value={currentItem.id_public} readOnly />
                        </div>
                    </div>
                </div>

               <div className="container-fluid">
                    {/* ======================= Documentos del expediente ======================= */}
                    <div className="row mt-4">
                        <div className="col">
                        <div className="docs-expediente card shadow-sm border-0">
                            <button
                            type="button"
                            className="section-toggle"
                            onClick={toggleListDocs}
                            aria-expanded={listDocsOpen}
                            aria-controls="ldocsCollapse"
                            >
                            <span className="title">Documentos del expediente</span>
                            <span className="actions">
                                {listDocsOpen ? (
                                <>
                                    <MDBBtn
                                    size="sm"
                                    color={showHiddenLD ? "info" : "light"}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowHiddenLD((v) => !v);
                                    }}
                                    title={showHiddenLD ? "Ocultar ocultos" : "Mostrar ocultos"}
                                    className="d-inline-flex align-items-center gap-2 me-2"
                                    >
                                    <i className={`fas ${showHiddenLD ? "fa-eye-slash" : "fa-eye"}`} />
                                    <span className="d-none d-sm-inline">
                                        {showHiddenLD ? "Ocultar ocultos" : "Mostrar ocultos"}
                                    </span>
                                    </MDBBtn>

                                    <MDBBtn
                                    size="sm"
                                    color="warning"
                                    outline
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        confirmRestore(
                                        {
                                            title: "¿Restaurar lista?",
                                            text: "Perderás los cambios no guardados en esta lista.",
                                            confirm: "Sí, restaurar",
                                        },
                                        restoreLD
                                        );
                                    }}
                                    title="Restaurar lista inicial"
                                    className="d-inline-flex align-items-center gap-2 me-2"
                                    >
                                    <i className="fas fa-undo" />
                                    <span className="d-none d-sm-inline">Restaurar</span>
                                    </MDBBtn>

                                    <MDBBtn
                                    size="sm"
                                    color="primary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const uid = `new_${Date.now()}`;
                                        setListDocuments((prev) => [
                                        ...(prev || []),
                                        {
                                            uid,
                                            id_public: "",
                                            date: "",
                                            time: "",
                                            name: "",
                                            category: "",
                                            page: "",
                                            pages: "",
                                            code: "",
                                            show: true,
                                        },
                                        ]);
                                    }}
                                    title="Agregar documento"
                                    className="d-inline-flex align-items-center gap-2"
                                    >
                                    <i className="fas fa-plus" />
                                    <span className="d-none d-sm-inline">Agregar</span>
                                    </MDBBtn>
                                </>
                                ) : null}
                                <i
                                className={`fas fa-chevron-${listDocsOpen ? "up" : "down"} caret`}
                                aria-hidden="true"
                                />
                            </span>
                            </button>

                            <div
                            id="ldocsCollapse"
                            className={`collapse ${listDocsOpen ? "show" : ""}`}
                            style={{ overflowAnchor: "none" }}
                            >
                            <div
                                className="table-responsive tableFixHead"
                                style={{ maxHeight: "60vh", overflowY: "auto" }}
                            >
                                <table className="table table-sm table-hover table-bordered align-middle mb-0">
                                <thead
                                    className="bg-light text-uppercase small"
                                    style={{ position: "sticky", top: 0, zIndex: 1 }}
                                >
                                    <tr>
                                    <th style={{ width: "38%" }} className="text-start">
                                        <button
                                        type="button"
                                        style={thBtn}
                                        onClick={() =>
                                            setSortLD((s) =>
                                            s.key === "name"
                                                ? { ...s, dir: s.dir === "asc" ? "desc" : "asc" }
                                                : { key: "name", dir: "asc" }
                                            )
                                        }
                                        >
                                        Contenido {sortIcon(sortLD.key === "name", sortLD.dir)}
                                        </button>
                                    </th>
                                    <th style={{ width: "17%" }} className="text-center">
                                        <button
                                        type="button"
                                        style={thBtn}
                                        onClick={() =>
                                            setSortLD((s) =>
                                            s.key === "vr"
                                                ? { ...s, dir: s.dir === "asc" ? "desc" : "asc" }
                                                : { key: "vr", dir: "asc" }
                                            )
                                        }
                                        >
                                        VR {sortIcon(sortLD.key === "vr", sortLD.dir)}
                                        </button>
                                    </th>
                                    <th style={{ width: "18%" }} className="text-center">
                                        <button
                                        type="button"
                                        style={thBtn}
                                        onClick={() =>
                                            setSortLD((s) =>
                                            s.key === "date"
                                                ? { ...s, dir: s.dir === "asc" ? "desc" : "asc" }
                                                : { key: "date", dir: "asc" }
                                            )
                                        }
                                        >
                                        Fecha {sortIcon(sortLD.key === "date", sortLD.dir)}
                                        </button>
                                    </th>
                                    <th style={{ width: "12%" }} className="text-center">
                                        <button
                                        type="button"
                                        style={thBtn}
                                        onClick={() =>
                                            setSortLD((s) =>
                                            s.key === "pages"
                                                ? { ...s, dir: s.dir === "asc" ? "desc" : "asc" }
                                                : { key: "pages", dir: "asc" }
                                            )
                                        }
                                        >
                                        Folios {sortIcon(sortLD.key === "pages", sortLD.dir)}
                                        </button>
                                    </th>
                                    <th style={{ width: "15%" }} className="text-center">
                                        <button
                                        type="button"
                                        style={thBtn}
                                        onClick={() =>
                                            setSortLD((s) =>
                                            s.key === "show"
                                                ? { ...s, dir: s.dir === "asc" ? "desc" : "asc" }
                                                : { key: "show", dir: "desc" }
                                            )
                                        }
                                        >
                                        Mostrar {sortIcon(sortLD.key === "show", sortLD.dir)}
                                        </button>
                                    </th>
                                    </tr>
                                </thead>

                                <tbody style={tableTight}>
                                    {rowsLD.map((row) => {
                                    const id = row.uid;
                                    const isVisible = row?.show !== false;
                                    return (
                                        <tr key={id} className={isVisible ? "" : "row-muted"}>
                                        <td className="text-start p-1">
                                            <input
                                            id={`ldoc_${id}_name`}
                                            type="text"
                                            className="form-control form-control-sm"
                                            aria-label="Nombre del documento"
                                            style={{ ...tightInput, textAlign: "left" }}
                                            value={row?.name ?? ""}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setListDocuments((prev) =>
                                                prev.map((r) =>
                                                    r.uid === id ? { ...r, name: value } : r
                                                )
                                                );
                                            }}
                                            />
                                            {/* {!isVisible && (
                                            <span className="ms-2 badge rounded-pill bg-secondary-subtle text-secondary border">oculto</span>
                                            )} */}
                                        </td>
                                        <td className="text-center p-1">
                                            <input
                                            id={`ldoc_${id}_vr`}
                                            type="text"
                                            className="form-control form-control-sm"
                                            aria-label="VR (id_public)"
                                            style={{ ...tightInput, textAlign: "center" }}
                                            value={row?.id_public ?? currentItem?.id_public ?? ""}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setListDocuments((prev) =>
                                                prev.map((r) =>
                                                    r.uid === id ? { ...r, id_public: value } : r
                                                )
                                                );
                                            }}
                                            />
                                        </td>
                                        <td className="text-center p-1">
                                            <input
                                            id={`ldoc_${id}_fecha`}
                                            type="date"
                                            className="form-control form-control-sm"
                                            aria-label="Fecha del documento"
                                            style={{ ...tightInput, textAlign: "center" }}
                                            value={row?.date ?? ""}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setListDocuments((prev) =>
                                                prev.map((r) =>
                                                    r.uid === id ? { ...r, date: value } : r
                                                )
                                                );
                                            }}
                                            />
                                        </td>
                                        <td className="text-center p-1">
                                            <input
                                            id={`ldoc_${id}_folios`}
                                            type="text"
                                            className="form-control form-control-sm"
                                            inputMode="numeric"
                                            aria-label="Número de folios"
                                            style={{ ...tightInput, textAlign: "center" }}
                                            value={row?.pages ?? row?.page ?? ""}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setListDocuments((prev) =>
                                                prev.map((r) =>
                                                    r.uid === id
                                                    ? { ...r, pages: value, page: value }
                                                    : r
                                                )
                                                );
                                            }}
                                            />
                                        </td>
                                        <td className="text-center p-1">
                                            <div className="form-check d-inline-flex justify-content-center">
                                            <input
                                                id={`ldoc_${id}_show`}
                                                className="form-check-input"
                                                type="checkbox"
                                                aria-label="Mostrar documento"
                                                style={tightChk}
                                                checked={!!isVisible}
                                                onChange={(e) => {
                                                const checked = e.target.checked;
                                                setListDocuments((prev) =>
                                                    prev.map((r) =>
                                                    r.uid === id ? { ...r, show: checked } : r
                                                    )
                                                );
                                                }}
                                            />
                                            </div>
                                        </td>
                                        </tr>
                                    );
                                    })}
                                </tbody>
                                </table>
                            </div>
                            <div className="card-footer bg-white py-2 small text-muted">
                                Usa el check (columna derecha) para mostrar/ocultar. Los demás
                                cambios se guardarán al confirmar.
                            </div>
                            </div>
                        </div>
                        </div>
                    </div>

                    <hr />

                    {/* ======================= Soportes de la curaduría ======================= */}
                    {model === "delete" ? (
                        <div className="row mt-4">
                        <div className="col">
                            <div className="docs-expediente card shadow-sm border-0">
                            <button
                                type="button"
                                className="section-toggle"
                                onClick={toggleDocs}
                                aria-expanded={docsOpen}
                                aria-controls="docsCollapse"
                            >
                                <span className="title">Soportes de la curaduría</span>
                                <span className="actions">
                                {docsOpen ? (
                                    <>
                                    <MDBBtn
                                        size="sm"
                                        color={showHiddenDocs ? "info" : "light"}
                                        onClick={(e) => {
                                        e.stopPropagation();
                                        setShowHiddenDocs((v) => !v);
                                        }}
                                        title={showHiddenDocs ? "Ocultar ocultos" : "Mostrar ocultos"}
                                        className="d-inline-flex align-items-center gap-2 me-2"
                                    >
                                        <i
                                        className={`fas ${
                                            showHiddenDocs ? "fa-eye-slash" : "fa-eye"
                                        }`}
                                        />
                                        <span className="d-none d-sm-inline">
                                        {showHiddenDocs ? "Ocultar ocultos" : "Mostrar ocultos"}
                                        </span>
                                    </MDBBtn>

                                    <MDBBtn
                                        size="sm"
                                        color="warning"
                                        outline
                                        onClick={(e) => {
                                        e.stopPropagation();
                                        confirmRestore(
                                            {
                                            title: "¿Restaurar documentos?",
                                            text: "Perderás los cambios no guardados en estos documentos.",
                                            confirm: "Sí, restaurar",
                                            },
                                            restoreDocs
                                        );
                                        }}
                                        title="Restaurar documentos iniciales"
                                        className="d-inline-flex align-items-center gap-2 me-2"
                                    >
                                        <i className="fas fa-undo" />
                                        <span className="d-none d-sm-inline">Restaurar</span>
                                    </MDBBtn>

                                    <MDBBtn
                                        size="sm"
                                        color="primary"
                                        onClick={addNewDoc}
                                        title="Agregar documento"
                                        className="d-inline-flex align-items-center gap-2"
                                    >
                                        <i className="fas fa-plus" />
                                        <span className="d-none d-sm-inline">Agregar</span>
                                    </MDBBtn>
                                    </>
                                ) : null}

                                <i
                                    className={`fas fa-chevron-${docsOpen ? "up" : "down"} caret`}
                                    aria-hidden="true"
                                />
                                </span>
                            </button>

                            <div
                                id="docsCollapse"
                                className={`collapse ${docsOpen ? "show" : ""}`}
                                style={{ overflowAnchor: "none" }}
                            >
                                <div
                                className="table-responsive tableFixHead"
                                style={{ maxHeight: "60vh", overflowY: "auto" }}
                                >
                                <table className="table table-sm table-hover table-bordered align-middle mb-0">
                                    <thead
                                    className="bg-light text-uppercase small"
                                    style={{ position: "sticky", top: 0, zIndex: 1 }}
                                    >
                                    <tr>
                                        <th style={{ width: "45%" }} className="text-start">
                                        <button
                                            type="button"
                                            style={thBtn}
                                            onClick={() =>
                                            setSortDocs((s) =>
                                                s.key === "name"
                                                ? { ...s, dir: s.dir === "asc" ? "desc" : "asc" }
                                                : { key: "name", dir: "asc" }
                                            )
                                            }
                                        >
                                            Contenido {sortIcon(sortDocs.key === "name", sortDocs.dir)}
                                        </button>
                                        </th>
                                        <th style={{ width: "25%" }} className="text-center">
                                        <button
                                            type="button"
                                            style={thBtn}
                                            onClick={() =>
                                            setSortDocs((s) =>
                                                s.key === "date"
                                                ? { ...s, dir: s.dir === "asc" ? "desc" : "asc" }
                                                : { key: "date", dir: "asc" }
                                            )
                                            }
                                        >
                                            Fecha {sortIcon(sortDocs.key === "date", sortDocs.dir)}
                                        </button>
                                        </th>
                                        <th style={{ width: "20%" }} className="text-center">
                                        <button
                                            type="button"
                                            style={thBtn}
                                            onClick={() =>
                                            setSortDocs((s) =>
                                                s.key === "pages"
                                                ? { ...s, dir: s.dir === "asc" ? "desc" : "asc" }
                                                : { key: "pages", dir: "asc" }
                                            )
                                            }
                                        >
                                            Folios {sortIcon(sortDocs.key === "pages", sortDocs.dir)}
                                        </button>
                                        </th>
                                        <th style={{ width: "10%" }} className="text-center">
                                        <button
                                            type="button"
                                            style={thBtn}
                                            onClick={() =>
                                            setSortDocs((s) =>
                                                s.key === "show"
                                                ? { ...s, dir: s.dir === "asc" ? "desc" : "asc" }
                                                : { key: "show", dir: "desc" }
                                            )
                                            }
                                        >
                                            Mostrar {sortIcon(sortDocs.key === "show", sortDocs.dir)}
                                        </button>
                                        </th>
                                    </tr>
                                    </thead>

                                    <tbody style={tableTight}>
                                    {rowsDocs.map(([id, doc]) => {
                                        const isVisible = doc?.show !== false;
                                        return (
                                        <tr key={id} className={isVisible ? "" : "row-muted"}>
                                            <td className="fw-medium text-start py-1">
                                            <input
                                                id={`doc_${id}_name`}
                                                type="text"
                                                className="form-control form-control-sm"
                                                aria-label="Nombre del documento"
                                                style={tightInput}
                                                value={doc?.name ?? ""}
                                                onChange={(e) => {
                                                const value = e.target.value;
                                                setDocuments((prev) => ({
                                                    ...(prev || {}),
                                                    [id]: { ...(prev?.[id] || {}), name: value },
                                                }));
                                                }}
                                            />
                                            {/* {!isVisible && (
                                                <span className="ms-2 badge rounded-pill bg-secondary-subtle text-secondary border">oculto</span>
                                            )} */}
                                            </td>

                                            <td className="text-center py-1">
                                            <input
                                                id={`doc_${id}_fecha`}
                                                type="date"
                                                className="form-control form-control-sm"
                                                aria-label="Fecha del documento"
                                                style={tightInput}
                                                value={doc?.date ?? ""}
                                                onChange={(e) => {
                                                const value = e.target.value;
                                                setDocuments((prev) => ({
                                                    ...(prev || {}),
                                                    [id]: { ...(prev?.[id] || {}), date: value },
                                                }));
                                                }}
                                            />
                                            </td>

                                            <td className="text-center py-1">
                                            <input
                                                id={`doc_${id}_folios`}
                                                type="text"
                                                className="form-control form-control-sm"
                                                inputMode="numeric"
                                                aria-label="Número de folios"
                                                style={tightInput}
                                                value={doc?.pages ?? ""}
                                                onChange={(e) => {
                                                const value = e.target.value;
                                                setDocuments((prev) => ({
                                                    ...(prev || {}),
                                                    [id]: { ...(prev?.[id] || {}), pages: value },
                                                }));
                                                }}
                                            />
                                            </td>

                                            <td className="text-center py-1">
                                            <div className="form-check d-inline-flex justify-content-center">
                                                <input
                                                className="form-check-input"
                                                type="checkbox"
                                                aria-label="Mostrar documento"
                                                style={tightChk}
                                                checked={!!isVisible}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setDocuments((prev) => ({
                                                    ...(prev || {}),
                                                    [id]: { ...(prev?.[id] || {}), show: checked },
                                                    }));
                                                }}
                                                />
                                            </div>
                                            </td>
                                        </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                                </div>

                                <div className="card-footer bg-white py-2 small text-muted">
                                Usa el check (columna derecha) para mostrar/ocultar. Los cambios se
                                guardan al confirmar en la pantalla principal.
                                </div>
                            </div>
                            </div>
                        </div>
                        </div>
                    ) : null}
                </div>

                
                {/* {getModel(model)} */}
                { canSave ?
                    <div className="row text-center">
                        <div className="col">
                            <button className="btn btn-success my-3" onClick={save_exp_res}><i class="far fa-share-square"></i> GUARDAR CAMBIOS </button>
                        </div>
                    </div>
                    : ''}
            </>
        );
    };

let _COMPONENT_DOC_RES_PDF = () => {
  const reso = _GET_EXPEDITION_JSON('reso') || {};
  const canGenPDF = true;
  if (!canGenPDF) return '';

  return (
    <>
      <hr />
      <div className="pdf-config clean-ui card p-3 shadow-sm pdf-edit">
        {/* UNA SOLA FILA: 3 tarjetas iguales */}
        <div className="row-equal">

            {/* 1) MÁRGENES */}
            <section className="card-box">
            <header className="card-title">Márgenes (cm)</header>
            <div className="fields vertical">
                <div className="field">
                <label className="field_label">Superior</label>
                <input type="number" defaultValue={1.2} className="form-control form-control-sm" id="record_maring_top_desist" />
                </div>
                <div className="field">
                <label className="field_label">Inferior</label>
                <input type="number" defaultValue={1.2} className="form-control form-control-sm" id="record_maring_bot_desist" />
                </div>
                <div className="field">
                <label className="field_label">Izquierdo</label>
                <input type="number" defaultValue={1.9} className="form-control form-control-sm" id="record_maring_left_desist" />
                </div>
                <div className="field">
                <label className="field_label">Derecho</label>
                <input type="number" defaultValue={1.9} className="form-control form-control-sm" id="record_maring_right_desist" />
                </div>
            </div>
            </section>

            {/* 2) OPCIONES */}
            <section className="card-box">
            <header className="card-title">Opciones</header>
            <div className="fields vertical">

                <label className="field">
                    <span className="field_label">Paginación</span>
                    <input type="checkbox" className="form-check-input" id="record_rew_pages_desist" defaultChecked />
                </label>

                <div className="field">
                    <label className="field_label">Espaciado encabezado</label>
                    <input
                        type="number"
                        defaultValue={6}
                        className="form-control form-control-sm"
                        id="record_header_spacing_desist"
                    />
                </div>

                <div className="field">
                    <label className="field_label">
                        Fuente Cuerpo
                        <span className="badge bg-primary ms-2">pt</span>
                    </label>
                    <input
                        type="number"
                        defaultValue={14}
                        className="form-control form-control-sm"
                        id="record_font_size_body_desist"
                    />
                </div>

                <div className="field">
                <label className="field_label">
                    Fuente Encabezado
                    <span className="badge bg-primary ms-2">pt</span>
                </label>
                <input
                    type="number"
                    defaultValue={10}
                    className="form-control form-control-sm"
                    id="record_font_size_header_desist"
                />
                </div>
                
            </div>
            </section>

            {/* 3) LOGO */}
            <section className="card-box">
            <header className="card-title">Logo</header>
            <div className="fields vertical">
                <div className="field">
                    <label className="field_label">Mostrar logo</label>
                    <select size={1} className="form-select form-select-sm" id="logo_pages_desist">
                        <option value="impar">Pág Impares</option>
                        <option value="par">Pág Pares</option>
                        <option value="all" selected>Todas las pág.</option>
                        <option value="none">No mostrar</option>
                    </select>
                </div>

                <div className="field">
                    <label className="field_label">Espaciado horizontal</label>
                    <input type="number" defaultValue={55} className="form-control form-control-sm" id="distance_icon_x_desist" />
                </div>

                <div className="field">
                    <label className="field_label">Espaciado vertical</label>
                    <input type="number" defaultValue={66} className="form-control form-control-sm" id="distance_icon_y_desist" />
                </div>

                <div className="field">
                    <label className="field_label">Autenticidad</label>
                    <select size={1} className="form-select form-select-sm" id="autenticidad_desist">
                        <option value="Original">Original</option>
                        <option value="Copia">Copia</option>
                        <option value="Vacio" selected>Vacío</option>
                    </select>
                </div>
            </div>
            </section>
        </div>

        {/* Mensaje + botón */}
        <p className="text-muted small mt-3 mb-2 text-center">
            Ajusta las opciones y usa “Editar PDF” para ver los cambios.
        </p>
    </div>

    <hr />
    <div className="row text-center">
        <div className="col">
            <MDBBtn className="btn btn-success my-3" onClick={save_exp_res}><i class="far fa-share-square"></i> GUARDAR CAMBIOS </MDBBtn>
        </div>
        <div className="col">
            {process.env.REACT_APP_GLOBAL_ID === 'cb1' && (
                <MDBBtn className="btn my-3" color="primary" onClick={() => pdf_gen_res(true)}>
                    <i className="fas fa-edit me-2" />
                    Editar PDF
                </MDBBtn>
            )}
        </div>
    </div>
    </>
  );
};


    let _MODEL_SELECTOR = () => {
        var default_model = currentRecord.model_des || 'delete';
        let models = [
            { value: 'delete', label: 'ACTA DE ELIMINACIÓN DE ARCHIVO' },
            { value: 'return', label: 'ACTA DE DEVOLUCION' },
            { value: 'transfer', label: 'ACTO DE DESGLOSE Y TRASLADO' },
        ];

        return <>
            <div className="row">
                <div className="col">
                    <label className="mt-2">ACTO</label>
                    <div class="input-group">
                        <select className="form-select" id="expedition_doc_res_model" defaultValue={default_model} onChange={(e) => {setResDocData(null); update_model(e.target.value)}}>
                            {models.map(model => {
                                if (model.omit) return ''
                                if (model.group)
                                    return <optgroup label={model.group}>
                                        {model.items.map(m => <option value={m.value}>{m.label}</option>)}
                                    </optgroup>
                                else return <option value={model.value}>{model.label}</option>
                            })}
                        </select>
                    </div>
                </div>
            </div>
        </>
    }
    // ******************************* APIS **************************** // 
    var formData = new FormData();
    let pdf_gen_res = (editDocument = null) => {
        formData = new FormData();

        formData.set('type_not', document.getElementById("type_not").value);

        let date_payment = _GET_CLOCK_STATE(3).date_start || '';
        let r_simple = document.getElementById("record_rew_simple").checked;
        formData.set('r_simple', r_simple);
        let rew_name = String(window.user.role_short + ' ' + window.user.name_full).toUpperCase();
        formData.set('r_simple_name', rew_name);
        let r_signs = document.getElementById("record_rew_signs").checked;
        formData.set('r_signs', r_signs);
        formData.set('r_pagesi', document.getElementById("record_rew_pagesi").checked);
        formData.set('r_pagesn', document.getElementById("record_rew_pagesn").checked);
        formData.set('r_pagesx', document.getElementById("record_rew_pagesx").checked);
        formData.set('logo', document.getElementById('exp_pdf_reso_logo').value);
        formData.set('model', document.getElementById('expedition_doc_res_model').value);
        formData.set('header_text', document.getElementById('expedition_doc_header_text').value);

        // Método para obtener configuracion de PDF nueva
        function applyPdfFormData(formData, suffix = 'desist') {
            const buildId = (base) => `${base}_${suffix}`;

            const getEl = (base) => {
                const id = buildId(base);
                let el = document.getElementById(id);
                if (!el) {
                el = document.getElementById(base);
                if (!el) {
                    console.warn(`[applyPdfFormData] No se encontró elemento con id="${id}" ni id="${base}"`);
                } else {
                    console.info(`[applyPdfFormData] Usando fallback id="${base}" (no encontró "${id}")`);
                }
                }
                return el;
            };

            const getSelectSingle = (base, def) => {
                const el = getEl(base);
                if (!el) return def;
                if (el.multiple) {
                const val = el.selectedOptions?.[0]?.value;
                return val || def;
                }
                const v = el.value;
                return (v == null || v === '') ? def : v;
            };

            const getNumber = (base, def) => {
                const el = getEl(base);
                if (!el) return def;
                const raw = String(el.value ?? '').trim();
                const n = Number(raw.replace(',', '.'));
                if (!Number.isFinite(n)) {
                console.warn(`[applyPdfFormData] Valor inválido en "${el.id}": "${raw}", usando default=${def}`);
                }
                return Number.isFinite(n) ? n : def;
            };

            const getCheck = (base, def = false) => {
                const el = getEl(base);
                if (!el) return def;
                return !!el.checked;
            };

            // === SELECTS (single) ===
            formData.set('logo_pages',   getSelectSingle('logo_pages',   'impar'));
            formData.set('autenticidad', getSelectSingle('autenticidad', 'Vacio'));

            // === NÚMEROS / CHECKS ===
            formData.set('font_size_body',        getNumber('record_font_size_body',   12));
            formData.set('font_size_header',      getNumber('record_font_size_header', 10));
            formData.set('distance_icon_x',       getNumber('distance_icon_x',         55));
            formData.set('distance_icon_y',       getNumber('distance_icon_y',         66));
            formData.set('record_header_spacing', getNumber('record_header_spacing',    6));

            formData.set('m_top',   getNumber('record_maring_top',   2.5));
            formData.set('m_bot',   getNumber('record_maring_bot',   2.5));
            formData.set('m_left',  getNumber('record_maring_left',  1.7));
            formData.set('m_right', getNumber('record_maring_right', 1.7));

            formData.set('r_pages',  getCheck('record_rew_pages')); // Si hay paginacion o no

            console.log('[applyPdfFormData] formData final:', Array.from(formData.entries()));
        }

        applyPdfFormData(formData, 'desist');

        formData.set('date_payment', date_payment);
        formData.set('tipo', document.getElementById('expedition_doc_res_1').value);
        formData.set('reso_date_desist', document.getElementById('expedition_doc_res_2_des').value);
        formData.set('reso_id', document.getElementById('expedition_doc_res_id').value);
        formData.set('id_public', document.getElementById('expedition_doc_res_3').value);
        formData.set('reso_pot', document.getElementById('expedition_doc_res_pot').value);
        formData.set('reso_state', document.getElementById('expedition_doc_res_state').value);
        formData.set('special_rule_1', infoCud.res_extras.art1p);

        if (document.getElementById('expedition_doc_res_old_lic')) formData.set('old_lic', document.getElementById('expedition_doc_res_old_lic').value);
        if (document.getElementById('expedition_doc_res_primero')) formData.set('primero', document.getElementById('expedition_doc_res_primero').value);
        if (document.getElementById('expedition_doc_res_primero_1')) formData.set('pimero_1', document.getElementById('expedition_doc_res_primero_1').value);
        if (document.getElementById('expedition_doc_res_primero_2')) formData.set('pimero_2', document.getElementById('expedition_doc_res_primero_2').value);
        if (document.getElementById('expedition_doc_res_primero_3')) formData.set('pimero_3', document.getElementById('expedition_doc_res_primero_3').value);
        if (document.getElementById('expedition_doc_res_primero_4')) formData.set('pimero_4', document.getElementById('expedition_doc_res_primero_4').value);
        if (document.getElementById('expedition_doc_res_primero_5')) formData.set('pimero_5', document.getElementById('expedition_doc_res_primero_5').value);
        if (document.getElementById('expedition_doc_res_primero_6')) formData.set('pimero_6', document.getElementById('expedition_doc_res_primero_6').value);
        if (document.getElementById('expedition_doc_res_primero_7')) formData.set('pimero_7', document.getElementById('expedition_doc_res_primero_7').value);
        if (document.getElementById('expedition_doc_res_primero_8')) formData.set('pimero_8', document.getElementById('expedition_doc_res_primero_8').value);
        if (document.getElementById('expedition_doc_res_negative_id')) formData.set('negative_id', document.getElementById('expedition_doc_res_negative_id').value);
        if (document.getElementById('expedition_doc_res_negative_user')) formData.set('negative_user', document.getElementById('expedition_doc_res_negative_user').value);

        if (document.getElementById('expedition_doc_res_segundo_1')) formData.set('segundo_1', document.getElementById('expedition_doc_res_segundo_1').value);
        if (document.getElementById('expedition_doc_res_segundo_2')) formData.set('segundo_2', document.getElementById('expedition_doc_res_segundo_2').value);
        if (document.getElementById('expedition_doc_res_segundo_a')) formData.set('segundo_a', document.getElementById('expedition_doc_res_segundo_a').value);

        if (document.getElementById('expedition_doc_res_tercero_1')) formData.set('tercero_1', document.getElementById('expedition_doc_res_tercero_1').value);
        if (document.getElementById('expedition_doc_res_tercero_2')) formData.set('tercero_2', document.getElementById('expedition_doc_res_tercero_2').value);
        if (document.getElementById('expedition_doc_res_tercero_3')) formData.set('tercero_3', document.getElementById('expedition_doc_res_tercero_3').value);

        if (document.getElementById('expedition_doc_res_quinto')) formData.set('quinto', document.getElementById('expedition_doc_res_quinto').value);
        if (document.getElementById('expedition_doc_res_cuarto_1')) formData.set('cuarto_1', document.getElementById('expedition_doc_res_cuarto_1').value);
        if (document.getElementById('expedition_doc_res_cuarto_cb')) formData.set('cuarto_cb', document.getElementById('expedition_doc_res_cuarto_cb').checked ? true : false);

        if (document.getElementById('expedition_doc_res_sexto_b')) formData.set('sexto_b', document.getElementById('expedition_doc_res_sexto_b').value);

        if (document.getElementById('expedition_doc_res_duty_2')) formData.set('duty_2', document.getElementById('expedition_doc_res_duty_2').value);
        if (document.getElementById('expedition_doc_res_duty_6')) formData.set('duty_6', document.getElementById('expedition_doc_res_duty_6').value);
        if (document.getElementById('expedition_doc_res_duty_9')) formData.set('duty_9', document.getElementById('expedition_doc_res_duty_9').value);
        if (document.getElementById('expedition_doc_res_duty_10')) formData.set('duty_10', document.getElementById('expedition_doc_res_duty_10').value);
        if (document.getElementById('expedition_doc_res_duty_17')) formData.set('duty_17', document.getElementById('expedition_doc_res_duty_17').value);
        if (document.getElementById('expedition_doc_res_duty_18')) formData.set('duty_18', document.getElementById('expedition_doc_res_duty_18').value);
        if (document.getElementById('expedition_doc_res_duty_19')) formData.set('duty_19', document.getElementById('expedition_doc_res_duty_19').value);
        if (document.getElementById('expedition_doc_res_duty_20')) formData.set('duty_20', document.getElementById('expedition_doc_res_duty_20').value);
        if (document.getElementById('expedition_doc_res_duty_21')) formData.set('duty_21', document.getElementById('expedition_doc_res_duty_21').value);


        if (document.getElementById('expedition_doc_res_art_1p')) formData.set('art_1p', document.getElementById('expedition_doc_res_art_1p').value);
        if (document.getElementById('expedition_doc_res_art_1_text')) formData.set('art_1_txt', document.getElementById('expedition_doc_res_art_1_text').value);
        if (document.getElementById('expedition_doc_res_art_1_cb_tb')) formData.set('art_1_cb_tb', document.getElementById('expedition_doc_res_art_1_cb_tb').checked ? true : false);
        if (document.getElementById('expedition_doc_res_art_1_text_tb')) formData.set('art_1_txt_tb', document.getElementById('expedition_doc_res_art_1_text_tb').value);

        if (document.getElementById('expedition_doc_res_art_4_1_dv')) formData.set('art_4_1', document.getElementById('expedition_doc_res_art_4_1_dv').value);
        if (document.getElementById('expedition_doc_res_art_4_2_dv')) formData.set('art_4_2', document.getElementById('expedition_doc_res_art_4_2_dv').value);
        if (document.getElementById('expedition_doc_res_art_4_p')) formData.set('art_4_p', document.getElementById('expedition_doc_res_art_4_p').value);

        if (document.getElementById('expedition_doc_res_art_5')) formData.set('art_5', document.getElementById('expedition_doc_res_art_5').value);
        if (document.getElementById('expedition_doc_res_art_7')) formData.set('art_7', document.getElementById('expedition_doc_res_art_7').value);
        if (document.getElementById('expedition_doc_res_art_8')) formData.set('art_8', document.getElementById('expedition_doc_res_art_8').value);
        if (document.getElementById('expedition_doc_res_art_8p')) formData.set('art_8p', document.getElementById('expedition_doc_res_art_8p').value);
        if (document.getElementById('expedition_doc_res_art_8p1')) formData.set('art_8p1', document.getElementById('expedition_doc_res_art_8p1').value);
        if (document.getElementById('expedition_doc_res_art_9')) formData.set('art_9', document.getElementById('expedition_doc_res_art_9').value);

        if (document.getElementById('expedition_doc_res_open_1')) formData.set('open_1', document.getElementById('expedition_doc_res_open_1').value);
        if (document.getElementById('expedition_doc_res_open_2')) formData.set('open_2', document.getElementById('expedition_doc_res_open_2').value);
        if (document.getElementById('expedition_doc_res_open_3')) formData.set('open_3', document.getElementById('expedition_doc_res_open_3').value);

        let values = []
        let values_html = document.getElementsByName('expedition_doc_res_sexto_v');
        for (let i = 0; i < values_html.length; i++) {
            const html = values_html[i];
            values.push(html.value)
        }

        formData.set('sexto_v', values.join(';'));

        values = []
        values_html = document.getElementsByName('expedition_doc_res_segundo_cb');
        for (let i = 0; i < values_html.length; i++) {
            const html = values_html[i];
            values.push(html.checked)
        }
        formData.set('segundo_cb', values.join(','));

        values = []
        values_html = document.getElementsByName('expedition_doc_res_tercero_cb');
        for (let i = 0; i < values_html.length; i++) {
            const html = values_html[i];
            values.push(html.checked)
        }
        formData.set('tercero_cb', values.join(','));

        values = []
        values_html = document.getElementsByName('expedition_doc_res_sexto_cb');
        for (let i = 0; i < values_html.length; i++) {
            const html = values_html[i];
            values.push(html.checked)
        }
        formData.set('sexto_cb', values.join(','));

        values = []
        values_html = document.getElementsByName('expedition_doc_res_sexto_v_cb');
        for (let i = 0; i < values_html.length; i++) {
            const element = values_html[i];
            if (element.checked === true) values.push(1)
            else values.push(0)
        }
        formData.set('sexto_v_cb', values.join(','));

        values = []
        values_html = document.getElementsByName('expedition_doc_res_duty_cb');
        for (let i = 0; i < values_html.length; i++) {
            const html = values_html[i];
            values.push(html.checked)
        }
        formData.set('duty_cb', values.join(','));

        values = []
        values_html = document.getElementsByName('expedition_doc_res_art_1_cb');
        for (let i = 0; i < values_html.length; i++) {
            const html = values_html[i];
            values.push(html.checked)
        }
        formData.set('art_1_cb', values.join(','));

        values = []
        values_html = document.getElementsByName('expedition_doc_res_arts_cb');
        for (let i = 0; i < values_html.length; i++) {
            const html = values_html[i];
            values.push(html.checked)
        }
        formData.set('arts_cb', values.join(','));

        values = []
        values_html = document.getElementsByName('expedition_doc_res_septimo_cb');
        for (let i = 0; i < values_html.length; i++) {
            const html = values_html[i];
            values.push(html.checked)
        }
        formData.set('septimo_cb', values.join(','));

        values = []
        values_html = document.getElementsByName('expedition_doc_res_c_parcon');
        for (let i = 0; i < values_html.length; i++) {
            const html = values_html[i];
            values.push(html.value)
        }
        formData.set('parcon', values.join('&&'));

        values = []
        values_html = document.getElementsByName('expedition_doc_res_c_sub');
        for (let i = 0; i < values_html.length; i++) {
            const html = values_html[i];
            values.push(html.value)
        }
        formData.set('sub', values.join('&&'));

        values = []
        values_html = document.getElementsByName('expedition_doc_reso_open_cb');
        for (let i = 0; i < values_html.length; i++) {
            const html = values_html[i];
            values.push(html.checked)
        }
        formData.set('open_cb', values.join(','));

        formData.set('r_sign_align', document.getElementById('exp_pdf_reso_1').value);
        formData.set('curaduria', infoCud.job);
        formData.set('ciudad', infoCud.city);
        formData.set('record_version', 1);
        formData.set('record_eje', document.getElementById('exp_pdf_reso_record_version').value);
        formData.set('id', currentItem.id);
        
        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });

        EXPEDITION_SERVICE.gen_doc_res(formData)
            .then(response => {
                if (response.data.status  === 'OK') {
                    if (editDocument) {
                        let data = {
                            ...(response.data || {}),
                            fun_2_child: _GET_CHILD_2(),
                            list_documents: listDocuments,
                            internal_documents: documents,
                        };
                        setResDocData(data); 
                        MySwal.close();
                    }
                } else {
                    MySwal.fire({
                        title: swaMsg.generic_eror_title,
                        text: swaMsg.generic_error_text,
                        icon: 'warning',
                        confirmButtonText: swaMsg.text_btn,
                    });
                }
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: swaMsg.generic_eror_title,
                    text: swaMsg.generic_error_text,
                    icon: 'warning',
                    confirmButtonText: swaMsg.text_btn,
                });
            });

    }

    let save_exp_res = (e) => {
        e.preventDefault();
        setResDocData(null);

        var _CHILD_1 = _GET_CHILD_1();

        let id_public = document.getElementById("expedition_doc_res_id").value;
        formData.set('id_public', id_public);
        if (currentRecord.id_public) formData.set('prev_id_public', currentRecord.id_public);

        let reso = _GET_EXPEDITION_JSON('reso');

        reso.type = document.getElementById('expedition_doc_res_1').value;
        reso.reso_date_desist = document.getElementById("expedition_doc_res_2_des").value;
        reso.date = reso.date || '';
        reso.state = document.getElementById("expedition_doc_res_state").value;
        reso.pot = document.getElementById("expedition_doc_res_pot").value;
        reso.eje = document.getElementById('exp_pdf_reso_record_version').value;
        reso.header_text = document.getElementById('expedition_doc_header_text').value;

        reso.primero = document.getElementById("expedition_doc_res_primero") ? document.getElementById("expedition_doc_res_primero").value : '';
        reso.primero_1 = document.getElementById("expedition_doc_res_primero_1") ? document.getElementById("expedition_doc_res_primero_1").value : '';
        reso.primero_2 = document.getElementById("expedition_doc_res_primero_2") ? document.getElementById("expedition_doc_res_primero_2").value : '';
        reso.primero_3 = document.getElementById("expedition_doc_res_negative_id") ? document.getElementById("expedition_doc_res_negative_id").value : '';
        reso.primero_4 = document.getElementById("expedition_doc_res_negative_user") ? document.getElementById("expedition_doc_res_negative_user").value : '';
        reso.primero_5 = document.getElementById("expedition_doc_res_primero_5") ? document.getElementById("expedition_doc_res_primero_5").value : '';


        reso.segundo_1 = document.getElementById("expedition_doc_res_segundo_1") ? document.getElementById("expedition_doc_res_segundo_1").value : '';
        reso.segundo_2 = document.getElementById("expedition_doc_res_segundo_2") ? document.getElementById("expedition_doc_res_segundo_2").value : '';

        let checks = [];
        let checks_html;

        if (_CHILD_1.tipo.includes('F')) {
            reso.tercero_1 = document.getElementById("expedition_doc_res_tercero_1") ? document.getElementById("expedition_doc_res_tercero_1").value : '';
            reso.tercero_2 = document.getElementById("expedition_doc_res_tercero_2") ? document.getElementById("expedition_doc_res_tercero_2").value : '';

            checks = [];
            checks_html = document.getElementsByName('expedition_doc_res_tercero_cb');
            for (let i = 0; i < checks_html.length; i++) {
                const element = checks_html[i];
                if (element.checked === true) checks.push(1)
                else checks.push(0)
            }
            reso.tercero_cb = checks.join(',');
        }

        reso.quinto = document.getElementById("expedition_doc_res_quinto") ? document.getElementById("expedition_doc_res_quinto").checked ? 1 : 0 : 0;
        reso.cuarto_1 = document.getElementById("expedition_doc_res_cuarto_1") ? document.getElementById("expedition_doc_res_cuarto_1").value : '';
        reso.cuarto_cb = document.getElementById("expedition_doc_res_cuarto_cb") ? document.getElementById("expedition_doc_res_cuarto_cb").checked ? 1 : 0 : 0;


        reso.sexto_b = document.getElementById("expedition_doc_res_sexto_b") ? document.getElementById("expedition_doc_res_sexto_b").value : '';


        let values = [];
        let values_html = document.getElementsByName('expedition_doc_res_segundo_cb');
        for (let i = 0; i < values_html.length; i++) {
            const element = values_html[i];
            if (element.checked === true) values.push(1)
            else values.push(0)
        }
        reso.segundo_cb = values.join(';');
        reso.segundo_a =  document.getElementsByName('expedition_doc_res_segundo_a').value;


        values = [];
        values_html = document.getElementsByName('expedition_doc_res_sexto_v');
        for (let i = 0; i < values_html.length; i++) {
            const element = values_html[i];
            values.push(element.value)
        }
        reso.sexto_v = values.join(';');

        checks = [];
        checks_html = document.getElementsByName('expedition_doc_res_sexto_cb');
        for (let i = 0; i < checks_html.length; i++) {
            const element = checks_html[i];
            if (element.checked === true) checks.push(1)
            else checks.push(0)
        }
        reso.sexto_cb = checks.join(',');

        checks = [];
        checks_html = document.getElementsByName('expedition_doc_res_sexto_v_cb');
        for (let i = 0; i < checks_html.length; i++) {
            const element = checks_html[i];
            if (element.checked === true) checks.push(1)
            else checks.push(0)
        }
        reso.sexto_v_cb = checks.join(',');

        checks = [];
        checks_html = document.getElementsByName('expedition_doc_res_duty_cb');
        for (let i = 0; i < checks_html.length; i++) {
            const element = checks_html[i];
            if (element.checked === true) checks.push(1)
            else checks.push(0)
        }

        reso.duty_cb = checks.join(',');

        checks = [];
        checks_html = document.getElementsByName('expedition_doc_res_art_1_cb');
        for (let i = 0; i < checks_html.length; i++) {
            const element = checks_html[i];
            if (element.checked === true) checks.push(1)
            else checks.push(0)
        }

        reso.art_1_cb = checks.join(',');

        checks = [];
        checks_html = document.getElementsByName('expedition_doc_res_arts_cb');
        for (let i = 0; i < checks_html.length; i++) {
            const element = checks_html[i];
            if (element.checked === true) checks.push(1)
            else checks.push(0)
        }

        reso.arts_cb = checks.join(',');

        checks = [];
        checks_html = document.getElementsByName('expedition_doc_res_septimo_cb');
        for (let i = 0; i < checks_html.length; i++) {
            const element = checks_html[i];
            if (element.checked === true) checks.push(1)
            else checks.push(0)
        }

        values = [];
        values_html = document.getElementsByName('expedition_doc_res_c_parcon');
        for (let i = 0; i < values_html.length; i++) {
            const element = values_html[i];
            values.push(element.value)
        }
        reso.parcon = values.join('&&');

        values = [];
        values_html = document.getElementsByName('expedition_doc_res_c_sub');
        for (let i = 0; i < values_html.length; i++) {
            const element = values_html[i];
            values.push(element.value)
        }
        reso.sub = values.join('&&');

        reso.septimo_cb = checks.join(',');

        reso.old_lic = document.getElementById("expedition_doc_res_old_lic") ? document.getElementById("expedition_doc_res_old_lic").value : '';

        reso.duty_2 = document.getElementById("expedition_doc_res_duty_2") ? document.getElementById("expedition_doc_res_duty_2").value : '';
        reso.duty_6 = document.getElementById("expedition_doc_res_duty_6") ? document.getElementById("expedition_doc_res_duty_6").value : '';
        reso.duty_9 = document.getElementById("expedition_doc_res_duty_9") ? document.getElementById("expedition_doc_res_duty_9").value : '';
        reso.duty_10 = document.getElementById("expedition_doc_res_duty_10") ? document.getElementById("expedition_doc_res_duty_10").value : '';
        reso.duty_17 = document.getElementById("expedition_doc_res_duty_17") ? document.getElementById("expedition_doc_res_duty_17").value : '';
        reso.duty_18 = document.getElementById("expedition_doc_res_duty_18") ? document.getElementById("expedition_doc_res_duty_18").value : '';
        reso.duty_19 = document.getElementById("expedition_doc_res_duty_19") ? document.getElementById("expedition_doc_res_duty_19").value : '';
        reso.duty_20 = document.getElementById("expedition_doc_res_duty_20") ? document.getElementById("expedition_doc_res_duty_20").value : '';
        reso.duty_21 = document.getElementById("expedition_doc_res_duty_21") ? document.getElementById("expedition_doc_res_duty_21").value : '';

        reso.art_1_txt = document.getElementById("expedition_doc_res_art_1_text") ? document.getElementById("expedition_doc_res_art_1_text").value : '';
        reso.art_1_cb_tb = document.getElementById("expedition_doc_res_art_1_cb_tb") ? document.getElementById("expedition_doc_res_art_1_cb_tb").checked ? 1 : 0 : 0;
        reso.art_1_txt_tb = document.getElementById("expedition_doc_res_art_1_text_tb") ? document.getElementById("expedition_doc_res_art_1_text_tb").value : '';

        reso.art_4_1 = document.getElementById("expedition_doc_res_art_4_1_dv") ? document.getElementById("expedition_doc_res_art_4_1_dv").value : '';
        reso.art_4_2 = document.getElementById("expedition_doc_res_art_4_2_dv") ? document.getElementById("expedition_doc_res_art_4_2_dv").value : '';
        reso.art_4_p = document.getElementById('expedition_doc_res_art_4_p') ? document.getElementById('expedition_doc_res_art_4_p').value : '';

        reso.art_1p = document.getElementById("expedition_doc_res_art_1p") ? document.getElementById("expedition_doc_res_art_1p").value : '';
        reso.art_5 = document.getElementById("expedition_doc_res_art_5") ? document.getElementById("expedition_doc_res_art_5").value : '';
        reso.art_7 = document.getElementById("expedition_doc_res_art_7") ? document.getElementById("expedition_doc_res_art_7").value : '';
        reso.art_8 = document.getElementById("expedition_doc_res_art_8") ? document.getElementById("expedition_doc_res_art_8").value : '';
        reso.art_8p = document.getElementById("expedition_doc_res_art_8p") ? document.getElementById("expedition_doc_res_art_8p").value : '';
        reso.art_8p1 = document.getElementById("expedition_doc_res_art_8p1") ? document.getElementById("expedition_doc_res_art_8p1").value : '';
        reso.art_9 = document.getElementById("expedition_doc_res_art_9") ? document.getElementById("expedition_doc_res_art_9").value : '';

        reso.open_1 = document.getElementById("expedition_doc_res_open_1") ? document.getElementById("expedition_doc_res_open_1").value : '';
        reso.open_2 = document.getElementById("expedition_doc_res_open_2") ? document.getElementById("expedition_doc_res_open_2").value : '';
        reso.open_3 = document.getElementById("expedition_doc_res_open_3") ? document.getElementById("expedition_doc_res_open_3").value : '';
        checks = [];
        checks_html = document.getElementsByName('expedition_doc_reso_open_cb');
        for (let i = 0; i < checks_html.length; i++) {
            const element = checks_html[i];
            if (element.checked === true) checks.push(1)
            else checks.push(0)
        }
        reso.open_cb = checks.join(',');

        // --- LISTA DE DOCUMENTOS (array) -> reso.list_docs_exp ---
        if (!Array.isArray(reso.list_docs_exp)) reso.list_docs_exp = [];

        const nextListDocsState = [];
        (listDocuments || []).forEach(row => {
        const id = row.uid; // estable

        const nameEl = document.getElementById(`ldoc_${id}_name`);
        const vrEl   = document.getElementById(`ldoc_${id}_vr`);     // <-- NEW
        const dateEl = document.getElementById(`ldoc_${id}_fecha`);
        const folEl  = document.getElementById(`ldoc_${id}_folios`);
        const showEl = document.getElementById(`ldoc_${id}_show`);

        const name  = (nameEl?.value ?? row.name  ?? '').trim();
        const vr    = (vrEl?.value   ?? row.id_public ?? '').trim(); // <-- NEW
        const date  = (dateEl?.value ?? row.date  ?? '').trim();
        const pages = (folEl?.value  ?? row.pages ?? row.page ?? '').trim();
        const show  = !!(showEl?.checked ?? row.show ?? true);

        nextListDocsState.push({
            ...row,
            id_public: vr,       // <-- guardar VR
            name, date,
            pages,
            page: pages,         // compat
            show,
        });
        });

        reso.list_docs_exp = nextListDocsState;  // array, no string


        if ((currentRecord.model_des || 'delete') === "delete") {
            if (!reso.documents) reso.documents = {};

            const nextResoDocuments = { ...reso.documents };

            // documents es OBJETO: recórrelo con Object.entries
            Object.entries(documents || {}).forEach(([id, doc]) => {
                // Lee inputs por ID (name, fecha y folios)
                const nameEl  = document.getElementById(`doc_${id}_name`);
                const dateEl  = document.getElementById(`doc_${id}_fecha`);
                const pagesEl = document.getElementById(`doc_${id}_folios`);

                const name  = (nameEl?.value  ?? doc?.name  ?? nextResoDocuments[id]?.name  ?? '').trim();
                const date  = (dateEl?.value  ?? doc?.date  ?? nextResoDocuments[id]?.date  ?? '').trim();
                const pages = (pagesEl?.value ?? doc?.pages ?? nextResoDocuments[id]?.pages ?? '').trim();

                // 'show' ya lo cambias con el botón (estado global)
                const show = doc?.show !== false;

                // Hidrata/actualiza una sola fuente de verdad
                nextResoDocuments[id] = {
                ...(nextResoDocuments[id] || {}),
                name,
                date,
                pages,
                show,
                };
            });

            // Actualiza estado y BD con el MISMO objeto (coherente con el render)
            reso.documents = nextResoDocuments;
        }


        formData.set('reso', JSON.stringify(reso));

        // Método para obtener configuracion de PDF nueva
        function applyPdfFormData(formData, suffix = 'desist') {
            const buildId = (base) => `${base}_${suffix}`;

            const getEl = (base) => {
                const id = buildId(base);
                let el = document.getElementById(id);
                if (!el) {
                el = document.getElementById(base);
                if (!el) {
                    console.warn(`[applyPdfFormData] No se encontró elemento con id="${id}" ni id="${base}"`);
                } else {
                    console.info(`[applyPdfFormData] Usando fallback id="${base}" (no encontró "${id}")`);
                }
                }
                return el;
            };

            const getSelectSingle = (base, def) => {
                const el = getEl(base);
                if (!el) return def;
                if (el.multiple) {
                const val = el.selectedOptions?.[0]?.value;
                return val || def;
                }
                const v = el.value;
                return (v == null || v === '') ? def : v;
            };

            const getNumber = (base, def) => {
                const el = getEl(base);
                if (!el) return def;
                const raw = String(el.value ?? '').trim();
                const n = Number(raw.replace(',', '.'));
                if (!Number.isFinite(n)) {
                console.warn(`[applyPdfFormData] Valor inválido en "${el.id}": "${raw}", usando default=${def}`);
                }
                return Number.isFinite(n) ? n : def;
            };

            const getCheck = (base, def = false) => {
                const el = getEl(base);
                if (!el) return def;
                return !!el.checked;
            };

            // === SELECTS (single) ===
            formData.set('logo_pages',   getSelectSingle('logo_pages',   'impar'));
            formData.set('autenticidad', getSelectSingle('autenticidad', 'Vacio'));

            // === NÚMEROS / CHECKS ===
            formData.set('font_size_body',        getNumber('record_font_size_body',   12));
            formData.set('font_size_header',      getNumber('record_font_size_header', 10));
            formData.set('distance_icon_x',       getNumber('distance_icon_x',         55));
            formData.set('distance_icon_y',       getNumber('distance_icon_y',         66));
            formData.set('record_header_spacing', getNumber('record_header_spacing',    6));

            formData.set('m_top',   getNumber('record_maring_top',   2.5));
            formData.set('m_bot',   getNumber('record_maring_bot',   2.5));
            formData.set('m_left',  getNumber('record_maring_left',  1.7));
            formData.set('m_right', getNumber('record_maring_right', 1.7));

            formData.set('r_pages',  getCheck('record_rew_pages')); // Si hay paginacion o no

            console.log('[applyPdfFormData] formData final:', Array.from(formData.entries()));
        }

        applyPdfFormData(formData, 'desist');
        manage_exp();

    }
    let update_model = (model) => {
        formData = new FormData();
        formData.set('model_des', model);
        manage_exp();
    }
    let manage_exp = () => {
        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        EXPEDITION_SERVICE.update(currentRecord.id, formData)
            .then(response => {
                if (response.data === 'OK') {
                    MySwal.fire({
                        title: swaMsg.publish_success_title,
                        text: swaMsg.publish_success_text,
                        footer: swaMsg.text_footer,
                        icon: 'success',
                        confirmButtonText: swaMsg.text_btn,
                    });

                    props.requestUpdateRecord(currentItem.id);
                    props.requestUpdate(currentItem.id);
                } else if (response.data === 'ERROR_DUPLICATE') {
                    MySwal.fire({
                        title: "ERROR DE DUPLICACION",
                        text: "El consecutivo CUB de este formulario ya existe, debe de elegir un consecutivo nuevo",
                        icon: 'error',
                        confirmButtonText: swaMsg.text_btn,
                    });
                }
                else {
                    MySwal.fire({
                        title: swaMsg.generic_eror_title,
                        text: swaMsg.generic_error_text,
                        icon: 'warning',
                        confirmButtonText: swaMsg.text_btn,
                    });
                }
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: swaMsg.generic_eror_title,
                    text: swaMsg.generic_error_text,
                    icon: 'warning',
                    confirmButtonText: swaMsg.text_btn,
                });
            });
    }
    return (
        <div>
            <div>
                {_MODEL_SELECTOR()}
    
                    {_COMPONENT_DOC_RES()}
                    {_COMPONENT_DOC_RES_PDF()}
               

                <div>
                    {process.env.REACT_APP_GLOBAL_ID === 'cb1' && resDocData && (
                        <EXP_RES_2 data={resDocData} swaMsg={swaMsg} currentItem={currentItem} currentModel={currentRecord.model_des || 'delete'}/>
                    )}
                </div>  
                
            </div>
        </div>
    );
}
