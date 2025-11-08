const { Subscription, Plan, User } = require('../models');
const { Op } = require('sequelize');
const { asyncHandler } = require('../middleware/error.middleware');
const logger = require('../config/logger');
const moment = require('moment-timezone');

  //const createSubscription = asyncHandler(async (req, res) => {
        //     const { plan_id } = req.body;
        //     const userId = req.user.id;

        //     // Check if plan exists
        //     const plan = await Plan.findByPk(plan_id);
        //     if (!plan) {
        //         return res.status(404).json({
        //             status: false,
        //             message: 'Plan not found'
        //         });
        //     }

        //     if (!plan.is_active) {
        //         return res.status(400).json({
        //             status: false,
        //             message: 'Plan is not active'
        //         });
        //     }

        //     // Check if user already has an active subscription
        //     const existingSubscription = await Subscription.findOne({
        //         where: { user_id: userId, status: 'active' }
        //     });

        //     if (existingSubscription) {
        //         return res.status(400).json({
        //             status: false,
        //             message: 'User already has an active subscription'
        //         });
        //     }

        //     const subscription = await Subscription.create({
        //         user_id: userId,
        //         plan_id,
        //         start_date: start_date || new Date(),
        //         end_date: end_date || null,
        //         status: 'active',
        //         posts_used: 0,
        //         ai_posts_used: 0,
        //         auto_renew: true
        //     });

        //     logger.info('Subscription created', { subscriptionId: subscription.id, userId, planId: plan_id });

        //     res.status(201).json({
        //         status: true,
        //         message: 'Subscription created successfully',
        //         data: { subscription }
        //     });
    //  });


const createSubscription = asyncHandler(async (req, res) => {
    const { plan_id } = req.body;
    const userId = req.user.id;

    // ✅ 1. Check if plan exists
    const plan = await Plan.findByPk(plan_id);
    if (!plan) {
        return res.status(404).json({
            status: false,
            message: 'Plan not found',
        });
    }

    if (!plan.is_active) {
        return res.status(400).json({
            status: false,
            message: 'Plan is not active',
        });
    }

    // ✅ 2. Get current time in IST
    const currentDate = moment().tz('Asia/Kolkata').startOf('day');

    // ✅ 3. Check if user already has a currently active plan
    const existingSubscription = await Subscription.findOne({
        where: {
            user_id: userId,
            status: 'active',
        },
        order: [['end_date', 'DESC']], // latest plan
    });

    let startDate;
    let endDate;

    if (
        existingSubscription &&
        currentDate.isBetween(
            moment(existingSubscription.start_date).tz('Asia/Kolkata').startOf('day'),
            moment(existingSubscription.end_date).tz('Asia/Kolkata').endOf('day'),
            null,
            '[]'
        )
    ) {
        // ✅ User has active plan
        // Start new plan from the next day after current plan ends
        startDate = moment(existingSubscription.end_date)
            .add(1, 'day')
            .tz('Asia/Kolkata')
            .toDate();
    } else {
        // ✅ No active plan → start today
        startDate = currentDate.toDate();
    }

    // ✅ 4. Calculate end date (based on plan duration or default 30 days)
    const endDateMoment = plan.duration_days
        ? moment(startDate).add(plan.duration_days, 'days').tz('Asia/Kolkata')
        : moment(startDate).add(30, 'days').tz('Asia/Kolkata');

    endDate = endDateMoment.toDate();

    // ✅ 5. Create new subscription
    const subscription = await Subscription.create({
        user_id: userId,
        plan_id,
        start_date: startDate,
        end_date: endDate,
        status: 'active',
        posts_used: 0,
        ai_posts_used: 0,
        auto_renew: true,
    });

    logger.info('Subscription created', {
        subscriptionId: subscription.id,
        userId,
        planId: plan_id,
    });

    res.status(201).json({
        status: true,
        message: 'Subscription created successfully',
        data: { subscription },
    });
});

    const getAllSubscriptions = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search, status, user_id } = req.query;
    const offset = (page - 1) * limit;
    const userType = req.user.user_type;
    const userId = req.user.id;

    const whereClause = {};
    
    // If not admin, only show user's own subscriptions
    if (userType !== 'admin') {
        whereClause.user_id = userId;
    } else if (user_id) {
        whereClause.user_id = user_id;
    }

    if (status) {
        whereClause.status = status;
    }

    if (search) {
        whereClause[Op.or] = [
            { '$User.user_name$': { [Op.like]: `%${search}%` } },
            { '$User.email$': { [Op.like]: `%${search}%` } },
            { '$Plan.name$': { [Op.like]: `%${search}%` } }
        ];
    }

    const { count, rows: subscriptions } = await Subscription.findAndCountAll({
        where: whereClause,
        include: [
            { 
                model: User, 
                as: 'User',
                attributes: ['id', 'user_name', 'email', 'user_fname', 'user_lname']
            },
            { 
                model: Plan, 
                as: 'Plan',
                attributes: ['id', 'name', 'price', 'monthly_posts', 'ai_posts', 'linked_accounts']
            }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
    });

    res.json({
        status: true,
        data: {
            subscriptions,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        }
    });
});

