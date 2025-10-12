const express = require('express');
const router = express.Router();
const planController = require('../controllers/plan.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');
const { validatePlanCreation, validateId, validatePagination } = require('../middleware/validation.middleware');

// All routes require authentication
router.use(authenticateToken);

// Public plan routes (for clients to view available plans)
router.get('/active', planController.getActivePlans);
router.get('/:id', validateId, planController.getPlanById);

// Admin-only routes
router.post('/', requireAdmin, validatePlanCreation, planController.createPlan);
router.get('/', requireAdmin, validatePagination, planController.getAllPlans);
router.put('/:id', requireAdmin, validateId, planController.updatePlan);
router.delete('/:id', requireAdmin, validateId, planController.deletePlan);
router.patch('/:id/toggle-status', requireAdmin, validateId, planController.togglePlanStatus);

module.exports = router;
