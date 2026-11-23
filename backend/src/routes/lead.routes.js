const express = require('express');
const { validateId, pickLeadFields, parseListQuery } = require('../middleware/validate.middleware');
const {
  getLeadStats,
  listLeads,
  createLead,
  getLead,
  updateLead,
  deleteLead,
} = require('../controllers/lead.controller');

const router = express.Router();

// Must come before '/:id', or "stats" is treated as an id.
router.get('/stats', getLeadStats);

router.get('/', parseListQuery, listLeads);
router.post('/', pickLeadFields, createLead);

router.get('/:id', validateId, getLead);
router.patch('/:id', validateId, pickLeadFields, updateLead);
router.delete('/:id', validateId, deleteLead);

module.exports = router;
