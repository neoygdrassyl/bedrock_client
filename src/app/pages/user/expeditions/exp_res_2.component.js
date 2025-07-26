import React, { useRef, useEffect, useState } from "react";
import { TemplateModifier } from "../../../utils/TemplateModifier";
import JoditEditor from "jodit-pro-react";
import { saveAs } from "file-saver";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
const MySwal = withReactContent(Swal);

export default function EXP_RES_2(props) {
  const { data, swaMsg, currentItem} = props;

  const _DATA = data?._DATA ?? {};
  data.reso_tipo = _DATA.reso?.tipo;

  const margins = {
    top: parseFloat(_DATA.reso?.m_top) || 7,
    bottom: parseFloat(_DATA.reso?.m_bot) || 1,
    left: parseFloat(_DATA.reso?.m_left) || 1,
    right: parseFloat(_DATA.reso?.m_right) || 1,
    topHeader: parseFloat(_DATA.reso?.record_header_spacing) || 6,
    r_pagesn: parseFloat(_DATA.reso?.r_pages) || 1,
  };
  

  const editor = useRef(null);
  const [content, setContent] = useState("<p>Cargando plantilla...</p>");
  const [htmlSizeKB, setHtmlSizeKB] = useState(null);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const model = _DATA.reso?.model;
        const part_cons =
          model === "open"
            ? "part_cons_1.html"
            : model === "des"
            ? "part_cons_2.html"
            : "part_cons_3.html";
        const part_res =
          model === "open"
            ? "part_reso_1.html"
            : model === "des"
            ? "part_reso_2.html"
            : "part_reso_3.html";

        const [header, footer, mainTemplate, partConsiderate, partResolutive, customCSS] =
          await Promise.all([
            fetch("/templates/resolution/header.html").then((r) => r.text()),
            fetch("/templates/resolution/footer.html").then((r) => r.text()),
            fetch("/templates/resolution/main.html").then((r) => r.text()),
            fetch(`/templates/resolution/considerate/${part_cons}`).then((r) => r.text()),
            fetch(`/templates/resolution/resolutive/${part_res}`).then((r) => r.text()),
            fetch("/templates/resolution/considerate/style_part_cons.css").then((r) => r.text()),
          ]);

        let tpl = mainTemplate
          .replace("<custom-header></custom-header>", header)
          .replace("<custom-footer></custom-footer>", footer)
          .replace("<considerate-section></considerate-section>", partConsiderate)
          .replace("<resolutive-section></resolutive-section>", partResolutive);

        tpl = Object.entries(data).reduce((tmp, [k, v]) => {
          const re = new RegExp(`{{\\s*${k}\\s*}}`, "g");
          return tmp.replace(re, v ?? "");
        }, tpl);

        tpl = tpl.replace("</head>", `<style>${customCSS}</style></head>`);

        const modifiedHTML = new TemplateModifier(data, tpl).modifyTemplateContent();

        setContent(modifiedHTML); // Cargamos el contenido inicial en el editor
      } catch (e) {
        console.error("Error cargando plantilla:", e);
        setContent("<p>Error cargando la plantilla.</p>");
      }
    }

    fetchTemplates();
  }, [data]);

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
      saveAs(blob, "Resolucion " + currentItem.id_public + ".pdf");

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
