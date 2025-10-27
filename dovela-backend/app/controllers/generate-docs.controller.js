const puppeteer = require('puppeteer-core');
const { PDFDocument } = require('pdf-lib');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

exports.generatePDF = async (req, res) => {
  let browser;
  const DEBUG = true;

  try {
    const { html, margins } = req.body;

    if (!html || typeof html !== "string") {
      return res.status(400).json({ error: "HTML inválido" });
    }

    let distance_icon_y = ((margins && margins.distance_icon_y != null) ? margins.distance_icon_y : 66);
    let distance_icon_x = ((margins && margins.distance_icon_x != null) ? margins.distance_icon_x : 55);
    let logo_pages = ((margins && margins.logo_pages != null) ? margins.logo_pages : 'impar');
    let font_size_body = ((margins && margins.font_size_body != null) ? margins.font_size_body : 12);
    let font_size_header = ((margins && margins.font_size_header != null) ? margins.font_size_header : 10);

    console.log("Font size body:", font_size_body);
    console.log("Font size header:", font_size_header);
    
    const ptToPx = (pt) => Math.round((pt * 96) / 72);
    const headerFontPx = ptToPx(font_size_header || 10);
    console.log("RESULTADO HEADER FONT", headerFontPx);

    // --- Cálculo de márgenes ---
    const marginTopUser   = ((margins && margins.top       != null) ? margins.top       : 7) * 10;
    const marginBottom    = ((margins && margins.bottom    != null) ? margins.bottom    : 1) * 10;
    const marginLeft      = ((margins && margins.left      != null) ? margins.left      : 1) * 10;
    const marginRight     = ((margins && margins.right     != null) ? margins.right     : 1) * 10;
    const headerHeightMM  = ((margins && margins.topHeader != null) ? margins.topHeader : 6) * 10;
    const finalMarginTop  = marginTopUser + headerHeightMM;
    const r_pagesn        = ((margins && margins.r_pagesn  != null && margins.r_pagesn > 0) ? true : false);

    if (DEBUG) {
      const htmlSizeInKB = (Buffer.byteLength(html, 'utf-8') / 1024).toFixed(2);
      console.log(`Tamaño del HTML: ${htmlSizeInKB} KB`);
      console.log("Primeros 500 caracteres del HTML:");
      console.log(html.slice(0, 500));
    }

    // --- Extraer y reemplazar <custom-header> ---
    const headerMatch = html.match(/<custom-header[^>]*>([\s\S]*?)<\/custom-header>/i);
    let extractedHeader = '';
    let htmlWithoutHeader = html;

    if (headerMatch) {
      const rawHeader = headerMatch[1];
      extractedHeader = rawHeader.replace(
        /<img[^>]*src=["'][^"']*["'][^>]*>/i,
        ``
      );
      htmlWithoutHeader = html.replace(headerMatch[0], '');
    }

    // === LIBERATION SANS NARROW: Configuración de fuentes ===
    const fontsDir = path.join(__dirname, '..', 'fonts');

    const PATHS = {
      regular: process.env.LIBERATION_SANS_NARROW_TTF_PATH        || path.join(fontsDir, 'LiberationSansNarrow-Regular.ttf'),
      bold:    process.env.LIBERATION_SANS_NARROW_BOLD_TTF_PATH   || path.join(fontsDir, 'LiberationSansNarrow-Bold.ttf'),
      italic:  process.env.LIBERATION_SANS_NARROW_ITALIC_TTF_PATH || path.join(fontsDir, 'LiberationSansNarrow-Italic.ttf'),
      bi:      process.env.LIBERATION_SANS_NARROW_BOLDITALIC_TTF_PATH || path.join(fontsDir, 'LiberationSansNarrow-BoldItalic.ttf'),
    };

    const toB64 = p => (p && fs.existsSync(p) ? fs.readFileSync(p).toString('base64') : null);
    const regB64  = toB64(PATHS.regular);
    const boldB64 = toB64(PATHS.bold);
    const italB64 = toB64(PATHS.italic);
    const biB64   = toB64(PATHS.bi);

    const clamp = (v, min = 6) => Math.max(min, Math.round(v));

    let titleGeneralSize = clamp(font_size_body + 4);
    let textSizeSmallSize = clamp(font_size_body + 0);
    let textSizeSmallerSize = clamp(font_size_body - 3);

    // Encabezados (hasta h4), incrementos fijos
    let h1Size = clamp(font_size_body + 12);
    let h2Size = clamp(font_size_body + 6);
    let h3Size = clamp(font_size_body + 10);
    let h4Size = clamp(font_size_body + 8);

    let fontFaceCSS;
    let fontFaceCSS_header = '';

    if (regB64) {
      let faces = `
    @font-face{
      font-family:'LiberationSansNarrowCustom';
      src:url('data:font/ttf;base64,${regB64}') format('truetype');
      font-weight:400;
      font-style:normal;
      font-display:swap;
    }
    ${boldB64 ? `@font-face{
      font-family:'LiberationSansNarrowCustom';
      src:url('data:font/ttf;base64,${boldB64}') format('truetype');
      font-weight:700;
      font-style:normal;
      font-display:swap;
    }` : ''}
    ${italB64 ? `@font-face{
      font-family:'LiberationSansNarrowCustom';
      src:url('data:font/ttf;base64,${italB64}') format('truetype');
      font-weight:400;
      font-style:italic;
      font-display:swap;
    }` : ''}
    ${biB64 ? `@font-face{
      font-family:'LiberationSansNarrowCustom';
      src:url('data:font/ttf;base64,${biB64}') format('truetype');
      font-weight:700;
      font-style:italic;
      font-display:swap;
    }` : ''}
      `.trim();

      fontFaceCSS = `
    ${faces}

    /* Familia global */
    html,body,.document,.document *{
      font-family:'LiberationSansNarrowCustom','Liberation Sans Narrow','Arial Narrow',Arial,sans-serif !important;
    }

    /* Font-size dinámico - Solo tamaños */
    body, .document, .document p, .document strong { font-size: ${font_size_body}pt !important; }
    td, th { font-size: ${font_size_body}pt !important; }

    /* Clases personalizadas */
    .titles-general { font-size: ${titleGeneralSize}pt !important; }
    .text-size-small { font-size: ${textSizeSmallSize}pt !important; }
    .text-size-smaller { font-size: ${textSizeSmallerSize}pt !important; }

    /* Encabezados */
    h1, .document h1 { font-size: ${h1Size}pt !important; }
    h2, .document h2 { font-size: ${h2Size}pt !important; }
    h3, .document h3 { font-size: ${h3Size}pt !important; }
    h4, .document h4 { font-size: ${h4Size}pt !important; }

    /* Elementos especiales */
    strong, b, .document strong, .document b { font-size: ${font_size_body}pt !important; }
    em, i, .document em, .document i { font-size: ${font_size_body}pt !important; }

    /* Tablas específicas */
    #determinates-table-1,
    #determinates-table-33,
    #determinates-table-34,
    #areas-table-container,
    .areas-table-container { font-size: ${font_size_body}pt !important; }

    /* Elementos con font-size específico */
    .relleno-balance { font-size: ${font_size_body}pt !important; }

    /* Tablas responsivas */
    .responsive-table-container table { 
      font-size: clamp(${Math.round(font_size_body * 0.8)}pt, 1vw, ${Math.round(font_size_body * 1.2)}pt); 
    }
      `.trim();

      fontFaceCSS_header = `
    ${faces}
    html,body,.document,.document *{
      font-family:'LiberationSansNarrowCustom','Liberation Sans Narrow','Arial Narrow',Arial,sans-serif !important;
    }
      `.trim();

      console.log('Fuente Liberation Sans Narrow cargada exitosamente');
      console.log('Variantes disponibles:', {
        regular: !!regB64,
        bold: !!boldB64,
        italic: !!italB64,
        boldItalic: !!biB64
      });
      console.log('Tamaños dinámicos aplicados:', { 
        base: font_size_body, 
        titlesGeneral: titleGeneralSize,
        textSizeSmall: textSizeSmallSize,
        textSizeSmaller: textSizeSmallerSize
      });
      
    } else {
      console.warn('Liberation Sans Narrow no encontrada; usando fallback.');
      
      fontFaceCSS = `
        html,body,.document,.document *{ font-family:'Liberation Sans Narrow','Arial Narrow',Arial,sans-serif !important; }
        body, .document, .document p, strong, b, td, th { font-size:${font_size_body}pt !important; }
        .titles-general { font-size:${titleGeneralSize}pt !important; }
        .text-size-small { font-size:${textSizeSmallSize}pt !important; }
        .text-size-smaller { font-size:${textSizeSmallerSize}pt !important; }
        h1 { font-size:${h1Size}pt !important; }
        h2 { font-size:${h2Size}pt !important; }
        #determinates-table-1, #determinates-table-33, #determinates-table-34, #areas-table-container, .areas-table-container { font-size:${font_size_body}pt !important; }
      `.trim();

      fontFaceCSS_header = `
        html,body,.document,.document *{ font-family:'Liberation Sans Narrow','Arial Narrow',Arial,sans-serif !important; }
      `.trim();
    }

    const headerTemplateHTML = `
      <style>
        ${fontFaceCSS_header}

        /* Fuerza Liberation Sans Narrow también en el encabezado */
        html, body, .header-container, .header-container * {
          font-family:'LiberationSansNarrowCustom','Liberation Sans Narrow','Arial Narrow',Arial,sans-serif !important;
          font-size: ${font_size_header}pt !important;
        }

        /* Aplicar tamaño de fuente específico a todos los elementos */
        .header-container,
        .header-container *,
        .header-container p,
        .header-container div,
        .header-container span,
        .header-container td,
        .header-container th,
        .header-container strong,
        .header-container b {
          font-size: ${font_size_header}pt !important;
          line-height: 1.2 !important;
        }

        .header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          font-size: ${font_size_header}pt !important;
        }

        .header-container table { 
          border-collapse: collapse; 
          width: 100%; 
          font-size: ${font_size_header}pt !important;
        }
        
        .header-container td, .header-container th { 
          padding: 2px; 
          font-size: ${font_size_header}pt !important;
        }
        
        .header-logo { 
          width: 60px; 
          height: auto; 
          margin: 0; 
        }

        /* Asegurar que elementos específicos también tomen el tamaño correcto */
        .header-container .text,
        .header-container .title,
        .header-container .content {
          font-size: ${font_size_header}pt !important;
        }
      </style>

      <div class="header-container"
          style="padding-top:${marginTopUser}mm;
                  padding-left:${marginLeft - 5.5}mm;
                  padding-right:${marginRight}mm;
                  font-size:${font_size_header}pt !important;">
        ${extractedHeader}
      </div>
    `;

    // --- Conexión con Browserless ---
    console.log("Conectando al navegador remoto...");
    const maxRetries = 3;
    let retryCount = 0;
    let connectionError;

    while (retryCount < maxRetries) {
      try {
        browser = await puppeteer.connect({
          browserWSEndpoint: `wss://production-sfo.browserless.io/chromium?token=2Se64hJgnBlJSaTb6c5704b613bf261d1d5831f2d7ad082c1`,
          ignoreHTTPSErrors: true,
          defaultViewport: null,
          timeout: 45000,
        });
        console.log("Conexión exitosa al navegador remoto");
        break;
      } catch (error) {
        connectionError = error;
        retryCount++;
        if (error.message.includes('429')) {
          console.log(`Rate limit alcanzado. Reintento ${retryCount}/${maxRetries} en 5 segundos...`);
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            continue;
          }
        }
      }
    }

    if (!browser) {
      const lastErrorMessage = (connectionError && connectionError.message) ? connectionError.message : 'Desconocido';
      throw new Error(`No se pudo conectar después de ${maxRetries} intentos. Error: ${lastErrorMessage}`);
    }

    // --- Crear página ---
    console.log("Creando nueva página...");
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(120000);
    await page.setDefaultTimeout(120000);
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.error('PAGE ERROR:', err.message));
    page.on('requestfailed', req => console.warn(`Request failed: ${req.url()} - ${req.failure().errorText}`));

    // --- Interceptar requests ---
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const url = request.url();
      const isBootstrapCSS = url.startsWith('https://cdn.jsdelivr.net/npm/bootstrap') && url.endsWith('.css');
      const isJoditUploader = url.startsWith('https://xdsoft.net/jodit/finder/?action=fileUpload');
      const isJoditBrowser  = url.startsWith('https://xdsoft.net/jodit/finder/');
      if (url.startsWith('http')) {
        if (isBootstrapCSS || isJoditUploader || isJoditBrowser) {
          request.continue();
        } else {
          console.log(`Bloqueado: ${url}`);
          request.abort();
        }
      } else {
        request.continue();
      }
    });

    // --- Cargar contenido ---
    console.log("Estableciendo contenido HTML...");
    await page.goto('data:text/html,' + encodeURIComponent(htmlWithoutHeader), {
      waitUntil: 'networkidle2',
      timeout: 90000,
    });
    console.log("Contenido HTML establecido correctamente");

    // Inyectar CSS de fuentes
    await page.evaluate((css) => {
      const style = document.createElement('style');
      style.type = 'text/css';
      style.innerHTML = css;
      document.head.appendChild(style);
    }, fontFaceCSS);

    // --- Generar PDF ---
    console.log("Generando PDF...");
    const pdfBuffer = await page.pdf({
      width: '215.9mm',
      height: '330.2mm',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: headerTemplateHTML,
      footerTemplate: r_pagesn
        ? `
          <div style="font-size:10px; width:100%; text-align:center; padding-bottom:${marginBottom - (marginBottom * .3)}mm; font-family:'LiberationSansNarrowCustom','Liberation Sans Narrow','Arial Narrow',Arial,sans-serif;">
            <span class="pageNumber"></span> de <span class="totalPages"></span>
          </div>
        `
        : '<span></span>',
      margin: {
        top:    `${finalMarginTop}mm`,
        bottom: `${marginBottom}mm`,
        left:   `${marginLeft}mm`,
        right:  `${marginRight}mm`,
      },
      timeout: 120000,
    });

    console.log("PDF generado exitosamente");
    await page.close();
    await browser.close();
    browser = null;

    // --- Post-procesar PDF con pdf-lib ---
    const realBuffer = Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);
    if (!Buffer.isBuffer(realBuffer) || realBuffer.length === 0) {
      return res.status(500).json({ error: "PDF generado no válido" });
    }

    const pdfDoc = await PDFDocument.load(realBuffer);
    const pages = pdfDoc.getPages();

    // 1. Cargar logo desde URL
    const logoUrl = 'https://uploads.onecompiler.io/43kp82whv/43mkk8hxu/logo.8340fc36.png';
    const logoBytes = await fetch(logoUrl).then(r => r.arrayBuffer());
    const logoImage = await pdfDoc.embedPng(logoBytes);
    const logoWidth = 60;
    const logoHeight = (logoImage.height / logoImage.width) * logoWidth;

    function shouldShowLogo(pageNumber, mode) {
      switch (mode) {
        case 'all':
          return true;
        case 'none':
          return false;
        case 'impar':
          return pageNumber % 2 === 1;
        case 'par':
          return pageNumber % 2 === 0;
        default:
          return false;
      }
    }

    // 2. Insertar logo en páginas
    pages.forEach((page, idx) => {
      const { width, height } = page.getSize();
      const pageNumber = idx + 1;

      if (shouldShowLogo(pageNumber, logo_pages)) {
        page.drawImage(logoImage, {
          x: width - logoWidth - distance_icon_x,
          y: height - logoHeight - distance_icon_y,
          width: logoWidth,
          height: logoHeight,
        });
      }
    });

    const finalPdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="documento.pdf"');
    res.send(Buffer.from(finalPdfBytes));

  } catch (err) {
    console.error("Error generando PDF:", err.message);
    if (DEBUG) console.error("Stack trace:", err.stack);

    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error("Error cerrando browser:", closeError.message);
      }
    }

    let errorMessage = "Error interno generando el PDF";
    let statusCode = 500;

    if (err.message.includes('429')) {
      errorMessage = "Servicio temporalmente no disponible. Intenta nuevamente en unos minutos.";
      statusCode = 429;
    } else if (err.message.includes('timeout')) {
      errorMessage = "Timeout generando el PDF. Intenta con un documento más pequeño.";
      statusCode = 408;
    }

    if (!res.headersSent) {
      res.status(statusCode).json({
        error: errorMessage,
        details: DEBUG ? err.message : undefined
      });
    }
  }
};
