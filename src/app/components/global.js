import { createGlobalStyle } from "styled-components"
export const GlobalStyles = createGlobalStyle`
  /* ── Legacy class aliases → BS5 CSS variables ── */
  .container-primary {
    background: var(--bs-body-bg);
    color: var(--bs-body-color);
    font-family: 'Inter', Roboto, Helvetica, Arial, sans-serif;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  .container-secondary {
    background: var(--bs-primary);
    color: #fff;
    font-family: 'Inter', Roboto, Helvetica, Arial, sans-serif;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  .app-text-primary {
    color: var(--bs-body-color);
  }

  .app-text-secondary {
    color: var(--bs-secondary-color);
  }

  .bg-card {
    background: var(--bs-tertiary-bg);
    color: var(--bs-body-color);
    border: 1px solid var(--bs-border-color);
    border-radius: 0.375rem;
    font-family: 'Inter', Roboto, Helvetica, Arial, sans-serif;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  .bg-card-2 {
    background: var(--bs-secondary-bg);
    color: var(--bs-body-color);
    border: 1px solid var(--bs-border-color);
    border-radius: 0.375rem;
    font-family: 'Inter', Roboto, Helvetica, Arial, sans-serif;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  .bg-dd {
    background: var(--bs-tertiary-bg);
  }

  /* ── Collapsible components ── */
  .Collapsible {
    background: var(--bs-primary);
    color: #fff;
  }

  .Collapsible__contentInner {
    background-color: var(--bs-body-bg);
    color: var(--bs-body-color);
    border-color: var(--bs-border-color);
  }

  .Collapsible__trigger {
    color: #fff;
  }

  /* ── Navigation button ── */
  .btn-nav {
    color: #fff;
    border-color: var(--bs-border-color);
    background-color: var(--bs-primary);
  }

  .btn-nav:hover {
    color: var(--bs-body-color);
    border-color: var(--bs-primary);
  }

  .btn-nav:focus {
    background-color: var(--bs-tertiary-bg);
    color: var(--bs-body-color);
  }

  /* ── DataTable — BS5 dark-mode-aware (Phase 4) ── */
  .rdt_Table {
    background: var(--bs-body-bg);
    color: var(--bs-body-color);
  }
  .rdt_TableHeadRow {
    background-color: var(--bs-tertiary-bg) !important;
    color: var(--bs-body-color) !important;
    border-bottom-color: var(--bs-border-color) !important;
  }
  .rdt_TableRow {
    background-color: var(--bs-body-bg) !important;
    color: var(--bs-body-color) !important;
    border-bottom-color: var(--bs-border-color) !important;
  }
  .rdt_TableRow:hover {
    background-color: var(--bs-tertiary-bg) !important;
  }
  .rdt_TableCol, .rdt_TableCell {
    color: var(--bs-body-color) !important;
  }
  .rdt_Pagination {
    background-color: var(--bs-body-bg) !important;
    color: var(--bs-body-color) !important;
    border-top-color: var(--bs-border-color) !important;
  }
  .rdt_Pagination button {
    color: var(--bs-body-color) !important;
    fill: var(--bs-body-color) !important;
  }
  .rdt_ExpanderRow {
    background-color: var(--bs-secondary-bg) !important;
    color: var(--bs-body-color) !important;
  }
  .rdt_TableCol_Sortable span {
    color: var(--bs-body-color) !important;
  }
  [data-tag="___react-data-table-allow-propagation___"] {
    color: var(--bs-body-color);
  }

  /* ── Font scales (from ThemeProvider font objects) ── */
  p {
    font-size: ${({ theme }) => theme.fontSizeP};
  }
  .app-p {
    font-size: ${({ theme }) => theme.fontSizeH3};
  }
  h1 {
    font-size: ${({ theme }) => theme.fontSizeH1};
  }
  h2 {
    font-size: ${({ theme }) => theme.fontSizeH2};
  }
  h3 {
    font-size: ${({ theme }) => theme.fontSizeH3};
  }
  h4 {
    font-size: ${({ theme }) => theme.fontSizeH4};
  }
  h5 {
    font-size: ${({ theme }) => theme.fontSizeH5};
  }
  h6 {
    font-size: ${({ theme }) => theme.fontSizeH6};
  }
  `;