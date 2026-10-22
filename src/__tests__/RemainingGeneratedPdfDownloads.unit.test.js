import { readFileSync } from 'node:fs';

describe('remaining generated PDF downloads', () => {
  test('consume the generation response artifact instead of fixed public files', () => {
    const firstLetter = readFileSync('src/features/expediente/records/record_letter.component.jsx', 'utf8');
    const extensionLetter = readFileSync('src/features/expediente/records/record_letter_2.component.jsx', 'utf8');
    const phReview = readFileSync('src/features/expediente/records/ph/record_ph_review.component.jsx', 'utf8');

    expect(firstLetter).toContain('downloadGeneratedPdf(response, null, filename)');
    expect(extensionLetter).toContain('downloadGeneratedPdf(response, null, filename)');
    expect(phReview).toContain('downloadGeneratedPdf({ data: result.data }, null, filename)');
    expect(phReview).toContain("isSuccessResponse: response => response.data === 'OK'");
    expect(phReview).toContain("typeof response.data?.artifactId === 'string'");
    expect(phReview).toContain("response.data.artifactId.trim() !== ''");
    expect(firstLetter).not.toContain('`/pdf/confirmact/${encodeURIComponent(filename)}`');
    expect(extensionLetter).not.toContain('`/pdf/confirmact2/${encodeURIComponent(filename)}`');
    expect(phReview).not.toContain('`/pdf/recordphnot/${encodeURIComponent(filename)}`');
  });
});
