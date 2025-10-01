import { BaseDocumentUtils } from './BaseDocumentUtils.js';

export class ExecEngineTemp extends BaseDocumentUtils {
    constructor(data, htmlString) {
        super(data, htmlString);
        this.state = '';
        this.reso_date_exec = this.getDateByState(70) || this._DATA?.reso?.reso_date || "";
    }

    modifyTemplateContent() {
        console.log("[TemplateModifier] Iniciando modificación del template...");
        this.contentHeaderTitle();
        this.bodySection();
        // this.considerateSection();
        // this.resolutiveSection();

        const normalizeStrong = s => s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        this.tempDiv.innerHTML = normalizeStrong(this.tempDiv.innerHTML);

        return this.tempDiv.innerHTML;
    }

    contentHeaderTitle() {

        if (this.data.model === "eje_open") {
            this.state = "OTORGADA";
            this.setText("exec-act-header-rad-state", "Otorgada");
            this.setText("act-exec-date-header", this.reso_date_exec);
            this.showDiv("vig-exec-o");
            let vig_text = `Con fundamento en el artículo 2.2.6.1.2.4.1 del Decreto 1077 
            de 2015 se concede una vigencia de ${this._DATA.reso.vn} para ejecutar las 
            obras autorizadas en la licencia de construcción en la(s) precitada(s) modalidad(es) 
            que acompaña(n) el reconocimiento, los cuales van DESDE EL 
            ${this.dateParser(this.exec_date).toUpperCase()} HASTA EL ${this.dateParser(this._DATA.reso.vig_date).toUpperCase()}.`;
            this.setText("exec-act-body-vig", vig_text);
        } else if (this.data.model === "eje_des") {
            this.state = "DESISTIDA";
            this.setText("exec-act-header-rad-state", "Desistida");
            this.exec_date = this.getDateByState(-30) || this.getDateBussinesDaysCol(this.notify_date) || "Fecha Inválida";
            this.reso_date_exec = this.getDateByState(-6) || this.getDateByState(70) || "Fecha Inválida";
            this.setText("act-exec-date-header",this.reso_date_exec);
        } else {
            this.state = "NEGADA";
            this.setText("exec-act-header-rad-state", "Negada");
            this.setText("act-exec-date-header", this.reso_date_exec);
        }

        this.setText("exec-ejec-date-header", this.exec_date);

        //Title 
        const cudaduria_info = this.data.curaduriaInfo || { job: "", title: "", master: "", call: "", pot: { pot: "", n: "", yy: "" } };
        let _DATA = this._DATA;
        if (cudaduria_info.job?.trim()) {
        this.setText("exec-act-header-job", cudaduria_info.job);
        } else {
        this.tempDiv.querySelector("#exec-act-header-job").style.display = "none";
        }

        const t = (cudaduria_info.title || "").toUpperCase();
        const m = (cudaduria_info.master || "").toUpperCase();
        if (t || m) {
        this.setText("exec-act-header-title", `${t} ${m}`.trim());
        } else {
        this.tempDiv.querySelector("#exec-act-header-title").style.display = "none";
        }

        if (cudaduria_info.call?.trim()) {
        this.setText("exec-act-header-call", cudaduria_info.call);
        } else {
        this.tempDiv.querySelector("#exec-act-header-call").style.display = "none";
        }

        console.log("DATA RESO:", this._DATA.reso);

        let reso_id = this._DATA.reso.reso_id ? this._DATA.reso.reso_id.includes('-') ? this._DATA.reso.reso_id.split('-')[1] : this._DATA.reso.reso_id : '';
        let txt_res = `RESOLUCIÓN\n${reso_id} DEL ${this.dateParser(this.reso_date_exec).toUpperCase()}`;
        this.setText("exec-act-reso-header", txt_res);

        this.setText("exec-act-state-header", this.data.formData.reso_state );
        this.setText("exec-act-header-id-cod", `ID ${this._DATA.fun.id_public}`);
        this.setText("exec-act-info-pot-header", `Conforme al ${this.data.curaduriaInfo.pot.pot}\n Acuerdo ${this._DATA.reso.reso_pot}`);

        this.setText("document-issued", `Expedida en ${this._DATA.reso.ciudad} el ${this.dateParser(this.exec_date)}.`);
        this.setText("signature-name", `${this.data.curaduriaInfo.title.toUpperCase()} ${this.data.curaduriaInfo.master.toUpperCase()}`);
        this.setText("signature-job", this.data.curaduriaInfo.job);
        this.setText("signature-name-law", "Proyectado/revisado por: "+this.data.curaduriaInfo.law || "Proyectado/revisado por: Abg. XXXX");
    }

