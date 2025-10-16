const User = require('./user.model');
const Role = require('./role.model');
const Post = require('./post.model');
const Plan = require('./plan.model');
const Subscription = require('./subscription.model');
const SocialAccount = require('./socialAccount.model');
const Profile = require('./profile.model');

const models = {
    User,
    Role,
    Post,
    Plan,
    Subscription,
    SocialAccount,
    Profile,
};

// Define associations in correct order

if (Role.associate) Role.associate(models);
if (User.associate) User.associate(models);
if (Post.associate) Post.associate(models);
if (Plan.associate) Plan.associate(models);
if (Subscription.associate) Subscription.associate(models);
if (SocialAccount.associate) SocialAccount.associate(models);
if (Profile.associate) Profile.associate(models);

module.exports = models;
