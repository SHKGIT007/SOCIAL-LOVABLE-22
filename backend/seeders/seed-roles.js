const { Role } = require('../app/models');

const seedRoles = async () => {
    try {
        console.log('Starting role seeding...');

        // Check if roles already exist
        const existingRoles = await Role.count();
        if (existingRoles > 0) {
            console.log('Roles already exist, skipping seeding');
            return;
        }

        // Create roles
        const roles = [
            {
                id: 1,
                name: 'admin',
                description: 'Administrator role with full access',
                permissions: {
                    users: ['create', 'read', 'update', 'delete'],
                    posts: ['create', 'read', 'update', 'delete'],
                    plans: ['create', 'read', 'update', 'delete'],
                    subscriptions: ['create', 'read', 'update', 'delete'],
                    social_accounts: ['create', 'read', 'update', 'delete'],
                    analytics: ['read']
                }
            },
            {
                id: 2,
                name: 'client',
                description: 'Client role with limited access',
                permissions: {
                    posts: ['create', 'read', 'update', 'delete'],
                    subscriptions: ['read'],
                    social_accounts: ['create', 'read', 'update', 'delete'],
                    profile: ['read', 'update']
                }
            }
        ];

        await Role.bulkCreate(roles);
        console.log('Roles seeded successfully');
    } catch (error) {
        console.error('Error seeding roles:', error);
        throw error;
    }
};

module.exports = seedRoles;
