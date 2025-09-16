import React, { useRef, useEffect, useState } from "react";
import { ResoEngineTemplate } from "../../../utils/ResoEngineTemplate";
import { ActDesistEngineTemp } from "../../../utils/ActDesistEngineTemp";
import { ExecEngineTemp } from "../../../utils/ExecEngineTemp";
import { TemplateEngine } from "../../../utils/TemplateEngine";
import JoditEditor from "jodit-pro-react";
import { saveAs } from "file-saver";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
const MySwal = withReactContent(Swal);

export default function EXP_RES_2(props) {
  const { data, swaMsg, currentItem, currentModel} = props;

  console.log("EXP_RES_2 - currentModel:", currentModel);
  console.log("EXP_RES_2 - data:", data);

  const _DATA = data?._DATA ?? {};
  data.reso_tipo = _DATA.reso?.tipo || _DATA.reso?.type  || "Modalidad no encontrada...";

  const margins = {
    top: parseFloat(_DATA.reso?.m_top) || 7,
    bottom: parseFloat(_DATA.reso?.m_bot) || 1,
    left: parseFloat(_DATA.reso?.m_left) || 1,
    right: parseFloat(_DATA.reso?.m_right) || 1,
    topHeader: parseFloat(_DATA.reso?.record_header_spacing) || 6,
    r_pagesn: parseFloat(_DATA.reso?.r_pages) || 1,
    distance_icon_x: parseFloat(_DATA.reso?.distance_icon_x) || 55,
    distance_icon_y: parseFloat(_DATA.reso?.distance_icon_y) || 66,
    logo_pages: _DATA.reso?.logo_pages || 'impar',
    autenticidad: _DATA.reso?.autenticidad || 'Original',
    font_size_body: parseFloat(_DATA.reso?.font_size_body) || 14,
    font_size_header: parseFloat(_DATA.reso?.font_size_header) || 10,
  };

  console.log("MARGINS", margins);
  
  const editor = useRef(null);
  const [content, setContent] = useState("<p>Cargando plantilla...</p>");
  const [htmlSizeKB, setHtmlSizeKB] = useState(null);
  const [nameFile, setNameFile] = useState(null);

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        data.model = currentModel;
        data.clocks = (currentItem?.fun_clocks ?? []).filter(Boolean);
        data.autenticidad = _DATA.reso?.autenticidad || 'Original';

        console.log("Data: \n",data.clocks);

        const tpl = await TemplateEngine.buildTemplate(data, currentModel);
        let modifiedHTML;

        if (["delete", "return", "transfer"].includes(currentModel)) {
          setNameFile("Acta_Desistimiento");
          modifiedHTML = new ActDesistEngineTemp(data, tpl).modifyTemplateContent();
        } else if (["eje_open", "eje_des", "eje_neg"].includes(currentModel))  {
          setNameFile("Ejecutoria");
          modifiedHTML = new ExecEngineTemp(data, tpl).modifyTemplateContent();
        } else {
          modifiedHTML = new ResoEngineTemplate(data, tpl).modifyTemplateContent();
          setNameFile("Resolucion");
        }

        setContent(modifiedHTML);
      } catch (err) {
        console.error("Error cargando plantilla:", err);
        setContent("<p>Error cargando la plantilla.</p>");
      }
    };

    loadTemplate();
  }, [data, currentModel]);


  const config = {
    readonly: false,
    language: "es",
    minHeight: 700,
    iframe: true,
    allowHTML: true,
    minHeight: 0, // <= importante poner en 0 o eliminar
    //iframe: false, // <= cambia esto a false
    height: 600,
    defaultActionOnPaste: "insert_only_text",
    uploader: {
      url: 'https://xdsoft.net/jodit/finder/?action=fileUpload'
    },
    filebrowser: {
        ajax: {
            url: 'https://xdsoft.net/jodit/finder/'
        },
        height: 1000,
    },
  };

  const handleDownloadPDFv2 = async () => {
    try {
      MySwal.fire({
        title: "Se está generando el PDF",
        text: swaMsg.text_wait,
        icon: 'info',
        showConfirmButton: false,
      });

      const editorHTML = editor.current?.value;

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/pdf-generate/generate-pdf`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ html: editorHTML, margins }),
        }
      );

      if (!response.ok) throw new Error("Error generando el PDF");

      const blob = await response.blob();
      saveAs(blob, nameFile + " " + currentItem.id_public + ".pdf");

      MySwal.close();
    } catch (err) {
      MySwal.fire({
        title: swaMsg.generic_eror_title,
        text: swaMsg.generic_error_text,
        icon: 'warning',
        confirmButtonText: swaMsg.text_btn,
      });
      console.error("Error descargando PDF v2:", err);
    }
  };

  return (
    <div>
      <JoditEditor
        ref={editor}
        value={content}
        config={config}
        onChange={setContent}
      />
      <div className="mt-3 text-center">
        <button className="btn btn-danger" onClick={handleDownloadPDFv2}>
          Descargar PDF 🧾
        </button>
      </div>

      {htmlSizeKB && (
        <div className="mt-2 text-muted">
          Tamaño del HTML generado: <strong>{htmlSizeKB} KB</strong>
        </div>
      )}
    </div>
  );
}
