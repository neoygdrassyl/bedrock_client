import { procesarFecha } from './BusinessDaysCol';

export class BaseDocumentUtils {
  constructor(data, htmlString) {
    this.data = data;
    this._DATA = data?._DATA ?? null;
    this.curaduriaId = data?.curaduriaInfo?.id ?? null;
    this.curaduriaInfo = data?.curaduriaInfo ?? null;
    let tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlString;
    this.tempDiv = tempDiv;
    this.setAutenticidad();

    this.notify_date = 
      this.getDateByState(-21) || this.getDateByState(-22)  || this.getDateByState(-20)  || //Si hay recurso
      this.getDateByState(-8) || this.getDateByState(-7)  || this.getDateByState(-5)  || //No hay recurso
      "";
    this.exec_date = this.getDateByState(99) || this.getDateBussinesDaysCol(this.notify_date) || "";
  }

  setAutenticidad(){
    let autenticidad = this.data.autenticidad;

    if (autenticidad!='Vacio'){
      this.showDiv("autenticidad","inline");
      this.setText("autenticidad", autenticidad);
    }
  }

  getDateBussinesDaysCol(date, days_after = 11) {
    try {
      const fecha = procesarFecha(date, days_after);
      if (fecha == null) throw new Error('Resultado nulo/indefinido');
      if (fecha instanceof Date) {
        if (isNaN(fecha.getTime())) throw new Error('Date inválida');
        return fecha;
      }
      if (typeof fecha === 'string') {
        const d = new Date(fecha);
        if (isNaN(d.getTime())) throw new Error('String de fecha inválido');
        return fecha;
      }
      throw new Error('Tipo de dato inesperado');
    } catch (_) {
      return 'Fecha Inválida';
    }
  }

  showDiv(id, state = "block") {
    const div = this.tempDiv.querySelector(`#${id}`);
    if (div) {
      div.style.display = state;
      console.log(`✅ Se mostró el div con ID: #${id}`);
    } else {
      console.error(`❌ No se encontró el div con ID: #${id}`);
    }
  }

  getJSON_Simple(objec) {
    let json = objec;
    let whileSafeBreaker = 0;
    while (typeof json !== "object") {
      try {
        json = JSON.parse(json);
      } catch (error) {
        return false;
      }
      if (++whileSafeBreaker === 10) return false;
    }
    return json;
  }

  LOAD_STEP(_id_public, record) {
    const sources = {
      eng: this._DATA.record_eng?.record_eng_steps,
      arc: this._DATA.record_arc?.record_arc_steps,
      law: this._DATA.record_law?.record_law_steps,
    };

    const _CHILD = sources[record] || [];

    for (let i = 0; i < _CHILD.length; i++) {
      if (
        _CHILD[i].version === this._DATA.version &&
        _CHILD[i].id_public === _id_public
      ) {
        return _CHILD[i];
      }
    }

    return [];
  }

  _GET_STEP_TYPE_JSON(_id_public, _type, record) {
    const STEP = this.LOAD_STEP(_id_public, record);
    return STEP?.[_type] ?? {};
  }

  _GET_STEP_TYPE(_id_public, _type, record) {
    var STEP = this.LOAD_STEP(_id_public, record);
    if (!STEP) return [];
    if (!STEP.id) return [];
    var value = STEP[_type] ? STEP[_type] : [];
    if (!value.length) return [];
    value = value.split(";");
    return value;
  }

  _ADD_AREAS_H = (_areas, key, i, filter) => {
    let sum = 0;
    _areas.map((areas) => {
      let value = areas[key] ? areas[key].split(";") : [];
      if (!filter) {
        let area = value[i] ? value[i] : 0;
        sum += Number(area);
      }
      if (filter) {
        let use = String(areas.use).toLowerCase();
        if (!use) use = "otro";
        if (filter.includes(use)) {
          let area = value[i] ? value[i] : 0;
          sum += Number(area);
        }
      }
    });

    return sum.toFixed(2);
  };

  _ADD_AREAS_I = (_array, i, filter) => {
    if (!_array) return 0;
    let sum = 0;

    _array.map((areas) => {
      if (!filter) {
        var area = areas.build ? areas.build.split(",") : 0;
        sum += Number(area[i]) || 0;
      }
      if (filter) {
        let use = String(areas.use).toLowerCase();
        if (!use) use = "otro";
        if (filter.includes(use)) {
          var area = areas.build ? areas.build.split(",") : 0;
          sum += Number(area[i]) || 0;
        }
      }
    });

    return sum.toFixed(2);
  };

  dateParser(date) {
    const moment = require("moment");
    let esLocale = require("moment/locale/es");
    var momentLocale = moment(date, "YYYY-MM-DD").locale("es", esLocale);
    return momentLocale.format("LL");
  }

  getDateByState(s) {
    if (this.data?.clocks === undefined) return null;
    return (this.data?.clocks.find(c => Number(c?.state) === s && c?.date_start && !Number.isNaN(Date.parse(c.date_start)))?.date_start) ?? null;
  }

  capFirstOnly = s => s.toLowerCase().replace(/^(\s*)(\S)/, (_, sp, ch) => sp + ch.toUpperCase());

