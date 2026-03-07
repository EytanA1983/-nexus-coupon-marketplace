# הוראות לעדכון Seed - הוספת 6 מוצרים

## מה עודכן

1. **הוספו 2 מוצרים חדשים ל-seed**:
   - Netflix Gift Card $75
   - Uber Eats $30 Credit

2. **שיפורים בתצוגה**:
   - מוצרים שנקנו מסומנים ב-"SOLD" אדום
   - שורה עם רקע אדום בהיר למוצרים שנקנו
   - סטטיסטיקות ב-Dashboard
   - היסטוריית רכישות ב-Dashboard

## הרצת Seed מחדש

כדי להוסיף את המוצרים החדשים, הרץ:

```bash
cd backend
npm run prisma:seed
```

**או אם אתה רוצה לאפס הכל ולהתחיל מחדש:**

```bash
cd backend
npx prisma migrate reset --force
npm run prisma:seed
```

## מה תראה אחרי ה-Seed

1. **6 מוצרים** במקום 4:
   - Amazon $100 Coupon
   - Spotify Premium Coupon
   - Steam Wallet $50
   - Cinema QR Pass
   - Netflix Gift Card $75 (חדש)
   - Uber Eats $30 Credit (חדש)

2. **ב-Dashboard**:
   - סטטיסטיקות: Total, Available, Sold, Revenue
   - היסטוריית רכישות אחרונות

3. **ברשימת הקופונים**:
   - מוצרים שנקנו מסומנים ב-"SOLD" אדום
   - שורה עם רקע אדום בהיר

## הערות

- ה-seed לא ימחק מוצרים קיימים (upsert logic)
- אם תריץ `migrate reset`, כל הנתונים יימחקו
- רכישות קיימות יישמרו אם לא תריץ reset
