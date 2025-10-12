const User = require('./user.model');
const Role = require('./role.model');
const Post = require('./post.model');
const Plan = require('./plan.model');
const Subscription = require('./subscription.model');
const SocialAccount = require('./socialAccount.model');

const models = {
    User,
    Role,
    Post,
    Plan,
    Subscription,
    SocialAccount,
};

// Define associations in correct order
Role.associate(models);
User.associate(models);
Post.associate(models);
Plan.associate(models);
Subscription.associate(models);
SocialAccount.associate(models);

module.exports = models;
