const express = require("express");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const sequelize = require("./App/Connection/db.config");
const routes = require("./App/Routes");
const http = require("http");
const socket = require("./socket");

const cors = require("cors");
const app = express();
const server = http.createServer(app);

socket.init(server);

const PORT = process.env.PORT || 9999;
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Security middleware
app.use(helmet());
// Enable file upload middleware
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Allow frontend origin
var corsOptions = {
  origin: "*",
};
app.use(cors(corsOptions));

app.use(bodyParser.json({ limit: "50mb", extended: true }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
  })
);

app.get("/", (req, res) => {
  res.send("Welcome to Social Lovable API");
});

// Third-party integration keys should be securely stored in .env file

app.use("/api", routes);

require("./redirectAuth")(app);
require("./App/jobs/runScheduler");
require("./App/autoschedulejobs/runScheduler");

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({
    status: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    status: false,
    message: "Route not found",
  });
});

// Import models to ensure they're loaded
const {
  Role,
  User,
  Post,
  Plan,
  Subscription,
  SocialAccount,
} = require("./App/Models");

sequelize
  .sync({ force: false })
  .then(async () => {
    // Run seeders after sync
    try {
      const seedRoles = require("./seeders/seed-roles");
      await seedRoles();

      const seedPlans = require("./seeders/seed-plans");
      await seedPlans();

      const seedAdminUser = require("./seeders/seed-admin-user");
      await seedAdminUser();

    } catch (e) {
    }
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
    });
  })
  .catch((error) => {
    console.error("Database sync failed:", error);
  });

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
