

const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};
// Social Account credentials update validation
const validateSocialAccountCredentialsUpdate = [
    body('platform')
        .notEmpty()
        .withMessage('Platform is required'),
    body('app_id')
        .notEmpty()
        .withMessage('App ID is required'),
    body('app_secret')
        .notEmpty()
        .withMessage('App Secret is required'),
    handleValidationErrors
];

// User validation rules
const validateUserRegistration = [
    body('user_name')
        .notEmpty()
        .withMessage('Username is required')
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters'),
    body('email')
        .isEmail()
        .withMessage('Valid email is required')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    body('user_fname')
        .optional()
        .isLength({ max: 50 })
        .withMessage('First name must be less than 50 characters'),
    body('user_lname')
        .optional()
        .isLength({ max: 50 })
        .withMessage('Last name must be less than 50 characters'),
    body('user_phone')
        .optional()
        .isMobilePhone()
        .withMessage('Valid phone number is required'),
    handleValidationErrors
];

const validateUserLogin = [
    body('email')
        .isEmail()
        .withMessage('Valid email is required')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    handleValidationErrors
];

const validateUserUpdate = [
    body('user_name')
        .optional()
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters'),
    body('email')
        .optional()
        .isEmail()
        .withMessage('Valid email is required')
        .normalizeEmail(),
    body('user_fname')
        .optional()
        .isLength({ max: 50 })
        .withMessage('First name must be less than 50 characters'),
    body('user_lname')
        .optional()
        .isLength({ max: 50 })
        .withMessage('Last name must be less than 50 characters'),
    body('user_phone')
        .optional()
        .isMobilePhone()
        .withMessage('Valid phone number is required'),
    handleValidationErrors
];

// Post validation rules
const validatePostCreation = [
   
    body('content')
        .notEmpty()
        .withMessage('Content is required')
        .isLength({ min: 10 })
        .withMessage('Content must be at least 10 characters long'),
    body('status')
        .optional()
        .isIn(['draft', 'scheduled', 'published'])
        .withMessage('Status must be draft, scheduled, or published'),
        body('scheduled_at')
            .optional({ nullable: true })
            .custom((value) => value === null || value === '' || !value || (typeof value === 'string' && !isNaN(Date.parse(value))))
            .withMessage('Scheduled date must be a valid date or null'),
    handleValidationErrors
];

const validatePostUpdate = [
    body('title')
        .optional()
        .isLength({ min: 1, max: 200 })
        .withMessage('Title must be between 1 and 200 characters'),
    body('content')
        .optional()
        .isLength({ min: 10 })
        .withMessage('Content must be at least 10 characters long'),
    body('platforms')
        .optional()
        .isArray({ min: 1 })
        .withMessage('At least one platform must be selected'),
    body('status')
        .optional()
        .isIn(['draft', 'scheduled', 'published'])
        .withMessage('Status must be draft, scheduled, or published'),
        body('scheduled_at')
            .optional({ nullable: true })
            .custom((value) => value === null || value === '' || !value || (typeof value === 'string' && !isNaN(Date.parse(value))))
            .withMessage('Scheduled date must be a valid date or null'),
    handleValidationErrors
];

// Plan validation rules
const validatePlanCreation = [
    body('name')
        .notEmpty()
        .withMessage('Plan name is required')
        .isLength({ min: 1, max: 100 })
        .withMessage('Plan name must be between 1 and 100 characters'),
    body('price')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    body('monthly_posts')
        .isInt({ min: 0 })
        .withMessage('Monthly posts must be a non-negative integer'),
    body('ai_posts')
        .isInt({ min: 0 })
        .withMessage('AI posts must be a non-negative integer'),
    body('linked_accounts')
        .isInt({ min: 1 })
        .withMessage('Linked accounts must be at least 1'),
    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description must be less than 500 characters'),
    handleValidationErrors
];

// Subscription validation rules
const validateSubscriptionCreation = [
    body('plan_id')
        .isInt({ min: 1 })
        .withMessage('Valid plan ID is required'),
    body('start_date')
        .optional()
        .isISO8601()
        .withMessage('Start date must be a valid date'),
    body('end_date')
        .optional()
        .isISO8601()
        .withMessage('End date must be a valid date'),
    handleValidationErrors
];

// Social Account validation rules
const validateSocialAccountCreation = [
    body('platform')
        .notEmpty()
        .withMessage('Platform is required')
        .isIn(['Facebook', 'Instagram', 'Twitter', 'LinkedIn'])
        .withMessage('Platform must be Facebook, Instagram, Twitter, or LinkedIn'),
    body('account_id')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Account ID must be less than 100 characters'),
    body('account_name')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Account name must be less than 100 characters'),
    handleValidationErrors
];

// AI Post generation validation
const validateAIPostGeneration = [
    // body('topic')
    //     .notEmpty()
    //     .withMessage('Topic is required')
    //     .isLength({ min: 1, max: 200 })
    //     .withMessage('Topic must be between 1 and 200 characters'),
    // body('wordCount')
    //     .optional()
    //     .isInt({ min: 50, max: 1000 })
    //     .withMessage('Word count must be between 50 and 1000'),
    // body('language')
    //     .optional()
    //     .isIn(['English', 'Spanish', 'French', 'German'])
    //     .withMessage('Language must be English, Spanish, French, or German'),
    // body('style')
    //     .optional()
    //     .isIn(['Formal', 'Informal', 'Casual'])
    //     .withMessage('Style must be Formal, Informal, or Casual'),
    // body('tone')
    //     .optional()
    //     .isIn(['Professional', 'Friendly', 'Humorous'])
    //     .withMessage('Tone must be Professional, Friendly, or Humorous'),
    // body('audience')
    //     .optional()
    //     .isIn(['Kids', 'Teens', 'Adults'])
    //     .withMessage('Audience must be Kids, Teens, or Adults'),
    // body('purpose')
    //     .optional()
    //     .isIn(['Marketing', 'Informational', 'Educational'])
    //     .withMessage('Purpose must be Marketing, Informational, or Educational'),
    handleValidationErrors
];

// Parameter validation
const validateId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Valid ID is required'),
    handleValidationErrors
];

// Query validation
const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    handleValidationErrors
];

module.exports = {
    validateUserRegistration,
    validateUserLogin,
    validateUserUpdate,
    validatePostCreation,
    validatePostUpdate,
    validatePlanCreation,
    validateSubscriptionCreation,
    validateSocialAccountCreation,
     validateSocialAccountCredentialsUpdate,
    validateAIPostGeneration,
    validateId,
    validatePagination,
    handleValidationErrors
};
