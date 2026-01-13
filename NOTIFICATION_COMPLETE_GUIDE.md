# 🚀 Complete Notification System - Implementation Guide

## Overview
A full-featured notification system with real-time socket.io updates, database persistence, and read/unread tracking.

---

## 📦 Files Created/Modified

### Backend

#### New Files:
1. **`app/models/notification.model.js`** - Notification model
2. **`app/migrations/20260113120000-create-notifications.js`** - Database migration
3. **`NOTIFICATION_IMPLEMENTATION.md`** - Implementation details
4. **`NOTIFICATION_SETUP_CHECKLIST.md`** - Setup & testing guide

#### Modified Files:
1. **`app/models/index.js`** - Added Notification model
2. **`app/controllers/notification.controller.js`** - Full CRUD operations
3. **`app/controllers/user.controller.js`** - Added user registration notifications
4. **`app/controllers/subscription.controller.js`** - Added plan purchase notifications
5. **`app/controllers/post.controller.js`** - Added post creation notifications
6. **`app/route/notification.routes.js`** - API routes
7. **`app/route/index.js`** - Registered notification routes
8. **`socket.js`** - Added admin broadcast functionality

### Frontend

#### New Files:
1. **`src/pages/NotificationsPage.tsx`** - Full notification page with filters

#### Modified Files:
1. **`src/App.tsx`** - Added notification routes and socket registration with userType

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     NOTIFICATION SYSTEM                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  FRONTEND                    BACKEND                  DATABASE│
│  ┌──────────────┐          ┌──────────────┐         ┌──────┐│
│  │ NotificationPage        │ Controllers  │─────────│ DB   ││
│  │ (View/Manage)│          │ (Create)     │         └──────┘│
│  └──────┬───────┘          └──────┬───────┘              │    │
│         │                         │                       │    │
│         │      Real-time via      │                       │    │
│         │     Socket.io (Toast)   │                       │    │
│         ├────────────────────────►│                       │    │
│         │                         │                       │    │
│         │        REST API         │                       │    │
│         │   (Get, Mark, Delete)   │                       │    │
│         ├────────────────────────►├──────────────────────┤    │
│         │                         │                       │    │
│         └────────────────────────►└───────────────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Notification Flow

### When an action happens (e.g., User Registration):

```
1. Admin creates user in User Controller
   ↓
2. createNotification() is called with:
   - for_admin: true
   - notification_type: "user_registered"
   - title & message
   ↓
3. Notification saved to database
   ↓
4. socket.sendAdminNotification() sends real-time message
   ↓
5. All connected admin sockets receive toast notification
   ↓
6. User can also view in /admin/notifications page
```

---

## 📋 API Endpoints

### Get Notifications
```
GET /api/notifications?page=1&limit=10&is_read=false
Authorization: Bearer {token}

Response:
{
  "status": true,
  "data": {
    "notifications": [...],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    },
    "unreadCount": 12
  }
}
```

### Get Unread Count
```
GET /api/notifications/count/unread
Authorization: Bearer {token}

Response:
{
  "status": true,
  "data": {
    "unreadCount": 5
  }
}
```

### Mark as Read
```
PUT /api/notifications/:id/read
Authorization: Bearer {token}

Response:
{
  "status": true,
  "message": "Notification marked as read",
  "data": { notification object }
}
```

### Mark All as Read
```
PUT /api/notifications/read/all
Authorization: Bearer {token}

Response:
{
  "status": true,
  "message": "All notifications marked as read",
  "data": {
    "updatedCount": 5
  }
}
```

### Delete
```
DELETE /api/notifications/:id
Authorization: Bearer {token}

Response:
{
  "status": true,
  "message": "Notification deleted"
}
```

---

## 🔌 Socket Events

### Server → Client

**Event: `receive_notification`**
```javascript
// Emitted to specific user socket
io.to(socketId).emit("receive_notification", {
  title: "User Registered",
  message: "New user John has registered",
  type: "user_registered",
  metadata: { user_id: 5, ... }
});

// Broadcast to all admin sockets
adminSockets.forEach(socketId => {
  io.to(socketId).emit("receive_notification", data);
});
```

### Client → Server

**Event: `register`**
```javascript
// When user connects, register with server
socket.emit("register", userId, userType);
```

---

## 💾 Database Schema

```javascript
Notification {
  id: INTEGER PRIMARY KEY,
  for_user_id: INTEGER (FK → users.id),
  for_admin: BOOLEAN (true if admin notification),
  notification_type: ENUM [
    "user_registered",
    "plan_purchase",
    "post_created",
    "post_published",
    "post_scheduled",
    "post_pending_review",
    "post_draft",
    "ai_limit_alert",
    "schedule_reminder",
    "draft_reminder"
  ],
  title: STRING(255),
  message: TEXT,
  metadata: JSON (store related IDs, names, etc),
  is_read: BOOLEAN (default: false),
  read_at: DATETIME (null until read),
  created_at: DATETIME,
  updated_at: DATETIME
}
```