  createLetteredList(items) {
    const list = document.createElement("div");
    list.classList.add("considerative-list");

    items.forEach((item, index) => {
      const row = document.createElement("div");
      row.classList.add("considerative-item");

      const label = document.createElement("strong");
      label.classList.add("label");
      label.textContent = `${String.fromCharCode(97 + index)}.`; // a, b, c...

      const text = document.createElement("div");
      text.classList.add("text");
      text.textContent = item.trim();

      row.appendChild(label);
      row.appendChild(text);
      list.appendChild(row);
    });

    return list;
  }

  syncAreasTableHeaderHeight() {
    const t1Head = this.tempDiv.querySelector("#table-331 thead");
    const t2Head = this.tempDiv.querySelector("#table-341 thead");
    if (!t1Head || !t2Head) return;

    // Reiniciar altura para medir correctamente
    t1Head.style.height = "auto";
    t2Head.style.height = "auto";

    console.log("t1Head", t1Head);
    console.log("t2Head", t2Head);

    // Calcular alturas reales
    const h1 = t1Head.offsetHeight;
    const h2 = t2Head.offsetHeight;
    console.log("h1", h1);
    console.log("h2", h2);
    const maxH = Math.max(h1, h2);

    console.log("maxH", maxH);

    // Aplicar altura unificada
    t1Head.style.height = maxH + "px";
    t2Head.style.height = maxH + "px";
  }

  setEqualColumnWidths(table) {
    // borra colgroup anterior si existe
    const old = table.querySelector("colgroup");
    if (old) old.remove();

    // cuenta columnas de la 2ª fila de thead (la detallada)
    const headerRow = table.querySelector("thead tr:nth-child(2)");
    const totalCols = headerRow ? headerRow.children.length : 0;
    if (!totalCols) return;

    const colgroup = document.createElement("colgroup");
    const w = 100 / totalCols + "%";
    for (let i = 0; i < totalCols; i++) {
      const col = document.createElement("col");
      col.style.width = w; // todas iguales
      colgroup.appendChild(col);
    }
    table.insertBefore(colgroup, table.firstChild);
  }

  getHiddenData(id) {
    const element = this.tempDiv.querySelector(`#${id}`);
    return element ? element.textContent.trim() : null;
  }

  setText(id, text) {
    const el = this.tempDiv.querySelector(`#${id}`);
    if (el) el.textContent = text;
  }

  hideDiv(id) {
    this.showDiv(id, "none");
  }

  VV = (val, df) => {
    if (val === "NO") return "";
    if (val) return val;
    if (df) return df;
    return "";
  };
  CV = (val, dv) => {
    if (val == "0") return "NO";
    if (val == "1") return "SI";
    if (val == "2") return "NA";
    if (dv != undefined || dv != null) {
      if (dv == "0") return "NO";
      if (dv == "1") return "SI";
      if (dv == "2") return "NA";
    }
    return "";
  };

  CV3 = (val) => {
    if (val == "0") return "CON R.";
    if (val == "1") return "SIN R.";
    return "";
  };

  CV2 = (val) => {
    if (val == 0) return "NO CUMPLE";
    if (val == 1) return "CUMPLE";
    if (val == 2) return "NO APLICA";
    return "";
  };

  renderEdificabilidad(CV2, VV) {
    let _CHECK_ARRAY_34 = this.data._areas_table?.table_3_4._CHECK_ARRAY || [];
    let _VALUE_ARRAY_34 = this.data._areas_table?.table_3_4._VALUE_ARRAY || [];

    let con_edif = _CHECK_ARRAY_34[1] != "2" || _CHECK_ARRAY_34[2] != "2";
    let con_volumen = this.data._areas_table?.table_3_4.con_volumen || false;
    let excs = this.data._areas_table?.table_3_4?.excs || [""];
    let content = 0;
    if (con_edif) {
      this.showDiv("table-334-1aa", "table-row");
      content++;
    }
    if (_CHECK_ARRAY_34[1] != "2") {
      this.setText("table-334-ocupacion-dato", VV(_VALUE_ARRAY_34[6]));
      this.setText("table-334-ocupacion-norma", VV(_VALUE_ARRAY_34[3]));
      this.setText("table-334-ocupacion-proyecto", VV(_VALUE_ARRAY_34[4]));
      this.setText(
        "table-334-ocupacion-eval",
        _VALUE_ARRAY_34[5] == "NO"
          ? CV2(_CHECK_ARRAY_34[1])
          : excs[_VALUE_ARRAY_34[5]] || "Excep."
      );
      content++;
    }
    if (_CHECK_ARRAY_34[1] != "2") {
      this.setText("table-334-construccion-dato", VV(_VALUE_ARRAY_34[10]));
      this.setText("table-334-construccion-norma", VV(_VALUE_ARRAY_34[7]));
      this.setText("table-334-construccion-proyecto", VV(_VALUE_ARRAY_34[8]));
      this.setText(
        "table-334-construccion-eval",
        _VALUE_ARRAY_34[9] == "NO"
          ? CV2(_CHECK_ARRAY_34[2])
          : excs[_VALUE_ARRAY_34[9]] || "Excep."
      );
      content++;
    }

    if (!content) {
      this.showDiv("table-341", "none");
    }
  }

