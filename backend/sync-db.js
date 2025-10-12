const sequelize = require('./app/config/db.config');

async function syncDatabase() {
    try {
        console.log('🔄 Starting database sync...');
        
        // Import models
        const { Role, User, Post, Plan, Subscription, SocialAccount } = require('./app/models');
        
        // Sync tables in correct order (no foreign key dependencies first)
        console.log('📋 Syncing Roles table...');
        await Role.sync({ force: false });
        
        console.log('👥 Syncing Users table...');
        await User.sync({ force: false });
        
        console.log('📦 Syncing Plans table...');
        await Plan.sync({ force: false });
        
        console.log('📝 Syncing Posts table...');
        await Post.sync({ force: false });
        
        console.log('💳 Syncing Subscriptions table...');
        await Subscription.sync({ force: false });
        
        console.log('🔗 Syncing Social Accounts table...');
        await SocialAccount.sync({ force: false });
        
        console.log('✅ All tables synced successfully!');
        
        // Run seeders
        console.log('🌱 Running seeders...');
        await require('./seeders/seed-roles');
        await require('./seeders/seed-plans');
        const seedAdminUser = require('./seeders/seed-admin-user');
        await seedAdminUser();
        
        console.log('🎉 Database setup completed successfully!');
        
        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Database sync failed:', error);
        process.exit(1);
    }
}

syncDatabase();
