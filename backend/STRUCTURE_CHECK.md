# בדיקת התאמה למבנה המומלץ

## מבנה מבוקש:
```
backend/
  package.json
  tsconfig.json
  .env.example
  src/
    app.ts
    server.ts
    lib/
      prisma.ts
    routes/
      index.ts
    controllers/
      health.controller.ts
    errors/
      AppError.ts
      BadRequestError.ts
      ConflictError.ts
      NotFoundError.ts
      UnauthorizedError.ts
    middleware/
      errorHandler.ts
      notFoundHandler.ts
```

## סטטוס נוכחי:

### ✅ קיים ותואם:
- ✅ `backend/package.json` - קיים
- ✅ `backend/tsconfig.json` - קיים
- ✅ `backend/src/app.ts` - קיים
- ✅ `backend/src/server.ts` - קיים
- ✅ `backend/src/lib/prisma.ts` - קיים
- ✅ `backend/src/routes/index.ts` - קיים
- ✅ `backend/src/errors/BadRequestError.ts` - קיים
- ✅ `backend/src/errors/ConflictError.ts` - קיים
- ✅ `backend/src/errors/NotFoundError.ts` - קיים
- ✅ `backend/src/errors/UnauthorizedError.ts` - קיים
- ✅ `backend/src/middleware/errorHandler.ts` - קיים
- ✅ `backend/src/middleware/notFoundHandler.ts` - קיים

### ⚠️ צריך תיקון:
- ⚠️ `backend/src/errors/appError.ts` - קיים עם `a` קטן, צריך `AppError.ts` עם `A` גדול
- ⚠️ `backend/src/errors/AppError.ts` - לא קיים (או קיים אבל לא ברשימה)

### ❌ חסר:
- ❌ `backend/.env.example` - חסר
- ❌ `backend/src/controllers/health.controller.ts` - חסר (אבל health endpoint יש ב-app.ts)

## הערות:
1. Health endpoint נמצא ב-`app.ts` (שורה 30), לא ב-controller נפרד
2. יש `appError.ts` עם `a` קטן, צריך לשנות ל-`AppError.ts` עם `A` גדול
3. חסר `.env.example` - צריך ליצור

## פעולות נדרשות:
1. לשנות `errors/appError.ts` ל-`errors/AppError.ts`
2. לעדכן את כל ה-imports מ-`appError` ל-`AppError`
3. ליצור `.env.example`
4. (אופציונלי) ליצור `controllers/health.controller.ts` ולהעביר את ה-health endpoint לשם
