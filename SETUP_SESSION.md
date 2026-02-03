# Quick Setup Guide for Session Management

## Step 1: Install Dependencies
```bash
cd backend
npm install
```

The required packages (`jsonwebtoken` and `cookie-parser`) have already been installed.

## Step 2: Update Environment Variables

Add this line to your `backend/.env` file:
```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**Important**: Use a strong, random secret in production. You can generate one with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 3: Restart Backend Server

Stop your current backend server and restart it:
```bash
cd backend
npm start
```

## Step 4: Test the Implementation

### Test 1: Login and Session Persistence
1. Clear your browser cookies and localStorage
2. Login to the application
3. Open DevTools → Application → Cookies
4. You should see a `token` cookie (HTTP-only)
5. Close the browser completely
6. Reopen and navigate to `/dashboard`
7. ✅ You should still be logged in

### Test 2: Session Verification
1. Login to the application
2. Open DevTools → Console
3. Look for: `✅ Session verified, user loaded:`
4. This confirms the backend session is working

### Test 3: Logout
1. Click the logout button
2. Check DevTools → Application → Cookies
3. The `token` cookie should be cleared
4. Try accessing `/dashboard`
5. ✅ You should be redirected to login

## What Changed?

### Backend
- ✅ Added JWT token generation on login
- ✅ Tokens stored in HTTP-only cookies (7-day expiry)
- ✅ New `/api/auth/me` endpoint to verify sessions
- ✅ New `/api/auth/logout` endpoint to clear sessions
- ✅ Cookie-parser middleware added

### Frontend
- ✅ All API requests now include `credentials: 'include'`
- ✅ Dashboard verifies session on load
- ✅ Falls back to localStorage if session fails (offline support)
- ✅ Logout clears both cookie and localStorage

## Benefits

1. **Persistent Sessions**: Users stay logged in after closing browser
2. **Security**: HTTP-only cookies prevent XSS attacks
3. **Auto-refresh**: User data automatically refreshed from backend
4. **Offline Support**: Falls back to localStorage when offline
5. **Token Expiry**: Sessions automatically expire after 7 days

## Troubleshooting

### "Session invalid" on dashboard
- Make sure backend is running
- Check that JWT_SECRET is set in `.env`
- Clear cookies and login again

### CORS errors
- Verify `FRONTEND_URL` in backend `.env`
- Make sure frontend is running on the correct port
- Check CORS configuration in `backend/src/app.js`

### Cookies not being set
- Check browser console for errors
- Verify `credentials: 'include'` in fetch requests
- In production, ensure HTTPS is enabled

## Production Checklist

- [ ] Set strong `JWT_SECRET` in production environment
- [ ] Set `NODE_ENV=production`
- [ ] Configure `FRONTEND_URL` to match your domain
- [ ] Enable HTTPS (required for secure cookies)
- [ ] Test session persistence in production environment
