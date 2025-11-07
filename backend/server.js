const express = require('express');
require('dotenv').config();
const sequelize = require('./app/config/db.config');
const routes = require('./app/route');


const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 9999;
const path = require('path');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Security middleware
app.use(helmet());
// Enable file upload middleware
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
}));

// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100 // limit each IP to 100 requests per windowMs
// });
// app.use(limiter);

// Allow frontend origin
var corsOptions = {
    origin: "*"
};
app.use(cors(corsOptions));

app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({
    limit: '50mb', extended: true
}));



app.get("/",(req,res)=>{
    res.send("Welcome to Social Lovable API")
});



// appid = 1579224306600577
// secretkey = a61184184766a15c03154b899db189c7
// callbackUrl = https://hometalent4u.in/backend/facebook/callback

//  VERIFY_TOKEN = "nilesh";



// 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


app.use('/api', routes);

require("./redirectAuth")(app);
require("./app/jobs/runScheduler");

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        status: false,
        message: 'Route not found'
    });
});

// Import models to ensure they're loaded
const { Role, User, Post, Plan, Subscription, SocialAccount } = require('./app/models');

sequelize.sync({ force: false })
    .then(async () => {
        console.log("Database & tables created!");
        // Run seeders after sync
        try {
            console.log('Running seeders...');
            const seedRoles = require('./seeders/seed-roles');
            await seedRoles();
            console.log('✅ Roles seeded');
            
            const seedPlans = require('./seeders/seed-plans');
            await seedPlans();
            console.log('✅ Plans seeded');
            
            const seedAdminUser = require('./seeders/seed-admin-user');
            await seedAdminUser();
            console.log('✅ Admin user seeded');
            
            console.log('All seeders completed successfully!');
        } catch (e) {
            console.log('Seeder error:', e);
        }
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch(error => console.log(error));










//     response.data {
//    access_token: 'IGAAVmGeDYcJ9BZAFFrZAVNwMkIweGlQUVhYa1ZAVZAnpSbi1vbVBPVVE2ZA1REckV0Q3duUi1BaFVHYkItX2xiWjRKMlo3Nk1aRm5zc1ZAhSDNOdC1idHp2TTZAkSURuOUh5amdJRVFQTmtDbVQ2ZAnppOVdySGpKeWVFU29ndjF4aDR4VjBLOXltQ2NxQ1NNNzR1UXhKNFJrSgZDZD',
//    user_id: 25282034201401110,
//    permissions: [
//      'instagram_business_basic',
//      'instagram_business_manage_messages',
//      'instagram_business_content_publish',
//      'instagram_business_manage_comments'
//    ]
//  }
//  userResponse {
//    id: '25282034201401113',
//    username: 'sewintechnology',
//    account_type: 'BUSINESS',
//    media_count: 66
//  }

