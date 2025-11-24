const { Subscription, Plan, User } = require("../models");
const { Op } = require("sequelize");
const { asyncHandler } = require("../middleware/error.middleware");
const logger = require("../config/logger");
const moment = require("moment-timezone");
const razorpayService = require("../services/razorpay.service");

const createSubscriptionRecord = async ({
  userId,
  plan,
  paymentDetails = {},
}) => {
  const currentDate = moment().tz("Asia/Kolkata").startOf("day");

  const existingSubscription = await Subscription.findOne({
    where: { user_id: userId, status: "active" },
    order: [["end_date", "DESC"]],
  });

  let startDate;

  if (
    existingSubscription &&
    currentDate.isBetween(
      moment(existingSubscription.start_date).tz("Asia/Kolkata").startOf("day"),
      moment(existingSubscription.end_date).tz("Asia/Kolkata").endOf("day"),
      null,
      "[]"
    )
  ) {
    startDate = moment(existingSubscription.end_date)
      .tz("Asia/Kolkata")
      .add(1, "day")
      .startOf("day");
  } else {
    startDate = currentDate.clone();
  }

  const durationDays = plan.duration_days || 30;
  const endDateMoment = startDate
    .clone()
    .add(durationDays, "days")
    .endOf("day");

  const subscription = await Subscription.create({
    user_id: userId,
    plan_id: plan.id,
    start_date: startDate.format("YYYY-MM-DD HH:mm:ss"),
    end_date: endDateMoment.format("YYYY-MM-DD HH:mm:ss"),
    status: "active",
    posts_used: 0,
    ai_posts_used: 0,
    auto_renew: false,

    payment_status: paymentDetails.payment_status || "success",
    amount_paid:
      paymentDetails.amount_paid !== undefined
        ? paymentDetails.amount_paid
        : plan.price,
    payment_id: paymentDetails.payment_id || null,
    order_id: paymentDetails.order_id || null,
  });

  logger.info("Subscription created", {
    subscriptionId: subscription.id,
    userId,
    planId: plan.id,
    paymentStatus: subscription.payment_status,
    amountPaid: subscription.amount_paid,
  });

  return subscription;
};

const createSubscription = asyncHandler(async (req, res) => {
  const { plan_id } = req.body;
  const userId = req.user.id;

  const plan = await Plan.findByPk(plan_id);
  if (!plan) {
    return res.status(404).json({
      status: false,
      message: "Plan not found",
    });
  }

  if (!plan.is_active) {
    return res.status(400).json({
      status: false,
      message: "Plan is not active",
    });
  }

  const subscription = await createSubscriptionRecord({
    userId,
    plan,
    paymentDetails: {
      payment_status: "success",
      amount_paid: 0,
      payment_id: null,
      order_id: null,
    },
  });

  res.status(201).json({
    status: true,
    message: "Subscription created successfully",
    data: { subscription },
  });
});

const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { plan_id } = req.body;
  const userId = req.user.id;

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return res.status(500).json({
      status: false,
      message: "Razorpay credentials are not configured",
    });
  }

  const plan = await Plan.findByPk(plan_id);
  if (!plan) {
    return res.status(404).json({
      status: false,
      message: "Plan not found",
    });
  }

  if (!plan.is_active) {
    return res.status(400).json({
      status: false,
      message: "Plan is not active",
    });
  }

  const amountInPaise = Math.round(Number(plan.price) * 100);

  if (!amountInPaise || amountInPaise <= 0) {
    return res.status(400).json({
      status: false,
      message: "Plan price must be greater than zero",
    });
  }

  const receipt = `sub_${userId}_${plan_id}_${Date.now()}`;

  const order = await razorpayService.createOrder({
    amount: amountInPaise,
    currency: "INR",
    receipt,
    notes: {
      plan_id: plan.id,
      user_id: userId,
    },
  });

  // 🔥 Calculate end_date properly
  const startDate = moment().tz("Asia/Kolkata").startOf("day");
  const durationDays = (plan.duration_months || 1) * 30;
  const endDate = startDate.clone().add(durationDays, "days").endOf("day");

  const pendingSubscription = await Subscription.create({
    user_id: userId,
    plan_id: plan.id,
    start_date: startDate.format("YYYY-MM-DD HH:mm:ss"),
    end_date: endDate.format("YYYY-MM-DD HH:mm:ss"), // 🔥 SET END_DATE
    status: "pending",
    posts_used: 0,
    ai_posts_used: 0,
    auto_renew: false,
    payment_status: "pending",
    amount_paid: plan.price,
    payment_id: null,
    order_id: order.id,
  });

  logger.info("Razorpay order created with pending subscription", {
    orderId: order.id,
    userId,
    planId: plan.id,
    subscriptionId: pendingSubscription.id,
  });

  res.status(201).json({
    status: true,
    data: {
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    },
  });
});

