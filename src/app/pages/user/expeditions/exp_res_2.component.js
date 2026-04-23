import { useRef, useEffect, useState } from "react";
import { Button } from '@/components/ui/button';
import { ResoEngineTemplate } from "../../../utils/ResoEngineTemplate";
import { ActDesistEngineTemp } from "../../../utils/ActDesistEngineTemp";
import { ExecEngineTemp } from "../../../utils/ExecEngineTemp";
import { TemplateEngine } from "../../../utils/TemplateEngine";
import JoditEditor from "jodit-pro-react";
import { saveAs } from "file-saver";
import { swalClose, swalError, swalLoading } from '@/app/utils/swalAdapter';
import { Icon } from '@/components/icon';
export default function EXP_RES_2(props) {
  const { data, swaMsg, currentItem, currentModel} = props;

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
    iframe: true,
    allowHTML: true,
    minHeight: 0,
    height: 640,
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

  const handleDownloadPDFv2 = async () => {
    try {
      swalLoading({ title: "Se está generando el PDF", text: swaMsg.text_wait });

      const editorHTML = editor.current?.value;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/pdf-generate/generate-pdf`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ html: editorHTML, margins }),
        }
      );

      if (!response.ok) throw new Error("Error generando el PDF");

      const blob = await response.blob();
      saveAs(blob, nameFile + " " + currentItem.id_public + ".pdf");

      swalClose();
    } catch (err) {
      swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
      console.error("Error descargando PDF v2:", err);
    }
  };

  return (
    <div className="mt-4 rounded-xl border border-border bg-card p-4 shadow-sm" data-testid="exp-res-editor">
      <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h3 className="m-0 text-sm font-semibold text-foreground">Editor PDF de resolución</h3>
          <p className="m-0 text-sm text-muted-foreground">
            Revisa el contenido generado, ajusta el texto y descarga el PDF cuando la vista previa quede correcta.
          </p>
        </div>

        <Button variant="destructive" size="sm" onClick={handleDownloadPDFv2}>
          <Icon name="file-pdf" size={16} className="me-2" />
          Descargar PDF
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border/70 bg-background">
        <JoditEditor
          ref={editor}
          value={content}
          config={config}
          tabIndex={1}
          onChange={setContent}
        />
      </div>

      {htmlSizeKB && (
        <div className="mt-2 text-xs text-muted-foreground">
          Tamaño del HTML generado: <strong>{htmlSizeKB} KB</strong>
        </div>
      )}
    </div>
  );
}
