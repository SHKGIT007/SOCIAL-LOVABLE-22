const bcrypt = require('bcryptjs');
const { User, Role } = require('../app/models');

const seedAdminUser = async () => {
    try {
        console.log('Starting admin user seeding...');

        // Check if admin user already exists
        const existingAdmin = await User.findOne({ 
            where: { user_type: 'admin' } 
        });
        
        if (existingAdmin) {
            console.log('Admin user already exists, skipping seeding');
            return;
        }

        // Get admin role
        const adminRole = await Role.findOne({ where: { name: 'admin' } });
        if (!adminRole) {
            console.log('Admin role not found, please run role seeder first');
            return;
        }

        // Create admin user
        const hashedPassword = await bcrypt.hash('admin123', 12);
        
        const adminUser = await User.create({
            user_name: 'admin',
            email: 'admin@gmail.com',
            password: hashedPassword,
            user_fname: 'Admin',
            user_lname: 'User',
            user_type: 'admin',
            role_id: adminRole.id,
            is_admin: 'on'
        });

        console.log('Admin user created successfully');
        console.log('Admin credentials:');
        console.log('Email: admin@sociallovable.com');
        console.log('Password: admin123');
        console.log('Please change the password after first login!');
        
        return adminUser;
    } catch (error) {
        console.error('Error seeding admin user:', error);
        throw error;
    }
};

module.exports = seedAdminUser;
