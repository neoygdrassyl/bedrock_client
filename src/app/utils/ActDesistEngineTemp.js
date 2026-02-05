import { BaseDocumentUtils } from './BaseDocumentUtils.js';

export class ActDesistEngineTemp extends BaseDocumentUtils {
    constructor(data, htmlString) {
        super(data, htmlString);
        this.desist_date = this.getDateByState(-6) || this.getDateByState(70) || "Fecha Inválida";
    }

    modifyTemplateContent() {
        console.log("[TemplateModifier] Iniciando modificación del template...");
        this.contentHeaderTitle();
        this.considerateSection();
        this.resolutiveSection();

        this.setText("document-issued", `Notifíquese y cumplase, Expedida en ${this._DATA.reso.ciudad} el ${this.dateParser(this.desist_date)}`);
        this.setText("signature-name", `${this.data.curaduriaInfo.title.toUpperCase()} ${this.data.curaduriaInfo.master.toUpperCase()}`);
        this.setText("signature-job", this.data.curaduriaInfo.job);
        this.setText("signature-name-law", "Proyectado/revisado por: "+this.data.curaduriaInfo.law || "Proyectado/revisado por: Abg. XXXX");

        const normalizeStrong = s => s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        this.tempDiv.innerHTML = normalizeStrong(this.tempDiv.innerHTML);

        return this.tempDiv.innerHTML;
    }

    contentHeaderTitle() {

        //Title 
        const info = this.data.curaduriaInfo || { job: "", title: "", master: "", call: "" };
        if (info.job?.trim()) {
        this.setText("desist-act-header-job", info.job);
        } else {
        this.tempDiv.querySelector("#desist-act-header-job").style.display = "none";
        }

        const t = (info.title || "").toUpperCase();
        const m = (info.master || "").toUpperCase();
        if (t || m) {
        this.setText("desist-act-header-title", `${t} ${m}`.trim());
        } else {
        this.tempDiv.querySelector("#desist-act-header-title").style.display = "none";
        }

        if (info.call?.trim()) {
        this.setText("desist-act-header-call", info.call);
        } else {
        this.tempDiv.querySelector("#desist-act-header-call").style.display = "none";
        }

        console.log("DATA RESO:", this._DATA.reso);

        let reso_id = this._DATA.reso.reso_id ? this._DATA.reso.reso_id.includes('-') ? this._DATA.reso.reso_id.split('-')[1] : this._DATA.reso.reso_id : '';
        let txt_res = `RESOLUCIÓN\n${reso_id} DEL ${this.dateParser(this.desist_date).toUpperCase()}`;
        this.setText("desist-act-reso-header", txt_res);

        this.setText("desist-act-reso-state-header", this._DATA.reso.reso_state );
        this.setText("desist-act-header-id-cod", `ID ${this._DATA.fun.id_public}`);
        this.setText("desist-act-info-pot-header", `Conforme al ${this.data.curaduriaInfo.pot.pot}\n Acuerdo ${this._DATA.reso.reso_pot}`);
        this.setText("desist-act-body_res", this.data._BODY || "");

        let ejec_header   = this.getDateByState(-30) || this.exec_date || "Fecha Inválida";
        this.setText("act-desist-date-header", this.desist_date);
        this.setText("ejec-date-header", ejec_header);

    }

    considerateSection() {
        const tempDiv = this.tempDiv;
        const data = this.data;
        const _DATA = this._DATA;
        let CON_ORDER_i = 0;

        let reso_date = _DATA.reso.reso_date || this.getDateByState(70);
        console.log("Data: ", data);

        // const ownersText = (data.f51 || [])
        //     .map(p => `${p.name} ${p.surname}`.toUpperCase())
        //     .join(", ");

        const ownersText = (_DATA.fun_51s || [])
            .map(p => ((p.surname) ? `**${(p.name).toUpperCase()} ${(p.surname).toUpperCase()}**` : 
            ((p.name) ? `**${(p.name).toUpperCase()}**` : `**${(p.rep_name).toUpperCase()}**`)))
            .join(", ");

        const first_text_cons = `Que el ${this.dateParser(reso_date)} se expidió la 
        Resolución No. ${_DATA.reso.reso_id}
        dentro de la solicitud con radicado interno ${_DATA.fun.id_public} "Por la cual 
        se **DESISTE** la solicitud de ${this.capFirstOnly(data.reso_tipo)}", 
        notificada personalmente a **${ownersText}** en 
        calidad de propietario${(data.f51.length>1) ? 's' : ''} del inmueble localizado en la **${data.f2?.direccion}**
        del barrio **${data.f2?.barrio}** del municipio de ${_DATA.reso.ciudad}.`;

        const second_text_cons = `Que el **(Añadir fecha de la comunicación de devolución)** 
        se realizo la debida notificación para la devolución de la documentación que reposa en
        esta dependencia de la solicitud desistida mencionada en el anterior cosiderando, 
        sin embargo, a la fecha de la presente acta no se ha recibido comunicación por parte 
        del interesado para retirar los documentos.`;

        const third_text_cons = `Dando cumplimiento a lo señalado en el artículo 2.2.6.1.2.3.4 
        del decreto 1077 de 2015 en concordancia con el parágrafo 2 del artículo 8 del Acuerdo 
        009 del 19 de diciembre de 2018, expedido por el Consejo Directivo del Archivo General 
        de la Nación Jorge Palacios Preciado, se evidencia que los documentos que conforman el 
        expediente **${_DATA.fun.id_public}** y que pueden ser objeto de eliminación son:`;

        tempDiv.querySelector("#act-des-cons-title-1").textContent = data.CON_ORDER[CON_ORDER_i++];
        tempDiv.querySelector("#act-des-cons-body-1").textContent = first_text_cons;

        if (data.model === "delete") {
            this.showDiv("act-des-cons-second-section");
            tempDiv.querySelector("#act-des-cons-title-2").textContent = data.CON_ORDER[CON_ORDER_i++];
            tempDiv.querySelector("#act-des-cons-body-2").textContent = second_text_cons;

            if (this.data.internal_documents && Object.keys(this.data.internal_documents).length > 0){
                this.showDiv("docs-table-internal");
                this.renderInternalDocsTable(this.data.internal_documents || {});
            }
        }

        tempDiv.querySelector("#act-des-cons-title-3").textContent = data.CON_ORDER[CON_ORDER_i++];
        tempDiv.querySelector("#act-des-cons-body-3").textContent = third_text_cons;

        // Documents list
        let documents = data.list_documents || [];
        this.renderDocsTable(documents);

    }

