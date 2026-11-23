import Button from '../common/Button';
import Spinner from '../common/Spinner';
import StatusBadge from './StatusBadge';

const COLUMNS = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'company', label: 'Company', sortable: true },
  { key: 'source', label: 'Source' },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'createdAt', label: 'Created', sortable: true },
];

// Fixed month names so the format is always "22 Nov 2026"
// (some locales print "Sept").
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function SortHeader({ column, sort, order, onSort }) {
  const active = sort === column.key;
  const ariaSort = active ? (order === 'asc' ? 'ascending' : 'descending') : 'none';
  return (
    <th scope="col" aria-sort={ariaSort}>
      <button
        type="button"
        className={`sort-button ${active ? 'sort-button--active' : ''}`.trim()}
        onClick={() => onSort(column.key)}
      >
        {column.label}
        <span className="sort-button__icon" aria-hidden="true">
          {active ? (order === 'asc' ? '▲' : '▼') : ''}
        </span>
      </button>
    </th>
  );
}

export default function LeadsTable({ leads, sort, order, onSort, onEdit, onDelete, loading = false }) {
  return (
    <div className={`table-wrap ${loading ? 'table-wrap--loading' : ''}`.trim()} aria-busy={loading || undefined}>
      {loading && (
        <div className="table-wrap__spinner">
          <Spinner size="sm" label="Updating leads" />
        </div>
      )}
      <table className="leads-table">
        <thead>
          <tr>
            {COLUMNS.map((col) =>
              col.sortable ? (
                <SortHeader key={col.key} column={col} sort={sort} order={order} onSort={onSort} />
              ) : (
                <th key={col.key} scope="col">
                  {col.label}
                </th>
              )
            )}
            <th scope="col" className="leads-table__actions-head">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td className="leads-table__name">{lead.name}</td>
              <td className="leads-table__email">{lead.email}</td>
              <td className="leads-table__nowrap">{lead.phone || '—'}</td>
              <td>{lead.company || '—'}</td>
              <td className="leads-table__nowrap">{lead.source}</td>
              <td>
                <StatusBadge status={lead.status} />
              </td>
              <td className="leads-table__nowrap">{formatDate(lead.createdAt)}</td>
              <td className="leads-table__actions">
                <Button variant="secondary" className="btn--sm" onClick={() => onEdit(lead)} aria-label={`Edit ${lead.name}`}>
                  Edit
                </Button>
                <Button variant="danger" className="btn--sm" onClick={() => onDelete(lead)} aria-label={`Delete ${lead.name}`}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
