const express = require('express');
const router = express.Router();
const socialAccountController = require('../controllers/socialAccount.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');
const { validateSocialAccountCreation, validateId, validatePagination } = require('../middleware/validation.middleware');

// All routes require authentication
router.use(authenticateToken);

// User social account routes
router.get('/my-accounts', socialAccountController.getUserSocialAccounts);
router.post('/', validateSocialAccountCreation, socialAccountController.createSocialAccount);
router.get('/:id', validateId, socialAccountController.getSocialAccountById);
router.put('/:id', validateId, socialAccountController.updateSocialAccount);
router.delete('/:id', validateId, socialAccountController.deleteSocialAccount);
router.patch('/:id/toggle-status', validateId, socialAccountController.toggleSocialAccountStatus);
router.put('/:id/refresh-token', validateId, socialAccountController.refreshSocialAccountToken);

// Admin-only routes
router.get('/', requireAdmin, validatePagination, socialAccountController.getAllSocialAccounts);

module.exports = router;