const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const {
    plan_id,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;
  const userId = req.user.id;

  const isValid = razorpayService.verifySignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );

  if (!isValid) {
    await Subscription.update(
      {
        payment_status: "failed",
        status: "inactive",
      },
      {
        where: {
          user_id: userId,
          order_id: razorpay_order_id,
        },
      }
    );

    return res.status(400).json({
      status: false,
      message: "Invalid Razorpay signature",
    });
  }

  const plan = await Plan.findByPk(plan_id);
  if (!plan) {
    return res.status(404).json({
      status: false,
      message: "Plan not found",
    });
  }

  if (!plan.is_active) {
    return res.status(400).json({
      status: false,
      message: "Plan is not active",
    });
  }

  // 🔥 Calculate proper end_date based on duration_months
  const startDate = moment().tz("Asia/Kolkata").startOf("day");
  const durationDays = plan.duration_months * 30; // 30 days per month
  const endDate = startDate.clone().add(durationDays, "days").endOf("day");

  const [updatedCount] = await Subscription.update(
    {
      status: "active",
      payment_status: "success",
      payment_id: razorpay_payment_id,
      end_date: endDate.format("YYYY-MM-DD HH:mm:ss"), // 🔥 SET END_DATE
    },
    {
      where: {
        user_id: userId,
        order_id: razorpay_order_id,
        payment_status: "pending",
      },
    }
  );

  if (updatedCount === 0) {
    const subscription = await createSubscriptionRecord({
      userId,
      plan,
      paymentDetails: {
        payment_status: "success",
        amount_paid: plan.price,
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
      },
    });

    return res.json({
      status: true,
      message: "Payment verified and subscription activated",
      data: { subscription },
    });
  }

  const subscription = await Subscription.findOne({
    where: {
      user_id: userId,
      order_id: razorpay_order_id,
    },
    include: [
      {
        model: Plan,
        as: "Plan",
      },
    ],
  });

  logger.info("Razorpay payment verified and subscription activated", {
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    subscriptionId: subscription.id,
  });

  res.json({
    status: true,
    message: "Payment verified and subscription activated",
    data: { subscription },
  });
});