### Indexes:
- `for_user_id` - Fast lookup of user notifications
- `for_admin` - Fast lookup of admin notifications
- `is_read` - Filter unread notifications

---

## 🎯 Notification Types Implemented

### Admin Notifications
```javascript
1. "user_registered"
   Title: "New User Registered"
   Message: "New User: 'John Doe' has been registered successfully."
   Triggered: When admin creates a new user

2. "plan_purchase"
   Title: "New Plan Purchase"
   Message: "Congratulations! 'John' successfully purchased 'Premium' plan."
   Triggered: When user completes payment

3. "post_created"
   Title: "User Post Created"
   Message: "Post Created: A new post was created by John."
   Triggered: When user creates a post

4. "post_draft"
   Title: "User Draft Post"
   Message: "John draft a AI-Post."
   Triggered: When user saves as draft
```

### User Notifications
```javascript
1. "plan_purchase"
   Title: "Plan Purchase Success"
   Message: "Congratulations! You have successfully purchased 'Premium' plan."
   Triggered: When payment is verified

(More can be added later)
```

---

## 🛠️ How to Add More Notifications

### Step 1: Add to notification_type enum
```javascript
// In notification.model.js
notification_type: {
  type: DataTypes.ENUM(
    "user_registered",
    // ... existing types
    "your_new_type"  // Add here
  ),
}
```

### Step 2: Create in controller
```javascript
// In any controller where action happens
const { createNotification } = require("./notification.controller");

// After action completes
await createNotification({
  for_user_id: userId,  // OR
  for_admin: true,      // for admin notification
  notification_type: "your_new_type",
  title: "Notification Title",
  message: "User friendly message",
  metadata: {
    // Any related data (IDs, names, etc)
    user_id: userId,
    action_id: actionId
  }
});

// Optional: Send real-time socket notification
socket.sendNotification(userId, {
  title: "Title",
  message: "Message",
  type: "your_new_type"
});
// OR for admin
socket.sendAdminNotification({...});
```

### Step 3: Add icon & color (optional)
```javascript
// In NotificationsPage.tsx
const getNotificationIcon = (type) => {
  const icons = {
    // ... existing
    "your_new_type": "🎉"  // Add emoji
  };
  return icons[type] || "📢";
};

const getNotificationColor = (type) => {
  const colors = {
    // ... existing
    "your_new_type": "bg-pink-50 border-pink-200"  // Add color
  };
  return colors[type] || "bg-gray-50 border-gray-200";
};
```

---

## 🧪 Testing Checklist

- [ ] Migration runs successfully: `npm run migrate`
- [ ] Backend server starts without errors
- [ ] Frontend connects to socket
- [ ] Create user → Toast appears
- [ ] Create user → Unread count increases
- [ ] Check `/admin/notifications` → Notification visible
- [ ] Click mark as read → Status updates
- [ ] Click delete → Notification removed
- [ ] Filter by read/unread works
- [ ] Pagination works (if >10 notifications)

---

## 🔐 Security Features

✅ Authentication middleware on all routes
✅ Users only see their notifications
✅ Admins only see admin notifications
✅ Can't access other user's notifications
✅ Can't modify notifications of others
✅ Socket validates user type for admin broadcast

---

## 🎨 UI/UX Features

✅ Real-time toast notifications
✅ Colored notifications by type
✅ Icon for each notification type
✅ Unread count badge
✅ Filter system (All/Unread/Read)
✅ Mark single/all as read
✅ Delete functionality
✅ Pagination (10 per page)
✅ Timestamps with local timezone
✅ Responsive design

---

## 📞 Troubleshooting Reference

| Issue | Check |
|-------|-------|
| Notifications not in toast | Socket connected? User registered? |
| Not saving to DB | Migration ran? Model imported? |
| Admin not receiving | Admin logged in? Socket online? |
| 404 on API | Routes registered in index.js? |
| Unread count wrong | Database entries correct? |
| User sees all | Auth middleware applied? |

---

## 🚀 Performance Notes

- ✅ Indexed on: for_user_id, for_admin, is_read
- ✅ Pagination: 10 results per page (configurable)
- ✅ Socket broadcasts only to relevant users
- ✅ Database queries are optimized with includes
- ✅ Unread count cached in state, refreshes every 10s

---

## 📚 Related Files

- **User Controller**: [user.controller.js](../backend/app/controllers/user.controller.js)
- **Subscription Controller**: [subscription.controller.js](../backend/app/controllers/subscription.controller.js)
- **Post Controller**: [post.controller.js](../backend/app/controllers/post.controller.js)
- **Socket Module**: [socket.js](../backend/socket.js)
- **Frontend App**: [App.tsx](../frontend/src/App.tsx)
- **Notification Page**: [NotificationsPage.tsx](../frontend/src/pages/NotificationsPage.tsx)

---

## ✨ Version Info

- Created: January 13, 2026
- Notification Service Version: 1.0
- Socket.io Version: 4.x
- React Query: Used for data fetching
- TypeScript: Frontend uses TypeScript

---

