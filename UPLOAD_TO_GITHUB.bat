@echo off
echo ========================================
echo Nexus Coupon Marketplace - GitHub Upload
echo ========================================
echo.

cd /d "%~dp0"

echo Step 1: Checking if repository exists on GitHub...
echo.
echo Please create a new repository on GitHub:
echo   1. Go to: https://github.com/EytanA1983
echo   2. Click "New" or "+" button
echo   3. Repository name: nexus-coupon-marketplace
echo   4. Description: Production-ready full-stack digital coupon marketplace
echo   5. Choose Public or Private
echo   6. DO NOT initialize with README
echo   7. Click "Create repository"
echo.
pause

echo.
echo Step 2: Adding remote origin...
git remote add origin https://github.com/EytanA1983/nexus-coupon-marketplace.git
if errorlevel 1 (
    echo Remote already exists or error occurred. Trying to set URL...
    git remote set-url origin https://github.com/EytanA1983/nexus-coupon-marketplace.git
)

echo.
echo Step 3: Setting branch to main...
git branch -M main

echo.
echo Step 4: Pushing to GitHub...
echo You may be prompted for GitHub credentials.
echo If you use 2FA, use a Personal Access Token as password.
echo.
git push -u origin main

if errorlevel 1 (
    echo.
    echo ========================================
    echo ERROR: Push failed!
    echo ========================================
    echo.
    echo Possible solutions:
    echo 1. Make sure you created the repository on GitHub first
    echo 2. Check your GitHub credentials
    echo 3. If using 2FA, use a Personal Access Token
    echo 4. Try: git push -u origin main --force
    echo.
) else (
    echo.
    echo ========================================
    echo SUCCESS! Project uploaded to GitHub
    echo ========================================
    echo.
    echo Your project is now available at:
    echo https://github.com/EytanA1983/nexus-coupon-marketplace
    echo.
)

pause
