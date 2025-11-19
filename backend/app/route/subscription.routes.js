const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');
const {
    validateSubscriptionCreation,
    validateRazorpayOrder,
    validateRazorpayVerification,
    validateId,
    validatePagination
} = require('../middleware/validation.middleware');

// All routes require authentication
router.use(authenticateToken);

// User subscription routes
router.get('/my-subscription', subscriptionController.getUserSubscription);
router.post('/', validateSubscriptionCreation, subscriptionController.createSubscription);
router.post('/razorpay/order', validateRazorpayOrder, subscriptionController.createRazorpayOrder);
router.post('/razorpay/verify', validateRazorpayVerification, subscriptionController.verifyRazorpayPayment);
router.put('/:id/cancel', validateId, subscriptionController.cancelSubscription);
router.put('/:id/renew', validateId, subscriptionController.renewSubscription);

// Admin-only routes
router.get('/', requireAdmin, validatePagination, subscriptionController.getAllSubscriptions);
router.get('/:id', requireAdmin, validateId, subscriptionController.getSubscriptionById);
router.put('/:id', requireAdmin, validateId, subscriptionController.updateSubscription);

module.exports = router;
