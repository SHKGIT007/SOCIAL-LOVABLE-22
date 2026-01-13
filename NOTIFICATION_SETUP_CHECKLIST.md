# ✅ Notification System - Setup Checklist

## Backend Setup

### 1. Database Migration
```bash
cd backend
npm run migrate
```
This will create the `notifications` table.

### 2. Start Backend Server
```bash
npm start
# or
npm run dev
```

**Expected Logs:**
- Server running on port 9999
- Socket.io initialized
- Database connected

---

## Frontend Setup

### 1. Start Frontend Dev Server
```bash
cd frontend
npm run dev
```

---

## 🧪 Testing the Notification System

### Test Case 1: User Registration Notification
1. Go to Admin Panel → Users Management
2. Click "Create User"
3. Fill in user details and submit
4. **Expected:**
   - Toast notification appears instantly (top-right)
   - Admin's bell icon shows "1" unread
   - Backend logs show: `✉️ Notification sent to socket ...`
   - Check `/admin/notifications` → New notification visible

### Test Case 2: Plan Purchase Notification
1. Go to User Panel → Plans
2. Select a plan and purchase
3. Complete payment (if using Razorpay)
4. **Expected:**
   - User sees toast: "Congratulations! You purchased plan X"
   - Admin sees toast: "User purchased plan X"
   - Both appear in their notification pages

### Test Case 3: Post Created Notification
1. User creates a new post
2. **Expected:**
   - Admin notification appears
   - Check `/admin/notifications` → "Post Created" notification

### Test Case 4: Mark as Read
1. Go to `/notifications` or `/admin/notifications`
2. Click check icon on unread notification
3. **Expected:**
   - Notification marked as read
   - Blue dot disappears
   - Unread count decreases

### Test Case 5: Delete Notification
1. Click trash icon on any notification
2. **Expected:**
   - Notification removed from list
   - Total count decreases

---

## 🔧 API Endpoints to Test with Postman

### Get All Notifications (with auth token)
```
GET http://localhost:9999/api/notifications
Authorization: Bearer <token>
```

### Get Unread Count
```
GET http://localhost:9999/api/notifications/count/unread
Authorization: Bearer <token>
```

### Mark Notification as Read
```
PUT http://localhost:9999/api/notifications/1/read
Authorization: Bearer <token>
```

### Mark All as Read
```
PUT http://localhost:9999/api/notifications/read/all
Authorization: Bearer <token>
```

### Delete Notification
```
DELETE http://localhost:9999/api/notifications/1
Authorization: Bearer <token>
```

---

## 🐛 Troubleshooting

### Issue: Notifications not appearing in toast
**Solution:**
1. Check frontend console (F12) for errors
2. Verify socket is connected: `socket.connected === true`
3. Check backend logs for socket connection messages
4. Verify user is registered with socket

### Issue: Notifications not saving to database
**Solution:**
1. Check if migration ran: `SELECT * FROM notifications;`
2. Verify Notification model is imported in models/index.js
3. Check backend logs for database errors

### Issue: Admin not receiving notifications
**Solution:**
1. Admin must be logged in on frontend
2. Socket connection must show admin is online
3. Check backend logs: should show admin socket ID

### Issue: Route errors (404)
**Solution:**
1. Verify route is added in `/route/index.js`
2. Check path: should be `/api/notifications`
3. Restart backend server after route changes

---

## 📱 Frontend Routes

| Route | For | Purpose |
|-------|-----|---------|
| `/notifications` | User | View user notifications |
| `/admin/notifications` | Admin | View admin notifications |

---

## ✨ Features Summary

- ✅ Real-time toast notifications via Socket.io
- ✅ Persistent storage in database
- ✅ Read/Unread status tracking
- ✅ Pagination with 10 per page
- ✅ Filter: All / Unread / Read
- ✅ Mark single/all as read
- ✅ Delete notifications
- ✅ User sees only their notifications
- ✅ Admin sees only admin notifications
- ✅ Unread count badge
- ✅ Colored notification types with icons
- ✅ Timestamps with local timezone

---

## 🎨 Notification Types & Colors

| Type | Icon | Color | When |
|------|------|-------|------|
| user_registered | 👤 | Blue | Admin creates user |
| plan_purchase | 💳 | Green | User buys plan |
| post_created | ✏️ | Purple | User creates post |
| post_published | 📤 | Green | Post goes live |
| post_scheduled | 📅 | Yellow | Post scheduled |
| post_pending_review | ⏳ | Orange | AI post review |
| post_draft | 📝 | Gray | User saves draft |
| ai_limit_alert | ⚠️ | Red | AI quota warning |
| schedule_reminder | 🔔 | Blue | Pre-publish reminder |
| draft_reminder | 📌 | Gray | Draft reminder |

---

## 📞 Support Notes

**If notifications still don't work:**
1. Check all 3 components are running:
   - Backend server ✓
   - Frontend dev server ✓
   - Database ✓

2. Verify console logs:
   - Backend: Socket connection messages
   - Frontend: Socket connected message + notification received

3. Check database:
   ```sql
   SELECT COUNT(*) FROM notifications;
   SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5;
   ```

4. Restart both servers and clear browser cache (Ctrl+Shift+Delete)

