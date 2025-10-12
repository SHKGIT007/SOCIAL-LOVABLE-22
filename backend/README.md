# Social Lovable Backend API

A comprehensive Node.js backend API for the Social Lovable application, built with Express.js, Sequelize ORM, and MySQL database.

## Features

- **Authentication & Authorization**: JWT-based token authentication with role-based access control
- **User Management**: Complete user CRUD operations with admin and client roles
- **Post Management**: Create, read, update, delete posts with AI generation support
- **Subscription Management**: Plan-based subscription system with usage tracking
- **Social Account Integration**: Manage connected social media accounts
- **Validation**: Comprehensive input validation using express-validator
- **Error Handling**: Centralized error handling with proper logging
- **Security**: Password hashing, CORS, rate limiting, and helmet security headers

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Security**: bcryptjs, helmet, cors, express-rate-limit
- **Logging**: Winston
- **Environment**: dotenv

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=social_lovable
   DB_USER=root
   DB_PASSWORD=your_password

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d

   # Server Configuration
   PORT=9999
   NODE_ENV=development

   # CORS Configuration
   FRONTEND_URL=http://localhost:5173

   # AI Configuration (for AI post generation)
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Database Setup**
   - Create a MySQL database named `social_lovable`
   - The application will automatically create tables and seed initial data

5. **Start the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Users
- `GET /api/users/stats` - Get user statistics
- `GET /api/users/admin-stats` - Get admin statistics (Admin only)
- `POST /api/users` - Create user (Admin only)
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Posts
- `POST /api/posts` - Create a new post
- `GET /api/posts` - Get all posts
- `GET /api/posts/:id` - Get post by ID
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/generate-ai` - Generate AI post
- `POST /api/posts/:id/publish` - Publish post

### Plans
- `GET /api/plans/active` - Get active plans
- `GET /api/plans/:id` - Get plan by ID
- `POST /api/plans` - Create plan (Admin only)
- `GET /api/plans` - Get all plans (Admin only)
- `PUT /api/plans/:id` - Update plan (Admin only)
- `DELETE /api/plans/:id` - Delete plan (Admin only)
- `PATCH /api/plans/:id/toggle-status` - Toggle plan status (Admin only)

### Subscriptions
- `GET /api/subscriptions/my-subscription` - Get user's subscription
- `POST /api/subscriptions` - Create subscription
- `GET /api/subscriptions` - Get all subscriptions (Admin only)
- `GET /api/subscriptions/:id` - Get subscription by ID (Admin only)
- `PUT /api/subscriptions/:id` - Update subscription (Admin only)
- `PUT /api/subscriptions/:id/cancel` - Cancel subscription
- `PUT /api/subscriptions/:id/renew` - Renew subscription

### Social Accounts
- `GET /api/social-accounts/my-accounts` - Get user's social accounts
- `POST /api/social-accounts` - Create social account
- `GET /api/social-accounts` - Get all social accounts (Admin only)
- `GET /api/social-accounts/:id` - Get social account by ID
- `PUT /api/social-accounts/:id` - Update social account
- `DELETE /api/social-accounts/:id` - Delete social account
- `PATCH /api/social-accounts/:id/toggle-status` - Toggle social account status
- `PUT /api/social-accounts/:id/refresh-token` - Refresh social account token

## Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `user_name` (String, Required)
- `email` (String, Required, Unique)
- `password` (String, Required, Hashed)
- `user_fname` (String, Optional)
- `user_lname` (String, Optional)
- `user_phone` (String, Optional)
- `user_type` (Enum: 'admin', 'client')
- `role_id` (Integer, Foreign Key to Roles)
- `avatar_url` (String, Optional)
- `full_name` (String, Optional)
- `created_at` (DateTime)
- `updated_at` (DateTime)

### Roles Table
- `id` (Integer, Primary Key, Auto Increment)
- `name` (String, Required, Unique)
- `description` (Text, Optional)
- `permissions` (JSON, Optional)
- `created_at` (DateTime)
- `updated_at` (DateTime)

### Posts Table
- `id` (UUID, Primary Key)
- `title` (String, Required)
- `content` (Text, Required)
- `platforms` (JSON, Required)
- `status` (Enum: 'draft', 'scheduled', 'published')
- `is_ai_generated` (Boolean, Default: false)
- `ai_prompt` (Text, Optional)
- `scheduled_at` (DateTime, Optional)
- `published_at` (DateTime, Optional)
- `user_id` (UUID, Foreign Key to Users)
- `category` (String, Optional)
- `tags` (JSON, Optional)
- `media_urls` (JSON, Optional)
- `analytics` (JSON, Optional)
- `created_at` (DateTime)
- `updated_at` (DateTime)

### Plans Table
- `id` (UUID, Primary Key)
- `name` (String, Required)
- `price` (Decimal, Required)
- `monthly_posts` (Integer, Required)
- `ai_posts` (Integer, Required)
- `linked_accounts` (Integer, Required)
- `features` (JSON, Optional)
- `is_active` (Boolean, Default: true)
- `description` (Text, Optional)
- `created_at` (DateTime)
- `updated_at` (DateTime)

### Subscriptions Table
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to Users)
- `plan_id` (UUID, Foreign Key to Plans)
- `status` (Enum: 'active', 'inactive', 'cancelled', 'expired')
- `start_date` (DateTime, Required)
- `end_date` (DateTime, Optional)
- `posts_used` (Integer, Default: 0)
- `ai_posts_used` (Integer, Default: 0)
- `auto_renew` (Boolean, Default: true)
- `created_at` (DateTime)
- `updated_at` (DateTime)

### Social Accounts Table
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to Users)
- `platform` (String, Required)
- `account_id` (String, Optional)
- `account_name` (String, Optional)
- `access_token` (Text, Optional)
- `refresh_token` (Text, Optional)
- `token_expires_at` (DateTime, Optional)
- `is_active` (Boolean, Default: true)
- `metadata` (JSON, Optional)
- `created_at` (DateTime)
- `updated_at` (DateTime)

## Default Admin Credentials

After running the seeders, you can login with:
- **Email**: admin@sociallovable.com
- **Password**: admin123

**⚠️ Important**: Change the admin password after first login!

## Postman Collection

A complete Postman collection is included in `postman_collection.json`. Import this file into Postman to test all API endpoints.

## Error Handling

The API uses standardized error responses:

```json
{
  "status": false,
  "message": "Error description",
  "errors": [] // Validation errors (if any)
}
```

## Authentication

All protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

The API implements rate limiting:
- 100 requests per 15 minutes per IP address
- Applied to all routes except authentication

## Logging

The application uses Winston for logging:
- Error logs: `logs/error.log`
- Combined logs: `logs/combined.log`
- Console output in development mode

## Security Features

- Password hashing using bcryptjs
- JWT token authentication
- CORS protection
- Helmet security headers
- Rate limiting
- Input validation and sanitization
- SQL injection protection via Sequelize ORM

## Development

### Running in Development Mode
```bash
npm run dev
```

### Database Migrations
The application automatically creates tables and runs seeders on startup.

### Adding New Features
1. Create model in `app/models/`
2. Create controller in `app/controllers/`
3. Create routes in `app/route/`
4. Add validation rules in `app/middleware/validation.middleware.js`
5. Update Postman collection

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a production database
3. Set strong JWT secrets
4. Configure proper CORS origins
5. Set up proper logging
6. Use a process manager like PM2

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.
