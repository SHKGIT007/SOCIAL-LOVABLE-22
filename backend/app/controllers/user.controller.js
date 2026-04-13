const bcrypt = require("bcryptjs");
const { User, Role, Subscription, Post, Plan, Notification } = require("../models");
const { Op } = require("sequelize");
const { asyncHandler } = require("../middleware/error.middleware");
const logger = require("../config/logger");
const socket = require("../../socket");
const { createNotification } = require("./notification.controller");

const createUser = asyncHandler(async (req, res) => {
  const {
    user_name,
    email,
    password,
    user_fname,
    user_lname,
    user_phone,
    user_type,
  } = req.body;

  // Check If Email Already Exists
  const emailExists = await User.findOne({ where: { email } });
  if (emailExists) {
    return res.status(409).json({
      status: false,
      message: "Email is already taken, please choose a different one",
    });
  }

  // Check If Username Already Exists
  const usernameExists = await User.findOne({ where: { user_name } });
  if (usernameExists) {
    return res.status(409).json({
      status: false,
      message: "Username is already taken, please choose a different one",
    });
  }

  // Check If Phone Already Exists (optional)
  if (user_phone) {
    const phoneExists = await User.findOne({ where: { user_phone } });
    if (phoneExists) {
      return res.status(409).json({
        status: false,
        message: "Phone number is already taken, please use another number",
      });
    }
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Determine role_id based on user_type
  const roleId = user_type === "admin" ? 1 : 2;

  // Create user
  const user = await User.create({
    user_name,
    email,
    password: hashedPassword,
    user_fname,
    user_lname,
    user_phone,
    user_type: user_type || "client",
    role_id: roleId,
    is_email_verified: true,
    active_status: true,
  });

  // 🔔 SEND NOTIFICATIONS - USER REGISTERED
  // Admin notification (socket notification sent internally by createNotification)
  await createNotification({
    for_admin: true,
    notification_type: "user_registered",
    title: "New User Registered",
    message: `New User: "${user.user_fname} ${user.user_lname}" has been registered successfully.`,
    metadata: {
      user_id: user.id,
      user_name: user.user_name,
      user_email: user.email,
    },
  });

  logger.info("User created by admin", {
    userId: user.id,
    email: user.email,
    createdBy: req.user.id,
  });

  res.status(201).json({
    status: true,
    message: "User created successfully",
    data: {
      user: {
        id: user.id,
        user_name: user.user_name,
        email: user.email,
        user_fname: user.user_fname,
        user_lname: user.user_lname,
        user_type: user.user_type,
        created_at: user.created_at,
      },
    },
  });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, user_type } = req.query;
  const offset = (page - 1) * limit;

  const whereClause = {};

  whereClause.is_deleted = false;
  whereClause.is_email_verified = 1;


  if (search) {
    whereClause[Op.or] = [
      { user_name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { user_fname: { [Op.like]: `%${search}%` } },
      { user_lname: { [Op.like]: `%${search}%` } },
    ];
  }

  if (user_type) {
    whereClause.user_type = user_type;
  }

  whereClause.user_type = { [Op.ne]: "admin" };

  const { count, rows: users } = await User.findAndCountAll({
    where: whereClause,
    distinct: true,
    col: "id",
    include: [
      { model: Role, as: "Role" },
      {
        model: Subscription,
        as: "Subscriptions",
        where: { status: "active" },
        required: false,
        include: [{ model: Plan, as: "Plan" }],
      },
    ],
    attributes: { exclude: ["password"] },
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [
      ["created_at", "DESC"],
      ["id", "DESC"],
    ],
  });

  const formattedUsers = users.map((user) => ({
    id: user.id,
    user_name: user.user_name,
    email: user.email,
    user_phone: user.user_phone,
    user_fname: user.user_fname,
    user_lname: user.user_lname,
    user_type: user.user_type,
    active_status: user.active_status,
    subscription: user.Subscriptions?.[0]
      ? {
          plan: user.Subscriptions[0].Plan?.name,
          status: user.Subscriptions[0].status,
          plan_ai_posts: Number(user.Subscriptions[0].ai_posts || 0),
          ai_posts_used: Number(user.Subscriptions[0].ai_posts_used || 0),
        }
      : {
          plan: null,
          status: null,
          plan_ai_posts: 0,
          ai_posts_used: 0,
        },
    created_at: user.created_at,
  }));

  res.json({
    status: true,
    data: {
      users: formattedUsers,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    },
  });
});

const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findByPk(id, {
    attributes: [
      "id",
      "user_name",
      "email",
      "user_fname",
      "user_lname",
      "user_phone",
      "user_type",
      "active_status",
      "created_at",
    ],
    include: [
      {
        model: Subscription,
        as: "Subscriptions",
        attributes: [
          "id",
          "plan_id",
          "status",
          "start_date",
          "end_date",
          "posts_used",
          "ai_posts_used",
          "payment_status",
          "amount_paid",
        ],
        include: [
          {
            model: Plan,
            as: "Plan",
            attributes: ["id", "name", "ai_posts", "linked_accounts", "price"],
          },
        ],
      },
    ],
  });

  if (!user) {
    return res.status(404).json({
      status: false,
      message: "User not found",
    });
  }

  res.json({
    status: true,
    data: { user },
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { user_name, user_fname, user_lname, user_phone, email } = req.body;

  const user = await User.findByPk(id);
  if (!user) {
    return res.status(404).json({
      status: false,
      message: "User not found",
    });
  }

  // --- DUPLICATE CHECKS ---

  // Username check
  if (user_name) {
    const existUserName = await User.findOne({
      where: { user_name, id: { [Op.ne]: id } },
    });
    if (existUserName) {
      return res.status(409).json({
        status: false,
        message: "Username already exists",
      });
    }
  }

  // Email check
  if (email) {
    const existEmail = await User.findOne({
      where: { email, id: { [Op.ne]: id } },
    });
    if (existEmail) {
      return res.status(409).json({
        status: false,
        message: "Email already exists",
      });
    }
  }

  // Phone check
  if (user_phone) {
    const existPhone = await User.findOne({
      where: { user_phone, id: { [Op.ne]: id } },
    });
    if (existPhone) {
      return res.status(409).json({
        status: false,
        message: "Phone number already exists",
      });
    }
  }

  // --- UPDATE FIELDS ---
  const updateData = {};
  if (user_name) updateData.user_name = user_name;
  if (user_fname) updateData.user_fname = user_fname;
  if (user_lname) updateData.user_lname = user_lname;
  if (user_phone) updateData.user_phone = user_phone;
  if (email) updateData.email = email;

  await User.update(updateData, { where: { id } });

  const updatedUser = await User.findByPk(id, {
    include: [{ model: Role, as: "Role" }],
    attributes: { exclude: ["password"] },
  });

  res.json({
    status: true,
    message: "User updated successfully",
    data: { user: updatedUser },
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByPk(id);
  if (!user) {
    return res.status(404).json({
      status: false,
      message: "User not found",
    });
  }

  // Prevent deleting own account
  if (id == req.user.id) {
    return res.status(400).json({
      status: false,
      message: "Cannot delete your own account",
    });
  }

  // Soft delete → set is_deleted = true and deleted_at timestamp
  await User.update(
    {
      is_deleted: true,
      deleted_at: new Date(), // store deletion timestamp
    },
    { where: { id } }
  );

  logger.info("User soft-deleted by admin", {
    userId: id,
    deletedBy: req.user.id,
  });

  res.json({
    status: true,
    message: "User deleted successfully",
  });
});

const getUserStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [totalPosts, aiPosts, scheduledPosts, publishedPosts] =
    await Promise.all([
      Post.count({ where: { user_id: userId } }),
      Post.count({ where: { user_id: userId, is_ai_generated: true } }),
      Post.count({ where: { user_id: userId, status: "scheduled" } }),
      Post.count({ where: { user_id: userId, status: "published" } }),
    ]);

  res.json({
    status: true,
    data: {
      stats: {
        totalPosts,
        aiPosts,
        scheduledPosts,
        publishedPosts,
      },
    },
  });
});

const getAdminStats = asyncHandler(async (req, res) => {
  const [
    totalClients,
    totalPosts,
    totalPlans,
    activeSubscriptions,
    successfulPayments,
  ] = await Promise.all([
    User.count({
      where: {
        user_type: "client",
        is_deleted: 0, // 🚀 Soft-deleted users excluded
      },
    }),

    Post.count(),
    Plan.count(),

    Subscription.count({ where: { status: "active" } }),

    Subscription.findAll({
      where: { payment_status: "success" },
      attributes: ["amount_paid"],
    }),
  ]);

  const activeSubs = await Subscription.findAll({
    where: { status: "active" },
    include: [{ model: Plan, as: "Plan" }],
  });

  const totalRevenue = activeSubs.reduce(
    (sum, s) => sum + Number(s?.Plan?.price || 0),
    0
  );

  const totalSuccessAmount = successfulPayments.reduce(
    (sum, s) => sum + Number(s.amount_paid || 0),
    0
  );

  res.json({
    status: true,
    data: {
      stats: {
        totalClients,
        totalPosts,
        totalPlans,
        activeSubscriptions,
        totalRevenue,
        totalSuccessAmount,
      },
    },
  });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { active_status } = req.body;
  const user = await User.findByPk(id);
  if (!user) {
    return res.status(404).json({
      status: false,
      message: "User not found",
    });
  }

  user.active_status = active_status;
  await user.save();

  logger.info("User status updated Successfully", {
    userId: id,
    updatedBy: req.user.id,
  });

  res.json({
    status: true,
    message: "User status updated successfully",
    data: { user },
  });
});

const getDeletedUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, user_type } = req.query;
  const offset = (page - 1) * limit;

  const whereClause = { is_deleted: true };

  // Search functionality
  if (search) {
    whereClause[Op.or] = [
      { user_name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { user_fname: { [Op.like]: `%${search}%` } },
      { user_lname: { [Op.like]: `%${search}%` } },
    ];
  }

  // Filter by user_type if provided
  if (user_type) {
    whereClause.user_type = user_type;
  }

  // Exclude admin users (optional, based on your previous API)
  whereClause.user_type = { [Op.ne]: "admin" };

  // Fetch deleted users with pagination
  const { count, rows: users } = await User.findAndCountAll({
    where: whereClause,
    attributes: [
      "id",
      "user_name",
      "user_fname",
      "user_lname",
      "email",
      "user_phone",
      "user_type",
      "active_status",
      "role_id",
      "avatar_url",
      "full_name",
      "is_deleted",
      "deleted_at",
    ],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [
      ["deleted_at", "DESC"],
      ["id", "DESC"],
    ],
  });

  res.json({
    status: true,
    message: "Deleted users fetched successfully",
    data: {
      users,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    },
  });
});