const getAllSubscriptions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, status, user_id } = req.query;
  const offset = (page - 1) * limit;
  const userType = req.user.user_type;
  const userId = req.user.id;

  const whereClause = {};

  if (userType !== "admin") {
    whereClause.user_id = userId;
  } else if (user_id) {
    whereClause.user_id = user_id;
  }

  if (status) {
    whereClause.status = status;
  }

  if (search) {
    whereClause[Op.or] = [
      { "$User.user_name$": { [Op.like]: `%${search}%` } },
      { "$User.email$": { [Op.like]: `%${search}%` } },
      { "$Plan.name$": { [Op.like]: `%${search}%` } },
    ];
  }

  const { count, rows: subscriptions } = await Subscription.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: User,
        as: "User",
        attributes: ["id", "user_name", "email", "user_fname", "user_lname"],
      },
      {
        model: Plan,
        as: "Plan",
        attributes: [
          "id",
          "name",
          "price",
          "monthly_posts",
          "ai_posts",
          "linked_accounts",
        ],
      },
    ],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [["created_at", "DESC"]],
  });

  res.json({
    status: true,
    data: {
      subscriptions,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    },
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
        as: "User",
        attributes: ["id", "user_name", "email", "user_fname", "user_lname"],
      },
      {
        model: Plan,
        as: "Plan",
      },
    ],
  });

  if (!subscription) {
    return res.status(404).json({
      status: false,
      message: "Subscription not found",
    });
  }

  if (userType !== "admin" && subscription.user_id !== userId) {
    return res.status(403).json({
      status: false,
      message: "Access denied",
    });
  }

  res.json({
    status: true,
    data: { subscription },
  });
});

const getUserSubscription = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const subscription = await Subscription.findOne({
    where: { user_id: userId, status: "active" },
    include: [
      {
        model: Plan,
        as: "Plan",
      },
    ],
    order: [["created_at", "DESC"]],
  });

  if (!subscription) {
    return res.json({
      status: true,
      data: { subscription: null },
    });
  }

  // 🔥 Check if AI posts limit reached
  if (subscription.ai_posts_used >= subscription.Plan.ai_posts) {
    await Subscription.update(
      { status: "inactive" },
      { where: { id: subscription.id } }
    );
    subscription.status = "inactive";
  }

  res.json({
    status: true,
    data: { subscription },
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
      message: "Subscription not found",
    });
  }

  if (userType !== "admin" && subscription.user_id !== userId) {
    return res.status(403).json({
      status: false,
      message: "Access denied",
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
        as: "User",
        attributes: ["id", "user_name", "email", "user_fname", "user_lname"],
      },
      {
        model: Plan,
        as: "Plan",
      },
    ],
  });

  logger.info("Subscription updated", {
    subscriptionId: id,
    updatedBy: req.user.id,
  });

  res.json({
    status: true,
    message: "Subscription updated successfully",
    data: { subscription: updatedSubscription },
  });
});

const cancelSubscription = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const subscription = await Subscription.findByPk(id);
  if (!subscription) {
    return res.status(404).json({
      status: false,
      message: "Subscription not found",
    });
  }

  if (subscription.user_id !== userId) {
    return res.status(403).json({
      status: false,
      message: "Access denied",
    });
  }

  await Subscription.update(
    {
      status: "cancelled",
      auto_renew: false,
    },
    { where: { id } }
  );

  logger.info("Subscription cancelled", { subscriptionId: id, userId });

  res.json({
    status: true,
    message: "Subscription cancelled successfully",
  });
});

const renewSubscription = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const subscription = await Subscription.findByPk(id, {
    include: [{ model: Plan, as: "Plan" }],
  });

  if (!subscription) {
    return res.status(404).json({
      status: false,
      message: "Subscription not found",
    });
  }

  if (subscription.user_id !== userId) {
    return res.status(403).json({
      status: false,
      message: "Access denied",
    });
  }

  if (subscription.status !== "active") {
    return res.status(400).json({
      status: false,
      message: "Only active subscriptions can be renewed",
    });
  }

  const newEndDate = new Date();
  newEndDate.setMonth(newEndDate.getMonth() + 1);

  await Subscription.update(
    {
      end_date: newEndDate,
      posts_used: 0,
      ai_posts_used: 0,
    },
    { where: { id } }
  );

  logger.info("Subscription renewed", { subscriptionId: id, userId });

  res.json({
    status: true,
    message: "Subscription renewed successfully",
  });
});

module.exports = {
  createSubscription,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getAllSubscriptions,
  getSubscriptionById,
  getUserSubscription,
  updateSubscription,
  cancelSubscription,
  renewSubscription,
};
