const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const postRoutes = require('./post.routes');
const planRoutes = require('./plan.routes');
const subscriptionRoutes = require('./subscription.routes');
const socialAccountRoutes = require('./socialAccount.routes');
const socialAccounOauthRoutes = require('./socialAccount.oauth.routes');
const profileRoutes = require('./profile.routes');
const systemSettingRoutes = require('./systemSetting.routes');
const scheduleRoutes = require('./schedule.routes');



// Use routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/plans', planRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/social-accounts', socialAccountRoutes);
router.use('/social-accounts/oauth', socialAccounOauthRoutes);
router.use('/profile', profileRoutes);
router.use('/system-settings', require('./systemSetting.routes'));
router.use('/schedules', scheduleRoutes);
module.exports = router;
