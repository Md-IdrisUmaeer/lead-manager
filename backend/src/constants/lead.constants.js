// Single source of truth for lead enums.
// The model, validation middleware and tests import from here.
// The frontend keeps a matching copy.
const LEAD_SOURCES = ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Event', 'Other'];
const LEAD_STATUSES = ['New', 'Contacted', 'Qualified', 'Lost'];
const DEFAULT_STATUS = 'New';

module.exports = { LEAD_SOURCES, LEAD_STATUSES, DEFAULT_STATUS };
