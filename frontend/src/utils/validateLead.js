// Same rules and messages as the backend Lead schema.
import { LEAD_SOURCES, LEAD_STATUSES } from '../constants/lead';

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^\+?[0-9\s\-()]{7,20}$/;

// Expects trimmed values. Returns { field: message }; empty object = valid.
export default function validateLead(values) {
  const errors = {};
  const { name = '', email = '', phone = '', company = '', source = '', status = '' } = values;

  if (!name) errors.name = 'Name is required';
  else if (name.length < 2 || name.length > 100) errors.name = 'Name must be 2–100 characters';

  if (!email) errors.email = 'Email is required';
  else if (email.length > 254 || !EMAIL_REGEX.test(email)) errors.email = 'Enter a valid email';

  if (phone && !PHONE_REGEX.test(phone)) errors.phone = 'Enter a valid phone number';

  if (company.length > 100) errors.company = 'Company must be at most 100 characters';

  if (!source || !LEAD_SOURCES.includes(source)) errors.source = 'Source is required';

  if (status && !LEAD_STATUSES.includes(status)) errors.status = 'Invalid status';

  return errors;
}
