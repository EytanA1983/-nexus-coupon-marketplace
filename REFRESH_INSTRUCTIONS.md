# הוראות רענון הדפדפן

## השרתים רצים:
- ✅ Backend: http://localhost:3000
- ✅ Frontend: http://localhost:5174

## אם אין שינוי בדפדפן:

### 1. רענון קשיח (Hard Refresh)
- **Windows/Linux**: `Ctrl + Shift + R` או `Ctrl + F5`
- **Mac**: `Cmd + Shift + R`

### 2. נקה Cache
- פתח DevTools (F12)
- לחץ ימין על כפתור הרענון
- בחר "Empty Cache and Hard Reload"

### 3. בדוק את הקונסול
- פתח DevTools (F12)
- לך ל-Tab "Console"
- בדוק אם יש שגיאות

### 4. בדוק את ה-Network
- פתח DevTools (F12)
- לך ל-Tab "Network"
- רענן את הדף
- בדוק אם הקבצים נטענים

### 5. אם עדיין לא עובד
- עצור את השרתים (Ctrl+C)
- הרץ מחדש:
  ```bash
  # Backend
  cd backend
  npm run dev

  # Frontend (בטרמינל אחר)
  cd frontend
  npm run dev
  ```

## מה צריך להופיע:

1. **דף Login**: `/admin/login` - צריך להציג את `AdminLoginPage` עם `AppHeader`
2. **כפתור Logout**: בכל דפי האדמין - צריך להיות גלוי ב-`AppHeader`
3. **Protected Routes**: אם אין token, צריך להפנות אוטומטית ל-`/admin/login`

## בדיקות מהירות:

1. לך ל: http://localhost:5174/admin/login
2. התחבר עם: `admin` / `admin123`
3. בדוק שהכפתור Logout מופיע
4. לחץ Logout ובדוק שזה מחזיר ל-`/admin/login`
