# Facebook Signup - Debug Checklist

## Quick Diagnostics

### Step 1: Frontend Auth Button Click
- [ ] Open browser DevTools (F12)
- [ ] Go to Console tab
- [ ] Look for: `Redirecting to Facebook OAuth: http://...`
- [ ] Verify URL contains `action=signup`

### Step 2: Backend Receives /auth/facebook Request
- [ ] Check backend console for: `[Facebook OAuth] Redirecting to Facebook login`
- [ ] Should see this with APP_ID configured message

### Step 3: Facebook Redirects to Callback
- [ ] Check backend console for: `[Facebook OAuth Callback] Starting...`
- [ ] Verify: `Code: ✓` (check mark means code was received)
- [ ] Verify: `Parsed state:` shows both `redirect_dashboard` and `action: "signup"`

### Step 4: User Created & Token Generated
- [ ] Check backend console for: `[Facebook OAuth] New user created: [USER_ID]`
- [ ] Verify: `[Facebook OAuth] Social token generated`
- [ ] Verify: `[Facebook OAuth] Final redirect URL: ...complete-social-signup?...`

### Step 5: Frontend Receives CompleteSocialSignup Params
- [ ] Check frontend console for: `[CompleteSocialSignup] URL Params received:`
- [ ] Verify both lines:
  - `social_token: [TOKEN]` (not empty)
  - `email: [EMAIL]` (not empty)

### Step 6: User Submits Password
- [ ] Check frontend console for: `[CompleteSocialSignup] handleCompleteSignup called`
- [ ] Verify: `[CompleteSocialSignup] Posting to /auth/complete-social-signup`

### Step 7: Backend Verifies Token & Updates User
- [ ] Check backend console for: `[completeSocialSignupV2] Request received`
- [ ] Verify: `[completeSocialSignupV2] Token verified`
- [ ] Verify: `[completeSocialSignupV2] User found:`
- [ ] Verify: `[completeSocialSignupV2] User updated`
- [ ] Verify: `[completeSocialSignupV2] JWT token generated, responding with success`

### Step 8: Frontend Receives Success & Redirects
- [ ] Check frontend console for: `[CompleteSocialSignup] API Response:` with `status: true`
- [ ] Verify: `[CompleteSocialSignup] Signup successful!`
- [ ] Verify: `[CompleteSocialSignup] Redirecting to dashboard`

---

## Common Issues & Solutions

### Issue: State showing as empty `{}`
**Cause**: State was not properly URL encoded or decoded
**Solution**: Check console for `[Facebook OAuth Callback] Raw State:` 
- If it's showing as empty, check network tab - state might not be coming from Facebook
- Verify Auth page is sending `action=signup` in the URL

### Issue: Redirect URL showing as `http://localhost:3000/auth?social_error=...`
**Cause**: One of the preceding steps failed
**Solution**: Work backwards through checklist - find where logs stop appearing

### Issue: "User not found" error at step 7
**Cause**: User ID in social token doesn't match database
**Solution**: 
- Check `[Facebook OAuth] New user created: [ID]` matches user ID in error
- Verify database transaction completed successfully

### Issue: "Email mismatch" error at step 7
**Cause**: Email from CompleteSocialSignup page doesn't match what was stored
**Solution**: 
- Check frontend console - verify email parameter is correct
- Check backend logs - compare DB email with request email

### Issue: Token verification fails at step 7
**Cause**: JWT token is invalid or expired (generated > 15 minutes ago)
**Solution**: 
- Restart the flow from beginning
- Check that JWT_SECRET is same on backend
- Look for `[completeSocialSignupV2] Token verification failed:`

---

## Files Modified

### Backend
- `/backend/SocialLogin/facebook.js` - Added comprehensive logging
- `/backend/app/controllers/auth.controller.js` - Added logging to completeSocialSignupV2

### Frontend
- `/frontend/src/pages/CompleteSocialSignup.tsx` - Added logging and fixed setAuthData call

---

## What Each Log Statement Means

### ✓ Logs to Look For (Success Indicators)
```
[Facebook OAuth Callback] Starting...              → Backend received callback
Code: ✓                                             → Facebook sent auth code
[Facebook OAuth] Parsing action: signup            → State parsed correctly
[Facebook OAuth] New user created: [ID]            → User saved to DB
[Facebook OAuth] Social token generated            → JWT created
[Facebook OAuth] Final redirect URL: ...           → Ready to redirect to frontend
[CompleteSocialSignup] URL Params received:        → Frontend got params
social_token: [VALUE]                              → social_token present
email: [VALUE]                                      → email present
[completeSocialSignupV2] Token verified            → JWT is valid
[completeSocialSignupV2] User found:               → User exists in DB
[completeSocialSignupV2] User updated              → Password saved, user activated
[completeSocialSignupV2] JWT token generated       → Final auth token created
Redirecting to dashboard                           → Success!
```

### ✗ Logs That Indicate Problems
```
App ID not configured                               → Facebook app not set up
No code received                                    → Facebook auth failed
Error parsing state                                 → URL encoding issue
Email already verified                              → User exists with same email
Invalid action                                      → action parameter wrong
User not found                                      → User ID doesn't exist
Email mismatch                                      → Email doesn't match DB
Token verification failed                           → JWT invalid/expired
```

---

## Running the Full Flow

1. **Terminal 1 - Backend**:
   ```bash
   cd backend
   npm start
   # Watch for [Facebook OAuth] logs
   ```

2. **Terminal 2 - Frontend**:
   ```bash
   cd frontend
   npm run dev
   # Open browser, go to localhost:5173/auth
   ```

3. **Browser**:
   - Open DevTools (F12)
   - Console tab active
   - Click "Sign up with Facebook"
   - Monitor console logs
   - Enter password when redirected
   - Click Complete Signup
   - Check final redirect

4. **Check Logs**:
   - Backend terminal: Look for all `[Facebook OAuth]` and `[completeSocialSignupV2]` logs
   - Frontend console: Look for all `[CompleteSocialSignup]` logs

If all logs appear in order without errors, signup succeeds!
