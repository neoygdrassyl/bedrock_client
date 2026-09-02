import {
  Check,
  ChevronDown,
  FileText,
  GitBranch,
  ListChecks,
  Menu,
  PlaySquare,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import LegalConfigInitialPage from './LegalConfigInitialPage.jsx';
import DocumentRequirementsSimulatorPage from './DocumentRequirementsSimulatorPage.jsx';
import DocumentReviewChecksPage from './DocumentReviewChecksPage.jsx';
import './DocumentCatalogWorkspacePage.css';

export const DOCUMENT_CATALOG_SECTIONS = Object.freeze([
  { key: 'documentos', label: 'Documentos', icon: FileText },
  { key: 'actuaciones', label: 'Actuaciones', icon: GitBranch },
  { key: 'simulador-requisitos', label: 'Emulador de requisitos', icon: PlaySquare },
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

  function selectSection(sectionKey) {
    if (sectionKey !== normalizedSection) onSectionChange?.(sectionKey);
  }

  const CurrentIcon = currentSection.icon;

  return (
    <section className="document-catalog-window" aria-label="Catálogo documental">
      <nav className="document-catalog-navbar" aria-label="Navegación del catálogo documental">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="document-catalog-navbar__trigger"
              aria-label={`Abrir secciones del catálogo documental. Sección actual: ${currentSection.label}`}
            >
              <span className="document-catalog-navbar__menu-icon"><Menu size={18} aria-hidden="true" /></span>
              <span className="document-catalog-navbar__trigger-copy">
                <small>Catálogo documental</small>
                <strong><CurrentIcon size={15} aria-hidden="true" />{currentSection.label}</strong>
              </span>
              <ChevronDown className="document-catalog-navbar__chevron" size={16} aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="document-catalog-navbar__menu"
            align="start"
            sideOffset={8}
            aria-label="Secciones del catálogo documental"
          >
            {DOCUMENT_CATALOG_SECTIONS.map((section) => {
              const Icon = section.icon;
              const selected = section.key === normalizedSection;
              return (
                <DropdownMenuItem
                  key={section.key}
                  className={`document-catalog-navbar__item${selected ? ' is-active' : ''}`}
                  aria-current={selected ? 'page' : undefined}
                  onSelect={() => selectSection(section.key)}
                >
                  <span className="document-catalog-navbar__item-icon"><Icon size={17} aria-hidden="true" /></span>
                  <span>{section.label}</span>
                  <Check className="document-catalog-navbar__check" size={15} aria-hidden="true" />
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>

      <div className="document-catalog-window__content">
        {normalizedSection === 'documentos' && <LegalConfigInitialPage section="documents" />}
        {normalizedSection === 'actuaciones' && <LegalConfigInitialPage section="actuations" />}
        {normalizedSection === 'simulador-requisitos' && <DocumentRequirementsSimulatorPage />}
        {normalizedSection === 'evaluacion-documentos' && <DocumentReviewChecksPage />}
      </div>
    </section>
  );
}
