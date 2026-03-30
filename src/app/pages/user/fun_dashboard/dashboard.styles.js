import styled from 'styled-components';

// ─── Design Tokens (Swiss Clean) ───────────────────────────────
const TOKENS = {
  fontHeading: "'Space Grotesk', sans-serif",
  fontBody: "'Inter', sans-serif",
  colorPrimary: '#0D0D0D',
  colorSecondary: '#7A7A7A',
  colorAccent: '#E42313',
  colorSurface: '#FAFAFA',
  colorBorder: '#E8E8E8',
  colorWhite: '#FFFFFF',
  radius: '0px',
};

// ─── Phase Colors ──────────────────────────────────────────────
export const PHASE_COLORS = {
  radicacion: '#F59E0B',
  lydf: '#3B82F6',
  acta: '#8B5CF6',
  viabilidad: '#06B6D4',
  expedicion: '#10B981',
  archivado: '#6B7280',
  desistido: '#6B7280',
  alarm: '#E42313',
};

export const PHASE_LABELS = {
  radicacion: 'Radicación',
  lydf: 'LyDF',
  acta: 'Acta',
  viabilidad: 'Viabilidad',
  expedicion: 'Expedición',
  archivado: 'Archivado',
};

// ─── State Badge Colors ────────────────────────────────────────
export const STATE_BADGE_MAP = {
  INCOM: { bg: '#F59E0B', label: 'INCOM' },
  LYDF: { bg: '#3B82F6', label: 'LYDF' },
  ACTA: { bg: '#8B5CF6', label: 'ACTA' },
  VIAB: { bg: '#06B6D4', label: 'VIAB' },
  EXPED: { bg: '#10B981', label: 'EXPED' },
  RADIC: { bg: '#E42313', label: 'RADIC' },
  DESIST: { bg: '#6B7280', label: 'DESIST' },
  ARCHIV: { bg: '#6B7280', label: 'ARCHIV' },
};

// ─── Layout ────────────────────────────────────────────────────
export const DashboardWrapper = styled.div`
  font-family: ${TOKENS.fontBody};
  background: ${TOKENS.colorSurface};
  min-height: 100vh;
  color: ${TOKENS.colorPrimary};
`;

export const HeaderBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  background: ${TOKENS.colorWhite};
  border-bottom: 1px solid ${TOKENS.colorBorder};
`;

export const HeaderTitle = styled.h1`
  font-family: ${TOKENS.fontHeading};
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: ${TOKENS.colorPrimary};
`;

export const DateFilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  input[type='date'] {
    font-family: ${TOKENS.fontBody};
    font-size: 12px;
    padding: 6px 10px;
    border: 1px solid ${TOKENS.colorBorder};
    border-radius: ${TOKENS.radius};
    background: ${TOKENS.colorSurface};
    color: ${TOKENS.colorPrimary};

    &:focus {
      outline: 2px solid ${TOKENS.colorAccent};
      outline-offset: -1px;
    }
  }

  button {
    font-family: ${TOKENS.fontHeading};
    font-size: 12px;
    font-weight: 600;
    padding: 6px 16px;
    border: none;
    background: ${TOKENS.colorAccent};
    color: ${TOKENS.colorWhite};
    cursor: pointer;

    &:hover {
      opacity: 0.9;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;

export const ProjectCountBadge = styled.span`
  font-family: ${TOKENS.fontHeading};
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  background: ${TOKENS.colorPrimary};
  color: ${TOKENS.colorWhite};
`;

// ─── KPI Strip ─────────────────────────────────────────────────
export const KPIStripWrapper = styled.div`
  display: flex;
  gap: 24px;
  padding: 12px 32px;
  background: ${TOKENS.colorWhite};
  border-bottom: 1px solid ${TOKENS.colorBorder};
  overflow-x: auto;
`;

export const KPIItem = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
  white-space: nowrap;

  .kpi-value {
    font-family: ${TOKENS.fontHeading};
    font-size: 20px;
    font-weight: 600;
    color: ${(props) => props.$color || TOKENS.colorPrimary};
  }

  .kpi-label {
    font-family: ${TOKENS.fontBody};
    font-size: 11px;
    color: ${TOKENS.colorSecondary};
    text-transform: uppercase;
  }
`;

// ─── Body Split ────────────────────────────────────────────────
export const BodySplit = styled.div`
  display: flex;
  gap: 0;
  flex: 1;
  min-height: 0;
  height: calc(100vh - 160px);

  @media (max-width: 1024px) {
    flex-direction: column;
    height: auto;
  }
`;

// ─── Scatter Chart Panel ───────────────────────────────────────
export const ScatterPanel = styled.div`
  flex: 1;
  padding: 20px 24px;
  background: ${TOKENS.colorWhite};
  border-right: 1px solid ${TOKENS.colorBorder};
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 1024px) {
    border-right: none;
    border-bottom: 1px solid ${TOKENS.colorBorder};
    min-height: 400px;
  }
`;

