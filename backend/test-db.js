const sequelize = require('./app/config/db.config');

async function testConnection() {
    try {
        await sequelize.authenticate();
        
        // Test table creation order
        
        // Import models in correct order
        const { Role, User, Post, Plan, Subscription, SocialAccount } = require('./app/models');
        
        // Sync tables in correct order
        await Role.sync({ force: false });
        
        await User.sync({ force: false });
        
        await Plan.sync({ force: false });
        
        await Post.sync({ force: false });
        
        await Subscription.sync({ force: false });
        
        await SocialAccount.sync({ force: false });
        
        
        await sequelize.close();
    } catch (error) {
        process.exit(1);
    }
}

testConnection();