    resolutiveSection() {
        const tempDiv = this.tempDiv;
        const data = this.data;
        const _DATA = this._DATA;
        
        const ownersText = (_DATA.fun_51s || [])
            .map(p => ((p.surname) ? `**${(p.name).toUpperCase()} ${(p.surname).toUpperCase()}** identificado con **${p.id_number}**` : 
            ((p.name) ? `**${(p.name).toUpperCase()}** identificado con **${p.id_number}**` : `**${(p.rep_name).toUpperCase()}** identificado con **${p.id_number}**`)))
            .join(", ");

        const delete_text = `**EFECTUAR** la eliminación de los documentos contentivos en el expediente 
        ${_DATA.fun.id_public}, descritos en la parte considerativa de esta acta, debido a que ya ha 
        cumplido con su ciclo vital en el archivo de gestion, todo esto de conformidad con lo 
        dispuesto en el paragrafo 2 del articulo 8 del Acuerdo 009 del 19 de diciembre de 2018, 
        expedido por el Consejo Directivo del Archivo General de la Nacion Jorge Palacios Preciado y 
        lo contemplado en el ARTÍCULO 2.2.6.1.2.3.4 del Decreto 1077 de 2015. `;

        const return_text = `**ORDENAR** la devolución de los documentos contentivos en el expediente ${_DATA.fun.id_public},
         descritos en la parte considerativa de esta acta, a ${ownersText}, de conformidad 
         con lo dispuesto en el paragrafo 2 del articulo 8 del Acuerdo 009 del 19 de diciembre de 2018, 
         expedido por el Consejo Directivo del Archivo General de la Nacion Jorge Palacios Preciado y lo 
         contemplado en el ARTÍCULO 2.2.6.1.2.3.4 del Decreto 1077 de 2015. `;

        const transfer_text = `**ORDENAR** el desglose y traslado de los documentos contentivos en el 
        expediente ${_DATA.fun.id_public}, descritos en la parte considerativa de esta acta, a la radicación 
        ${_DATA.fun.id_public}, de conformidad con lo dispuesto en el paragrafo 2 del articulo 8 del Acuerdo 
        009 del 19 de diciembre de 2018, expedido por el Consejo Directivo del Archivo General de la 
        Nacion Jorge Palacios Preciado y lo contemplado en el ARTÍCULO 2.2.6.1.2.3.4 del Decreto 1077 
        de 2015. El traslado de los documentos NO implica pronunciamiento sobre la radicacion en legal 
        y debida forma o completa, y en todo caso, se esta sujeto a la revision de estos en conjunto 
        con los presentados en la nueva radicación.`;

        if (data.model === "delete") {
            this.setText("act-des-resol-1", delete_text);
            // Signatures section
            this.showDiv("signature-common-des",'flex');
            this.showDiv("signature-delete",'flex');
            this.setText("desist-act-reso-state-header",'ACTA DE ELIMINACION DE ARCHIVO');

        } else if (data.model === "return") {
            this.setText("act-des-resol-1", return_text);

            this.showDiv("signature-common-des");
            this.showDiv("signature-return");
            this.showDiv("signature-return-2");
            this.setText("desist-act-reso-state-header",'ACTA DE DEVOLUCION DE DOCUMENTOS');

        } else if (data.model === "transfer") {
            this.showDiv("act-des-resol-2");
            this.setText("act-des-resol-1", transfer_text);

            this.showDiv("signature-transfer");
            this.setText("desist-act-reso-state-header",'ACTO DESGLOSE Y TRASLADO');
        }
    }
}