export const ScatterTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;

  h3 {
    font-family: ${TOKENS.fontHeading};
    font-size: 14px;
    font-weight: 600;
    margin: 0;
    color: ${TOKENS.colorPrimary};
  }
`;

export const ScatterLegend = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  padding: 8px 0;
  flex-wrap: wrap;
`;

export const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${(props) => props.$color};
  }

  .label {
    font-size: 10px;
    color: ${TOKENS.colorSecondary};
  }
`;

// ─── Table Panel ───────────────────────────────────────────────
export const TablePanel = styled.div`
  flex: 1;
  padding: 16px 20px;
  background: ${TOKENS.colorWhite};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const TableHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;

  h3 {
    font-family: ${TOKENS.fontHeading};
    font-size: 14px;
    font-weight: 600;
    margin: 0;
    color: ${TOKENS.colorPrimary};
  }
`;

export const SearchInput = styled.input`
  font-family: ${TOKENS.fontBody};
  font-size: 12px;
  padding: 6px 12px;
  border: 1px solid ${TOKENS.colorBorder};
  border-radius: ${TOKENS.radius};
  background: ${TOKENS.colorSurface};
  width: 200px;
  color: ${TOKENS.colorPrimary};

  &::placeholder {
    color: #B0B0B0;
  }

  &:focus {
    outline: 2px solid ${TOKENS.colorAccent};
    outline-offset: -1px;
  }
`;

export const ColumnHeaderRow = styled.div`
  display: flex;
  align-items: center;
  padding: 0 8px;
  height: 32px;
  background: ${TOKENS.colorSurface};
  border-bottom: 1px solid ${TOKENS.colorBorder};
  flex-shrink: 0;

  span {
    font-family: ${TOKENS.fontHeading};
    font-size: 10px;
    font-weight: 600;
    color: ${TOKENS.colorSecondary};
    text-transform: uppercase;
  }
`;

export const TableBody = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
`;

export const TableRow = styled.div`
  display: flex;
  align-items: center;
  padding: 0 8px;
  height: 48px;
  background: ${(props) => props.$highlight ? '#FFF5F5' : TOKENS.colorWhite};
  border-bottom: 1px solid #F0F0F0;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: ${(props) => props.$highlight ? '#FFEDED' : '#F8F8F8'};
  }
`;

export const CellRadicado = styled.div`
  width: 120px;
  flex-shrink: 0;

  .id {
    font-family: ${TOKENS.fontHeading};
    font-size: 11px;
    font-weight: 600;
    color: ${TOKENS.colorPrimary};
    line-height: 1.3;
  }

  .sub {
    font-family: ${TOKENS.fontBody};
    font-size: 8px;
    color: #B0B0B0;
  }
`;

export const CellTipo = styled.span`
  width: 35px;
  flex-shrink: 0;
  font-family: ${TOKENS.fontHeading};
  font-size: 11px;
  font-weight: 600;
  text-align: center;
  color: ${TOKENS.colorPrimary};
  text-transform: uppercase;
`;

export const CellEstado = styled.div`
  width: 70px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
`;

export const StateBadge = styled.span`
  display: inline-block;
  font-family: ${TOKENS.fontBody};
  font-size: 9px;
  font-weight: 600;
  padding: 2px 8px;
  color: ${TOKENS.colorWhite};
  background: ${(props) => props.$bg || '#6B7280'};
`;

export const CellGantt = styled.div`
  flex: 1;
  min-width: 0;
  padding: 0 8px;
`;

export const MiniGanttBar = styled.div`
  display: flex;
  height: 14px;
  background: #F5F5F5;
  gap: 1px;
  overflow: hidden;
`;

export const GanttSegment = styled.div`
  height: 100%;
  background: ${(props) => props.$color};
  opacity: ${(props) => props.$opacity || 1};
  flex: ${(props) => props.$flex || 'none'};
  width: ${(props) => props.$width || 'auto'};
  min-width: ${(props) => props.$width ? '0' : '2px'};
`;

export const CellAlarm = styled.div`
  width: 60px;
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 4px;

  .alarm-text {
    font-family: ${TOKENS.fontBody};
    font-size: 10px;
    font-weight: 600;
    color: ${(props) => props.$severity === 'danger' ? TOKENS.colorAccent : '#F59E0B'};
  }

  .alarm-icon {
    font-size: 11px;
    color: ${(props) => props.$severity === 'danger' ? TOKENS.colorAccent : '#F59E0B'};
  }

  .no-alarm {
    color: #D0D0D0;
    font-size: 10px;
  }
`;

// ─── Tooltip ───────────────────────────────────────────────────
export const ScatterTooltip = styled.div`
  position: absolute;
  pointer-events: none;
  background: ${TOKENS.colorPrimary};
  color: ${TOKENS.colorWhite};
  padding: 8px 12px;
  font-family: ${TOKENS.fontBody};
  font-size: 11px;
  line-height: 1.5;
  z-index: 10;
  min-width: 180px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);

  .tt-title {
    font-family: ${TOKENS.fontHeading};
    font-weight: 600;
    font-size: 12px;
  }

  .tt-row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }
`;
