const Lead = require('../models/Lead');
const escapeRegex = require('../utils/escapeRegex');
const { LEAD_STATUSES } = require('../constants/lead.constants');

// Turns the parsed list query (from parseListQuery) into Mongo query parts.
function buildListQuery({ search, status, sort, order, page, limit }) {
  const filter = {};
  if (search) filter.name = { $regex: escapeRegex(search), $options: 'i' };
  if (status) filter.status = status;

  // _id tie-break keeps pagination stable when sort values are equal
  const sortObj = { [sort]: order === 'asc' ? 1 : -1, _id: 1 };
  const skip = (page - 1) * limit;

  return { filter, sortObj, skip, limit };
}

// Total leads and a count for every status (statuses with no leads report 0).
async function getStats() {
  const groups = await Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);

  const byStatus = Object.fromEntries(LEAD_STATUSES.map((s) => [s, 0]));
  let total = 0;
  for (const { _id, count } of groups) {
    if (_id in byStatus) byStatus[_id] = count;
    total += count;
  }

  return { total, byStatus };
}

module.exports = { buildListQuery, getStats };
