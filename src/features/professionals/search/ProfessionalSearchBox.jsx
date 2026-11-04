import { useMemo, useState } from 'react';
import HTMLDatalist from '@/shared/components/HTMLDatalist';
import { Icon } from '@/shared/components/icon';
import { createFallbackSearch, professionalSearch } from './fallbackSearch';
import { searchTextOf, suggestionOptions } from './professionalSuggestion';
import { useProfessionalSearch } from './useProfessionalSearch';

export const STATUS_TEXT = {
  loading: 'Buscando…',
  empty: 'Sin resultados',
  unavailable: 'Búsqueda no disponible; ingrese los datos manualmente',
};
export const NAME_REVIEW_HINT = 'Revise la separación de nombres y apellidos';

/**
 * The FUN 5.2 professional search box: type at least three characters, pick a suggestion and `onSelect` receives it.
 * It searches the configured sources (VITE_PROFESSIONAL_SEARCH_SOURCES) unless `sources` (a stable list of
 * ProfessionalSearchSource, tried in order) or a ready `search` function is given.
 */
export default function ProfessionalSearchBox({ onSelect, sources, search, name = 'search_52' }) {
  const searchToUse = useMemo(
    () => search ?? (sources ? createFallbackSearch(sources) : professionalSearch),
    [search, sources],
  );
  const { setQuery, status, suggestions } = useProfessionalSearch({ search: searchToUse });
  const [selected, setSelected] = useState(null);

  const handleChange = ({ target }) => {
    const picked = suggestions.find((suggestion) => suggestion.key === target.value);
    if (picked) {
      setSelected(picked);
      onSelect(picked);
      return;
    }
    setSelected(null);
    setQuery(searchTextOf(target.text));
  };

  return (
    <div className="row">
      <div className="col">
        <label>
          Busqueda de Profesional.{' '}
          <span className="fw-bold" role="status" aria-live="polite">{STATUS_TEXT[status] || ''}</span>
        </label>
        <div className="input-group my-1">
          <span className="input-group-text bg-success text-white">
            <Icon name="search" size={16} />
          </span>
          <HTMLDatalist
            name={name}
            onChange={handleChange}
            classNames="form-control"
            options={suggestionOptions(suggestions)}
          />
        </div>
        {selected?.nameNeedsReview ? <small className="text-warning fw-semibold d-block">{NAME_REVIEW_HINT}</small> : null}
      </div>
    </div>
  );
}
