const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Role } = require("../models");
const { asyncHandler } = require("../middleware/error.middleware");
const logger = require("../config/logger");
const { Op } = require("sequelize");
const nodemailer = require("nodemailer");

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// const register = asyncHandler(async (req, res) => {
//     const { user_name, email, password, user_fname, user_lname, user_phone } = req.body;

//     // Check If Email Already Exists
//     const emailExists = await User.findOne({ where: { email } });
//     if (emailExists) {
//         return res.status(409).json({
//             status: false,
//             message: 'Email is already taken, please choose a different one'
//         });
//     }

//     // Check If Username Already Exists
//     const usernameExists = await User.findOne({ where: { user_name } });
//     if (usernameExists) {
//         return res.status(409).json({
//             status: false,
//             message: 'Username is already taken, please choose a different one'
//         });
//     }

//     // Check If Phone Already Exists (optional)
//     if (user_phone) {
//         const phoneExists = await User.findOne({ where: { user_phone } });
//         if (phoneExists) {
//             return res.status(409).json({
//                 status: false,
//                 message: 'Phone number is already taken, please use another number'
//             });
//         }
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 12);

//     // Create user
//     const user = await User.create({
//         user_name,
//         email,
//         password: hashedPassword,
//         user_fname,
//         user_lname,
//         user_phone,
//         user_type: 'client',
//         role_id: 2
//     });

//     // Generate token
//     const token = generateToken(user.id);

//     logger.info('User registered successfully', { userId: user.id, email: user.email });

//     res.status(201).json({
//         status: true,
//         message: 'User registered successfully',
//         data: {
//             user: {
//                 id: user.id,
//                 user_name: user.user_name,
//                 email: user.email,
//                 user_fname: user.user_fname,
//                 user_lname: user.user_lname,
//                 user_type: user.user_type
//             },
//             token
//         }
//     });
// });

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user
  const user = await User.findOne({
    where: { email },
    include: [{ model: Role, as: "Role" }],
  });

  if (!user) {
    return res.status(401).json({
      status: false,
      message: "Invalid email or password",
    });
  }

  // 🔥 Fix: active_status may be "0" (string) instead of number
  if (Number(user.active_status) === 0) {
    return res.status(403).json({
      status: false,
      message: "Your account is deactivated. Please contact admin.",
    });
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({
      status: false,
      message: "Invalid email or password",
    });
  }

  // Generate token
  const token = generateToken(user.id);

  logger.info("User logged in successfully", {
    userId: user.id,
    email: user.email,
  });

  res.json({
    status: true,
    message: "Login successful",
    data: {
      user: {
        id: user.id,
        user_name: user.user_name,
        email: user.email,
        user_fname: user.user_fname,
        user_lname: user.user_lname,
        user_type: user.user_type,
        role: user.Role?.name,
      },
      token,
    },
  });
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    include: [{ model: Role, as: "Role" }],
    attributes: { exclude: ["password"] },
  });

  res.json({
    status: true,
    data: {
      user: {
        id: user.id,
        user_name: user.user_name,
        email: user.email,
        user_fname: user.user_fname,
        user_lname: user.user_lname,
        user_phone: user.user_phone,
        user_type: user.user_type,
        avatar_url: user.avatar_url,
        full_name: user.full_name,
        role: user.Role?.name,
        created_at: user.created_at,
      },
    },
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { user_name, user_fname, user_lname, user_phone, full_name, email } =
    req.body;
  const userId = req.user.id;

  // 🔍 DUPLICATE CHECK
  if (user_name || email || user_phone) {
    const duplicateUser = await User.findOne({
      where: {
        [Op.or]: [
          user_name ? { user_name } : null,
          email ? { email } : null,
          user_phone ? { user_phone } : null,
        ],
        id: { [Op.ne]: userId }, // 👈 exclude current user
      },
    });

    if (duplicateUser) {
      let message = "Already exists";

      if (duplicateUser.user_name === user_name)
        message = "Username already taken";
      if (duplicateUser.email === email) message = "Email already registered";
      if (duplicateUser.user_phone === user_phone)
        message = "Phone number already registered";

      return res.status(400).json({
        status: false,
        message,
      });
    }
  }

  const updateData = {};
  if (user_name) updateData.user_name = user_name;
  if (email) updateData.email = email;
  if (user_fname) updateData.user_fname = user_fname;
  if (user_lname) updateData.user_lname = user_lname;
  if (user_phone) updateData.user_phone = user_phone;
  if (full_name) updateData.full_name = full_name;

  await User.update(updateData, {
    where: { id: userId },
  });

  const updatedUser = await User.findByPk(userId, {
    include: [{ model: Role, as: "Role" }],
    attributes: { exclude: ["password"] },
  });

  res.json({
    status: true,
    message: "Profile updated successfully",
    data: {
      user: {
        id: updatedUser.id,
        user_name: updatedUser.user_name,
        email: updatedUser.email,
        user_fname: updatedUser.user_fname,
        user_lname: updatedUser.user_lname,
        user_phone: updatedUser.user_phone,
        user_type: updatedUser.user_type,
        avatar_url: updatedUser.avatar_url,
        full_name: updatedUser.full_name,
        role: updatedUser.Role?.name,
      },
    },
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { old_password, new_password } = req.body;
  const userId = req.user.id;

  const user = await User.findByPk(userId);
  if (!user) {
    return res.status(404).json({
      status: false,
      message: "User not found",
    });
  }

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(
    old_password,
    user.password
  );
  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      status: false,
      message: "Current password is incorrect",
    });
  }

  // Hash new password
  const hashedNewPassword = await bcrypt.hash(new_password, 12);

  // Update password
  await User.update({ password: hashedNewPassword }, { where: { id: userId } });

  logger.info("User password changed", { userId });

  res.json({
    status: true,
    message: "Password changed successfully",
  });
});

const sendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      status: false,
      message: "Email is required",
    });
  }

  // Check if email already verified
  const existingUser = await User.findOne({
    where: { email, is_email_verified: true },
  });

  if (existingUser) {
    return res.status(409).json({
      status: false,
      message: "Email is already registered",
    });
  }

  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  const tempUser = await User.findOne({
    where: { email, is_email_verified: false },
  });

  if (tempUser) {
    await User.update(
      { otp, otp_expiry: otpExpiry },
      { where: { email, is_email_verified: false } }
    );
  } else {
    await User.create({
      email,
      otp,
      otp_expiry: otpExpiry,
      user_name: "temp_" + Date.now(),
      password: "temp_password",
      is_email_verified: false,
      active_status: false,
    });
  }

  try {
    await sendOTPEmail(email, otp);
    logger.info("OTP sent", { email });

    res.json({
      status: true,
      message: "OTP sent successfully to your email",
    });
  } catch (error) {
    logger.error("OTP sending failed", { email, error: error.message });

    res.status(500).json({
      status: false,
      message: "Failed to send OTP. Please try again.",
    });
  }
});

const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      status: false,
      message: "Email and OTP are required",
    });
  }

  const user = await User.findOne({
    where: { email, is_email_verified: false },
  });

  if (!user) {
    return res.status(404).json({
      status: false,
      message: "No OTP request found. Request a new OTP.",
    });
  }

  if (new Date() > new Date(user.otp_expiry)) {
    return res.status(400).json({
      status: false,
      message: "OTP expired. Request a new one.",
    });
  }

  if (user.otp !== otp.trim()) {
    return res.status(400).json({
      status: false,
      message: "Invalid OTP",
    });
  }

  logger.info("OTP verified successfully", { email });

  res.json({
    status: true,
    message: "OTP verified successfully. You can now complete registration.",
  });
});

const register = asyncHandler(async (req, res) => {
  const {
    user_name,
    email,
    password,
    user_fname,
    user_lname,
    user_phone,
    otp,
  } = req.body;

  const tempUser = await User.findOne({
    where: { email, is_email_verified: false },
  });

  if (!tempUser) {
    return res.status(400).json({
      status: false,
      message: "Please verify your email with OTP first",
    });
  }

  if (new Date() > new Date(tempUser.otp_expiry)) {
    return res.status(400).json({
      status: false,
      message: "OTP has expired",
    });
  }

  if (tempUser.otp !== otp.trim()) {
    return res.status(400).json({
      status: false,
      message: "Invalid OTP",
    });
  }

  const usernameExists = await User.findOne({
    where: { user_name, is_email_verified: true },
  });

  if (usernameExists) {
    return res.status(409).json({
      status: false,
      message: "Username already taken",
    });
  }

  if (user_phone) {
    const phoneExists = await User.findOne({
      where: { user_phone, is_email_verified: true },
    });

    if (phoneExists) {
      return res.status(409).json({
        status: false,
        message: "Phone number already registered",
      });
    }
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await User.update(
    {
      user_name,
      password: hashedPassword,
      user_fname,
      user_lname,
      user_phone,
      user_type: "client",
      role_id: 2,
      is_email_verified: true,
      otp: null,
      otp_expiry: null,
      active_status: true,
    },
    {
      where: { id: tempUser.id },
    }
  );

  const user = await User.findByPk(tempUser.id);
  const token = generateToken(user.id);

  logger.info("User registered", { userId: user.id });

  res.status(201).json({
    status: true,
    message: "User registered successfully",
    data: {
      user: {
        id: user.id,
        user_name: user.user_name,
        email: user.email,
        user_fname: user.user_fname,
        user_lname: user.user_lname,
        user_type: user.user_type,
      },
      token,
    },
  });
});

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Your OTP Code",
    html: `
            <h2>Your OTP Code</h2>
            <p>Your OTP is: <b>${otp}</b></p>
            <p>This OTP is valid for 10 minutes.</p>
        `,
  });
};

module.exports = {
  register,
  verifyOTP,
  sendOTP,
  login,
  getProfile,
  updateProfile,
  changePassword,
};
