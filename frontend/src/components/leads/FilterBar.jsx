import { LEAD_STATUSES } from '../../constants/lead';

export default function FilterBar({ search, status, onSearchChange, onStatusChange }) {
  return (
    <div className="filters" role="search">
      <label className="visually-hidden" htmlFor="filter-search">
        Search leads by name
      </label>
      <input
        id="filter-search"
        type="search"
        className="field__control filters__search"
        placeholder="Search by name..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        maxLength={100}
        autoComplete="off"
      />

      <label className="visually-hidden" htmlFor="filter-status">
        Filter by status
      </label>
      <select
        id="filter-status"
        className="field__control filters__status"
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
      >
        <option value="">All statuses</option>
        {LEAD_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}
