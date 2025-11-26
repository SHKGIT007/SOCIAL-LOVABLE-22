const bcrypt = require("bcryptjs");
const { User, Role, Subscription, Post, Plan } = require("../models");
const { Op } = require("sequelize");
const { asyncHandler } = require("../middleware/error.middleware");
const logger = require("../config/logger");

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

  // Check if user already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return res.status(409).json({
      status: false,
      message: "User already exists with this email",
    });
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

  // Hide deleted users
  whereClause.is_deleted = false;

  // Search filters
  if (search) {
    whereClause[Op.or] = [
      { user_name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { user_fname: { [Op.like]: `%${search}%` } },
      { user_lname: { [Op.like]: `%${search}%` } },
    ];
  }

  // Filter by user type if provided
  if (user_type) {
    whereClause.user_type = user_type;
  }

  // Exclude admin always
  whereClause.user_type = { [Op.ne]: "admin" };

  const { count, rows: users } = await User.findAndCountAll({
    where: whereClause,
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
    order: [["created_at", "DESC"]],
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
        }
      : null,
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
        attributes: ["status"],
        include: [
          {
            model: Plan,
            as: "Plan",
            attributes: ["name"],
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

// const updateUser = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const { user_name, user_fname, user_lname, user_phone, email } = req.body;

//   const user = await User.findByPk(id);
//   if (!user) {
//     return res.status(404).json({
//       status: false,
//       message: "User not found",
//     });
//   }

//   const updateData = {};
//   if (user_name) updateData.user_name = user_name;
//   if (user_fname) updateData.user_fname = user_fname;
//   if (user_lname) updateData.user_lname = user_lname;
//   if (user_phone) updateData.user_phone = user_phone;
//   if (email) updateData.email = email;

//   await User.update(updateData, { where: { id } });

//   const updatedUser = await User.findByPk(id, {
//     include: [{ model: Role, as: "Role" }],
//     attributes: { exclude: ["password"] },
//   });

//   logger.info("User updated by admin", { userId: id, updatedBy: req.user.id });

//   res.json({
//     status: true,
//     message: "User updated successfully",
//     data: { user: updatedUser },
//   });
// });

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
  const deletedUsers = await User.findAll({
    where: { is_deleted: true },
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
  });

  res.json({
    status: true,
    message: "Deleted users fetched successfully",
    data: { users: deletedUsers },
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
};