const getSubscriptionById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userType = req.user.user_type;
    const userId = req.user.id;

    const subscription = await Subscription.findByPk(id, {
        include: [
            { 
                model: User, 
                as: 'User',
                attributes: ['id', 'user_name', 'email', 'user_fname', 'user_lname']
            },
            { 
                model: Plan, 
                as: 'Plan'
            }
        ]
    });

    if (!subscription) {
        return res.status(404).json({
            status: false,
            message: 'Subscription not found'
        });
    }

    // Check if user can access this subscription
    if (userType !== 'admin' && subscription.user_id !== userId) {
        return res.status(403).json({
            status: false,
            message: 'Access denied'
        });
    }

    res.json({
        status: true,
        data: { subscription }
    });
});

const getUserSubscription = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const subscription = await Subscription.findOne({
        where: { user_id: userId, status: 'active' },
        include: [
            { 
                model: Plan, 
                as: 'Plan'
            }
        ]
    });

    if (!subscription) {
        return res.json({
            status: true,
            data: { subscription: null }
        });
    }

    res.json({
        status: true,
        data: { subscription }
    });
});

const updateSubscription = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, end_date, auto_renew } = req.body;
    const userType = req.user.user_type;
    const userId = req.user.id;

    const subscription = await Subscription.findByPk(id);
    if (!subscription) {
        return res.status(404).json({
            status: false,
            message: 'Subscription not found'
        });
    }

    // Check if user can update this subscription
    if (userType !== 'admin' && subscription.user_id !== userId) {
        return res.status(403).json({
            status: false,
            message: 'Access denied'
        });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (end_date !== undefined) updateData.end_date = end_date;
    if (auto_renew !== undefined) updateData.auto_renew = auto_renew;

    await Subscription.update(updateData, { where: { id } });

    const updatedSubscription = await Subscription.findByPk(id, {
        include: [
            { 
                model: User, 
                as: 'User',
                attributes: ['id', 'user_name', 'email', 'user_fname', 'user_lname']
            },
            { 
                model: Plan, 
                as: 'Plan'
            }
        ]
    });

    logger.info('Subscription updated', { subscriptionId: id, updatedBy: req.user.id });

    res.json({
        status: true,
        message: 'Subscription updated successfully',
        data: { subscription: updatedSubscription }
    });
});

const cancelSubscription = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const subscription = await Subscription.findByPk(id);
    if (!subscription) {
        return res.status(404).json({
            status: false,
            message: 'Subscription not found'
        });
    }

    // Check if user can cancel this subscription
    if (subscription.user_id !== userId) {
        return res.status(403).json({
            status: false,
            message: 'Access denied'
        });
    }

    await Subscription.update(
        { 
            status: 'cancelled',
            auto_renew: false
        },
        { where: { id } }
    );

    logger.info('Subscription cancelled', { subscriptionId: id, userId });

    res.json({
        status: true,
        message: 'Subscription cancelled successfully'
    });
});

const renewSubscription = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const subscription = await Subscription.findByPk(id, {
        include: [{ model: Plan, as: 'Plan' }]
    });

    if (!subscription) {
        return res.status(404).json({
            status: false,
            message: 'Subscription not found'
        });
    }

    // Check if user can renew this subscription
    if (subscription.user_id !== userId) {
        return res.status(403).json({
            status: false,
            message: 'Access denied'
        });
    }

    if (subscription.status !== 'active') {
        return res.status(400).json({
            status: false,
            message: 'Only active subscriptions can be renewed'
        });
    }

    // Calculate new end date (extend by plan duration)
    const newEndDate = new Date();
    newEndDate.setMonth(newEndDate.getMonth() + 1); // Assuming monthly plans

    await Subscription.update(
        { 
            end_date: newEndDate,
            posts_used: 0,
            ai_posts_used: 0
        },
        { where: { id } }
    );

    logger.info('Subscription renewed', { subscriptionId: id, userId });

    res.json({
        status: true,
        message: 'Subscription renewed successfully'
    });
});

module.exports = {
    createSubscription,
    getAllSubscriptions,
    getSubscriptionById,
    getUserSubscription,
    updateSubscription,
    cancelSubscription,
    renewSubscription
};
