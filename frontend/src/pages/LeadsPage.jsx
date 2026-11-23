import { useCallback, useState } from 'react';
import { ApiError } from '../api/client';
import { createLead, deleteLead, updateLead } from '../api/leads';
import Button from '../components/common/Button';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import Modal from '../components/common/Modal';
import Spinner from '../components/common/Spinner';
import Toast from '../components/common/Toast';
import FilterBar from '../components/leads/FilterBar';
import LeadForm from '../components/leads/LeadForm';
import LeadsTable from '../components/leads/LeadsTable';
import Pagination from '../components/leads/Pagination';
import StatsBar from '../components/leads/StatsBar';
import useLeads from '../hooks/useLeads';
import useStats from '../hooks/useStats';

// Optional fields left blank aren't sent on create.
function omitEmpty(values) {
  return Object.fromEntries(Object.entries(values).filter(([, v]) => v !== ''));
}

// Field errors (400 with details, 409) are shown inside the form instead of a toast.
function isFormError(err) {
  return err instanceof ApiError && (err.status === 409 || (err.status === 400 && err.details));
}

export default function LeadsPage() {
  const {
    leads,
    pagination,
    loading,
    error,
    query,
    hasFilters,
    setSearch,
    setStatus,
    setSort,
    setPage,
    clearFilters,
    refetch,
  } = useLeads();
  const { stats, loading: statsLoading, refetch: refetchStats } = useStats();

  const [formOpen, setFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null); // null = add mode
  const [deletingLead, setDeletingLead] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
  }, []);
  const closeToast = useCallback(() => setToast(null), []);

  const openCreate = useCallback(() => {
    setEditingLead(null);
    setFormOpen(true);
  }, []);
  const openEdit = useCallback((lead) => {
    setEditingLead(lead);
    setFormOpen(true);
  }, []);
  const closeForm = useCallback(() => {
    setFormOpen(false);
    setEditingLead(null);
  }, []);
  const closeDelete = useCallback(() => setDeletingLead(null), []);

  async function handleSubmit(values) {
    try {
      if (editingLead) await updateLead(editingLead.id, values);
      else await createLead(omitEmpty(values));
    } catch (err) {
      if (!isFormError(err)) showToast(err.message, 'error');
      throw err; // LeadForm shows it on the fields / above the buttons
    }
    const message = editingLead ? 'Lead updated' : 'Lead created';
    closeForm();
    refetch();
    refetchStats();
    showToast(message);
  }

  async function handleDelete() {
    if (!deletingLead) return;
    setDeleting(true);
    try {
      await deleteLead(deletingLead.id);
      showToast('Lead deleted');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleting(false);
      setDeletingLead(null);
    }
    refetchStats();
    // Deleting the last row on a later page: step back instead of loading an empty page.
    if (leads?.length === 1 && query.page > 1) setPage(query.page - 1);
    else refetch();
  }

  function handleRetry() {
    refetch();
    refetchStats();
  }

  let content;
  if (error) {
    content = <ErrorState message={error.message} onRetry={handleRetry} retrying={loading} />;
  } else if (!leads) {
    content = (
      <div className="table-loading">
        <Spinner size="lg" label="Loading leads" />
      </div>
    );
  } else if (leads.length === 0) {
    content = hasFilters ? (
      <EmptyState title="No leads match your filters" message="Try a different name or status." actionLabel="Clear filters" onAction={clearFilters} />
    ) : (
      <EmptyState title="No leads yet" message="Leads you add will show up here." actionLabel="Add your first lead" onAction={openCreate} />
    );
  } else {
    content = (
      <LeadsTable
        leads={leads}
        sort={query.sort}
        order={query.order}
        onSort={setSort}
        onEdit={openEdit}
        onDelete={setDeletingLead}
        loading={loading}
      />
    );
  }

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Lead Manager</h1>
        <Button variant="primary" onClick={openCreate}>
          + Add Lead
        </Button>
      </header>

      <main className="page__main">
        <StatsBar stats={stats} loading={statsLoading} />

        <FilterBar search={query.search} status={query.status} onSearchChange={setSearch} onStatusChange={setStatus} />

        <section className="panel" aria-label="Leads">
          {content}
          {!error && pagination && (
            <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} disabled={loading} />
          )}
        </section>
      </main>

      <Modal open={formOpen} title={editingLead ? 'Edit Lead' : 'Add Lead'} onClose={closeForm}>
        {/* key remounts the form so each open starts from fresh values */}
        <LeadForm key={editingLead?.id ?? 'new'} initialLead={editingLead} onSubmit={handleSubmit} onCancel={closeForm} />
      </Modal>

      <ConfirmDialog
        open={Boolean(deletingLead)}
        title="Delete lead"
        message={deletingLead ? `Delete lead "${deletingLead.name}"? This can't be undone.` : ''}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={closeDelete}
        loading={deleting}
      />

      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={closeToast} />}
    </div>
  );
}
