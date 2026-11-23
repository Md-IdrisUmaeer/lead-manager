// Request-shape checks only. Field rules (required, regex, enum, length)
// live in the Mongoose schema.
const mongoose = require('mongoose');
const AppError = require('../utils/AppError');
const { LEAD_STATUSES } = require('../constants/lead.constants');

const LEAD_FIELDS = ['name', 'email', 'phone', 'company', 'source', 'status'];
const SORT_FIELDS = ['name', 'company', 'status', 'createdAt', 'updatedAt'];
const SORT_ORDERS = ['asc', 'desc'];
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

function validateId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new AppError(400, 'Invalid lead id');
  }
  next();
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// Copies only allowed fields into a new body, so unknown keys
// (_id, createdAt, $set, ...) never reach the database.
function pickLeadFields(req, res, next) {
  if (!isPlainObject(req.body)) {
    throw new AppError(400, 'Request body must be a JSON object');
  }

  const picked = {};
  const details = {};
  for (const field of LEAD_FIELDS) {
    if (!Object.hasOwn(req.body, field)) continue;
    const value = req.body[field];
    if (typeof value !== 'string') {
      details[field] = `${field} must be a string`;
    } else {
      picked[field] = value;
    }
  }

  if (Object.keys(details).length > 0) {
    throw new AppError(400, 'Validation failed', details);
  }
  if (req.method === 'PATCH' && Object.keys(picked).length === 0) {
    throw new AppError(400, 'No valid fields to update');
  }

  req.body = picked;
  next();
}

// Parses an integer from a query string, or returns null.
function toInt(value) {
  if (typeof value !== 'string' || !/^\s*-?\d+\s*$/.test(value)) return null;
  return Number.parseInt(value, 10);
}

// req.query is read-only in Express 5, so the result goes on req.listQuery.
function parseListQuery(req, res, next) {
  const { search, status, sort, order, page, limit } = req.query;

  const listQuery = {
    search: typeof search === 'string' && search.trim() ? search.trim() : undefined,
    status: undefined,
    sort: 'createdAt',
    order: 'desc',
    page: DEFAULT_PAGE,
    limit: DEFAULT_LIMIT,
  };

  if (status !== undefined && status !== '') {
    if (!LEAD_STATUSES.includes(status)) throw new AppError(400, 'Invalid status');
    listQuery.status = status;
  }
  if (sort !== undefined && sort !== '') {
    if (!SORT_FIELDS.includes(sort)) throw new AppError(400, 'Invalid sort field');
    listQuery.sort = sort;
  }
  if (order !== undefined && order !== '') {
    if (!SORT_ORDERS.includes(order)) throw new AppError(400, 'Invalid order');
    listQuery.order = order;
  }

  const pageNum = toInt(page);
  if (pageNum !== null && pageNum >= 1) listQuery.page = pageNum;

  const limitNum = toInt(limit);
  if (limitNum !== null) listQuery.limit = Math.min(Math.max(limitNum, 1), MAX_LIMIT);

  req.listQuery = listQuery;
  next();
}

module.exports = { validateId, pickLeadFields, parseListQuery, LEAD_FIELDS, SORT_FIELDS };