  renderVolumen(CV2, VV) {
    let _CHECK_ARRAY_34 = this.data._areas_table?.table_3_4._CHECK_ARRAY || [];
    let _VALUE_ARRAY_34 = this.data._areas_table?.table_3_4._VALUE_ARRAY || [];

    let con_edif = _CHECK_ARRAY_34[1] != "2" || _CHECK_ARRAY_34[2] != "2";
    let con_volumen = this.data._areas_table?.table_3_4.con_volumen || false;
    let excs = this.data._areas_table?.table_3_4?.excs || [""];

    if (!con_volumen) {
      this.showDiv("table-3342", "none");
    } else {
      if (_CHECK_ARRAY_34[0] != "2") {
        this.showDiv("table-334-tipo-edi", "table-row");
        this.setText("table-334-tipo-edi-norma", VV(_VALUE_ARRAY_34[0]));
        this.setText("table-334-tipo-edi-proyecto", VV(_VALUE_ARRAY_34[1]));
        this.setText(
          "table-334-tipo-edi-eval",
          _VALUE_ARRAY_34[2] == "NO"
            ? CV2(_CHECK_ARRAY_34[0])
            : excs[_VALUE_ARRAY_34[2]] || "Excep."
        );
      }

      if (_CHECK_ARRAY_34[3] != "2") {
        this.showDiv("table-334-pisos", "table-row");
        this.setText("table-334-pisos-norma", VV(_VALUE_ARRAY_34[11]));
        this.setText("table-334-pisos-proyecto", VV(_VALUE_ARRAY_34[12]));
        this.setText(
          "table-334-pisos-eval",
          _VALUE_ARRAY_34[13] == "NO"
            ? CV2(_CHECK_ARRAY_34[3])
            : excs[_VALUE_ARRAY_34[13]] || "Excep."
        );
      }

      if (_CHECK_ARRAY_34[4] != "2") {
        this.showDiv("table-334-semisotano", "table-row");
        this.setText("table-334-semisotano-norma", VV(_VALUE_ARRAY_34[18]));
        this.setText("table-334-semisotano-proyecto", VV(_VALUE_ARRAY_34[19]));
        this.setText("table-334-semisotano-eval", CV2(_VALUE_ARRAY_34[4]));
      }

      if (_CHECK_ARRAY_34[5] != "2") {
        this.showDiv("table-334-sotano", "table-row");
        this.setText("table-334-sotano-norma", VV(_VALUE_ARRAY_34[22]));
        this.setText("table-334-sotano-proyecto", VV(_VALUE_ARRAY_34[23]));
        this.setText("table-334-sotano-eval", CV2(_VALUE_ARRAY_34[5]));
      }
    }
  }

  addAislamientoRow(CV2, VV, tableId, chkIdx, txtIdx, norIdx, proIdx, evIdx) {
    const tbody = this.tempDiv.querySelector(`#${tableId} tbody`);
    const check = this.data._areas_table.table_3_4._CHECK_ARRAY[chkIdx];
    if (check === "2") return;

    const tr = document.createElement("tr");

    // 1) Texto (sin "Aislamiento ")
    const tdTxt = document.createElement("td");
    tdTxt.classList.add("text-left");
    tdTxt.textContent = String(
      VV(this.data._areas_table.table_3_4._VALUE_ARRAY[txtIdx])
    ).replace("Aislamiento ", "");
    tr.appendChild(tdTxt);

    // 2) Norma
    const tdNor = document.createElement("td");
    tdNor.textContent = VV(
      this.data._areas_table.table_3_4._VALUE_ARRAY[norIdx]
    );
    tr.appendChild(tdNor);

    // 3) Proyecto
    const tdPro = document.createElement("td");
    tdPro.textContent = VV(
      this.data._areas_table.table_3_4._VALUE_ARRAY[proIdx]
    );
    tr.appendChild(tdPro);

    // 4) Eval. / Excep.
    const tdEv = document.createElement("td");
    const excs = this.data._areas_table.table_3_4.excs || [];
    if (evIdx === null) {
      tdEv.textContent = CV2(check);
    } else {
      const evVal = this.data._areas_table.table_3_4._VALUE_ARRAY[evIdx];
      tdEv.textContent = evVal === "NO" ? CV2(check) : excs[evVal] || "Excep.";
    }
    tr.appendChild(tdEv);

    tbody.appendChild(tr);
  }

  renderAislamientos(CV2, VV) {
    const chk = this.data._areas_table.table_3_4._CHECK_ARRAY;
    const val = this.data._areas_table.table_3_4._VALUE_ARRAY;
    let rowsAdded = 0;

    const tryAdd = (...args) => {
      const [tableId, chkIdx] = args;
      if (chk[chkIdx] !== "2") {
        this.addAislamientoRow(CV2, VV, ...args);
        rowsAdded++;
      }
    };

    tryAdd("table-3343", 6, 69, 26, 27, 62);
    tryAdd("table-3343", 7, 70, 30, 31, 63);
    tryAdd("table-3343", 8, 71, 34, 35, 64);
    tryAdd("table-3343", 9, 72, 38, 39, 65);
    tryAdd("table-3343", 11, 74, 46, 47, 66);
    tryAdd("table-3343", 12, 75, 50, 51, null);
    tryAdd("table-3343", 13, 76, 54, 55, null);
    tryAdd("table-3343", 14, 77, 58, 59, null);
    tryAdd("table-3343", 15, 78, 82, 79, null);

    if (rowsAdded === 0) {
      this.showDiv("table-3343", "none");
    }
  }

