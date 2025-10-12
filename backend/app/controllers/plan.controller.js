const { Plan, Subscription } = require('../models');
const { Op } = require('sequelize');
const { asyncHandler } = require('../middleware/error.middleware');
const logger = require('../config/logger');

const createPlan = asyncHandler(async (req, res) => {
    const { name, price, monthly_posts, ai_posts, linked_accounts, features, description } = req.body;

    const plan = await Plan.create({
        name,
        price,
        monthly_posts,
        ai_posts,
        linked_accounts,
        features,
        description,
        is_active: true
    });

    logger.info('Plan created', { planId: plan.id, createdBy: req.user.id });

    res.status(201).json({
        status: true,
        message: 'Plan created successfully',
        data: { plan }
    });
});

const getAllPlans = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search, is_active } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    
    if (search) {
        whereClause[Op.or] = [
            { name: { [Op.like]: `%${search}%` } },
            { description: { [Op.like]: `%${search}%` } }
        ];
    }

    if (is_active !== undefined) {
        whereClause.is_active = is_active === 'true';
    }

    const { count, rows: plans } = await Plan.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['price', 'ASC']]
    });

    res.json({
        status: true,
        data: {
            plans,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        }
    });
});

const getActivePlans = asyncHandler(async (req, res) => {
    const plans = await Plan.findAll({
        where: { is_active: true },
        order: [['price', 'ASC']]
    });

    res.json({
        status: true,
        data: { plans }
    });
});

const getPlanById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const plan = await Plan.findByPk(id, {
        include: [
            { 
                model: Subscription, 
                as: 'Subscriptions',
                where: { status: 'active' },
                required: false
            }
        ]
    });

    if (!plan) {
        return res.status(404).json({
            status: false,
            message: 'Plan not found'
        });
    }

    res.json({
        status: true,
        data: { plan }
    });
});

const updatePlan = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, price, monthly_posts, ai_posts, linked_accounts, features, description, is_active } = req.body;

    const plan = await Plan.findByPk(id);
    if (!plan) {
        return res.status(404).json({
            status: false,
            message: 'Plan not found'
        });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (price !== undefined) updateData.price = price;
    if (monthly_posts !== undefined) updateData.monthly_posts = monthly_posts;
    if (ai_posts !== undefined) updateData.ai_posts = ai_posts;
    if (linked_accounts !== undefined) updateData.linked_accounts = linked_accounts;
    if (features) updateData.features = features;
    if (description) updateData.description = description;
    if (is_active !== undefined) updateData.is_active = is_active;

    await Plan.update(updateData, { where: { id } });

    const updatedPlan = await Plan.findByPk(id);

    logger.info('Plan updated', { planId: id, updatedBy: req.user.id });

    res.json({
        status: true,
        message: 'Plan updated successfully',
        data: { plan: updatedPlan }
    });
});

const deletePlan = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const plan = await Plan.findByPk(id);
    if (!plan) {
        return res.status(404).json({
            status: false,
            message: 'Plan not found'
        });
    }

    // Check if plan has active subscriptions
    const activeSubscriptions = await Subscription.count({
        where: { plan_id: id, status: 'active' }
    });

    if (activeSubscriptions > 0) {
        return res.status(400).json({
            status: false,
            message: 'Cannot delete plan with active subscriptions'
        });
    }

    await Plan.destroy({ where: { id } });

    logger.info('Plan deleted', { planId: id, deletedBy: req.user.id });

    res.json({
        status: true,
        message: 'Plan deleted successfully'
    });
});

const togglePlanStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const plan = await Plan.findByPk(id);
    if (!plan) {
        return res.status(404).json({
            status: false,
            message: 'Plan not found'
        });
    }

    const newStatus = !plan.is_active;
    await Plan.update({ is_active: newStatus }, { where: { id } });

    logger.info('Plan status toggled', { planId: id, newStatus, updatedBy: req.user.id });

    res.json({
        status: true,
        message: `Plan ${newStatus ? 'activated' : 'deactivated'} successfully`,
        data: { is_active: newStatus }
    });
});

module.exports = {
    createPlan,
    getAllPlans,
    getActivePlans,
    getPlanById,
    updatePlan,
    deletePlan,
    togglePlanStatus
};
