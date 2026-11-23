// Controllers read the request, call the model/service and send the response.
// No try/catch: Express 5 forwards rejected promises to the error handler.
const Lead = require('../models/Lead');
const AppError = require('../utils/AppError');
const { buildListQuery, getStats } = require('../services/lead.service');

async function getLeadStats(req, res) {
  res.json({ data: await getStats() });
}

async function listLeads(req, res) {
  const { page } = req.listQuery;
  const { filter, sortObj, skip, limit } = buildListQuery(req.listQuery);

  const [data, total] = await Promise.all([
    Lead.find(filter).sort(sortObj).skip(skip).limit(limit),
    Lead.countDocuments(filter),
  ]);

  res.json({
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

async function createLead(req, res) {
  const lead = await Lead.create(req.body);
  res.status(201).json({ data: lead });
}

async function getLead(req, res) {
  const lead = await Lead.findById(req.params.id);
  if (!lead) throw new AppError(404, 'Lead not found');
  res.json({ data: lead });
}

async function updateLead(req, res) {
  const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!lead) throw new AppError(404, 'Lead not found');
  res.json({ data: lead });
}

async function deleteLead(req, res) {
  const lead = await Lead.findByIdAndDelete(req.params.id);
  if (!lead) throw new AppError(404, 'Lead not found');
  res.status(204).end();
}

module.exports = { getLeadStats, listLeads, createLead, getLead, updateLead, deleteLead };
