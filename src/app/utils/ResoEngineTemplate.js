import { BaseDocumentUtils } from './BaseDocumentUtils.js';

export class ResoEngineTemplate extends BaseDocumentUtils {
    constructor(data, htmlString) {
        super(data, htmlString);
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
        } else if (this._DATA?.reso?.model === "des"){
            this.desist_ConsiderativePart();
            this.desist_ResolutivePart();
        } 
        else {
            console.warn("[TemplateModifier] Modelo no es 'open'. No se aplicaron cambios.");
        }

        this.setText("document-issued", `Notifíquese y cumplase, Expedida en ${this._DATA.reso.ciudad} el ${this.dateParser(this._DATA.reso.reso_date)}`);
        this.setText("signature-name", `${this.data.curaduriaInfo.title.toUpperCase()} ${this.data.curaduriaInfo.master.toUpperCase()}`);
        this.setText("signature-job", this.data.curaduriaInfo.job);
        this.setText("signature-name-law", "Proyectado/revisado por: "+this.data.curaduriaInfo.law || "Proyectado/revisado por: Abg. XXXX");
        return this.tempDiv.innerHTML;
    }

    contentHeaderTitle() {

        //Title 
        const info = this.data.curaduriaInfo || { job: "", title: "", master: "", call: "" };
        if (info.job?.trim()) {
        this.setText("header-job", info.job);
        } else {
        this.tempDiv.querySelector("#header-job").style.display = "none";
        }

        const t = (info.title || "").toUpperCase();
        const m = (info.master || "").toUpperCase();
        if (t || m) {
        this.setText("header-title", `${t} ${m}`.trim());
        } else {
        this.tempDiv.querySelector("#header-title").style.display = "none";
        }

        if (info.call?.trim()) {
        this.setText("header-call", info.call);
        } else {
        this.tempDiv.querySelector("#header-call").style.display = "none";
        }

        let reso_id = this._DATA.reso.reso_id ? this._DATA.reso.reso_id.includes('-') ? this._DATA.reso.reso_id.split('-')[1] : this._DATA.reso.reso_id : '';
        let txt_res = `RESOLUCIÓN\n${reso_id} DEL ${this.dateParser(this._DATA.reso.reso_date).toUpperCase()}`;
        this.setText("reso-header", txt_res);

        this.setText("reso-state-header", this._DATA.reso.reso_state );
        this.setText("header-id-cod", `ID ${this._DATA.fun.id_public}`);
        this.setText("date-header", this.data.fun_c.date );
        this.setText("legal-date-header", this.data.fun_c.legal_date);
        this.setText("info-pot-header", `Conforme al ${this.data.curaduriaInfo.pot.pot}\n Acuerdo ${this._DATA.reso.reso_pot}`);

        if(this._DATA?.reso?.model === "open") {
            this.setText("body_res", this.data._BODY || "");
        }
        else if(this._DATA?.reso?.model === "des") {
            this.setText("desist-date-header", this.getDateByState(-6) || "Fecha Inválida");
            this.setText("body_res", this.data._BODY || "");
        }
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
        const tempDiv = this.tempDiv;
        const data = this.data;
        let CON_ORDER_i = 0;

        tempDiv.querySelector("#isNotSub-first-section strong").textContent = data.CON_ORDER[CON_ORDER_i++];
        tempDiv.querySelector("#isNotSub-body-1").textContent = data._BODY_PRIMERO || "";

        tempDiv.querySelector("#isNotSub-second-section strong").textContent = data.CON_ORDER[CON_ORDER_i++];
        tempDiv.querySelector("#isNotSub-body-2").textContent = data._BODY_SEGUNDO || "";

        // --- SEGUNDO ARRAY ---
        const segundoArrayContainer = tempDiv.querySelector("#isNotSub-second-array");
        const SEGUNDO_ARRAY_C = data._SEGUNDO_ARRAY.filter((arr, i) => data.segundo_cb[i] === 'true');
        if (segundoArrayContainer && SEGUNDO_ARRAY_C.length > 0) {
            segundoArrayContainer.appendChild(this.createLetteredList(SEGUNDO_ARRAY_C));
        }

        // --- TERCERO ---
        const tercero_cb = data._DATA.reso.tercero_cb ? data._DATA.reso.tercero_cb.split(',') : [];
        const terceroArrayContainer = tempDiv.querySelector("#isNotSub-third-array");
        if (tercero_cb[0] === "true") {
            tempDiv.querySelector("#isNotSub-third-section strong").textContent = data.CON_ORDER[CON_ORDER_i++];
            tempDiv.querySelector("#isNotSub-body-3").textContent = data._BODY_TERCERO || "";
            this.showDiv("isNotSub-third-section");

            tercero_cb.shift(); 
            const new_tercero_array = data._TERCERO_ARRAY.filter((val, i) => tercero_cb[i] === "true");
            if (terceroArrayContainer && new_tercero_array.length > 0) {
                terceroArrayContainer.appendChild(this.createLetteredList(new_tercero_array));
            }
        }

        // --- CUARTO ---
        if (data.cuarto === 'true') {
            this.showDiv("isNotSub-fourth-section");
            tempDiv.querySelector("#isNotSub-fourth-section strong").textContent = data.CON_ORDER[CON_ORDER_i++];
            tempDiv.querySelector("#isNotSub-body-4").textContent = data._BODY_CUARTO || "";
        }

        // --- QUINTO ---
        if (data.quinto === 'true') {
            this.showDiv("isNotSub-fifth-section");
            tempDiv.querySelector("#isNotSub-fifth-section strong").textContent = data.CON_ORDER[CON_ORDER_i++];
            tempDiv.querySelector("#isNotSub-body-5").textContent = data._BODY_QUINTO || "";
        }

        this.showDiv("isNotSub-sixth-section");

        // Título y cuerpo
        tempDiv.querySelector("#isNotSub-title-6").textContent = data.CON_ORDER[CON_ORDER_i];
        tempDiv.querySelector("#isNotSub-body-6").textContent = data._BODY_SEXTO || "";
        CON_ORDER_i++;

        const sexto_cb_raw = data?._DATA?.reso?.sexto_cb ?? '';
        const sexto_cb = sexto_cb_raw.split(',').map(v => String(v).trim().toLowerCase());
        const src = Array.isArray(data?._SEXTO_ARRAY) ? data._SEXTO_ARRAY : [];

        const new_sexto_array = sexto_cb.reduce((acc, val, i) => {
        if (val === 'true') {
            const txt = src[i];
            if (typeof txt === 'string' && txt.trim().length) acc.push(txt.trim());
        }
        return acc;
        }, []);

        let lastLetterCode = 'a'.charCodeAt(0);

        // Render
        const container = tempDiv.querySelector('#isNotSub-sexto-array');
        if (!container) {
        console.warn('Contenedor #isNotSub-sexto-array no encontrado');
        } else {
        new_sexto_array.forEach((item, i) => {
            const div = document.createElement('div');
            div.className = 'considerative-item';

            const label = document.createElement('span');
            label.className = 'label';
            label.innerHTML = `<strong>${String.fromCharCode(lastLetterCode + i)}.</strong>`;

            const text = document.createElement('span');
            text.className = 'text';
            text.textContent = item; // ya viene trim()

            div.appendChild(label);
            div.appendChild(text);
            container.appendChild(div);
        });
        }

        // Mostrar _SEXTO_PAY_ARRAY si checkbox[2] es true
        let subListCount = 0;
        if (sexto_cb[2] === "true") {
            const payContainer = tempDiv.querySelector("#isNotSub-sexto-pay-array");
            const baseLabel = String.fromCharCode(lastLetterCode + new_sexto_array.length - 1);

            const mainLetter = String.fromCharCode(lastLetterCode + new_sexto_array.length - 1);

            data._SEXTO_PAY_ARRAY.forEach((item, i) => {
                if (item.trim() != "") {
                    const div = document.createElement("div");
                    div.className = "considerative-subitem";

                    const sublabel = document.createElement("span");
                    sublabel.className = "sublabel";
                    sublabel.innerHTML = `<strong>${mainLetter}.${i + 1} </strong>`;

                    const subtext = document.createElement("span");
                    subtext.className = "subtext";
                    subtext.textContent = item.trim();

                    div.appendChild(sublabel);
                    div.appendChild(subtext);
                    payContainer.appendChild(div);
                }
            });

        }

        lastLetterCode = lastLetterCode + new_sexto_array.length;
        if (subListCount > 0) {
            lastLetterCode += 1;
        }

        const open_cb = data._DATA.reso.open_cb ? data._DATA.reso.open_cb.split(',') : ['false', 'false', 'false'];
        const openContainer = tempDiv.querySelector("#open-sections");

        open_cb.forEach((val, i) => {
            if (val === "true") {
                const block = document.createElement("div");
                block.className = "considerative-item";

                const titleLabel = document.createElement("span");
                titleLabel.className = "label";
                titleLabel.innerHTML = `<strong>${String.fromCharCode(lastLetterCode++)}.</strong>`;

                const titleText = document.createElement("span");
                titleText.className = "text";
                titleText.textContent = data.CON_ORDER[CON_ORDER_i];

                block.appendChild(titleLabel);
                block.appendChild(titleText);
                openContainer.appendChild(block);

                const paragraph = document.createElement("div");
                paragraph.className = "considerative-subitem";

                const paragraphText = document.createElement("span");
                paragraphText.className = "subtext";
                paragraphText.textContent = data._DATA.reso[`open_${i + 1}`] || "";

                paragraph.appendChild(paragraphText);
                openContainer.appendChild(paragraph);

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
        const vals = _DATA.info_geo_arq || [];

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

        this.setText("body-art-6", data._BODY_ART_6);

        // 3) Profesionales responsables (_ARRAY_ART_6)
        const profList = art6.querySelector("#art-6-prof-list");
        profList.style.listStyle = "none";  // quitar viñetas
        profList.innerHTML = "";
        (data._ARRAY_ART_6 || []).forEach((prof, i) => {
        if (prof?.trim()) {
            const li = document.createElement("li");
            li.classList.add("considerative-item");
            // Prefijo alfabético manual: a., b., c., ...
            const prefix = document.createElement("span");
            prefix.classList.add("label");
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
            li.classList.add("considerative-item");
            // Prefijo alfabético manual
            const prefix = document.createElement("span");
            prefix.classList.add("label");
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
            li.classList.add("considerative-item");
            // Prefijo manual 2.2., 2.3., etc.
            const prefix = document.createElement("span");
            prefix.classList.add("label");
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

    desist_ConsiderativePart() {
        const tempDiv = this.tempDiv;
        const data = this.data;
        const _DATA = this._DATA.reso;
        let CON_ORDER_i = 0;

        tempDiv.querySelector("#des-cons-first-section strong").textContent = data.CON_ORDER[CON_ORDER_i++];
        tempDiv.querySelector("#des-cons-body-1").textContent = data._BODY_PRIMERO_a || "";

        if (_DATA.segundo_1) {
            this.showDiv("des-cons-second-section");
            tempDiv.querySelector("#des-cons-second-section strong").textContent = data.CON_ORDER[CON_ORDER_i++];
            tempDiv.querySelector("#des-cons-body-2").textContent = _DATA.segundo_1 || "";
        }

        if (_DATA.segundo_2) {
            this.showDiv("des-cons-third-section");
            tempDiv.querySelector("#des-cons-third-section strong").textContent = data.CON_ORDER[CON_ORDER_i++];
            tempDiv.querySelector("#des-cons-body-3").textContent = _DATA.segundo_2 || "";
        }

        if (_DATA.tercero_1) {
            this.showDiv("des-cons-fourth-section");
            tempDiv.querySelector("#des-cons-fourth-section strong").textContent = data.CON_ORDER[CON_ORDER_i++];
            tempDiv.querySelector("#des-cons-body-4").textContent = _DATA.tercero_1 || "";
        }

        if (_DATA.cuarto_1) {
            this.showDiv("des-cons-fifth-section");
            tempDiv.querySelector("#des-cons-fifth-section strong").textContent = data.CON_ORDER[CON_ORDER_i++];
            tempDiv.querySelector("#des-cons-body-5").textContent = _DATA.cuarto_1 || "";
        }

    }

    desist_ResolutivePart() {
        const tempDiv = this.tempDiv;
        const data = this.data;
        const _DATA = this._DATA.reso;

        tempDiv.querySelector("#des-resol-1").textContent = data._BODY_ART_1_a || "";
        tempDiv.querySelector("#des-resol-2").textContent = data._BODY_ART_2_a || "";
        tempDiv.querySelector("#des-resol-2-2").textContent = data._BODY_ART_2_a_2 || "";
        tempDiv.querySelector("#des-resol-3").textContent = data._BODY_ART_3_a || "";
        tempDiv.querySelector("#des-resol-4").textContent = data._BODY_ART_4_a || "";
        tempDiv.querySelector("#des-resol-5").textContent = data._BODY_ART_5_a || "";
        tempDiv.querySelector("#des-resol-6").textContent = data._BODY_ART_6_a || "";
    }

}
