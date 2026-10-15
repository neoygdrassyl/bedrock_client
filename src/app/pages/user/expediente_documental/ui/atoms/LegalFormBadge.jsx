import { Tag } from './Tag';
import { LEGAL_FORM_FILTER } from '../../../shared/expediente-documental.utils';

const TONES = {
    [LEGAL_FORM_FILTER.MISSING]: 'danger',
    [LEGAL_FORM_FILTER.PENDING_SCAN]: 'warning',
    [LEGAL_FORM_FILTER.PRESENT]: 'success',
};

export function LegalFormBadge({ status = '', children, className }) {
    return <Tag
        data-testid="legal-form-badge"
        data-legal-form-status={status || 'none'}
        tone={TONES[status] || 'neutral'}
        pill
        className={className}
    >
        {children}
    </Tag>;
}

export default LegalFormBadge;
