const bcrypt = require('bcryptjs');
const { User, Role } = require('../app/models');

const seedAdminUser = async () => {
    try {

        // Check if admin user already exists
        const existingAdmin = await User.findOne({ 
            where: { user_type: 'admin' } 
        });
        
        if (existingAdmin) {
            return;
        }

        // Get admin role
        const adminRole = await Role.findOne({ where: { name: 'admin' } });
        if (!adminRole) {
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

        
        return adminUser;
    } catch (error) {
        throw error;
    }
};

module.exports = seedAdminUser;
