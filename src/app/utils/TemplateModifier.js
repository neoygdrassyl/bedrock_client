export class TemplateModifier {
    constructor(data, htmlString) {
        this.data = data;
        this._DATA = data?._DATA ?? null;
        this.curaduriaId = data?.curaduriaInfo?.id ?? null;
        this.curaduriaInfo = data?.curaduriaInfo ?? null;
        let tempDiv = document.createElement("div");
        tempDiv.innerHTML = htmlString;
        this.tempDiv = tempDiv;
    }

    setText(id, text) {
        const el = this.tempDiv.querySelector(`#${id}`);
        if (el) el.textContent = text;
    }


    VV = (val, df) => {
        if (val === 'NO') return '';
        if (val) return val;
        if (df) return df;
        return ''
    }
    CV = (val, dv) => {
        if (val == '0') return 'NO';
        if (val == '1') return 'SI';
        if (val == '2') return 'NA';
        if (dv != undefined || dv != null) {
            if (dv == '0') return 'NO';
            if (dv == '1') return 'SI';
            if (dv == '2') return 'NA';
        }
        return '';
    }

    CV3 = (val,) => {
        if (val == '0') return 'CON R.';
        if (val == '1') return 'SIN R.';
        return '';
    }

    CV2 = val => {
        if (val == 0) return 'NO CUMPLE';
        if (val == 1) return 'CUMPLE';
        if (val == 2) return 'NO APLICA';
        return ''
    }

    renderEdificabilidad(CV2, VV) {
        let _CHECK_ARRAY_34 = this.data._areas_table?.table_3_4._CHECK_ARRAY || [];
        let _VALUE_ARRAY_34 = this.data._areas_table?.table_3_4._VALUE_ARRAY || [];

        let con_edif = _CHECK_ARRAY_34[1] != '2' || _CHECK_ARRAY_34[2] != '2';
        let con_volumen = this.data._areas_table?.table_3_4.con_volumen || false;
        let excs = this.data._areas_table?.table_3_4?.excs || [''];
        let content = 0;
        if (con_edif){
            this.showDiv('table-334-1aa','table-row');
            content++;
        }
        if (_CHECK_ARRAY_34[1] != '2'){
            this.setText('table-334-ocupacion-dato', VV(_VALUE_ARRAY_34[6]));
            this.setText('table-334-ocupacion-norma', VV(_VALUE_ARRAY_34[3]));
            this.setText('table-334-ocupacion-proyecto', VV(_VALUE_ARRAY_34[4]));
            this.setText('table-334-ocupacion-eval', _VALUE_ARRAY_34[5] == 'NO' ? CV2(_CHECK_ARRAY_34[1]) : (excs[_VALUE_ARRAY_34[5]] || 'Excep.'));
            content++;
        }
        if (_CHECK_ARRAY_34[1] != '2'){
            this.setText('table-334-construccion-dato', VV(_VALUE_ARRAY_34[10]));
            this.setText('table-334-construccion-norma', VV(_VALUE_ARRAY_34[7]));
            this.setText('table-334-construccion-proyecto', VV(_VALUE_ARRAY_34[8]));
            this.setText('table-334-construccion-eval', _VALUE_ARRAY_34[9] == 'NO' ? CV2(_CHECK_ARRAY_34[2]) : (excs[_VALUE_ARRAY_34[9]] || 'Excep.'));
            content++;
        }

        if (!content){
            this.showDiv('table-341','none');
        }
    }

    renderVolumen(CV2, VV) {
        let _CHECK_ARRAY_34 = this.data._areas_table?.table_3_4._CHECK_ARRAY || [];
        let _VALUE_ARRAY_34 = this.data._areas_table?.table_3_4._VALUE_ARRAY || [];

        let con_edif = _CHECK_ARRAY_34[1] != '2' || _CHECK_ARRAY_34[2] != '2';
        let con_volumen = this.data._areas_table?.table_3_4.con_volumen || false;
        let excs = this.data._areas_table?.table_3_4?.excs || [''];

        if(!con_volumen){
            this.showDiv('table-3342','none');
        }
        else{
            if(_CHECK_ARRAY_34[0] != '2'){
                this.showDiv('table-334-tipo-edi','table-row');
                this.setText('table-334-tipo-edi-norma', VV(_VALUE_ARRAY_34[0]));
                this.setText('table-334-tipo-edi-proyecto', VV(_VALUE_ARRAY_34[1]));
                this.setText('table-334-tipo-edi-eval', _VALUE_ARRAY_34[2] == 'NO' ? CV2(_CHECK_ARRAY_34[0]) : (excs[_VALUE_ARRAY_34[2]] || 'Excep.'));
            }
    
            if(_CHECK_ARRAY_34[3] != '2'){
                this.showDiv('table-334-pisos','table-row');
                this.setText('table-334-pisos-norma', VV(_VALUE_ARRAY_34[11]));
                this.setText('table-334-pisos-proyecto', VV(_VALUE_ARRAY_34[12]));
                this.setText('table-334-pisos-eval', _VALUE_ARRAY_34[13] == 'NO' ? CV2(_CHECK_ARRAY_34[3]) : (excs[_VALUE_ARRAY_34[13]] || 'Excep.'));
            }
    
            if(_CHECK_ARRAY_34[4] != '2'){
                this.showDiv('table-334-semisotano','table-row');
                this.setText('table-334-semisotano-norma', VV(_VALUE_ARRAY_34[18]));
                this.setText('table-334-semisotano-proyecto', VV(_VALUE_ARRAY_34[19]));
                this.setText('table-334-semisotano-eval', CV2(_VALUE_ARRAY_34[4]));
            }
    
            if(_CHECK_ARRAY_34[5] != '2'){
                this.showDiv('table-334-sotano','table-row');
                this.setText('table-334-sotano-norma', VV(_VALUE_ARRAY_34[22]));
                this.setText('table-334-sotano-proyecto', VV(_VALUE_ARRAY_34[23]));
                this.setText('table-334-sotano-eval', CV2(_VALUE_ARRAY_34[5]));
            }
        }
    }

    addAislamientoRow(CV2, VV, tableId, chkIdx, txtIdx, norIdx, proIdx, evIdx) {
        const tbody = this.tempDiv.querySelector(`#${tableId} tbody`);
        const check = this.data._areas_table.table_3_4._CHECK_ARRAY[chkIdx];
        if (check === '2') return;
    
        const tr = document.createElement('tr');
    
        // 1) Texto (sin "Aislamiento ")
        const tdTxt = document.createElement('td');
        tdTxt.classList.add('text-left');
        tdTxt.textContent = String(
          VV(this.data._areas_table.table_3_4._VALUE_ARRAY[txtIdx])
        ).replace('Aislamiento ', '');
        tr.appendChild(tdTxt);
    
        // 2) Norma
        const tdNor = document.createElement('td');
        tdNor.textContent = VV(
          this.data._areas_table.table_3_4._VALUE_ARRAY[norIdx]
        );
        tr.appendChild(tdNor);
    
        // 3) Proyecto
        const tdPro = document.createElement('td');
        tdPro.textContent = VV(
          this.data._areas_table.table_3_4._VALUE_ARRAY[proIdx]
        );
        tr.appendChild(tdPro);
    
        // 4) Eval. / Excep.
        const tdEv = document.createElement('td');
        const excs = this.data._areas_table.table_3_4.excs || [];
        if (evIdx === null) { 
          tdEv.textContent = CV2(check);
        } else {
          const evVal = this.data._areas_table.table_3_4._VALUE_ARRAY[evIdx];
          tdEv.textContent =
            evVal === 'NO' ? CV2(check) : excs[evVal] || 'Excep.';
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
            if (chk[chkIdx] !== '2') {
            this.addAislamientoRow(CV2, VV, ...args);
            rowsAdded++;
            }
        };

        tryAdd('table-3343', 6, 69, 26, 27, 62);
        tryAdd('table-3343', 7, 70, 30, 31, 63);
        tryAdd('table-3343', 8, 71, 34, 35, 64);
        tryAdd('table-3343', 9, 72, 38, 39, 65);
        tryAdd('table-3343', 11, 74, 46, 47, 66);
        tryAdd('table-3343', 12, 75, 50, 51, null);
        tryAdd('table-3343', 13, 76, 54, 55, null);
        tryAdd('table-3343', 14, 77, 58, 59, null);
        tryAdd('table-3343', 15, 78, 82, 79, null);

        if (rowsAdded === 0) {
            this.showDiv('table-3343', 'none');
        }
    }

    renderExcepciones() {
        if(!this.data._areas_table.table_3_4.excps_array){
            this.showDiv('table-3344-excepciones','none');
            return;
        }

        const tbody = this.tempDiv.querySelector('#table-3344-excepciones tbody');
        const chk = this.data._areas_table.table_3_4._CHECK_ARRAY;
        const val = this.data._areas_table.table_3_4._VALUE_ARRAY;
        const excs = this.data._areas_table.table_3_4.excs || [];
        const excps = [];
    
        // recoge sólo las excepciones únicas y válidas
        [5, 9].forEach(i => {
          if (!excps.includes(val[i]) && val[i] !== 'NO') excps.push(val[i]);
        });
        [[0,2],[3,13],[6,62],[7,63],[8,64],[9,65],[10,66]]
          .forEach(([chkIdx,valIdx]) => {
            if (chk[chkIdx] !== '2' && val[valIdx] !== 'NO' && !excps.includes(val[valIdx])) {
              excps.push(val[valIdx]);
            }
          });
    
        // inyecta cada fila
        excps.forEach(code => {
          const tr = document.createElement('tr');
          const tdCode = document.createElement('td');
          tdCode.style.textAlign = 'center';
          tdCode.textContent = code;
          const tdDesc = document.createElement('td');
          tdDesc.textContent = excs[code] || '';
          tr.appendChild(tdCode);
          tr.appendChild(tdDesc);
          tbody.appendChild(tr);
        });
    }
    
    renderParkings() {
        if(!this.data._areas_table.table_3_4.showTable_parking){
            this.showDiv('table-3344-parkings','none');
            return;
        }
        const tbody = this.tempDiv.querySelector('#table-3344-parkings tbody');
        const arc = this.data.record_arc_35_parkings || [];
        const parkings = [];
        const headers = { 'Visit':false, 'PVV':false, 'Carga':false, 'Motoc':false, 'Bicic':false };

        // agrupa usos y suma
        arc.forEach(v => {
            let p = parkings.find(x => x.name === v.use);
            if (!p) {
            p = { name: v.use, uu: v.pos, Visit:0, PVV:0, Carga:0, Motoc:0, Bicic:0 };
            parkings.push(p);
            }
            ['P.P','Visitantes','Carga','Motocicletas','Bicicletas'].forEach(type => {
            if (v.type.includes(type)) {
                const key = ({ 'P.P':'PVV','Visitantes':'Visit','Carga':'Carga',
                                'Motocicletas':'Motoc','Bicicletas':'Bicic' })[type];
                p[key] += Number(v.project);
                headers[key] = true;
            }
            });
        });

        // totales
        const totals = { Visit:0, PVV:0, Carga:0, Motoc:0, Bicic:0 };
        parkings.forEach(p => Object.keys(totals).forEach(k => totals[k] += p[k]));

        // limpia filas antiguas menos la de totales (última)
        Array.from(tbody.querySelectorAll('tr'))
            .slice(0,-1)
            .forEach(tr => tbody.removeChild(tr));

        // inserta cada parking
        parkings.forEach(p => {
            const tr = document.createElement('tr');
            [['',p.name],['',p.uu],['Visit',p.Visit],['PVV',p.PVV],
            ['Carga',p.Carga],['Motoc',p.Motoc],['Bicic',p.Bicic]
            ].forEach(([key,val]) => {
            const td = document.createElement('td');
            td.textContent = key ? val : val; 
            if (key) td.classList.add('dinamico');
            tr.appendChild(td);
            });
            // sólo si hay algún valor >0
            if (Object.keys(headers).some(h => headers[h] && p[h] > 0)) {
            tbody.insertBefore(tr, tbody.lastElementChild);
            }
        });

        // rellena totales en la última fila
        const totalRow = tbody.lastElementChild;
        totalRow.querySelectorAll('td.dinamico').forEach((td,i) => {
            const key = Object.keys(totals)[i];
            td.textContent = totals[key] || '';
        });
    }

    TABLE_AREAS(filter = []) {
        const SHOW = val => {
            if (val === 'NO') return '';
            if (val == undefined || val == null || val.toString().trim() === '') return '-';
            return val;
        }

        const VV = (val, df) => {
            if (val === 'NO') return '';
            if (val) return val;
            if (df) return df;
            return ''
        }

        const CV = (val, dv) => {
            if (val == '0') return 'NO';
            if (val == '1') return 'SI';
            if (val == '2') return 'NA';
            if (dv != undefined || dv != null) {
                if (dv == '0') return 'NO';
                if (dv == '1') return 'SI';
                if (dv == '2') return 'NA';
            }
            return '';
        }

        const CV3 = (val) => {
            if (val == '0') return 'CON R.';
            if (val == '1') return 'SIN R.';
            return '-';
        }

        const CV2 = val => {
            if (val == 0) return 'NO CUMPLE';
            if (val == 1) return 'CUMPLE';
            if (val == 2) return 'NO APLICA';
            return '-';
        }

        this.showDiv('areas-table-container', 'block');

        const container = this.tempDiv.querySelector('#areas-table-container');
        const subHeaderRow = this.tempDiv.querySelector('#heads_table_3_1');
        const urbanTh = this.tempDiv.querySelector('#head_urban_3_1');
        const grpTh1 = this.tempDiv.querySelector('#table_colspan1_3_1');
        const tbody = this.tempDiv.querySelector('#table-body-areas');
        if (!subHeaderRow || !urbanTh || !grpTh1 || !tbody) return;

        subHeaderRow.querySelectorAll('th.dynamic').forEach(th => th.remove());
        tbody.querySelectorAll('tr.dynamic-row, tr.dynamic-total').forEach(tr => tr.remove());

        let texts = this.data._areas_table?.dinmanicHeaders
        let insertAfter = urbanTh;
        texts.forEach(text => {
            const th = document.createElement('th');
            th.classList.add('dynamic');
            th.textContent = SHOW(text.text);
            th.style.cssText = 'border:1px solid #000; padding:4px; text-align:center; font-weight:bold;';
            insertAfter.insertAdjacentElement('afterend', th);
            insertAfter = th;
        });

        const newColspan = 3 + texts.length;
        grpTh1.colSpan = newColspan;

        let useRows = this.data._areas_table?.table_use_rows;
        if (!useRows) useRows = [];
        else if (typeof useRows === 'string') {
            try {
                useRows = JSON.parse(useRows);
            } catch (e) {
                console.error('No se pudo parsear table_use_rows:', e);
                useRows = [];
            }
        }

        if (!Array.isArray(useRows)) {
            console.warn('table_use_rows no es un array, convirtiendo con Object.values');
            useRows = Object.values(useRows);
        }

        useRows.forEach((row, rowIndex) => {
            let cells = Array.isArray(row) ? row : Object.values(row);
            const tr = document.createElement('tr');
            tr.classList.add('dynamic-row');

            cells.forEach(cell => {
                const td = document.createElement('td');
                td.textContent = SHOW(cell.text);

                td.style.border = '1px solid #000';
                td.style.padding = '4px';
                td.style.textAlign = cell.config?.align || 'center';
                td.style.verticalAlign = cell.config?.valign ? 'middle' : 'baseline';

                if (cell.w) {
                    td.style.width = `${cell.w}%`;
                }

                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });

        let raw = this.data._areas_table?.table_total_rows || [];
        let totalRows = Array.isArray(raw) && raw.length > 0 && raw[0].text !== undefined ? [raw] : raw;

        totalRows.forEach(row => {
            const tr = document.createElement('tr');
            tr.classList.add('dynamic-total');

            row.forEach((cell, idx) => {
                const td = document.createElement('td');
                td.textContent = SHOW(cell.text);
                if (idx === 0) td.colSpan = 3;

                td.style.border = '1px solid #000';
                td.style.padding = '4px';
                td.style.textAlign = cell.config?.align || 'center';
                td.style.verticalAlign = cell.config?.valign ? 'middle' : 'baseline';

                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });

       // this.showDiv('determinates-table-2', 'block');
        let table33 = this.data._areas_table?.table_3_3;

        this.setText('table-331-ficha', SHOW(table33?._JSON_STEP.ficha));
        this.setText('table-331-estrato', SHOW(this.data?.f2.estrato));
        this.setText('table-331-sector', SHOW(table33?._JSON_STEP.sector));
        this.setText('table-331-zgu', SHOW(table33?._JSON_STEP.zgu));
        this.setText('table-331-subsector', SHOW(table33?._JSON_STEP.subsector));
        this.setText('table-331-zugm', SHOW(table33?._JSON_STEP.zugm));

        this.setText('table-333-restriccion-title', "Zona de restricción: " + SHOW(table33?._VALUE_ARRAY[6]));
        this.setText('table-333-restriccion', CV3(table33?._CHECK_ARRAY[6]));

        this.setText('table-333-amenaza-title', "Amenaza y Riesgo: " + SHOW(table33?._VALUE_ARRAY[8]));
        this.setText('table-333-amenaza', CV3(table33?._CHECK_ARRAY[8]));

        this.setText('table-333-utilidad-title', "Utilidad Pública: " + SHOW(table33?._VALUE_ARRAY[7]));
        this.setText('table-333-utilidad', CV3(table33?._CHECK_ARRAY[7]));

        this.setText('table-333-n-title', SHOW(table33?._VALUE_ARRAY[9]));
        this.setText('table-333-n', CV3(table33?._CHECK_ARRAY[9]));

        this.setText('table-334-suelo', SHOW(table33?._VALUE_ARRAY[0]));
        this.setText('table-334-tratamiento', SHOW(table33?._VALUE_ARRAY[2]));
        this.setText('table-334-area', SHOW(table33?._VALUE_ARRAY[4]));
        this.setText('table-334-unidad', SHOW(table33?._VALUE_ARRAY[3]));

        const table3_5 = this.data._areas_table?.table_3_5;
        const headers = (table3_5 && table3_5.headers) || [];
        const perfiles = (table3_5 && table3_5.perfiles) || [];

        if (!headers.length) return;


        const table = this.tempDiv.querySelector('#perfil-vial');
        const thead3_5 = table.querySelector('#perfil-vial-head');
        const tbody3_5 = table.querySelector('#perfil-vial-body');

        const trTitle = document.createElement('tr');
        const thMainTitle = document.createElement('th');
        thMainTitle.textContent = '3.3.5 Perfil via';
        thMainTitle.colSpan = 1 + headers.length * 2;
        thMainTitle.classList.add('bg-table');
        thMainTitle.style.textAlign = 'left';
        thMainTitle.style.fontWeight = 'bold';
        trTitle.appendChild(thMainTitle);
        thead3_5.appendChild(trTitle);

        const trGroup = document.createElement('tr');
        const thTitle = document.createElement('th');
        thTitle.textContent = 'Perfil vial';
        thTitle.rowSpan = 2;
        thTitle.classList.add('bg-table');
        thTitle.style.textAlign = 'center';
        trGroup.appendChild(thTitle);

        headers.forEach(dir => {
            const th = document.createElement('th');
            th.textContent = SHOW(dir);
            th.colSpan = 2;
            th.style.background = 'silver';
            th.style.textAlign = 'center';
            trGroup.appendChild(th);
        });
        thead3_5.appendChild(trGroup);

        const trSub = document.createElement('tr');
        headers.forEach(() => {
            ['N', 'P'].forEach(letter => {
                const th = document.createElement('th');
                th.textContent = letter;
                th.style.background = 'gainsboro';
                th.style.textAlign = 'center';
                trSub.appendChild(th);
            });
        });
        thead3_5.appendChild(trSub);

        perfiles.forEach(p => {
            const tr = document.createElement('tr');
            const tdName = document.createElement('td');
            tdName.textContent = SHOW(p.name);
            tdName.style.fontWeight = 'bold';
            tdName.style.textAlign = 'center';
            tr.appendChild(tdName);

            headers.forEach((_, i) => {
                const tdN = document.createElement('td');
                tdN.textContent = SHOW(p.norm?.[i]);
                tdN.style.textAlign = 'center';
                tr.appendChild(tdN);

                const tdP = document.createElement('td');
                tdP.textContent = SHOW(p.project?.[i]);
                tdP.style.textAlign = 'center';
                tr.appendChild(tdP);
            });

            tbody3_5.appendChild(tr);
        });

        const ALLOW_REVIEWS = this.data._areas_table?.ALLOW_REVIEWS;
        console.log(`ALLOW_REVIEWS: ${ALLOW_REVIEWS}`);

        if (ALLOW_REVIEWS && ALLOW_REVIEWS[0] == 1) {
            this.showDiv('table-areas-33-34');
            this.renderEdificabilidad(CV2, SHOW);
            this.renderVolumen(CV2, SHOW);
            this.renderAislamientos(CV2, SHOW);
            this.renderExcepciones();
            this.renderParkings();
        }
    }


    F2_TABLE_MANUAL(text) {
        const container = this.tempDiv.querySelector("#manualTableContainer");
        container.innerHTML = '';  // Limpiar antes de inyectar
    
        const rows = text.trim().split('\n');
        if (rows.length === 0) return;
    
        const maxColumns = Math.max(...rows.map(r => r.split('|').length));
        const table = document.createElement('table');
        table.className = 'custom-table';
    
        rows.forEach(rowText => {
          const row = document.createElement('tr');
          const cells = rowText.split('|');
          const isHeader = String(cells[0]).trim() === "#";
    
          cells.forEach((cellText, i) => {
            const cell = document.createElement(isHeader ? 'th' : 'td');
            const content = String(cellText).trim() === "#" ? "Predio" : cellText.trim();
            cell.textContent = content;
            cell.className = i === 0 ? 'small-col' : 'dynamic-col';
            row.appendChild(cell);
          });
    
          table.appendChild(row);
        });
    
        container.appendChild(table);
        container.style.display = 'block'; // Mostrar el contenedor
    }

    TABLE_F2(hide=false, area=false, useState=false) {
        let ADDRESS_LABLE = 'Dirección';
        let BARRIOR_LABEL = 'Barrio';
        const table = this.tempDiv.querySelector("#tabla-predios");
        this.showDiv("tabla-f2","table");
      
        // Mostrar u ocultar columna "Área predio"
        const areaCells = this.tempDiv.querySelectorAll('.area-col');
        areaCells.forEach(cell => {
          cell.style.display = area ? 'table-cell' : 'none';
        });

        if (this.curaduriaInfo.id == 'cup1') {
            ADDRESS_LABLE = 'Nomenclatura / Dirección / Denominación';
            if (useState) BARRIOR_LABEL = 'Municipio';
        }
      
        // encabezados
        this.tempDiv.querySelector("#th-direccion-f2").textContent = ADDRESS_LABLE;
        this.tempDiv.querySelector("#th-barrio-f2").textContent = BARRIOR_LABEL;
        
        // primer fila
        this.tempDiv.querySelector("#numero-predial-f2").textContent = this._DATA.reso.pimero_3 || this.data.fun_2.catastral;
        this.tempDiv.querySelector("#mat-inmob-f2").textContent = this._DATA.reso.pimero_4 || this.data.fun_2.matricula;
        this.tempDiv.querySelector("#dir-predio").textContent = this._DATA.reso.pimero_5 || this.data.fun_2.direccion;
        this.tempDiv.querySelector("#barrio-f2").textContent = this.curaduriaInfo.id == 'cup1' && useState ? "Piedecuesta" : this.data.fun_2.barrio;
        this.tempDiv.querySelector("#area-f2").textContent = area + " m2";
    }

    TABLE_F51(ROLE, hide = false, ROLE_EXCLUDE = false) {
        const tbody = this.tempDiv.querySelector('#table-f51-body');
        if (!tbody) return;
    
        tbody.innerHTML = ''; // Limpia contenido previo
    
        if (!Array.isArray(this.data.f51)) return;
    
        // Cambiar encabezado si es 'cup1'
        if (this.curaduriaInfo?.id === 'cup1') {
            const label = this.tempDiv.querySelector('#f51-name-label');
            if (label) label.textContent = 'Nombre y Apellidos / (Razón social)';
        }
    
        this.data.f51.forEach(value => {
            const role = value.role ?? '';
            const name51 = `${value.name ?? ''} ${value.surname ?? ''}`.toUpperCase().trim();
            const id51 = value.id_number ?? '';
    
            if (ROLE && !String(role).includes(ROLE)) return;
    
            const tr = document.createElement('tr');
            [role, name51, id51].forEach(text => {
                const td = document.createElement('td');
                td.style.textAlign = 'center';
                td.style.padding = '0.2rem';
                td.textContent = text;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
    
            if (value.type === 'PERSONA JURIDICA' && !ROLE_EXCLUDE) {
                const rName51 = (value.rep_name ?? '').toUpperCase().trim();
                const rId51 = (value.rep_id_number ?? '').toUpperCase().trim();
    
                const trRep = document.createElement('tr');
                ['REPRESENTANTE LEGAL', rName51, rId51].forEach(text => {
                    const td = document.createElement('td');
                    td.style.textAlign = 'center';
                    td.style.padding = '0.2rem';
                    td.textContent = text;
                    trRep.appendChild(td);
                });
                tbody.appendChild(trRep);
            }
        });
    }

    TABLE_F52(ROLE, hide = false, ROLE_EXCLUDE = false) {
        const tbody = this.tempDiv.querySelector('#table-f51-body');
        if (!tbody) return;
    
        tbody.innerHTML = ''; // Limpia contenido previo
    
        if (!Array.isArray(this.data.f51)) return;
    
        // Cambiar encabezado si es 'cup1'
        if (this.curaduriaInfo?.id === 'cup1') {
            const label = this.tempDiv.querySelector('#f51-name-label');
            if (label) label.textContent = 'Nombre y Apellidos / (Razón social)';
        }
    
        this.data.f51.forEach(value => {
            const role = value.role ?? '';
            const name51 = `${value.name ?? ''} ${value.surname ?? ''}`.toUpperCase().trim();
            const id51 = value.id_number ?? '';
    
            if (ROLE && !String(role).includes(ROLE)) return;
    
            const tr = document.createElement('tr');
            [role, name51, id51].forEach(text => {
                const td = document.createElement('td');
                td.style.textAlign = 'center';
                td.style.padding = '0.2rem';
                td.textContent = text;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
    
            if (value.type === 'PERSONA JURIDICA' && !ROLE_EXCLUDE) {
                const rName51 = (value.rep_name ?? '').toUpperCase().trim();
                const rId51 = (value.rep_id_number ?? '').toUpperCase().trim();
    
                const trRep = document.createElement('tr');
                ['REPRESENTANTE LEGAL', rName51, rId51].forEach(text => {
                    const td = document.createElement('td');
                    td.style.textAlign = 'center';
                    td.style.padding = '0.2rem';
                    td.textContent = text;
                    trRep.appendChild(td);
                });
                tbody.appendChild(trRep);
            }
        });
    }

    TABLE_F52(hide = false) {
        const tbody = this.tempDiv.querySelector('#table-f52-body');
        if (!tbody || !Array.isArray(this.data.f52)) return;
    
        tbody.innerHTML = ''; // Limpia contenido previo
    
        let nameLabel = 'Nombre';
        if (this.curaduriaInfo?.id === 'cup1') {
            nameLabel = 'Nombre y Apellidos';
            const label = this.tempDiv.querySelector('#f52-name-label');
            if (label) label.textContent = nameLabel;
        }
    
        const profShortNames = {
            'URBANIZADOR/PARCELADOR': 'URBANIZADOR/PARCELADOR',
            'URBANIZADOR O CONSTRUCTOR RESPONSABLE': 'URBANIZADOR/CONSTRUCTOR RESPONSABLE',
            'DIRECTOR DE LA CONSTRUCCION': 'DIRECTOR DE LA CONSTRUCCIÓN',
            'ARQUITECTO PROYECTISTA': 'ARQUITECTO PROYECTISTA',
            'INGENIERO CIVIL DISEÑADOR ESTRUCTURAL': 'INGENIERO CIVIL ESTRUCTURAL',
            'DISEÑADOR DE ELEMENTOS NO ESTRUCTURALES': 'DISEÑADOR ELEMENTOS NO ESTRUCT.',
            'INGENIERO CIVIL GEOTECNISTA': 'INGENIERO CIVIL GEOTECNISTA',
            'INGENIERO TOPOGRAFO Y/O TOPÓGRAFO': 'INGENIERO TOPÓGRAFO Y/O TOPÓGR.',
            'REVISOR INDEPENDIENTE DE LOS DISEÑOS ESTRUCTURALES': 'REVISOR INDEPENDIENTE ESTRUCTURAL',
            'OTROS PROFESIONALES ESPECIALISTAS': 'OTROS PROFESIONALES ESPECIALISTAS',
        };
    
        this.data.f52.forEach(value => {
            const role = profShortNames[value.role] || value.role || '';
            const name = `${value.name ?? ''} ${value.surname ?? ''}`.toUpperCase().trim();
            const registration = value.registration ?? '';
    
            const tr = document.createElement('tr');
            [role, name, registration].forEach(text => {
                const td = document.createElement('td');
                td.style.textAlign = 'center';
                td.style.padding = '0.2rem';
                td.textContent = text;
                tr.appendChild(td);
            });
    
            tbody.appendChild(tr);
        });
    }

    modifyTemplateContent() {
        console.log("[TemplateModifier] Iniciando modificación del template...");
        this.contentHeaderTitle()
        if (this._DATA?.reso?.model === "open") {

            let isSub = this.data.fun_1.tipo.includes('C');
            console.log(`[TemplateModifier] Modelo 'open' detectado. ¿Es sub? ${isSub}`);

            if (isSub) {
                this.consideratePart1_isSub();
                this.resolutivePart1_isSub();
                this.showDiv("considerate-1-isSub");
                this.showDiv("resolutive-1-isSub");
            } else {
                this.consideratePart1_isNotSub();
                this.resolutivePart1_isNotSub();
                this.showDiv("considerate-1-isNotSub");
                this.showDiv("resolutive-1-isNotSub");
            }
        } else {
            console.warn("[TemplateModifier] Modelo no es 'open'. No se aplicaron cambios.");
        }

        this.setText("document-issued", `Expedida en ${this._DATA.reso.ciudad} el ${this.dateParser(this._DATA.reso.reso_date)}`);
        this.setText("signature-name", `${this.data.curaduriaInfo.title.toUpperCase()} ${this.data.curaduriaInfo.master.toUpperCase()}`);
        this.setText("signature-job", this.data.curaduriaInfo.job);


        return this.tempDiv.innerHTML;
    }

    getHiddenData(id) {
        const element = this.tempDiv.querySelector(`#${id}`);
        return element ? element.textContent.trim() : null;
    }

    contentHeaderTitle() {

        //Title 
        const info = this.data.curaduriaInfo || { job: "", title: "", master: "", call: "" };
        // Cargo / dependencia (equivale a doc.fontSize(13) + Helvetica-Bold)
        if (info.job?.trim()) {
        this.setText("header-job", info.job);
        } else {
        this.tempDiv.querySelector("#header-job").style.display = "none";
        }

        // Título + Máster (equivale a fontSize(12) + uppercase)
        const t = (info.title || "").toUpperCase();
        const m = (info.master || "").toUpperCase();
        if (t || m) {
        this.setText("header-title", `${t} ${m}`.trim());
        } else {
        this.tempDiv.querySelector("#header-title").style.display = "none";
        }

        // Línea de llamada (equivale a fontSize(7))
        if (info.call?.trim()) {
        this.setText("header-call", info.call);
        } else {
        this.tempDiv.querySelector("#header-call").style.display = "none";
        }

        this.setText("reso-state-header", this._DATA.reso.reso_state );
        this.setText("header-id-cod", `ID ${this._DATA.fun.id_public}`);
        this.setText("date-header", this.data.fun_c.date );
        this.setText("legal-date-header", this.data.fun_c.legal_date);
        this.setText("info-pot-header", `Conforme al ${this.data.curaduriaInfo.pot.pot}\n Acuerdo ${this._DATA.reso.reso_pot}`);
    }

    consideratePart1_isSub() {
        let tempDiv = this.tempDiv;
        let data = this.data; 
        let CON_ORDER_i = 0;
        const getHiddenData = (id) => {
            const element = tempDiv.querySelector(`#${id}`);
            return element ? element.textContent.trim() : null;
        };
    
        // 3️⃣ Procesar el array oculto y agregarlo al DOM
        const SEXTO_ARRAY_SUB = getHiddenData("hidden-SEXTO_ARRAY") ? getHiddenData("hidden-SEXTO_ARRAY").split(".,") : [];
        const sextoArrayContainer = tempDiv.querySelector("#sexto-array");
    
        if (sextoArrayContainer) {
            SEXTO_ARRAY_SUB.forEach(a => {
                const p = document.createElement("p");
                p.classList.add("sub-item");
                p.textContent = `- ${a.trim()}`;
                sextoArrayContainer.appendChild(p);
            });
        } else {
            console.error("❌ No se encontró el contenedor #sexto-array en el DOM.");
        }
    
        const NOVENO_ARRAY_SUB = getHiddenData("hidden-NOVENO_ARRAY") ? getHiddenData("hidden-NOVENO_ARRAY").split(".,") : [];
        const novenoArrayContainer = tempDiv.querySelector("#noveno-array");
    
        if (novenoArrayContainer) {
            NOVENO_ARRAY_SUB.forEach(a => {
                const p = document.createElement("p");
                p.classList.add("sub-item");
                p.textContent = `- ${a.trim()}`;
                novenoArrayContainer.appendChild(p);
            });
        } else {
            console.error("❌ No se encontró el contenedor #noveno-array en el DOM.");
        }
    }
    
    consideratePart1_isNotSub() {
        let tempDiv = this.tempDiv;
        let data = this.data;
        let CON_ORDER_i = 0;
        const getHiddenData = (id) => {
            const element = tempDiv.querySelector(`#${id}`);
            return element ? element.textContent.trim() : null;
        };
    
        tempDiv.querySelector("#isNotSub-first-section strong").textContent = data.CON_ORDER[CON_ORDER_i];
        CON_ORDER_i++;
        tempDiv.querySelector("#isNotSub-body-1").textContent = data._BODY_PRIMERO || "";
    
        tempDiv.querySelector("#isNotSub-second-section strong").textContent = data.CON_ORDER[CON_ORDER_i];
        CON_ORDER_i++;
        tempDiv.querySelector("#isNotSub-body-2").textContent = data._BODY_SEGUNDO || "";
    
        const segundoArrayContainer = tempDiv.querySelector("#isNotSub-second-array");
    
        let SEGUNDO_ARRAY_C = data._SEGUNDO_ARRAY.filter((arr, i) => data.segundo_cb[i] == 'true')
    
        if (segundoArrayContainer && SEGUNDO_ARRAY_C.length > 0) {
            SEGUNDO_ARRAY_C.forEach((item, index) => {
                const p = document.createElement("p");
                p.textContent = `${String.fromCharCode(65 + index).toLowerCase()}. ${item.trim()}`; // Usar letras A, B, C...
                segundoArrayContainer.appendChild(p);
            });
            const textJump = document.createElement("br");
            segundoArrayContainer.appendChild(textJump);
        }
    
        let tercero_cb = data._DATA.reso.tercero_cb;
        tercero_cb = tercero_cb ? tercero_cb.split(',') : []
        const terceroArrayContainer = tempDiv.querySelector("#isNotSub-third-array");
    
        if (tercero_cb[0] === "true") {
    
            tempDiv.querySelector("#isNotSub-third-section strong").textContent = data.CON_ORDER[CON_ORDER_i];
            CON_ORDER_i++;
            tempDiv.querySelector("#isNotSub-body-3").textContent = data._BODY_TERCERO || "";
    
            this.showDiv("isNotSub-third-section");
    
            tercero_cb.shift(); // Elimina el primer elemento ya procesado
            // ✅ Procesar el array del tercero
            let new_tercero_array = [];
            let TERCERO_ARRAY = data._TERCERO_ARRAY
    
            new_tercero_array = TERCERO_ARRAY.filter((value, i) => (tercero_cb[i] === "true"));
    
            if (terceroArrayContainer && new_tercero_array.length > 0) {
                new_tercero_array.forEach((item,index) => {
                    const p = document.createElement("p");
                    p.textContent = `${String.fromCharCode(65 + index).toLowerCase()}. ${item.trim()}`;  // Lista con viñetas
                    terceroArrayContainer.appendChild(p);
                });
                // const textJump = document.createElement("br");
                // terceroArrayContainer.appendChild(textJump);
            }
        }
    
        if (data.cuarto == 'true') {
            this.showDiv("isNotSub-fourth-section");
            tempDiv.querySelector("#isNotSub-fourth-section strong").textContent = data.CON_ORDER[CON_ORDER_i];
            CON_ORDER_i++;
            tempDiv.querySelector("#isNotSub-body-4").textContent = data._BODY_CUARTO || "";
        };
    
        if (data.quinto == 'true') {
            this.showDiv("isNotSub-fifth-section");
            tempDiv.querySelector("#isNotSub-fifth-section strong").textContent = data.CON_ORDER[CON_ORDER_i];
            CON_ORDER_i++;
            tempDiv.querySelector("#isNotSub-body-5").textContent = data._BODY_QUINTO || "";
        };
    
        this.showDiv("isNotSub-sixth-section");
    
        // Título y cuerpo
        tempDiv.querySelector("#isNotSub-title-6").textContent = data.CON_ORDER[CON_ORDER_i];
        tempDiv.querySelector("#isNotSub-body-6").textContent = data._BODY_SEXTO || "";
        CON_ORDER_i++;
    
        // Procesamiento de checkbox
        let sexto_cb = data._DATA.reso.sexto_cb;
        sexto_cb = sexto_cb ? sexto_cb.split(',') : [];
        let new_sexto_array = [];
    
        sexto_cb.forEach((val, i) => {
            if (val === "true") new_sexto_array.push(data._SEXTO_ARRAY[i]);
        });
    
        const container = tempDiv.querySelector("#isNotSub-sexto-array");
    
        let lastLetterCode = 'a'.charCodeAt(0);
    
        new_sexto_array.forEach((item, i) => {
            const p = document.createElement("p");
            const label = String.fromCharCode(lastLetterCode + i);
            p.textContent = `${label}. ${item.trim()}`;
            container.appendChild(p);
        });
    
        // Mostrar _SEXTO_PAY_ARRAY si checkbox[2] es true
        let subListCount = 0;
        if (sexto_cb[2] === "true") {
            const payContainer = tempDiv.querySelector("#isNotSub-sexto-pay-array");
            const baseLabel = String.fromCharCode(lastLetterCode + new_sexto_array.length - 1); // la 'c' por ejemplo
    
            data._SEXTO_PAY_ARRAY.forEach((item, i) => {
                const p = document.createElement("p");
                p.textContent = `${baseLabel}.${i + 1}. ${item.trim()}`;
                payContainer.appendChild(p);
                subListCount++;
            });
        }
    
        // Almacena la siguiente letra disponible (ej: d, e, f...) para los bloques OPEN
        lastLetterCode = lastLetterCode + new_sexto_array.length;
        if (subListCount > 0) {
            // Si hubo sublista, solo incrementamos una vez más
            lastLetterCode += 1;
        }
    
        const open_cb = data._DATA.reso.open_cb ? data._DATA.reso.open_cb.split(',') : ['false', 'false', 'false'];
        const openContainer = tempDiv.querySelector("#open-sections");
        
        open_cb.forEach((val, i) => {
            if (val === "true") {
                const block = document.createElement("div");
                const title = document.createElement("strong");
                const paragraph = document.createElement("p");
        
                const letter = String.fromCharCode(lastLetterCode++);
                title.textContent = `${letter}. ${data.CON_ORDER[CON_ORDER_i]}`;
                paragraph.textContent = data._DATA.reso[`open_${i + 1}`] || "";
        
                block.appendChild(title);
                block.appendChild(paragraph);
                openContainer.appendChild(block);
                CON_ORDER_i++;
            }
        });
    }
    
    resolutivePart1_isSub(){
        let tempDiv = this.tempDiv;
        let data = this.data;
        tempDiv.querySelector("#art-1-body").textContent = data._BODY_ART_1_SUB || "";
        tempDiv.querySelector("#art-1-paragraph").textContent = data._DATA.reso.art_1p || "";
        tempDiv.querySelector("#art-2-body").textContent = data._BODY_ART_2_SUB || "";
        tempDiv.querySelector("#art-3-body").textContent = data._BODY_ART_3_SUB || "";
    
        // Insertar lista del artículo 3
        const art3ArrayContainer = tempDiv.querySelector("#art-3-array");
        if (art3ArrayContainer && data._BODY_ART_3_SUB_a) {
            const item = document.createElement("p");
            item.textContent = `- ${data._BODY_ART_3_SUB_a.trim()}`;
            art3ArrayContainer.appendChild(item);
        }
    
        tempDiv.querySelector("#art-4-body").textContent = data._BODY_ART_4_SUB || "";
        tempDiv.querySelector("#art-5-body").textContent = data._BODY_ART_5_SUB || "";
        tempDiv.querySelector("#art-6-body").textContent = data._BODY_ART_6_SUB || "";
        tempDiv.querySelector("#art-7-body").textContent = data._ARRAY_ART_7_SUB || "";
    
        return;
    }    
    
    resolutivePart1_isNotSub() {
        const data = this.data;
        const _DATA = this._DATA;
        const cur = data.curaduriaInfo || {};
        
        // Article 1

        let ACONF = this.LOAD_STEP('s34', 'arc');
        let ac_json = ACONF ? ACONF.json ? ACONF.json : {} : {};
        ac_json = this.getJSON_Simple(ac_json);
        let area = ac_json.m2;

        //doc.on('pageAdded', () => { return false });
        if (_DATA.reso.art_1_cb_tb == 'true') {
            this.F2_TABLE_MANUAL(_DATA.reso.art_1_txt_tb);
        } else this.TABLE_F2();
      
        // Pronombre y cargo
        this.setText('resolutive-pronoun-job', `${cur.pronoum || ''} ${cur.job || ''}`);
      
        // Artículo 1
        this.setText('body-art-1', data._BODY_ART_1 || '');

        // Información Geográfica
      
        // Artículo 1.2
        const art1cb = (_DATA.reso.art_1_cb || '').split(',');
        const art12cont = this.tempDiv.querySelector('#art-1-2-container');
        if (art1cb[0] === 'true') {
            let _BODY_ART_1_2 = data._BODY_ART_1_2;
            this.setText('art-1-2', data._BODY_ART_1_2);
            art12cont.style.display = '';
        } else art12cont.style.display = 'none';
        
        // Coordenadas
        const geoDiv = this.tempDiv.querySelector('#geo-info');
        if (cur.id === 'cub1') {
        const vals = this._GET_STEP_TYPE('geo', 'value', 'arc');

        this.setText('geo-cell-north', `Norte: ${vals?.[0] || '-'}`);
        this.setText('geo-cell-east',  `Este: ${vals?.[1] || '-'}`);

        geoDiv.style.display = 'table';
        } else {
        geoDiv.style.display = 'none';
        }

        // // Artículo 2 y 3 (igual que antes)
        this.setText('body-art-2', data?._BODY_ART_2);
        this.TABLE_F51(false, true, true);

        // this.setText('body-art-3', _DATA.reso.body_art_3 || '');
        this.setText('body-art-3', data?._BODY_ART_3);
        this.TABLE_F52(false, true, true);

        // Inicializar
        this.tempDiv.querySelector('#art-4-list').style.display = 'none';

        // 1. Antecedentes
        if (this.data.arts_cb[0] === 'true') {
        this.tempDiv.querySelector('#art-4-1-container').style.display = '';
        this.setText('body-art-4-1', this._DATA.reso.art_4_1 || 'No se presentaron antecedentes urbanísticos.');
        this.tempDiv.querySelector('#art-4-list').style.display = 'block';
        }

        // 2. Descripción
        if (this.data.arts_cb[1] === 'true') {
        this.tempDiv.querySelector('#art-4-2-container').style.display = '';
        this.setText('body-art-4-2', this._DATA.reso.art_4_2 || 'No se presentó descripción.');
        this.tempDiv.querySelector('#art-4-list').style.display = 'block';
        }

        // 3. Características (solo para cub1)
        if (this.curaduriaInfo.id === 'cub1') {
        this.tempDiv.querySelector('#art-4-3-container').style.display = '';
        this.setText('body-art-4-3', this._DATA.reso.art_4_3 || '');
        this.tempDiv.querySelector('#art-4-list').style.display = 'block';
        }

        // Tablas
        // AREAS TABLE
        let STEP = this.LOAD_STEP('a_config', 'arc');
        let json = STEP ? STEP.json ? STEP.json : {} : {};
        json = this.getJSON_Simple(json);

        var json_var = this._GET_STEP_TYPE_JSON('s34', 'json', 'arc');
        json_var = this.getJSON_Simple(json_var);

        const check34 = this._GET_STEP_TYPE('s34','check','arc');
        this.TABLE_AREAS(check34);

        // Artículo 5
        this.setText('body-art-5', data._BODY_ART_5 || '');
        this.setText('art-5-paragraph', data._BODY_ART_5P || '');

        // —– ARTÍCULO 6 —–
        const art6 = this.tempDiv.querySelector("#art-6-container");
        art6.style.display = "";

        // 3) Profesionales responsables (_ARRAY_ART_6)
        const profList = art6.querySelector("#art-6-prof-list");
        profList.style.listStyle = "none";  // quitar viñetas
        profList.innerHTML = "";
        (data._ARRAY_ART_6 || []).forEach((prof, i) => {
        if (prof?.trim()) {
            const li = document.createElement("li");
            // Prefijo alfabético manual: a., b., c., ...
            const prefix = document.createElement("span");
            prefix.textContent = `${String.fromCharCode(97 + i)}.`; 
            prefix.style.fontWeight = "bold";
            prefix.style.marginRight = "8px";
            li.appendChild(prefix);
            li.appendChild(document.createTextNode(prof));
            profList.appendChild(li);
        }
        });
        if (!profList.children.length) profList.parentNode.style.display = "none";

        // 4) Párrafo 2.1
        if (data._BODY_DUTY?.trim()) {
        this.setText("art-6-duty-2-1", `2.1. ${data._BODY_DUTY}`);
        } else {
        art6.querySelector("#art-6-duty-2-1").style.display = "none";
        }

        // 5) Ítems duty_cb ⇒ _DUTY_ARRAY
        const dutyFlags = (this._DATA.reso.duty_cb || "").split(",");
        const dutyList = art6.querySelector("#art-6-duty-list");
        dutyList.style.listStyle = "none";  // quitar viñetas
        dutyList.innerHTML = "";
        dutyFlags.forEach((flag, i) => {
        const txt = data._DUTY_ARRAY?.[i];
        if (flag === "true" && txt?.trim()) {
            const li = document.createElement("li");
            // Prefijo alfabético manual
            const prefix = document.createElement("span");
            prefix.textContent = `${String.fromCharCode(97 + i)}.`; 
            prefix.style.fontWeight = "bold";
            prefix.style.marginRight = "8px";
            li.appendChild(prefix);
            li.appendChild(document.createTextNode(txt));
            dutyList.appendChild(li);
        }
        });
        if (!dutyList.children.length) dutyList.parentNode.style.display = "none";

        // 6) BODY_DUTY_2 y BODY_DUTY_3
        if (dutyFlags[17] === "true" && data._BODY_DUTY_2?.trim()) {
        this.setText("art-6-duty-2", data._BODY_DUTY_2);
        } else {
        art6.querySelector("#art-6-duty-2").style.display = "none";
        }
        if (data._BODY_DUTY_3?.trim()) {
        this.setText("art-6-duty-3", data._BODY_DUTY_3);
        } else {
        art6.querySelector("#art-6-duty-3").style.display = "none";
        }

        // 7) Sub-lista 2.x con _DUTY_ARRAY_2 (índices 18 y 19)
        const subList = art6.querySelector("#art-6-duty-sublist");
        subList.style.listStyle = "none";  // quitar viñetas
        subList.innerHTML = "";
        const startAt = 2, root = 2;
        [18, 19].forEach((idx, j) => {
        const txt2 = data._DUTY_ARRAY_2?.[j];
        if (dutyFlags[idx] === "true" && txt2?.trim()) {
            const li = document.createElement("li");
            // Prefijo manual 2.2., 2.3., etc.
            const prefix = document.createElement("span");
            prefix.textContent = `${root}.${startAt + j}.`;
            prefix.style.fontWeight = "bold";
            prefix.style.marginRight = "8px";
            li.appendChild(prefix);
            li.appendChild(document.createTextNode(txt2));
            subList.appendChild(li);
        }
        });
        if (!subList.children.length) {
        subList.style.display = "none";
        }

        // —– ARTÍCULO 7 —–
        const art7 = this.tempDiv.querySelector("#art-7-container");
        art7.style.display = "";

        // Intro
        this.setText("body-art-7-intro", "Librar las siguientes notificaciones personales.");

        // Lista de notificaciones (_ARRAY_ART_7 filtrado por septimo_cb)
        const septimo = (this._DATA.reso.septimo_cb || "").split(",");
        const notifs = data._ARRAY_ART_7 || [];

        const list7 = art7.querySelector("#art-7-list");
        list7.innerHTML = "";
        // Aplicamos lista alfabética
        list7.style.listStyleType = "lower-alpha";
        list7.style.paddingLeft = "1.25rem";  // equivalente a ml-4

        let any7 = false;
        notifs.forEach((txt, i) => {
        if (septimo[i] === "true" && txt?.trim()) {
            any7 = true;
            const li = document.createElement("li");
            // Simplemente el texto, sin prefijo ni negrilla
            li.textContent = txt;
            list7.appendChild(li);
        }
        });
        if (!any7) list7.style.display = "none";

        // Párrafo final (_BODY_ART_7P)
        if (data._BODY_ART_7P?.trim()) {
        this.setText("body-art-7p", data._BODY_ART_7P);
        } else {
        art7.querySelector("#body-art-7p").style.display = "none";
        }

        // Flags de artículos
        const arts_cb = (this._DATA.reso.arts_cb || "").split(",");

        // —– ARTÍCULO 8 —–
        const art8 = this.tempDiv.querySelector("#art-8-container");
        art8.style.display = "";
        // cuerpo principal
        this.setText("body-art-8", data._BODY_ART_8 || "");
        // párrafos opcionales
        const p8p1 = art8.querySelector("#body-art-8p1");
        if (arts_cb[2] === "true" && data._BODY_ART_8P1?.trim()) {
        p8p1.textContent = data._BODY_ART_8P1;
        p8p1.style.display = "";
        }
        const p8p2 = art8.querySelector("#body-art-8p2");
        if (arts_cb[3] === "true" && data._BODY_ART_8P2?.trim()) {
        p8p2.textContent = data._BODY_ART_8P2;
        p8p2.style.display = "";
        }

        // Contador de offset si mostramos el 9
        let offset = 0;

        // —– ARTÍCULO 9 (si arts_cb[4]) —–
        if (arts_cb[4] === "true" && data._BODY_ART_9?.trim()) {
        offset = 1;
        const art9 = this.tempDiv.querySelector("#art-9-container");
        art9.style.display = "";
        // título fijo "ARTÍCULO 9°."
        art9.querySelector("#art-9-title").textContent = "ARTÍCULO 9°.";
        this.setText("body-art-9", data._BODY_ART_9);
        }

        // —– ARTÍCULO 10 (dinámico número 9+offset) —–
        const num10 = 9 + offset;
        const art10 = this.tempDiv.querySelector("#art-10-container");
        art10.style.display = "";
        art10.querySelector("#art-10-title").textContent = `ARTÍCULO ${num10}°.`;
        this.setText("body-art-10", data._BODY_ART_10);

        // —– ARTÍCULO FINAL (dinámico número 10+offset) —–
        const numF = 10 + offset;
        const artF = this.tempDiv.querySelector("#art-final-container");
        artF.style.display = "";
        artF.querySelector("#art-final-title").textContent = `ARTÍCULO ${numF}°.`;

    }
      
    
    showDiv(id, state="block") {
        const div = this.tempDiv.querySelector(`#${id}`);
        if (div) {
            div.style.display = state;
            console.log(`✅ Se mostró el div con ID: #${id}`);
        } else {
            console.error(`❌ No se encontró el div con ID: #${id}`);
        }
    }

    // Métodos auxiliares sin cambios
    getJSON_Simple(objec) {
        let json = objec;
        let whileSafeBreaker = 0;
        while (typeof json !== 'object') {
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
            if (_CHILD[i].version === this._DATA.version && _CHILD[i].id_public === _id_public) {
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
        var value = STEP[_type] ? STEP[_type] : []
        if (!value.length) return [];
        value = value.split(';');
        return value
    }

    _ADD_AREAS_H = (_areas, key, i, filter) => {
        let sum = 0;
        _areas.map(areas => {
            let value = areas[key] ? areas[key].split(';') : [];
            if (!filter) {
                let area = value[i] ? value[i] : 0;
                sum += Number(area)
            }
            if (filter) {
                let use = String(areas.use).toLowerCase();
                if (!use) use = 'otro';
                if (filter.includes(use)) {
                    let area = value[i] ? value[i] : 0;
                    sum += Number(area)
                }
            }
        })

        return sum.toFixed(2);
    }

    _ADD_AREAS_I = (_array, i, filter) => {
        if (!_array) return 0;
        let sum = 0;

        _array.map(areas => {
            if (!filter) {
                var area = areas.build ? areas.build.split(",") : 0;
                sum += Number(area[i]) || 0
            }
            if (filter) {
                let use = String(areas.use).toLowerCase();
                if (!use) use = 'otro';
                if (filter.includes(use)) {
                    var area = areas.build ? areas.build.split(",") : 0;
                    sum += Number(area[i]) || 0
                }
            }

        })

        return sum.toFixed(2);
    }

    dateParser(date) {
        const moment = require('moment');
        let esLocale = require('moment/locale/es');
        var momentLocale = moment(date, 'YYYY-MM-DD').locale('es', esLocale);
        return momentLocale.format("LL")
    }
}