    bodySection(){
        const cudaduria_info = this.data.curaduriaInfo || { job: "", title: "", master: "", call: "", pot: { pot: "", n: "", yy: "" } };
        let _DATA = this._DATA;
        let f2 = _DATA.fun_2 || {};

        let state = this._DATA.reso.reso_state;
        let action_word = _DATA.reso.reso_state;
        if (cudaduria_info.id == 'cub1' && action_word == 'OTORGADA') action_word = 'CONCEDE';

        let _BODY_2 = `El ${cudaduria_info.job} ${(cudaduria_info.master).toUpperCase()} en uso de sus facultades legales, derivadas de los actos de posesión y nombramiento y de las 
        facultades legales conferidas por las leyes: Ley 9 de 1989; Ley 388 de 1997; Ley 400 de 1997, Ley 810 de 2003, Ley 1796 de 2016; los decretos nacionales: Decreto 1077 de 
        2015 y sus decretos modificatorios que reglamenta el sector de vivienda, ciudad y territorio y en particular aquellos que establecen las condiciones para el estudio y expedición 
        de la licencias urbanísticas; Decreto 926 de 2010 y sus decretos modificatorios del Reglamento Colombiano de Construcción Sismorresistente NSR-10 y el Acuerdo Municipal 
        ${cudaduria_info.pot.n} de ${cudaduria_info.pot.yy} mediante el cual se adoptó el ${cudaduria_info.pot.pot} del municipio de ${_DATA.reso.ciudad},`.replace(/[\n\r]+ */g, ' ');

        //${action_word}: ${_DATA.reso.tipo}, decisión soportada en los siguientes elementos:

        this.setText("exec-act-body_res", _BODY_2 || "");

        // ===== exec-act-body-2 =====
        const licType   = this._DATA?.reso?.tipo || this.data?.formData?.tipo || "TIPO DE LICENCIA";
        let reso_id = this._DATA.reso.reso_id ? this._DATA.reso.reso_id.includes('-') ? this._DATA.reso.reso_id.split('-')[1] : this._DATA.reso.reso_id : '';
        let txt_res = `RESOLUCIÓN ${reso_id} DEL ${this.dateParser(this.reso_date_exec).toUpperCase()}`;
        const numPredial = f2?.catastral || f2?.predial || f2?.catastral_2 || "";
        const matricula  = f2?.matricula || "";
        const direccion  = f2?.direccion || "";
        const barrio     = f2?.barrio || "";
        const ciudad     = this._DATA?.reso?.ciudad || "";

        console.log("DATOS DE TITULARES: ",_DATA.fun_51s);

        const ownersText = (_DATA.fun_51s || [])
            .map(p => ((p.surname) ? `**${(p.name).toUpperCase()} ${(p.surname).toUpperCase()}** identificado con **${p.id_number}**` : 
            ((p.name) ? `**${(p.name).toUpperCase()}** identificado con **${p.id_number}**` : `**${(p.rep_name).toUpperCase()}** identificado con **${p.id_number}**`)))
            .join(", ");

        const body2 = `
        **${this.state}** la solicitud **${licType} ID ${_DATA.fun.id_public}**, para el inmueble identificado con el número predial **${numPredial}**, 
        matrícula inmobiliaria **${matricula}** y nomenclatura **${direccion}**${barrio ? ' barrio **'+barrio+'**' : ''} del municipio de **${ciudad}**.
        Solicitada por ${ownersText}. Actuando en calidad de propietario${(_DATA.fun_51s.length>1) ? 's' : ''} del inmueble, mediante 
        la **${txt_res}**, la solicitud de **${licType}**, la cual se encuentra **EJECUTORIADA**, al haber concluido los términos de 
        ley y agotarse los recursos el día ${this.dateParser(this.exec_date)}.
        `;

        this.setText("exec-act-body-2", body2);

        //exec-act-body-vig

        
    }

}
