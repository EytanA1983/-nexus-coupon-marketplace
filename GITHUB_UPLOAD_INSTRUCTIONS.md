# הוראות העלאה ל-GitHub

## שלב 1: יצירת Repository ב-GitHub

1. היכנס ל-GitHub: https://github.com/EytanA1983
2. לחץ על הכפתור הירוק **"New"** או **"+"** בפינה הימנית העליונה
3. בחר **"New repository"**
4. מלא את הפרטים:
   - **Repository name**: `nexus-coupon-marketplace`
   - **Description**: `Production-ready full-stack digital coupon marketplace with strict pricing rules, secure reseller API, admin CRUD operations, and transaction-safe purchase flows`
   - **Visibility**: בחר **Public** או **Private** (לפי העדפתך)
   - **אל תסמן** "Initialize this repository with a README" (כי כבר יש לנו README)
5. לחץ על **"Create repository"**

## שלב 2: חיבור ה-Repository המקומי ל-GitHub

לאחר יצירת ה-repository ב-GitHub, הרץ את הפקודות הבאות:

```bash
cd "C:\Users\maore\git\Nexus Exercies\nexus-coupon-marketplace"
git remote add origin https://github.com/EytanA1983/nexus-coupon-marketplace.git
git branch -M main
git push -u origin main
```

## שלב 3: אימות (אם נדרש)

אם GitHub דורש אימות, תוכל:
- להשתמש ב-GitHub Personal Access Token במקום סיסמה
- או להשתמש ב-GitHub CLI: `gh auth login`

## קישור סופי

לאחר ההעלאה, הקישור לפרויקט יהיה:
**https://github.com/EytanA1983/nexus-coupon-marketplace**

---

## הערות

- כל הקבצים כבר ב-commit ראשוני
- ה-.gitignore מוגדר נכון (node_modules, dist, .env מוחרגים)
- ה-README.md כבר קיים ומפורט
