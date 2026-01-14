const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken, requireAdmin, requireRole } = require('../middleware/auth.middleware');
const { validateUserRegistration, validateId, validatePagination } = require('../middleware/validation.middleware');

// All routes require authentication
router.use(authenticateToken);

// Get current user profile (must be before /:id route to avoid conflicts)
router.get('/profile/me', userController.getMe);

// User stats (accessible by both admin and client)
router.get('/stats', userController.getUserStats);

// Admin-only routes
router.post('/', requireAdmin, validateUserRegistration, userController.createUser);
router.get('/', requireAdmin, validatePagination, userController.getAllUsers);
router.get('/admin-stats', requireAdmin, userController.getAdminStats);
// Get user by ID (admin only)
router.get('/:id', requireAdmin, userController.getUserById);
router.put('/:id', requireAdmin, validateId, userController.updateUser);
router.delete('/:id', requireAdmin, validateId, userController.deleteUser);
router.put('/:id/status', requireAdmin, validateId, userController.updateUserStatus);
router.get('/deleted/list', requireAdmin, validatePagination, userController.getDeletedUsers);
router.post('/deletemyaccount', userController.deleteMyAccount);
router.get('/user-plan-history/:id', requireAdmin, validateId, validatePagination,userController.getUserPlanHistory);
router.get('/user-post-history/:id', requireAdmin, validateId, validatePagination,userController.getUserPostHistory);
router.get( "/:id/post-dashboard-stats", requireAdmin, validateId, userController.getUserPostDashboardStats);


module.exports = router;
