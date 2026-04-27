const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');
const { 
    validatePostCreation, 
    validatePostUpdate, 
    validateAIPostGeneration,
    validateId, 
    validatePagination 
} = require('../middleware/validation.middleware');
const { getBlockedCategories, getAllowedTopics } = require('../services/contentModeration.service');

// All routes require authentication
router.use(authenticateToken);

// ============================================
// Content Policy Info (Public - no auth needed)
// ============================================
router.get('/content-policy', (req, res) => {
    res.json({
        status: true,
        message: 'Content policy retrieved successfully',
        data: {
            blockedCategories: getBlockedCategories(),
            allowedTopics: getAllowedTopics(),
            guidelines: {
                maxPromptLength: 2000,
                minPromptLength: 3,
                description: 'User prompts must not contain inappropriate, harmful, illegal, or offensive content.'
            }
        }
    });
});

// Post CRUD operations

router.put('/approve/:id', validateId, postController.approvePost);

// router.post('/', validatePostCreation, postController.createPost);
router.post('/', postController.createPost);
router.get('/', validatePagination, postController.getAllPosts);
 router.get('/:id', validateId, postController.getPostById);
router.put('/:id', validateId, validatePostUpdate, postController.updatePost);
router.delete('/:id', validateId, postController.deletePost);

// Post actions
router.post('/generate-ai', validateAIPostGeneration, postController.generateAIPost);
router.post('/:id/publish', validateId, postController.publishPost);

module.exports = router;