  renderExcepciones() {
    if (!this.data._areas_table.table_3_4.excps_array) {
      this.showDiv("table-3344-excepciones", "none");
      return;
    }

    const tbody = this.tempDiv.querySelector("#table-3344-excepciones tbody");
    const chk = this.data._areas_table.table_3_4._CHECK_ARRAY;
    const val = this.data._areas_table.table_3_4._VALUE_ARRAY;
    const excs = this.data._areas_table.table_3_4.excs || [];
    const excps = [];

    // recoge sólo las excepciones únicas y válidas
    [5, 9].forEach((i) => {
      if (!excps.includes(val[i]) && val[i] !== "NO") excps.push(val[i]);
    });
    [
      [0, 2],
      [3, 13],
      [6, 62],
      [7, 63],
      [8, 64],
      [9, 65],
      [10, 66],
    ].forEach(([chkIdx, valIdx]) => {
      if (
        chk[chkIdx] !== "2" &&
        val[valIdx] !== "NO" &&
        !excps.includes(val[valIdx])
      ) {
        excps.push(val[valIdx]);
      }
    });

    // inyecta cada fila
    excps.forEach((code) => {
      const tr = document.createElement("tr");
      const tdCode = document.createElement("td");
      tdCode.style.textAlign = "center";
      tdCode.textContent = code;
      const tdDesc = document.createElement("td");
      tdDesc.textContent = excs[code] || "";
      tr.appendChild(tdCode);
      tr.appendChild(tdDesc);
      tbody.appendChild(tr);
    });
  }

  renderParkings() {
    if (!this.data._areas_table.table_3_4.showTable_parking) {
      this.showDiv("table-3344-parkings", "none");
      return;
    }
    const tbody = this.tempDiv.querySelector("#table-3344-parkings tbody");
    const arc = this.data.record_arc_35_parkings || [];
    const parkings = [];
    const headers = {
      Visit: false,
      PVV: false,
      Carga: false,
      Motoc: false,
      Bicic: false,
    };

    // agrupa usos y suma
    arc.forEach((v) => {
      let p = parkings.find((x) => x.name === v.use);
      if (!p) {
        p = {
          name: v.use,
          uu: v.pos,
          Visit: 0,
          PVV: 0,
          Carga: 0,
          Motoc: 0,
          Bicic: 0,
        };
        parkings.push(p);
      }
      ["P.P", "Visitantes", "Carga", "Motocicletas", "Bicicletas"].forEach(
        (type) => {
          if (v.type.includes(type)) {
            const key = {
              "P.P": "PVV",
              Visitantes: "Visit",
              Carga: "Carga",
              Motocicletas: "Motoc",
              Bicicletas: "Bicic",
            }[type];
            p[key] += Number(v.project);
            headers[key] = true;
          }
        }
      );
    });

    // totales
    const totals = { Visit: 0, PVV: 0, Carga: 0, Motoc: 0, Bicic: 0 };
    parkings.forEach((p) =>
      Object.keys(totals).forEach((k) => (totals[k] += p[k]))
    );

    // limpia filas antiguas menos la de totales (última)
    Array.from(tbody.querySelectorAll("tr"))
      .slice(0, -1)
      .forEach((tr) => tbody.removeChild(tr));

    // inserta cada parking
    parkings.forEach((p) => {
      const tr = document.createElement("tr");
      [
        ["", p.name],
        ["", p.uu],
        ["Visit", p.Visit],
        ["PVV", p.PVV],
        ["Carga", p.Carga],
        ["Motoc", p.Motoc],
        ["Bicic", p.Bicic],
      ].forEach(([key, val]) => {
        const td = document.createElement("td");
        td.textContent = key ? val : val;
        if (key) td.classList.add("dinamico");
        tr.appendChild(td);
      });
      // sólo si hay algún valor >0
      if (Object.keys(headers).some((h) => headers[h] && p[h] > 0)) {
        tbody.insertBefore(tr, tbody.lastElementChild);
      }
    });

    // rellena totales en la última fila
    const totalRow = tbody.lastElementChild;
    totalRow.querySelectorAll("td.dinamico").forEach((td, i) => {
      const key = Object.keys(totals)[i];
      td.textContent = totals[key] || "";
    });
  }

