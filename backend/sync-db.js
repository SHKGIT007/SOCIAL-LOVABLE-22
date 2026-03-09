const sequelize = require('./app/config/db.config');

async function syncDatabase() {
    try {
        
        // Import models
        const { Role, User, Post, Plan, Subscription, SocialAccount } = require('./app/models');
        
        // Sync tables in correct order (no foreign key dependencies first)
        await Role.sync({ force: false });
        
        await User.sync({ force: false });
        
        await Plan.sync({ force: false });
        
        await Post.sync({ force: false });
        
        await Subscription.sync({ force: false });
        
        await SocialAccount.sync({ force: false });
        
        
        // Run seeders
        await require('./seeders/seed-roles');
        await require('./seeders/seed-plans');
        const seedAdminUser = require('./seeders/seed-admin-user');
        await seedAdminUser();
        
        
        await sequelize.close();
        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
}

syncDatabase();
