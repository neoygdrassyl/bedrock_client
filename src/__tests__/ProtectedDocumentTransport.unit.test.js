import { readFileSync } from 'node:fs';

const generatedDocumentFiles = [
  'src/app/pages/user/seal.jsx',
  'src/app/pages/user/certifications/certification.page.jsx',
  'src/app/pages/user/norms/norm_resume.component.jsx',
  'src/app/pages/user/submit/submit_anex.component.jsx',
  'src/app/pages/user/zone_use/zone_use.component.jsx',
  'src/app/pages/user/records/record_letter_2.component.jsx',
  'src/app/pages/user/records/record_letter.component.jsx',
  'src/app/pages/user/records/record_review.jsx',
  'src/app/pages/user/pqrs/asignpqrs.jsx',
  'src/app/pages/user/pqrs/pqrs_manage.view.jsx',
  'src/app/pages/user/nomenclature/nomenclature_anex.component.jsx',
  'src/app/pages/user/fun_forms/components/fun_doc_confirmlegal.jsx',
  'src/app/pages/user/fun_forms/components/fun_doc_certification.component.jsx',
  'src/app/pages/user/fun_forms/components/fun_d_control.component_2.jsx',
  'src/app/pages/user/fun_forms/components/fun_report_data_pdf.component.jsx',
  'src/app/pages/user/fun_forms/components/fun_doc_confirminc.jsx',
  'src/app/pages/user/fun_forms/components/fun_alertNeighbour.jsx',
  'src/app/pages/user/fun_forms/components/fun_doc_abdicate.component.jsx',
  'src/app/pages/user/fun_forms/components/fun_d_control.component.jsx',
  'src/app/pages/user/fun_forms/components/fun_sign_pdf.component.jsx',
  'src/app/pages/user/fun_forms/components/fun_archive.component.jsx',
  'src/app/pages/user/fun_forms/components/fun_seals.jsx',
  'src/app/pages/user/records/eng/record_eng_review.component.jsx',
  'src/app/pages/user/records/law/record_law_pdf.jsx',
  'src/app/pages/user/records/ph/record_ph_review.component.jsx',
  'src/app/pages/user/records/arc/record_arc_38.jsx',
  'src/app/pages/user/pqrs/components/pqrs_genPDF_reply.component.jsx',
  'src/app/pages/user/pqrs/components/pqrs_genPDF_confirm.component.jsx',
];

const protectedAttachmentFiles = [
  'src/app/pages/user/publish.jsx',
  'src/app/pages/user/fun_forms/fun_n_3.jsx',
  'src/app/pages/user/pqrs/lockpqrs.jsx',
  'src/app/pages/user/pqrs/pqrs_manage.view.jsx',
  'src/app/pages/user/pqrs/components/pqrs_attach_pro.component.jsx',
];

const protectedPreviewFiles = [
  'src/app/components/vizualizer.component.jsx',
  'src/app/pages/user/shared/UnifiedDocumentEntryModal.jsx',
  'src/app/pages/user/fun_forms/components/FunDocumentManagementModal.jsx',
  'src/app/pages/user/submit/submit_list.component.jsx',
  'src/app/pages/user/fun_forms/components/FunCorrelatedDocumentControl.jsx',
  'src/app/pages/user/fun_forms/components/RequirementManagementModal.jsx',
  'src/app/components/viewer.component.jsx',
];

const protectedPdfTemplateFiles = [
  'src/app/pages/user/fun_forms/components/fun_pdf.jsx',
  'src/app/pages/user/fun_forms/components/checklistPdf.js',
  'src/app/pages/user/records/arc/record_arc_38.jsx',
  'src/app/pages/user/records/ph/record_ph_review.component.jsx',
  'src/app/pages/user/records/record_review.jsx',
  'src/app/pages/user/records/law/record_law_pdf.jsx',
  'src/app/pages/user/records/eng/record_eng_review.component.jsx',
];

const readSource = (file) => readFileSync(file, 'utf8');

describe('protected document transport', () => {
  test('routes all 30 generated document downloads through the authenticated client', () => {
    const legacyCalls = generatedDocumentFiles.flatMap((file) => {
      const matches = readSource(file).match(
        /window\.open\s*\(\s*import\.meta\.env\.VITE_API_URL\s*\+\s*["']\/(?:pdf|seal)\//g,
      );
      return matches?.map(() => file) || [];
    });

    expect(legacyCalls).toEqual([]);
  });

  test('routes all 11 protected attachment downloads through the authenticated client', () => {
    const legacyAnchors = protectedAttachmentFiles.flatMap((file) => {
      const matches = readSource(file).match(
        /href\s*=\s*\{[^}]*import\.meta\.env\.VITE_API_URL[^}]*\/files\//g,
      );
      return matches?.map(() => file) || [];
    });

    expect(legacyAnchors).toEqual([]);
  });

  test('resolves neighbour support document ids before downloading their files', () => {
    const source = readSource('src/app/pages/user/fun_forms/fun_n_3.jsx');

    expect(source).not.toMatch(/split\(['"]&['"]\)\[2\]\.(?:path|filename)/);
    expect(source).toContain('_FIND_6(documentId)');
  });

  test('keeps all 7 shared preview and download flows on authenticated blob URLs', () => {
    protectedPreviewFiles.forEach((file) => {
      const source = readSource(file);

      expect(source, file).toContain('ProtectedDocument');
      expect(source, file).not.toMatch(/window\.open\s*\([^)]*(?:previewUrl|downloadUrl|buildBrowserUrl)/);
      expect(source, file).not.toMatch(/<(?:iframe|img)[^>]+src=\{(?:previewUrl|previewEntry\.previewUrl)/);
      expect(source, file).not.toMatch(/<a[^>]+href=\{(?:downloadUrl|downloadHref)/);
    });
  });

  test('loads all 12 protected PDF templates through the authenticated client', () => {
    const legacyFetches = protectedPdfTemplateFiles.flatMap((file) => {
      const matches = readSource(file).match(/\bfetch\s*\(\s*(?:formUrl|PdfUrl_2pg)/g);
      return matches?.map(() => file) || [];
    });

    expect(legacyFetches).toEqual([]);
    protectedPdfTemplateFiles.forEach((file) => {
      const source = readSource(file);
      expect(source, file).toContain('requestProtectedArrayBufferWithFeedback');
      expect(source, file).not.toMatch(/\brequestProtectedArrayBuffer\s*\(/);
    });
  });

  test('previews intelligent checklist evidence through an authenticated blob URL', () => {
    const source = readSource('src/app/pages/user/fun_forms/components/fun_checklist_n.jsx');

    expect(source).toContain('ProtectedDocumentPreview');
    expect(source).not.toMatch(/window\.open\s*\(\s*previewUrl/);
  });

  test('does not capture the terminal loop index in PQRS attachment buttons', () => {
    const source = readSource('src/app/pages/user/pqrs/components/pqrs_attach_pro.component.jsx');

    expect(source).toContain('for (let i = 0;');
    expect(source).toContain('buildProtectedFilePath');
  });
});