  TABLE_AREAS(filter = []) {
    const SHOW = (val) => {
      if (val === "NO") return "";
      if (val == undefined || val == null || val.toString().trim() === "") return "-";
      return val;
    };

    const CV3 = (val) => {
      if (val == "0") return "CON R.";
      if (val == "1") return "SIN R.";
      return "-";
    };

    const CV2 = (val) => {
      if (val == 0) return "NO CUMPLE";
      if (val == 1) return "CUMPLE";
      if (val == 2) return "NO APLICA";
      return "-";
    };

    if (this.data._areas_table?.dinmanicHeaders === undefined) {
      return;
    }

    this.showDiv("areas-table-container", "block");

    const container = this.tempDiv.querySelector("#areas-table-container");
    const table_1 = container.querySelector("table");
    const subHeaderRow = this.tempDiv.querySelector("#heads_table_3_1");
    const urbanTh = this.tempDiv.querySelector("#head_urban_3_1");
    const grpTh1 = this.tempDiv.querySelector("#table_colspan1_3_1");
    const tbody = this.tempDiv.querySelector("#table-body-areas");
    if (!subHeaderRow || !urbanTh || !grpTh1 || !tbody) return;

    subHeaderRow.querySelectorAll("th.dynamic").forEach((th) => th.remove());
    tbody.querySelectorAll("tr.dynamic-row, tr.dynamic-total").forEach((tr) => tr.remove());

    let texts = this.data._areas_table?.dinmanicHeaders || [];
    console.log("Texts:", texts);
    let insertAfter = urbanTh;
    texts.forEach((text) => {
      const th = document.createElement("th");
      th.classList.add("dynamic");
      th.textContent = SHOW(text?.text ?? text);
      th.style.cssText =
        "border:1px solid #000; padding:4px; text-align:center; font-weight:bold;";
      insertAfter.insertAdjacentElement("afterend", th);
      insertAfter = th;
    });

    const newColspan = 3 + (Array.isArray(texts) ? texts.length : 0);
    grpTh1.colSpan = newColspan;

    this.setEqualColumnWidths(table_1);

    // --- Normalización robusta de table_use_rows ---
    let useRows = this.data._areas_table?.table_use_rows;

    if (!useRows) {
      useRows = [];
    } else if (typeof useRows === "string") {
      try {
        useRows = JSON.parse(useRows);
      } catch (e) {
        console.error("No se pudo parsear table_use_rows:", e);
        useRows = [];
      }
    }

    if (!Array.isArray(useRows)) {
      if (useRows && typeof useRows === "object") {
        try {
          useRows = Object.values(useRows);
        } catch (e) {
          console.warn("table_use_rows no convertible con Object.values:", e);
          useRows = [];
        }
      } else {
        useRows = [];
      }
    }

    console.log("useRows:", useRows);

    useRows.forEach((row) => {
      if (row == null) return;

      let cells;
      if (Array.isArray(row)) {
        cells = row;
      } else if (typeof row === "object") {
        try {
          cells = Object.values(row);
        } catch {
          cells = [];
        }
      } else {
        cells = [{ text: String(row) }];
      }

      if (!cells.length) return;

      const tr = document.createElement("tr");
      tr.classList.add("dynamic-row");

      console.log("cells:", cells);

      cells.forEach((rawCell) => {
        const cell =
          rawCell && typeof rawCell === "object"
            ? rawCell
            : { text: rawCell != null ? String(rawCell) : "" };

        const td = document.createElement("td");
        const text = cell.text ?? cell.value ?? cell.label ?? "";
        td.textContent = SHOW(text);

        td.style.border = "1px solid #000";
        td.style.padding = "4px";
        td.style.textAlign = cell?.config?.align || "center";
        td.style.verticalAlign = cell?.config?.valign ? "middle" : "baseline";

        if (cell?.w) {
          td.style.width = `${cell.w}%`;
        }

        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    // --- Totales robustos (soporta array, objeto o valor suelto) ---
    let raw = this.data._areas_table?.table_total_rows;
    let totalRows = [];

    if (Array.isArray(raw)) {
      // Si ya es array, úsalo tal cual
      totalRows = raw;
      // Compatibilidad con el caso "una sola fila como array de celdas"
      if (raw.length > 0 && raw[0]?.text !== undefined) {
        totalRows = [raw];
      }
    } else if (raw && typeof raw === "object") {
      // Objeto -> fila única con sus values
      try {
        totalRows = [Object.values(raw)];
      } catch {
        totalRows = [];
      }
    } else if (raw != null) {
      // Primitivo -> una fila, una celda
      totalRows = [[{ text: String(raw) }]];
    }

    totalRows.forEach((row) => {
      if (!Array.isArray(row)) return;

      const tr = document.createElement("tr");
      tr.classList.add("dynamic-total");

      row.forEach((rawCell, idx) => {
        const cell =
          rawCell && typeof rawCell === "object"
            ? rawCell
            : { text: rawCell != null ? String(rawCell) : "" };

        const td = document.createElement("td");
        td.textContent = SHOW(cell.text ?? cell.value ?? cell.label ?? "");
        if (idx === 0) td.colSpan = 3;

        td.style.border = "1px solid #000";
        td.style.padding = "4px";
        td.style.textAlign = cell?.config?.align || "center";
        td.style.verticalAlign = cell?.config?.valign ? "middle" : "baseline";

        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    // this.showDiv('determinates-table-2', 'block');
    let table33 = this.data._areas_table?.table_3_3;

    this.setText("table-331-ficha", SHOW(table33?._JSON_STEP?.ficha));
    this.setText("table-331-estrato", SHOW(this.data?.f2?.estrato));
    this.setText("table-331-sector", SHOW(table33?._JSON_STEP?.sector));
    this.setText("table-331-zgu", SHOW(table33?._JSON_STEP?.zgu));
    this.setText("table-331-subsector", SHOW(table33?._JSON_STEP?.subsector));
    this.setText("table-331-zugm", SHOW(table33?._JSON_STEP?.zugm));

    this.setText(
      "table-333-restriccion-title",
      "Zona de restricción: " + SHOW(table33?._VALUE_ARRAY?.[6])
    );
    this.setText("table-333-restriccion", CV3(table33?._CHECK_ARRAY?.[6]));

    this.setText(
      "table-333-amenaza-title",
      "Amenaza y Riesgo: " + SHOW(table33?._VALUE_ARRAY?.[8])
    );
    this.setText("table-333-amenaza", CV3(table33?._CHECK_ARRAY?.[8]));

    this.setText(
      "table-333-utilidad-title",
      "Utilidad Pública: " + SHOW(table33?._VALUE_ARRAY?.[7])
    );
    this.setText("table-333-utilidad", CV3(table33?._CHECK_ARRAY?.[7]));

    this.setText("table-333-n-title", SHOW(table33?._VALUE_ARRAY?.[9]));
    this.setText("table-333-n", CV3(table33?._CHECK_ARRAY?.[9]));

    this.setText("table-334-suelo", SHOW(table33?._VALUE_ARRAY?.[0]));
    this.setText("table-334-tratamiento", SHOW(table33?._VALUE_ARRAY?.[2]));
    this.setText("table-334-area", SHOW(table33?._VALUE_ARRAY?.[4]));
    this.setText("table-334-unidad", SHOW(table33?._VALUE_ARRAY?.[3]));

    const table3_5 = this.data._areas_table?.table_3_5;
    const headers = (table3_5 && table3_5.headers) || [];
    const perfiles = (table3_5 && table3_5.perfiles) || [];
    console.log("Headers:", headers);
    console.log("Headers:", headers);
    console.log("Headers:", headers);
    console.log("Perfiles:", perfiles);

    if (!headers.length) return;

    const table = this.tempDiv.querySelector("#perfil-vial");
    const thead3_5 = table.querySelector("#perfil-vial-head");
    const tbody3_5 = table.querySelector("#perfil-vial-body");

    const trTitle = document.createElement("tr");
    const thMainTitle = document.createElement("th");
    thMainTitle.textContent = "3.3.5 Perfil via";
    thMainTitle.colSpan = 1 + headers.length * 2;
    thMainTitle.classList.add("bg-table");
    thMainTitle.style.textAlign = "left";
    thMainTitle.style.fontWeight = "bold";
    trTitle.appendChild(thMainTitle);
    thead3_5.appendChild(trTitle);

    const trGroup = document.createElement("tr");
    const thTitle = document.createElement("th");
    thTitle.textContent = "Perfil vial";
    thTitle.rowSpan = 2;
    thTitle.classList.add("bg-table");
    thTitle.style.textAlign = "center";
    trGroup.appendChild(thTitle);

    headers.forEach((dir) => {
      const th = document.createElement("th");
      th.textContent = SHOW(dir);
      th.colSpan = 2;
      th.style.background = "silver";
      th.style.textAlign = "center";
      trGroup.appendChild(th);
    });
    thead3_5.appendChild(trGroup);

    const trSub = document.createElement("tr");
    headers.forEach(() => {
      ["N", "P"].forEach((letter) => {
        const th = document.createElement("th");
        th.textContent = letter;
        th.style.background = "gainsboro";
        th.style.textAlign = "center";
        trSub.appendChild(th);
      });
    });
    thead3_5.appendChild(trSub);

    perfiles.forEach((p) => {
      const tr = document.createElement("tr");
      const tdName = document.createElement("td");
      tdName.textContent = SHOW(p?.name);
      tdName.style.fontWeight = "bold";
      tdName.style.textAlign = "center";
      tr.appendChild(tdName);

      headers.forEach((_, i) => {
        const tdN = document.createElement("td");
        tdN.textContent = SHOW(p?.norm?.[i]);
        tdN.style.textAlign = "center";
        tr.appendChild(tdN);

        const tdP = document.createElement("td");
        tdP.textContent = SHOW(p?.project?.[i]);
        tdP.style.textAlign = "center";
        tr.appendChild(tdP);
      });

      tbody3_5.appendChild(tr);
    });

    const ALLOW_REVIEWS = this.data._areas_table?.ALLOW_REVIEWS;
    console.log(`ALLOW_REVIEWS: ${ALLOW_REVIEWS}`);

    if (ALLOW_REVIEWS?.[0] == 1) {
      this.showDiv("table-areas-33-34-1", "flex");
      this.showDiv("table-areas-33-34-2", "flex");
      this.showDiv("table-areas-33-34-3", "flex");
      this.renderEdificabilidad(CV2, SHOW);
      this.renderVolumen(CV2, SHOW);
      this.renderAislamientos(CV2, SHOW);
      this.renderExcepciones();
      this.renderParkings();
    }
  }


  F2_TABLE_MANUAL(text) {
    const container = this.tempDiv.querySelector("#manualTableContainer");
    container.innerHTML = ""; // Limpiar antes de inyectar

    const rows = text.trim().split("\n");
    if (rows.length === 0) return;

    const maxColumns = Math.max(...rows.map((r) => r.split("|").length));
    const table = document.createElement("table");
    table.className = "custom-table";

    rows.forEach((rowText) => {
      const row = document.createElement("tr");
      const cells = rowText.split("|");
      const isHeader = String(cells[0]).trim() === "#";

      cells.forEach((cellText, i) => {
        const cell = document.createElement(isHeader ? "th" : "td");
        const content =
          String(cellText).trim() === "#" ? "Predio" : cellText.trim();
        cell.textContent = content;
        cell.className = i === 0 ? "small-col" : "dynamic-col";
        row.appendChild(cell);
      });

      table.appendChild(row);
    });

    container.appendChild(table);
    container.style.display = "block"; // Mostrar el contenedor
  }

  TABLE_F2(hide = false, area = false, useState = false) {
    let ADDRESS_LABLE = "Dirección";
    let BARRIOR_LABEL = "Barrio";
    const table = this.tempDiv.querySelector("#tabla-predios");
    this.showDiv("tabla-f2", "table");

    // Mostrar u ocultar columna "Área predio"
    const areaCells = this.tempDiv.querySelectorAll(".area-col");
    areaCells.forEach((cell) => {
      cell.style.display = area ? "table-cell" : "none";
    });

    if (this.curaduriaInfo.id == "cup1") {
      ADDRESS_LABLE = "Nomenclatura / Dirección / Denominación";
      if (useState) BARRIOR_LABEL = "Municipio";
    }

    // encabezados
    this.tempDiv.querySelector("#th-direccion-f2").textContent = ADDRESS_LABLE;
    this.tempDiv.querySelector("#th-barrio-f2").textContent = BARRIOR_LABEL;

    // primer fila
    this.tempDiv.querySelector("#numero-predial-f2").textContent =
      this._DATA.reso.pimero_3 || this.data.fun_2.catastral;
    this.tempDiv.querySelector("#mat-inmob-f2").textContent =
      this._DATA.reso.pimero_4 || this.data.fun_2.matricula;
    this.tempDiv.querySelector("#dir-predio").textContent =
      this._DATA.reso.pimero_5 || this.data.fun_2.direccion;
    this.tempDiv.querySelector("#barrio-f2").textContent =
      this.curaduriaInfo.id == "cup1" && useState
        ? "Piedecuesta"
        : this.data.fun_2.barrio;
    this.tempDiv.querySelector("#area-f2").textContent = area + " m2";
  }

  TABLE_F51(ROLE, hide = false, ROLE_EXCLUDE = false) {
    const tbody = this.tempDiv.querySelector("#table-f51-body");
    if (!tbody) return;

    tbody.innerHTML = ""; // Limpia contenido previo

    if (!Array.isArray(this.data.f51)) return;

    // Cambiar encabezado si es 'cup1'
    if (this.curaduriaInfo?.id === "cup1") {
      const label = this.tempDiv.querySelector("#f51-name-label");
      if (label) label.textContent = "Nombre y Apellidos / (Razón social)";
    }

    this.data.f51.forEach((value) => {
      const role = value.role ?? "";
      const name51 = `${value.name ?? ""} ${value.surname ?? ""}`
        .toUpperCase()
        .trim();
      const id51 = value.id_number ?? "";

      if (ROLE && !String(role).includes(ROLE)) return;

      const tr = document.createElement("tr");
      [role, name51, id51].forEach((text) => {
        const td = document.createElement("td");
        td.style.textAlign = "center";
        td.style.padding = "0.2rem";
        td.textContent = text;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);

      if (value.type === "PERSONA JURIDICA" && !ROLE_EXCLUDE) {
        const rName51 = (value.rep_name ?? "").toUpperCase().trim();
        const rId51 = (value.rep_id_number ?? "").toUpperCase().trim();

        const trRep = document.createElement("tr");
        ["REPRESENTANTE LEGAL", rName51, rId51].forEach((text) => {
          const td = document.createElement("td");
          td.style.textAlign = "center";
          td.style.padding = "0.2rem";
          td.textContent = text;
          trRep.appendChild(td);
        });
        tbody.appendChild(trRep);
      }
    });
  }

  TABLE_F52(ROLE, hide = false, ROLE_EXCLUDE = false) {
    const tbody = this.tempDiv.querySelector("#table-f51-body");
    if (!tbody) return;

    tbody.innerHTML = ""; // Limpia contenido previo

    if (!Array.isArray(this.data.f51)) return;

    // Cambiar encabezado si es 'cup1'
    if (this.curaduriaInfo?.id === "cup1") {
      const label = this.tempDiv.querySelector("#f51-name-label");
      if (label) label.textContent = "Nombre y Apellidos / (Razón social)";
    }

    this.data.f51.forEach((value) => {
      const role = value.role ?? "";
      const name51 = `${value.name ?? ""} ${value.surname ?? ""}`
        .toUpperCase()
        .trim();
      const id51 = value.id_number ?? "";

      if (ROLE && !String(role).includes(ROLE)) return;

      const tr = document.createElement("tr");
      [role, name51, id51].forEach((text) => {
        const td = document.createElement("td");
        td.style.textAlign = "center";
        td.style.padding = "0.2rem";
        td.textContent = text;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);

      if (value.type === "PERSONA JURIDICA" && !ROLE_EXCLUDE) {
        const rName51 = (value.rep_name ?? "").toUpperCase().trim();
        const rId51 = (value.rep_id_number ?? "").toUpperCase().trim();

        const trRep = document.createElement("tr");
        ["REPRESENTANTE LEGAL", rName51, rId51].forEach((text) => {
          const td = document.createElement("td");
          td.style.textAlign = "center";
          td.style.padding = "0.2rem";
          td.textContent = text;
          trRep.appendChild(td);
        });
        tbody.appendChild(trRep);
      }
    });
  }

  TABLE_F52(hide = false) {
    const tbody = this.tempDiv.querySelector("#table-f52-body");
    if (!tbody || !Array.isArray(this.data.f52)) return;

    tbody.innerHTML = ""; // Limpia contenido previo

    let nameLabel = "Nombre";
    if (this.curaduriaInfo?.id === "cup1") {
      nameLabel = "Nombre y Apellidos";
      const label = this.tempDiv.querySelector("#f52-name-label");
      if (label) label.textContent = nameLabel;
    }

    const profShortNames = {
      "URBANIZADOR/PARCELADOR": "URBANIZADOR/PARCELADOR",
      "URBANIZADOR O CONSTRUCTOR RESPONSABLE":
        "URBANIZADOR/CONSTRUCTOR RESPONSABLE",
      "DIRECTOR DE LA CONSTRUCCION": "DIRECTOR DE LA CONSTRUCCIÓN",
      "ARQUITECTO PROYECTISTA": "ARQUITECTO PROYECTISTA",
      "INGENIERO CIVIL DISEÑADOR ESTRUCTURAL": "INGENIERO CIVIL ESTRUCTURAL",
      "DISEÑADOR DE ELEMENTOS NO ESTRUCTURALES":
        "DISEÑADOR ELEMENTOS NO ESTRUCT.",
      "INGENIERO CIVIL GEOTECNISTA": "INGENIERO CIVIL GEOTECNISTA",
      "INGENIERO TOPOGRAFO Y/O TOPÓGRAFO": "INGENIERO TOPÓGRAFO Y/O TOPÓGR.",
      "REVISOR INDEPENDIENTE DE LOS DISEÑOS ESTRUCTURALES":
        "REVISOR INDEPENDIENTE ESTRUCTURAL",
      "OTROS PROFESIONALES ESPECIALISTAS": "OTROS PROFESIONALES ESPECIALISTAS",
    };

    this.data.f52.forEach((value) => {
      const role = profShortNames[value.role] || value.role || "";
      const name = `${value.name ?? ""} ${value.surname ?? ""}`
        .toUpperCase()
        .trim();
      const registration = value.registration ?? "";

      const tr = document.createElement("tr");
      [role, name, registration].forEach((text) => {
        const td = document.createElement("td");
        td.style.textAlign = "center";
        td.style.padding = "0.2rem";
        td.textContent = text;
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });
  }

  renderDocsTable(data) {
    const tbody = this.tempDiv.querySelector("#act-des-docs-body");
    if (!tbody) {
      console.error("❌ No se encontró el tbody con ID #docs-body");
      return;
    }

    tbody.innerHTML = "";

    data.forEach(item => {

      if (!item?.show) return;

      const tr = document.createElement("tr");
      // Descripción
      const tdDesc = document.createElement("td");
      tdDesc.textContent = item.name;
      tr.appendChild(tdDesc);

      // VR
      const tdVr = document.createElement("td");
      tdVr.textContent = item.id_public;
      tdVr.style.textAlign = "center";
      tr.appendChild(tdVr);

      // Folios
      const tdPage = document.createElement("td");
      tdPage.textContent = item.page || "";
      tdPage.style.textAlign = "center";
      tr.appendChild(tdPage);

      // Fecha Radicación
      const tdDate = document.createElement("td");
      if (item.date) {
        const [yyyy, mm, dd] = item.date.split("-");
        tdDate.textContent = `${dd}/${mm}/${yyyy.slice(-2)}`;
      } else {
        tdDate.textContent = "";
      }
      tdDate.style.textAlign = "center";
      tr.appendChild(tdDate);

      tbody.appendChild(tr);
    });
  }

  renderInternalDocsTable(list) {
    const tbody = this.tempDiv.querySelector("#act-des-docs-internal-body");
    if (!tbody) {
      console.error("❌ No se encontró el tbody con ID #act-des-docs-internal-body");
      return;
    }

    tbody.innerHTML = "";

    if (!list || typeof list !== "object") return;

    Object.values(list).forEach(doc => {
      if (!doc?.show) return; // solo filas marcadas para mostrar

      const tr = document.createElement("tr");

      // Contenido
      const tdName = document.createElement("td");
      tdName.textContent = doc.name || "";
      tr.appendChild(tdName);

      // Fecha
      const tdDate = document.createElement("td");
      if (doc.date) {
        const [yyyy, mm, dd] = doc.date.split("-");
        tdDate.textContent = `${dd}/${mm}/${yyyy.slice(-2)}`;
      } else {
        tdDate.textContent = "";
      }
      tdDate.style.textAlign = "center";
      tr.appendChild(tdDate);

      // Folios
      const tdPages = document.createElement("td");
      tdPages.textContent = doc.pages || "";
      tdPages.style.textAlign = "center";
      tr.appendChild(tdPages);

      tbody.appendChild(tr);
    });

    if (!tbody.children.length) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 3;
      td.style.textAlign = "center";
      td.textContent = "— Sin documentos internos para mostrar —";
      tr.appendChild(td);
      tbody.appendChild(tr);
    }
  }

  
}
