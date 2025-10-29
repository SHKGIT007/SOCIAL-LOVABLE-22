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

// All routes require authentication
router.use(authenticateToken);

// Post CRUD operations
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
