// utils/TemplateEngine.js
export class TemplateEngine {
  static async buildTemplate(data, model) {
    // escoger rutas según modelo
    let header_file, part_cons, part_res, main;

    if (model === "open") {
      header_file = "/templates/resolution/header/header.html";
      part_cons   = "/templates/resolution/considerate/reso_open_cons.html";
      part_res    = "/templates/resolution/resolutive/reso_open_resol.html";
      main        = "/templates/resolution/main.html";

    } else if (model === "des") {
      header_file = "/templates/resolution/header/header_des.html";
      part_cons   = "/templates/resolution/considerate/des_cons.html";
      part_res    = "/templates/resolution/resolutive/des_resol.html";
      main        = "/templates/resolution/main.html";

    } else if (["delete", "return", "transfer"].includes(model)) {
      header_file = "/templates/ActDesist/header.html";
      part_cons   = "/templates/ActDesist/considerate/considerate.html";
      part_res    = "/templates/ActDesist/resolutive/resolutive.html";
      main        = "/templates/ActDesist/main.html";

    } else if (["eje_open", "eje_des", "eje_neg"].includes(model)) {
      header_file = "/templates/Executory/header.html";
      part_cons   = "/templates/Executory/body.html";
      part_res    = "/templates/Executory/resol_part.html";
      main        = "/templates/Executory/main.html";
    } else {
      // fallback
      header_file = "/templates/resolution/header/header.html";
      part_cons   = "/templates/resolution/considerate/reso_open_cons.html";
      part_res    = "/templates/resolution/resolutive/reso_open_resol.html";
      main        = "/templates/resolution/main.html";
    }

    // fetch en paralelo
    const [header, footer, mainTemplate, partConsiderate, partResolutive, customCSS] =
      await Promise.all([
        fetch(header_file).then(r => r.text()),
        fetch("/templates/resolution/footer.html").then(r => r.text()),
        fetch(main).then(r => r.text()),
        fetch(part_cons).then(r => r.text()),
        fetch(part_res).then(r => r.text()),
        fetch("/templates/resolution/considerate/style_part_cons.css").then(r => r.text()),
      ]);

    // componer plantilla
    let tpl = mainTemplate
      .replace("<custom-header></custom-header>", header)
      .replace("<considerate-section></considerate-section>", partConsiderate)
      .replace("<resolutive-section></resolutive-section>", partResolutive);

    tpl = Object.entries(data).reduce((tmp, [k, v]) => {
      const re = new RegExp(`{{\\s*${k}\\s*}}`, "g");
      return tmp.replace(re, v ?? "");
    }, tpl);

    tpl = tpl.replace("</head>", `<style>${customCSS}</style></head>`);

    return tpl;
  }
}
