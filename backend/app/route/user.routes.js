const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken, requireAdmin, requireRole } = require('../middleware/auth.middleware');
const { validateUserRegistration, validateId, validatePagination } = require('../middleware/validation.middleware');

// All routes require authentication
router.use(authenticateToken);

// User stats (accessible by both admin and client)
router.get('/stats', userController.getUserStats);

// Admin-only routes
router.post('/', requireAdmin, validateUserRegistration, userController.createUser);
router.get('/', requireAdmin, validatePagination, userController.getAllUsers);
router.get('/admin-stats', requireAdmin, userController.getAdminStats);
router.get('/:id', requireAdmin, validateId, userController.getUserById);
router.put('/:id', requireAdmin, validateId, userController.updateUser);
router.delete('/:id', requireAdmin, validateId, userController.deleteUser);

module.exports = router;
