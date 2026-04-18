import * as LucideIcons from 'lucide-react';
import { CircleAlert } from 'lucide-react';
import { FA_TO_LUCIDE } from '@/lib/icon-map';

/**
 * Bridge component: accepts a FontAwesome class name or Lucide component name
 * and renders the corresponding Lucide React icon.
 *
 * Usage:
 *   <Icon name="fa-file-alt" />           // FA name
 *   <Icon name="FileText" />              // Lucide name
 *   <Icon name="fa-file-alt" size={20} /> // with size
 *   <Icon name="fa-file-alt" className="text-primary" />
 *
 * @param {object} props
 * @param {string} props.name - FA class name (e.g. "fa-file-alt") or Lucide name (e.g. "FileText")
 * @param {number} [props.size=16] - Icon size in px
 * @param {string} [props.className] - CSS classes
 */
export function Icon({ name, size = 16, className, ...rest }) {
  const lucideName = FA_TO_LUCIDE[name] || name;
  const LucideComponent = LucideIcons[lucideName] || CircleAlert;

  return <LucideComponent size={size} className={className} {...rest} />;
}

export default Icon;
