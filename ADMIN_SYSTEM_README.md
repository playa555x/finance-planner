# 🔐 ADMIN SYSTEM - DOKUMENTATION

**Stand:** 27. Oktober 2025
**Status:** ✅ **FULLY OPERATIONAL**

---

## 🎯 ADMIN LOGIN CREDENTIALS

**Email:** `emir@admin.com`
**Password:** `Mallman12`
**Role:** `admin`

---

## 🚀 ADMIN DASHBOARD FEATURES

### 1. **User Overview** 👥
- Vollständige Liste aller registrierten User
- Real-time Statistiken
- User Search & Filter
- Pagination Support

### 2. **Statistics Dashboard** 📊
- **Total Users** - Gesamtzahl aller User
- **Active Users** - Aktive User
- **Admin Users** - Anzahl Admins
- **Regular Users** - Standard-User

### 3. **User Details** 🔍
Für jeden User wird angezeigt:
- **Personal Info:**
  - Name, Email, Role
  - Account Status (Active/Inactive)
  - Registration Date
  - Last Login (Zeit + IP)

- **Financial Statistics:**
  - Total Financial Plans
  - Total Expenses
  - Total Daily Budgets
  - Total Fixed Costs
  - Total Amount Spent
  - Current Budget
  - Currency

- **Location Info:**
  - Last Known Location
  - Countries visited/planned

---

## 🌐 ADMIN ENDPOINTS

### 1. **GET /api/admin/users**
Liste aller User mit Statistiken

**Query Parameters:**
```
?page=1          # Page number (default: 1)
?limit=50        # Results per page (default: 50)
?search=email    # Search by email or name
```

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": "clxyz...",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "isActive": true,
      "lastLoginAt": "2025-10-27T...",
      "lastLoginIp": "192.168.1.1",
      "createdAt": "2025-10-20T...",
      "statistics": {
        "totalFinancialPlans": 3,
        "totalExpenses": 150,
        "totalDailyBudgets": 60,
        "totalFixedCosts": 5,
        "totalSpent": 25000.50,
        "lastLocation": "Bangkok, Thailand",
        "currentBudget": 2000,
        "currency": "THB"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 120,
    "totalPages": 3
  },
  "statistics": {
    "totalUsers": 120,
    "activeUsers": 115,
    "adminUsers": 2,
    "regularUsers": 118
  }
}
```

### 2. **GET /api/admin/users/[id]**
Detaillierte User-Informationen

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "clxyz...",
    "email": "user@example.com",
    "name": "John Doe",
    "financialPlans": [...],
    "expenses": [...],
    "dailyBudgets": [...],
    "fixedCosts": [...]
  },
  "analytics": {
    "expenses": {
      "total": 25000.50,
      "count": 150,
      "average": 166.67,
      "byCategory": [
        {"category": "Food", "_sum": {"amount": 8000}},
        {"category": "Housing", "_sum": {"amount": 10000}}
      ]
    },
    "activity": {
      "last30Days": 45,
      "financialPlansCount": 3,
      "dailyBudgetsCount": 60,
      "activeFixedCosts": 5
    },
    "locations": [
      {
        "location": "Bangkok, Thailand",
        "currency": "THB",
        "budget": 50000,
        "createdAt": "2025-10-15T..."
      }
    ]
  }
}
```

### 3. **PATCH /api/admin/users/[id]**
User updaten (Admin only)

**Request Body:**
```json
{
  "isActive": false,  // Activate/Deactivate user
  "role": "admin"     // Change role
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "user": {
    "id": "clxyz...",
    "email": "user@example.com",
    "role": "admin",
    "isActive": false
  }
}
```

---

## 🔒 SECURITY

### Admin Authentication Flow:

```
1. User logs in via NextAuth
   ↓
2. Session is created
   ↓
3. Admin Middleware checks:
   - Is user authenticated?
   - Is user role = "admin"?
   - Is user active?
   ↓
4. If YES → Grant Access
   If NO  → Return 403 Forbidden
```

### Protected Routes:
- `/admin` - Admin Dashboard
- `/api/admin/*` - All Admin API Endpoints

### Middleware Protection:
**File:** `src/lib/adminAuth.ts`

```typescript
export async function requireAdmin() {
  const admin = await isAdmin();

  if (!admin) {
    throw new Error('Unauthorized: Admin access required');
  }

  return true;
}
```

---

## 📱 ADMIN DASHBOARD UI

### Access:
```
http://localhost:3000/admin
```

### Features:

**1. Statistics Overview Cards**
- Total Users (Blue)
- Active Users (Green)
- Admin Users (Purple)
- Regular Users (Orange)

**2. Search & Filter**
- Search by email or name
- Real-time search

**3. User Cards**
Each user card shows:
- Personal Info (Name, Email, Role, Status)
- Registration & Login Info
- Statistics Grid (Plans, Expenses, Budgets, Fixed Costs)
- Financial Summary (Total Spent, Current Budget)
- Location Info
- "View Details" Button

**4. Pagination**
- 50 users per page
- Previous/Next Navigation
- Total count display

---

## 🛠️ SETUP INSTRUCTIONS

### 1. Create Admin User

```bash
# Run the admin creation script
npx tsx create-admin.ts
```

This creates:
- Email: `emir@admin.com`
- Password: `Mallman12`
- Role: `admin`

### 2. Login as Admin

