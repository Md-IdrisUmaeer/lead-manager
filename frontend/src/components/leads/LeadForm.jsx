import { useState } from 'react';
import { ApiError } from '../../api/client';
import { DEFAULT_STATUS, LEAD_SOURCES, LEAD_STATUSES } from '../../constants/lead';
import validateLead from '../../utils/validateLead';
import Button from '../common/Button';
import SelectField from '../common/SelectField';
import TextField from '../common/TextField';

const FIELDS = ['name', 'email', 'phone', 'company', 'source', 'status'];

function toFormValues(lead) {
  return {
    name: lead?.name ?? '',
    email: lead?.email ?? '',
    phone: lead?.phone ?? '',
    company: lead?.company ?? '',
    source: lead?.source ?? '',
    status: lead?.status ?? DEFAULT_STATUS,
  };
}

// One form for add (initialLead = null) and edit. `onSubmit` should throw
// an ApiError on failure; field errors from the server land on the fields.
export default function LeadForm({ initialLead, onSubmit, onCancel }) {
  const isEdit = Boolean(initialLead);
  const [values, setValues] = useState(() => toFormValues(initialLead));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (formError) setFormError('');
  }

  function applyServerError(err) {
    if (err instanceof ApiError && err.status === 409) {
      setErrors({ email: 'A lead with this email already exists' });
      return;
    }
    if (err instanceof ApiError && err.status === 400 && err.details) {
      const fieldErrors = {};
      const other = [];
      for (const [field, message] of Object.entries(err.details)) {
        if (FIELDS.includes(field)) fieldErrors[field] = message;
        else other.push(message);
      }
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
        if (other.length > 0) setFormError(other.join(' '));
        return;
      }
    }
    setFormError(err?.message || 'Something went wrong. Please try again.');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;

    const trimmed = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.trim()]));
    setValues(trimmed);

    const found = validateLead(trimmed);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setFormError('');
      const firstInvalid = FIELDS.find((f) => found[f]);
      document.getElementById(`field-${firstInvalid}`)?.focus();
      return;
    }

    setErrors({});
    setFormError('');
    setSubmitting(true);
    try {
      await onSubmit(trimmed);
    } catch (err) {
      applyServerError(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <div className="form__grid">
        <TextField label="Name" name="name" value={values.name} onChange={handleChange} error={errors.name} required maxLength={100} autoComplete="off" />
        <TextField label="Email" name="email" type="email" value={values.email} onChange={handleChange} error={errors.email} required maxLength={254} autoComplete="off" />
        <TextField label="Phone" name="phone" type="tel" value={values.phone} onChange={handleChange} error={errors.phone} maxLength={20} placeholder="+91 98765 43210" autoComplete="off" />
        <TextField label="Company" name="company" value={values.company} onChange={handleChange} error={errors.company} maxLength={100} autoComplete="off" />
        <SelectField label="Source" name="source" value={values.source} onChange={handleChange} error={errors.source} required options={LEAD_SOURCES} placeholder="Select source" />
        <SelectField label="Status" name="status" value={values.status} onChange={handleChange} error={errors.status} options={LEAD_STATUSES} />
      </div>

      {formError && (
        <p className="form__error" role="alert">
          {formError}
        </p>
      )}

      <div className="form__actions">
        <Button variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={submitting}>
          {isEdit ? 'Save' : 'Create'}
        </Button>
      </div>
    </form>
  );
}
