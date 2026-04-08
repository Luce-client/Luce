@echo off
color 0B
echo =======================================================
echo          [LUCE CLIENT] BUILDER v1.0
echo =======================================================
echo.

cd luce-dashboard
if errorlevel 1 (
    echo [ERROR] luce-dashboard folder not found!
    pause
    exit /b 1
)

echo [1/4] Cleaning previous build...
if exist dist rmdir /s /q dist
if exist out rmdir /s /q out

echo [2/4] Installing dependencies...
call npm install
if errorlevel 1 (
    echo [ERROR] npm install failed!
    pause
    exit /b 1
)

call npm install electron-updater --save
if errorlevel 1 (
    echo [WARNING] electron-updater install had issues, continuing...
)

echo [3/4] Building TypeScript + React...
call npm run build
if errorlevel 1 (
    echo [ERROR] Build failed! Check errors above.
    pause
    exit /b 1
)

echo [4/4] Packaging into Setup.exe (NSIS Installer)...
call npx electron-builder --win
if errorlevel 1 (
    echo [ERROR] Packaging failed! Check errors above.
    pause
    exit /b 1
)

echo.
echo =======================================================
echo    BUILD SUCCESS!
echo    Installer: luce-dashboard\dist\Luce Client Setup 1.0.0.exe
echo =======================================================
echo.
explorer dist
pause
