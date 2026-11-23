import { LEAD_STATUSES } from '../../constants/lead';

// Skeleton while the first load runs; "—" if stats failed to load.
export default function StatsBar({ stats, loading }) {
  const tiles = [
    { key: 'total', label: 'Total', value: stats?.total },
    ...LEAD_STATUSES.map((status) => ({ key: status, label: status, value: stats?.byStatus?.[status] })),
  ];

  return (
    <section className="stats" aria-label="Lead counts" aria-busy={loading || undefined}>
      {tiles.map(({ key, label, value }) => (
        <div key={key} className={`stat stat--${key.toLowerCase()}`}>
          <span className="stat__label">{label}</span>
          {loading && !stats ? (
            <span className="stat__value stat__value--skeleton" aria-hidden="true" />
          ) : (
            <span className="stat__value">{value ?? '—'}</span>
          )}
        </div>
      ))}
    </section>
  );
}
