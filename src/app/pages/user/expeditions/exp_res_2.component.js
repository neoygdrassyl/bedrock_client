import { useRef, useEffect, useState } from "react";
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
  const { data, swaMsg, currentItem, currentModel, onClose } = props;

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
    logo_pages: _DATA.reso?.logo_pages || 'par',
    autenticidad: _DATA.reso?.autenticidad || 'Original',
    font_size_body: parseFloat(_DATA.reso?.font_size_body) || 14,
    font_size_header: parseFloat(_DATA.reso?.font_size_header) || 10,
  };

  console.log("MARGINS", margins);

  const editor = useRef(null);
  const containerRef = useRef(null);
  const [content, setContent] = useState("<p>Cargando plantilla...</p>");
  const [htmlSizeKB, setHtmlSizeKB] = useState(null);
  const [nameFile, setNameFile] = useState(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

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

  const getEditorHtml = () => {
    const editorContainer = containerRef.current;
    const iframe = editorContainer?.querySelector('iframe');
    const iframeHtml = iframe?.contentDocument?.body?.innerHTML || iframe?.contentDocument?.documentElement?.outerHTML || '';
    if (iframeHtml.trim()) return iframeHtml;

    const wysiwygHtml = editorContainer?.querySelector('.jodit-wysiwyg')?.innerHTML || '';
    if (wysiwygHtml.trim()) return wysiwygHtml;

    try {
      const editorValue = typeof editor.current?.value === 'string' ? editor.current.value : '';
      if (editorValue.trim()) return editorValue;
    } catch (error) {
      console.warn('No fue posible leer editor.current.value, usando fallbacks del DOM.', error);
    }

    if (typeof content === 'string' && content.trim()) return content;

    return '';
  };


  const config = {
    readonly: false,
    language: "es",
    loadExternalConfig: false,
    // El contenido generado trae estilos de documento propios.
    // Mantenerlo dentro del iframe evita que reestilice o redimensione el modal padre.
    iframe: true,
    allowHTML: true,
    minHeight: typeof window !== "undefined" ? Math.max(window.innerHeight - 320, 520) : 640,
    height: typeof window !== "undefined" ? Math.max(window.innerHeight - 320, 520) : 640,
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
    cleanHTML: {
      removeEmptyElements: false,
      fillEmptyParagraph: false
    }
  };

  const overlayStyle = {
    position: "fixed",
    inset: 0,
    zIndex: 2000,
    backgroundColor: "rgba(15, 23, 42, 0.58)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  };

  const panelStyle = {
    width: "min(1400px, calc(100vw - 3rem))",
    maxHeight: "calc(100vh - 3rem)",
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    boxShadow: "0 24px 80px rgba(15, 23, 42, 0.28)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  };

  const bodyStyle = {
    padding: "1rem 1.25rem 1.25rem",
    overflow: "auto",
  };

  const handleDownloadPDFv2 = async () => {
    try {
      MySwal.fire({
        title: "Se está generando el PDF",
        text: swaMsg.text_wait,
        icon: 'info',
        showConfirmButton: false,
      });

      const editorHTML = getEditorHtml();
      if (!editorHTML) {
        throw new Error("No se pudo obtener el HTML actual del editor.");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/pdf-generate/generate-pdf`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ html: editorHTML, margins }),
        }
      );

      if (!response.ok) {
        let detail = '';
        try {
          detail = await response.clone().text();
        } catch (_) {
          detail = '';
        }
        throw new Error(`Error generando el PDF (${response.status})${detail ? `: ${detail}` : ''}`);
      }

      const blob = await response.blob();
      if (!blob.size) {
        throw new Error("El backend respondió sin contenido PDF.");
      }

      saveAs(blob, nameFile + " " + currentItem.id_public + ".pdf");

      MySwal.close();
    } catch (err) {
      MySwal.fire({
        title: swaMsg.generic_eror_title,
        text: err?.message || swaMsg.generic_error_text,
        icon: 'warning',
        confirmButtonText: swaMsg.text_btn,
      });
      console.error("Error descargando PDF v2:", err);
    }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <section
        style={panelStyle}
        role="dialog"
        aria-modal="true"
        aria-label="Editor PDF de expedición"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 border-bottom px-4 py-3">
          <div>
            <h5 className="mb-1">Editor PDF</h5>
            <div className="text-muted small">
              {(nameFile || "Documento") + (currentItem?.id_public ? ` · ${currentItem.id_public}` : "")}
            </div>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <button type="button" className="btn btn-danger" onClick={handleDownloadPDFv2}>
              Descargar PDF 🧾
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>

        <div ref={containerRef} style={bodyStyle}>
          <JoditEditor
            ref={editor}
            value={content}
            config={config}
            onBlur={setContent}
            onChange={() => {}}
          />

          {htmlSizeKB && (
            <div className="mt-2 text-muted">
              Tamaño del HTML generado: <strong>{htmlSizeKB} KB</strong>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
