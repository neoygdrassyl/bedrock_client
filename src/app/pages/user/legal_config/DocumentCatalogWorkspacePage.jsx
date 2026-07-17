import { useEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  FileText,
  GitBranch,
  ListChecks,
  Menu,
} from 'lucide-react';
import LegalConfigInitialPage from './LegalConfigInitialPage.jsx';
import DocumentReviewChecksPage from './DocumentReviewChecksPage.jsx';
import './DocumentCatalogWorkspacePage.css';

export const DOCUMENT_CATALOG_SECTIONS = Object.freeze([
  { key: 'documentos', label: 'Documentos', icon: FileText },
  { key: 'actuaciones', label: 'Actuaciones', icon: GitBranch },
  { key: 'evaluacion-documentos', label: 'Evaluación de documentos', icon: ListChecks },
]);

export const DEFAULT_DOCUMENT_CATALOG_SECTION = DOCUMENT_CATALOG_SECTIONS[0].key;

export function normalizeDocumentCatalogSection(value) {
  return DOCUMENT_CATALOG_SECTIONS.some((section) => section.key === value)
    ? value
    : DEFAULT_DOCUMENT_CATALOG_SECTION;
}

export default function DocumentCatalogWorkspacePage({
  activeSection = DEFAULT_DOCUMENT_CATALOG_SECTION,
  onSectionChange,
}) {
  const normalizedSection = normalizeDocumentCatalogSection(activeSection);
  const currentSection = DOCUMENT_CATALOG_SECTIONS.find((section) => section.key === normalizedSection);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRootRef = useRef(null);
  const menuButtonRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const closeOnOutsideInteraction = (event) => {
      if (!menuRootRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    };

    document.addEventListener('pointerdown', closeOnOutsideInteraction);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideInteraction);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [menuOpen]);

  function selectSection(sectionKey) {
    setMenuOpen(false);
    if (sectionKey !== normalizedSection) onSectionChange?.(sectionKey);
  }

  const CurrentIcon = currentSection.icon;

  return (
    <section className="document-catalog-window" aria-label="Catálogo documental">
      <nav className="document-catalog-navbar" aria-label="Navegación del catálogo documental">
        <div className="document-catalog-navbar__menu-root" ref={menuRootRef}>
          <button
            ref={menuButtonRef}
            type="button"
            className="document-catalog-navbar__trigger"
            aria-label="Abrir secciones del catálogo documental"
            aria-haspopup="true"
            aria-expanded={menuOpen}
            aria-controls="document-catalog-section-menu"
            onClick={() => setMenuOpen((current) => !current)}
          >
            <Menu size={18} aria-hidden="true" />
            <span>Secciones</span>
            <ChevronDown className={menuOpen ? 'is-open' : ''} size={15} aria-hidden="true" />
          </button>

          {menuOpen && (
            <div
              id="document-catalog-section-menu"
              className="document-catalog-navbar__menu"
              role="group"
              aria-label="Secciones del catálogo documental"
            >
              {DOCUMENT_CATALOG_SECTIONS.map((section) => {
                const Icon = section.icon;
                const selected = section.key === normalizedSection;
                return (
                  <button
                    key={section.key}
                    type="button"
                    className={`document-catalog-navbar__item${selected ? ' is-active' : ''}`}
                    aria-current={selected ? 'page' : undefined}
                    onClick={() => selectSection(section.key)}
                  >
                    <Icon size={17} aria-hidden="true" />
                    <span>{section.label}</span>
                    <Check className="document-catalog-navbar__check" size={15} aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="document-catalog-navbar__context" aria-live="polite">
          <span className="document-catalog-navbar__context-icon">
            <CurrentIcon size={17} aria-hidden="true" />
          </span>
          <span>
            <small>Catálogo documental</small>
            <strong>{currentSection.label}</strong>
          </span>
        </div>
      </nav>

      <div className="document-catalog-window__content">
        {normalizedSection === 'documentos' && <LegalConfigInitialPage section="documents" />}
        {normalizedSection === 'actuaciones' && <LegalConfigInitialPage section="actuations" />}
        {normalizedSection === 'evaluacion-documentos' && <DocumentReviewChecksPage />}
      </div>
    </section>
  );
}
