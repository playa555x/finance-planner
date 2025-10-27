@echo off
echo ========================================
echo GitHub Push Script
echo ========================================
echo.

cd "C:\Users\win11\Downloads\workspace-b02bb954-88db-46c9-8be9-62909d5d2356"

echo Step 1: Creating GitHub repository...
gh repo create finance-planner --public --source=. --remote=origin --description "Personal Finance Planning Application"

echo.
echo Step 2: Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo ========================================
echo Done! Repository pushed to GitHub
echo ========================================
pause
