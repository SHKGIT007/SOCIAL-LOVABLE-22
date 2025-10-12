const sequelize = require('./app/config/db.config');

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');
        
        // Test table creation order
        console.log('🔄 Testing table creation...');
        
        // Import models in correct order
        const { Role, User, Post, Plan, Subscription, SocialAccount } = require('./app/models');
        
        // Sync tables in correct order
        await Role.sync({ force: false });
        console.log('✅ Roles table synced');
        
        await User.sync({ force: false });
        console.log('✅ Users table synced');
        
        await Plan.sync({ force: false });
        console.log('✅ Plans table synced');
        
        await Post.sync({ force: false });
        console.log('✅ Posts table synced');
        
        await Subscription.sync({ force: false });
        console.log('✅ Subscriptions table synced');
        
        await SocialAccount.sync({ force: false });
        console.log('✅ Social Accounts table synced');
        
        console.log('🎉 All tables created successfully!');
        
        await sequelize.close();
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
}

testConnection();
