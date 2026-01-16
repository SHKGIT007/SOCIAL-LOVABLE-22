# Facebook Signup Debugging - Complete Flow Trace

## Problem
Facebook signup process was not completing successfully. The issue needed to be traced from start to finish.

## Solution Implemented
Added comprehensive logging throughout the entire Facebook signup flow to track exactly where it fails.

## Flow Diagram
```
1. Frontend: User clicks "Sign up with Facebook" on Auth page
   ↓
2. Frontend redirects to `/auth/facebook?redirect_dashboard=...&action=signup`
   ↓
3. Backend: Extracts action and redirect_dashboard from query params
   Backend: Encodes as state and redirects to Facebook login
   ↓
4. User logs in with Facebook
   ↓
5. Facebook redirects to `/auth/facebook/callback?code=...&state=...`
   ↓
6. Backend: Decodes state to extract action and redirect_dashboard
   Backend: Exchanges code for access token
   Backend: Gets user profile from Facebook
   ↓
7. Backend: Creates temporary unverified user
   Backend: Generates social token (JWT with social_signup flag)
   Backend: Redirects to `/complete-social-signup?social_token=...&email=...`
   ↓
8. Frontend: CompleteSocialSignup page receives social_token and email
   ↓
9. User enters password and clicks "Complete Signup"
   ↓
10. Frontend POSTs to `/auth/complete-social-signup` with token, email, password
    ↓
11. Backend: Verifies social token (JWT)
    Backend: Validates email matches
    Backend: Hashes password and activates user
    ↓
12. Backend: Returns JWT token and user data
    ↓
13. Frontend: Saves auth data to localStorage
    Frontend: Redirects to /dashboard
```

## Logging Added

### Backend Facebook OAuth Initiation (`/auth/facebook`)
- Logs app configuration status
- Logs redirect URI construction
- Logs state object (redirect_dashboard, action)
- Logs Facebook OAuth URL being used

### Backend Facebook Callback (`/auth/facebook/callback`)
#### Initial Parsing
```javascript
console.log("[Facebook OAuth Callback] Raw query params:", req.query);
console.log("[Facebook OAuth Callback] Code:", code ? "✓" : "✗");
console.log("[Facebook OAuth Callback] Error:", error);
console.log("[Facebook OAuth Callback] Raw State:", rawState);
console.log("[Facebook OAuth Callback] Decoded state string:", decodedState);
console.log("[Facebook OAuth Callback] Parsed state:", state);
```

#### User Lookup
```javascript
console.log("[Facebook OAuth] Processing action:", action, "with state:", state);
console.log("[Facebook OAuth] Existing user found:", !!user, user ? `(verified: ${user.is_email_verified})` : "");
```

#### Signup Flow
```javascript
console.log("[Facebook OAuth] Handling SIGNUP flow");
console.log("[Facebook OAuth] New user created:", user.id, "with email:", user.email);
console.log("[Facebook OAuth] Social token generated");
console.log("[Facebook OAuth] Frontend base:", frontendBase);
console.log("[Facebook OAuth] Final redirect URL:", redirectUrl);
```

#### Signin Flow
```javascript
console.log("[Facebook OAuth] Handling SIGNIN flow");
console.log("[Facebook OAuth] Redirecting after signin");
```

#### Error Handling
```javascript
console.log("[Facebook OAuth] CALLBACK ERROR:", err.message);
console.error("[Facebook OAuth] Error Stack:", err.stack);
```

### Frontend CompleteSocialSignup Component

#### URL Parameter Reception
```javascript
console.log("[CompleteSocialSignup] URL Params received:");
console.log("  - social_token:", token);
console.log("  - email:", emailParam);
```

#### Form Submission
```javascript
console.log("[CompleteSocialSignup] handleCompleteSignup called");
console.log("[CompleteSocialSignup] State:", { email, socialToken, passwordLength });
console.log("[CompleteSocialSignup] Posting to /auth/complete-social-signup");
console.log("[CompleteSocialSignup] API Response:", response);
```

