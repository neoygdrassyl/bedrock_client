/**
 * Dovela DataTable Theme — BS5 dark-mode-aware
 *
 * Uses CSS variables so the same style object works for both
 * light and dark mode (variables change with data-bs-theme).
 *
 * Usage:
 *   import { dovelaDTCustomStyles } from '../../components/ui/dataTableTheme';
 *   <DataTable customStyles={dovelaDTCustomStyles} ... />
 */

export const dovelaDTCustomStyles = {
  table: {
    style: {
      backgroundColor: 'var(--bs-body-bg)',
      color: 'var(--bs-body-color)',
    },
  },
  headRow: {
    style: {
      backgroundColor: 'var(--bs-tertiary-bg)',
      borderBottomColor: 'var(--bs-border-color)',
      minHeight: '40px',
    },
  },
  headCells: {
    style: {
      color: 'var(--bs-body-color)',
      fontWeight: 600,
      fontSize: '0.8rem',
    },
  },
  rows: {
    style: {
      backgroundColor: 'var(--bs-body-bg)',
      color: 'var(--bs-body-color)',
      borderBottomColor: 'var(--bs-border-color)',
      minHeight: '40px',
    },
    highlightOnHoverStyle: {
      backgroundColor: 'var(--bs-tertiary-bg)',
      color: 'var(--bs-body-color)',
      outline: 'none',
    },
  },
  pagination: {
    style: {
      backgroundColor: 'var(--bs-body-bg)',
      color: 'var(--bs-body-color)',
      borderTopColor: 'var(--bs-border-color)',
    },
    pageButtonsStyle: {
      color: 'var(--bs-body-color)',
      fill: 'var(--bs-body-color)',
    },
  },
  noData: {
    style: {
      backgroundColor: 'var(--bs-body-bg)',
      color: 'var(--bs-body-color)',
    },
  },
  expanderRow: {
    style: {
      backgroundColor: 'var(--bs-secondary-bg)',
      color: 'var(--bs-body-color)',
    },
  },
  subHeader: {
    style: {
      backgroundColor: 'var(--bs-body-bg)',
      color: 'var(--bs-body-color)',
    },
  },
};
