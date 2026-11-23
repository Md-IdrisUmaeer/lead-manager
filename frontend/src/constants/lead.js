// Must match backend/src/constants/lead.constants.js
export const LEAD_SOURCES = ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Event', 'Other'];
export const LEAD_STATUSES = ['New', 'Contacted', 'Qualified', 'Lost'];
export const DEFAULT_STATUS = 'New';

// Fields the API accepts for ?sort=
export const SORT_FIELDS = ['name', 'company', 'status', 'createdAt', 'updatedAt'];
