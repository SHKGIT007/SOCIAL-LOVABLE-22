const User = require('./user.model');
const Role = require('./role.model');
const Post = require('./post.model');
const Plan = require('./plan.model');
const Subscription = require('./subscription.model');
const SocialAccount = require('./socialAccount.model');
const Profile = require('./profile.model');
const SystemSetting = require('./systemSetting.model');
const Schedule = require('./schedule.model');
const AiGenratePost = require('./aiGenratePost.model');

const models = {
    User,
    Role,
    Post,
    Plan,
    Subscription,
    SocialAccount,
    Profile,
    SystemSetting,
    Schedule,
    AiGenratePost
};

// Define associations in correct order

if (Role.associate) Role.associate(models);
if (User.associate) User.associate(models);
if (Post.associate) Post.associate(models);
if (Plan.associate) Plan.associate(models);
if (Subscription.associate) Subscription.associate(models);
if (SocialAccount.associate) SocialAccount.associate(models);
if (Profile.associate) Profile.associate(models);
if (SystemSetting.associate) SystemSetting.associate(models);
if (Schedule.associate) Schedule.associate(models);
if (AiGenratePost.associate) AiGenratePost.associate(models);

module.exports = models;