1. Navigate to: `http://localhost:3000/api/auth/signin`
2. Enter credentials:
   - Email: `emir@admin.com`
   - Password: `Mallman12`
3. Click "Sign In"

### 3. Access Admin Dashboard

After login, navigate to:
```
http://localhost:3000/admin
```

---

## 🧪 TESTING

### Test Admin API:

```bash
# 1. Login first to get session cookie
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"emir@admin.com","password":"Mallman12"}' \
  --cookie-jar cookies.txt

# 2. Access admin endpoint with cookie
curl http://localhost:3000/api/admin/users \
  --cookie cookies.txt
```

### Expected Response:
```json
{
  "success": true,
  "users": [...],
  "statistics": {...},
  "pagination": {...}
}
```

---

## 📊 USER STATISTICS EXPLAINED

### Per-User Statistics:

**totalFinancialPlans**
- Anzahl aller Financial Plans des Users

**totalExpenses**
- Gesamtanzahl aller Expense-Einträge

**totalDailyBudgets**
- Anzahl aller Daily Budget-Einträge

**totalFixedCosts**
- Anzahl aller aktiven Fixed Costs

**totalSpent**
- Summe ALLER Expenses (in Local Currency)

**lastLocation**
- Letzter bekannter Standort aus:
  1. Latest Financial Plan Location
  2. Last Login IP (falls verfügbar)
  3. "Unknown" als Fallback

**currentBudget**
- Aktuelles monatliches Budget aus neuestem Financial Plan

**currency**
- Währung aus neuestem Financial Plan

---

## 🎨 UI COMPONENTS USED

- **Card** - Container für User-Daten
- **Badge** - Role & Status Indicator
- **Button** - Actions (Search, Refresh, View Details)
- **Input** - Search Field
- **Icons** (lucide-react):
  - Users, Shield, Activity
  - DollarSign, MapPin, Calendar
  - Search, RefreshCw, Eye

---

## 🔧 CUSTOMIZATION

### Add More Statistics:

**File:** `src/app/api/admin/users/route.ts`

```typescript
// Add new statistic
const customStat = await prisma.customModel.aggregate({
  where: { userId: user.id },
  _sum: { field: true }
});

// Include in response
statistics: {
  ...existingStats,
  customMetric: customStat._sum.field || 0
}
```

### Add New Admin Actions:

**File:** `src/app/api/admin/users/[id]/route.ts`

```typescript
export async function DELETE(request: Request, { params }) {
  await requireAdmin();

  // Delete user logic
  await prisma.user.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
```

---

## ⚠️ IMPORTANT NOTES

### Security Best Practices:

1. **NEVER expose admin credentials** in frontend code
2. **ALWAYS use `requireAdmin()`** in admin endpoints
3. **Log all admin actions** for audit trail
4. **Rate limit admin endpoints** to prevent abuse
5. **Use HTTPS** in production

### Production Checklist:

- [ ] Change admin password from default
- [ ] Enable 2FA for admin accounts
- [ ] Setup audit logging
- [ ] Configure rate limiting
- [ ] Enable CORS properly
- [ ] Setup monitoring/alerts
- [ ] Regular security audits

---

## 📞 ADMIN ACTIONS

### Available Actions:

**1. View User Details**
```
Click "View Details" → Opens detailed analytics
```

**2. Activate/Deactivate User**
```typescript
// Via API
PATCH /api/admin/users/[id]
{ "isActive": false }
```

**3. Change User Role**
```typescript
// Via API
PATCH /api/admin/users/[id]
{ "role": "admin" }
```

**4. Search Users**
```
Type in search bar → Press Enter
```

---

## 🎯 FUTURE ENHANCEMENTS

### Planned Features:

- [ ] User Activity Timeline
- [ ] Export User Data (CSV/Excel)
- [ ] Bulk User Actions
- [ ] Advanced Filtering (by date, location, budget)
- [ ] Real-time User Activity Feed
- [ ] Email User Functionality
- [ ] User Ban/Suspend System
- [ ] Admin Action Audit Log
- [ ] Dashboard Charts & Graphs
- [ ] Mobile Admin App

---

## 📈 METRICS & ANALYTICS

### Key Metrics Tracked:

1. **User Growth**
   - Total registrations
   - Daily/Weekly/Monthly new users

2. **User Engagement**
   - Active users (last 7/30 days)
   - Plans created per user
   - Expenses tracked

3. **Financial Data**
   - Total money managed in platform
   - Average budget per user
   - Most popular currencies

4. **Geographic Data**
   - Most popular locations
   - User distribution by country

---

## 🚨 TROUBLESHOOTING

### Problem: "Unauthorized: Admin access required"

**Solution:**
1. Check if logged in as admin
2. Verify role in database: `SELECT role FROM User WHERE email='emir@admin.com';`
3. Re-run admin creation script if needed

### Problem: Dashboard shows no data

**Solution:**
1. Check browser console for errors
2. Verify API response: `curl http://localhost:3000/api/admin/users`
3. Check database: `SELECT * FROM User;`

### Problem: Can't login as admin

**Solution:**
1. Reset password: Run `npx tsx create-admin.ts` again
2. Check database: `SELECT * FROM User WHERE email='emir@admin.com';`
3. Clear browser cache/cookies

---

**ADMIN SYSTEM IS READY! 🎉**

Access Dashboard: http://localhost:3000/admin
Login: emir@admin.com / Mallman12
