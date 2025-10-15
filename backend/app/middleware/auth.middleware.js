const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../config/logger');

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
       
        
        if (!token) {
            return res.status(401).json({
                status: false,
                message: 'Access token required'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database
        const user = await User.findByPk(decoded.userId, {
            include: ['Role']
        });

        if (!user) {
            return res.status(401).json({
                status: false,
                message: 'Invalid token - user not found'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        logger.error('Authentication error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                status: false,
                message: 'Invalid token'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: false,
                message: 'Token expired'
            });
        }

        return res.status(500).json({
            status: false,
            message: 'Authentication failed'
        });
    }
};

const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                status: false,
                message: 'Authentication required'
            });
        }

        const userRole = req.user.user_type || req.user.Role?.name;
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                status: false,
                message: 'Insufficient permissions'
            });
        }

        next();
    };
};

const requireAdmin = requireRole('admin');
const requireClient = requireRole('client');

module.exports = {
    authenticateToken,
    requireRole,
    requireAdmin,
    requireClient
};
