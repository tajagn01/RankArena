# 🚀 Quick Start - Session Management

## ⚡ 3-Step Setup

### 1️⃣ Add JWT Secret to .env
Open `backend/.env` and add this line:
```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

💡 **Tip**: Generate a strong secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2️⃣ Restart Backend
```bash
cd backend
npm start
```

### 3️⃣ Test It!
1. Login to your app
2. Close browser completely
3. Reopen and go to dashboard
4. ✅ You should still be logged in!

---

## 🎯 What's Fixed?

### Before
- ❌ Had to login again after closing browser
- ❌ Data not refreshing automatically
- ❌ Session not persisting

### After
- ✅ Stay logged in for 7 days
- ✅ Data automatically refreshes from server
- ✅ Secure HTTP-only cookies
- ✅ Works offline with localStorage fallback

---

## 🔍 Quick Test

Open browser DevTools and check:

### Console (should see):
```
✅ Session verified, user loaded: {name: "...", ...}
```

### Application → Cookies (should see):
```
Name: token
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
HttpOnly: ✓
Secure: ✓ (in production)
```

---

## 📚 More Info

- **Full Documentation**: See `SESSION_MANAGEMENT.md`
- **Setup Guide**: See `SETUP_SESSION.md`
- **All Changes**: See `CHANGES_SUMMARY.md`

---

## ⚠️ Troubleshooting

### Issue: Still getting logged out
- Make sure you added `JWT_SECRET` to `.env`
- Restart the backend server
- Clear browser cookies and login again

### Issue: CORS errors
- Check `FRONTEND_URL` in backend `.env`
- Make sure it matches your frontend URL

### Issue: Cookies not being set
- Check browser console for errors
- Verify backend is running
- Try clearing all cookies and cache

---

## 🎉 That's It!

Your session management is now working. Users will stay logged in and their data will automatically refresh from the server.
