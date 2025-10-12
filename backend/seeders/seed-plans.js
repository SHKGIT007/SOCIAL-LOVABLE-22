const { Plan } = require('../app/models');

const seedPlans = async () => {
    try {
        console.log('Starting plan seeding...');

        // Check if plans already exist
        const existingPlans = await Plan.count();
        if (existingPlans > 0) {
            console.log('Plans already exist, skipping seeding');
            return;
        }

        // Create plans
        const plans = [
            {
                name: 'Free Plan',
                price: 0.00,
                monthly_posts: 5,
                ai_posts: 2,
                linked_accounts: 1,
                description: 'Perfect for getting started with social media management',
                features: {
                    basic_posting: true,
                    ai_generation: true,
                    analytics: false,
                    scheduling: true,
                    support: 'email'
                },
                is_active: true
            },
            {
                name: 'Pro Plan',
                price: 19.99,
                monthly_posts: 50,
                ai_posts: 20,
                linked_accounts: 3,
                description: 'Ideal for small businesses and content creators',
                features: {
                    basic_posting: true,
                    ai_generation: true,
                    analytics: true,
                    scheduling: true,
                    support: 'priority',
                    custom_branding: true
                },
                is_active: true
            },
            {
                name: 'Business Plan',
                price: 49.99,
                monthly_posts: 200,
                ai_posts: 100,
                linked_accounts: 10,
                description: 'Perfect for growing businesses and agencies',
                features: {
                    basic_posting: true,
                    ai_generation: true,
                    analytics: true,
                    scheduling: true,
                    support: 'priority',
                    custom_branding: true,
                    team_collaboration: true,
                    advanced_analytics: true
                },
                is_active: true
            },
            {
                name: 'Enterprise Plan',
                price: 99.99,
                monthly_posts: 500,
                ai_posts: 300,
                linked_accounts: 25,
                description: 'For large organizations with extensive social media needs',
                features: {
                    basic_posting: true,
                    ai_generation: true,
                    analytics: true,
                    scheduling: true,
                    support: 'dedicated',
                    custom_branding: true,
                    team_collaboration: true,
                    advanced_analytics: true,
                    api_access: true,
                    white_label: true
                },
                is_active: true
            }
        ];

        await Plan.bulkCreate(plans);
        console.log('Plans seeded successfully');
    } catch (error) {
        console.error('Error seeding plans:', error);
        throw error;
    }
};

module.exports = seedPlans;
