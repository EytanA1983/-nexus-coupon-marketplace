# פתרון בעיות העלאה ל-GitHub

## בעיה: "Repository not found"

אם אתה מקבל שגיאה `remote: Repository not found`, נסה את הפתרונות הבאים:

### פתרון 1: וודא שה-repository נוצר

1. לך ל: https://github.com/EytanA1983?tab=repositories
2. בדוק אם יש repository בשם `nexus-coupon-marketplace`
3. אם לא - צור אותו: https://github.com/new

### פתרון 2: בדוק את שם ה-Repository

אם יצרת את ה-repository בשם אחר, עדכן את ה-remote:

```powershell
cd "C:\Users\maore\git\Nexus Exercies\nexus-coupon-marketplace"
git remote set-url origin https://github.com/EytanA1983/[שם-ה-repository-שלך].git
git push -u origin main
```

### פתרון 3: בעיית הרשאות / אימות

אם יש בעיית אימות, נסה:

1. **Personal Access Token**:
   - לך ל: https://github.com/settings/tokens
   - Generate new token (classic)
   - בחר scope: `repo` (כל ה-repositories)
   - Copy את ה-token

2. **השתמש ב-token במקום סיסמה**:
   ```powershell
   git push -u origin main
   # Username: EytanA1983
   # Password: [הדבק את ה-token כאן]
   ```

### פתרון 4: יצירת Repository דרך GitHub CLI (אם מותקן)

```powershell
gh repo create nexus-coupon-marketplace --public --source=. --remote=origin --push
```

### פתרון 5: יצירה ידנית עם SSH (אם מוגדר)

אם יש לך SSH key מוגדר:

```powershell
git remote set-url origin git@github.com:EytanA1983/nexus-coupon-marketplace.git
git push -u origin main
```

---

## בדיקה מהירה

הרץ את הפקודה הזו כדי לבדוק את ה-remote:

```powershell
cd "C:\Users\maore\git\Nexus Exercies\nexus-coupon-marketplace"
git remote -v
```

ה-remote צריך להיות:
```
origin  https://github.com/EytanA1983/nexus-coupon-marketplace.git (fetch)
origin  https://github.com/EytanA1983/nexus-coupon-marketplace.git (push)
```

---

## אם כל זה לא עובד

1. **צור repository חדש** ב-GitHub עם שם אחר (למשל: `nexus-marketplace`)
2. **עדכן את ה-remote**:
   ```powershell
   git remote set-url origin https://github.com/EytanA1983/nexus-marketplace.git
   git push -u origin main
   ```