#### Success/Error Handling
```javascript
console.log("[CompleteSocialSignup] Signup successful!");
console.log("[CompleteSocialSignup] Redirecting to dashboard");
console.error("[CompleteSocialSignup] Exception:", error);
```

### Backend Complete Social Signup Endpoint (`/auth/complete-social-signup`)

#### Request Validation
```javascript
console.log("[completeSocialSignupV2] Request received");
console.log("[completeSocialSignupV2] Body:", { token, email, password });
```

#### Token Verification
```javascript
console.log("[completeSocialSignupV2] Verifying social token...");
console.log("[completeSocialSignupV2] Token verified, payload:", { userId, social_signup });
```

#### User Lookup & Update
```javascript
console.log("[completeSocialSignupV2] Looking up user with ID:", payload.userId);
console.log("[completeSocialSignupV2] User found:", { id, email, is_email_verified });
console.log("[completeSocialSignupV2] Hashing password and updating user...");
console.log("[completeSocialSignupV2] User updated, fetching updated data...");
console.log("[completeSocialSignupV2] Updated user data retrieved:", { id, email, active_status });
console.log("[completeSocialSignupV2] JWT token generated, responding with success");
```

## How to Use These Logs

1. **Start Facebook Signup**
   - Open browser console (F12)
   - Check backend logs in terminal
   - Look for `[Facebook OAuth]` logs

2. **Monitor State Parsing**
   - Check `[Facebook OAuth Callback] Parsed state:` 
   - Ensure it has both `redirect_dashboard` and `action`
   - If empty/broken, there's a URL encoding issue

3. **Monitor User Creation**
   - Check `[Facebook OAuth] New user created:`
   - Verify user ID is generated
   - Verify email is correct

4. **Monitor CompleteSocialSignup Reception**
   - Check `[CompleteSocialSignup] URL Params received:`
   - Both `social_token` and `email` should be present
   - If missing, there's a redirect URL issue

5. **Monitor Password Completion**
   - Check `[completeSocialSignupV2] Request received:`
   - Verify token, email, and password are present
   - Check `[completeSocialSignupV2] Token verified:`
   - Ensure token payload has `social_signup: true` and valid `userId`

6. **Monitor Final Success**
   - Check `[completeSocialSignupV2] JWT token generated:`
   - Check frontend `[CompleteSocialSignup] Redirecting to dashboard:`

## Key Fixes Made

### 1. **State Parsing Robustness**
   - Added URL decoding error handling
   - Added fallback values for undefined state
   - Logs at each parsing stage

### 2. **Frontend URL Redirect Fallback**
   - Backend now has fallback: `state.redirect_dashboard || process.env.FRONTEND_URL || http://localhost:3000`
   - Prevents crashes on null URLs

### 3. **Auth Data Setting**
   - Fixed CompleteSocialSignup to properly set auth data as object
   - Before: `setAuthData(token, user)` (wrong)
   - After: `setAuthData({ token, user })` (correct)

### 4. **Comprehensive Error Logging**
   - Backend catches and logs all errors with full stack traces
   - Frontend catches and logs API response errors
   - All errors include relevant context (user ID, email, etc.)

## Next Steps for Testing

Run the complete flow and monitor:

```bash
# In backend terminal, look for logs like:
[Facebook OAuth Callback] Starting...
[Facebook OAuth Callback] Code: ✓
[Facebook OAuth] Processing action: signup
[Facebook OAuth] New user created: 123
[Facebook OAuth] Final redirect URL: http://localhost:3000/complete-social-signup?social_token=...&email=...
[completeSocialSignupV2] Request received
[completeSocialSignupV2] Token verified
[completeSocialSignupV2] User updated
[completeSocialSignupV2] JWT token generated, responding with success

# In frontend browser console, look for logs like:
[CompleteSocialSignup] URL Params received:
  - social_token: eyJhbGc...
  - email: user@example.com
[CompleteSocialSignup] handleCompleteSignup called
[CompleteSocialSignup] Posting to /auth/complete-social-signup
[CompleteSocialSignup] API Response: {status: true, ...}
[CompleteSocialSignup] Signup successful!
[CompleteSocialSignup] Redirecting to dashboard
```

If any log is missing, that's where the issue is!
