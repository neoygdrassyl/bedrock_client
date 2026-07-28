import { useRef, useEffect, useMemo, useState } from "react";
import { Button } from '@/components/ui/button';
import { ResoEngineTemplate } from "../../../utils/ResoEngineTemplate";
import { ActDesistEngineTemp } from "../../../utils/ActDesistEngineTemp";
import { ExecEngineTemp } from "../../../utils/ExecEngineTemp";
import { TemplateEngine } from "../../../utils/TemplateEngine";
import JoditEditor from "jodit-pro-react";
import { swalClose, swalError, swalProgressPDF, swalUpdateProgress } from '@/app/utils/swalAdapter';
import { Icon } from '@/components/icon';
import { downloadProtectedPdf } from '../../../utils/pdfDownload';
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
  const [isTemplateReady, setIsTemplateReady] = useState(false);
  const [htmlSizeKB, setHtmlSizeKB] = useState(null);
  const [nameFile, setNameFile] = useState(null);

  useEffect(() => {
    const loadTemplate = async () => {
      setIsTemplateReady(false);
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
        setIsTemplateReady(true);
      } catch (err) {
        console.error("Error cargando plantilla:", err);
        setContent("<p>Error cargando la plantilla.</p>");
        setIsTemplateReady(false);
      }
    };

    loadTemplate();
  }, [data, currentModel]);


  const config = useMemo(() => ({
    readonly: false,
    language: "es",
    iframe: true,
    editHTMLDocumentMode: true,
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
  }), []);

  const handleDownloadPDFv2 = async () => {
    try {
      if (!isTemplateReady) {
        swalError({ title: swaMsg.generic_eror_title, text: 'La plantilla todavía no ha terminado de cargar.', icon: 'warning' });
        return;
      }

      if (!content || !content.trim()) {
        swalError({ title: swaMsg.generic_eror_title, text: 'El editor no tiene contenido para exportar.', icon: 'warning' });
        return;
      }

      // ── Fase 1: abrir modal y mostrar progreso inicial ─────────────
      swalProgressPDF({ title: 'Generando PDF' });
      // Pequeña pausa para que el DOM del modal esté listo
      await new Promise(r => setTimeout(r, 80));
      swalUpdateProgress(5, 'Preparando documento...');

      await new Promise(r => setTimeout(r, 150));
      swalUpdateProgress(15, 'Enviando al servidor...');

      swalUpdateProgress(35, 'Generando PDF en el servidor...');
      const filename = `${nameFile} ${currentItem.id_public}.pdf`;
      await downloadProtectedPdf('/pdf-generate/generate-pdf', filename, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: { html: content, margins },
        onDownloadProgress: ({ loaded, total }) => {
          const progress = total ? 80 + Math.round((loaded / total) * 18) : 82;
          swalUpdateProgress(Math.min(progress, 98), 'Descargando archivo...');
        },
      });

      swalUpdateProgress(100, 'Listo. Guardando archivo...');
      await new Promise(r => setTimeout(r, 350));

      swalClose();
    } catch (err) {
      swalError({ title: swaMsg.generic_eror_title, text: err.message || swaMsg.generic_error_text, icon: 'warning' });
      console.error('Error descargando PDF v2:', err);
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

        <Button variant="destructive" size="sm" onClick={handleDownloadPDFv2} disabled={!isTemplateReady}>
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
          onBlur={setContent}
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