const deleteMyAccount = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const user = await User.findByPk(userId);
  if (!user) {
    return res.status(404).json({
      status: false,
      message: "User not found",
    });
  }

  user.is_deleted = true;
  user.deleted_at = new Date();
  await user.save();

  logger.info("User soft-deleted their account", {
    userId: userId,
  });

  res.json({
    status: true,
    message: "Your account has been deleted successfully",
  });
});

const getUserPlanHistory = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  const { page = 1, limit = 10, search } = req.query;
  const offset = (page - 1) * limit;

  const whereClause = { user_id: userId };

  // Search filter (plan name, status, price)
  if (search) {
    whereClause[Op.or] = [
      { status: { [Op.like]: `%${search}%` } },
      { "$Plan.name$": { [Op.like]: `%${search}%` } },
      { "$Plan.type$": { [Op.like]: `%${search}%` } },
      { "$Plan.price$": { [Op.like]: `%${search}%` } },
    ];
  }

  const { count, rows: subscriptions } = await Subscription.findAndCountAll({
    where: whereClause,
    include: [{ model: Plan, as: "Plan" }],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [
      ["created_at", "DESC"],
      ["id", "DESC"],
    ],
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

const getUserPostHistory = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  const { page = 1, limit = 10, search, year, month, date } = req.query;
  const offset = (page - 1) * limit;

  const whereClause = { user_id: userId };

  // Search filters
  if (search) {
    whereClause[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { content: { [Op.like]: `%${search}%` } },
      { status: { [Op.like]: `%${search}%` } },
    ];
  }

  // Filter: Year
  if (year) {
    whereClause.created_at = whereClause.created_at || {};
    whereClause.created_at[Op.gte] = new Date(`${year}-01-01`);
    whereClause.created_at[Op.lte] = new Date(`${year}-12-31 23:59:59`);
  }

  // Filter: Month
  if (month && year) {
    const start = new Date(`${year}-${month}-01`);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);

    whereClause.created_at = {
      [Op.gte]: start,
      [Op.lte]: new Date(end.setHours(23, 59, 59)),
    };
  }

  // Filter: Exact Date
  if (date) {
    whereClause.created_at = {
      [Op.gte]: new Date(`${date} 00:00:00`),
      [Op.lte]: new Date(`${date} 23:59:59`),
    };
  }

  const { count, rows: posts } = await Post.findAndCountAll({
    where: whereClause,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [
      ["created_at", "DESC"],
      ["id", "DESC"],
    ],
  });

  res.json({
    status: true,
    data: {
      posts,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    },
  });
});

const getUserPostDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.params.id; // ✅ target user
  const now = new Date();

  const [
    totalCreatedPosts,
    publishedPosts,
    draftPosts,
    scheduledPosts,
    failedPosts,
  ] = await Promise.all([
    Post.count({ where: { user_id: userId } }),

    Post.count({
      where: { user_id: userId, status: "published" },
    }),

    Post.count({
      where: { user_id: userId, status: "draft" },
    }),

    Post.count({
      where: {
        user_id: userId,
        status: "scheduled",
        scheduled_at: { [Op.gt]: now },
      },
    }),

    Post.count({
      where: {
        user_id: userId,
        status: "scheduled",
        scheduled_at: { [Op.lt]: now },
        review_status: "pending",
      },
    }),
  ]);

  const successPercentage =
    totalCreatedPosts > 0
      ? ((publishedPosts / totalCreatedPosts) * 100).toFixed(2)
      : 0;

  res.json({
    status: true,
    data: {
      user_id: Number(userId),
      total_created_posts: totalCreatedPosts,
      published_posts: publishedPosts,
      draft_posts: draftPosts,
      scheduled_posts: scheduledPosts,
      failed_posts: failedPosts,
      success_percentage: Number(successPercentage),
    },
  });
});

const recoverUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByPk(id);
  if (!user) {
    return res.status(404).json({
      status: false,
      message: "User not found",
    });
  }

  // Restore user → set is_deleted = false and deleted_at = null
  await User.update(
    {
      is_deleted: false,
      deleted_at: null,
    },
    { where: { id } }
  );

  logger.info("User recovered by admin", {
    userId: id,
    recoveredBy: req.user.id,
  });

  res.json({
    status: true,
    message: "User recovered successfully",
  });
});

const getMe = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Only return user data where email is verified
  const user = await User.findOne({
    where: { id: userId, is_email_verified: true },
    attributes: {
      exclude: ["password"],
    },
    include: [
      { model: Role, as: "Role" },
      {
        model: Subscription,
        as: "Subscriptions",
        where: { status: "active" },
        required: false,
        include: [{ model: Plan, as: "Plan" }],
      },
    ],
  });

  if (!user) {
    return res.status(403).json({
      status: false,
      message: "User not found or email not verified",
    });
  }

  res.json({
    status: true,
    data: { user },
  });
});

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats,
  getAdminStats,
  updateUserStatus,
  getDeletedUsers,
  deleteMyAccount,
  getUserPlanHistory,
  getUserPostHistory,
  getUserPostDashboardStats,
  recoverUser,
  getMe,
};
