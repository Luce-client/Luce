@echo off
setlocal
title DataVault Builder (Python 3.15 Optimized)

REM IMPORTANT: This script requires "Microsoft C++ Build Tools" to be installed 
REM because Python 3.15 does not have pre-built binaries for libraries yet.

echo [1/3] Searching for Python 3.15 Environment...
py -3.15 --version >nul 2>&1
if %errorlevel% EQU 0 (
    set PYTHON_CMD=py -3.15
) else (
    echo [!] ERROR: Python 3.15 was not found. Please install it first.
    pause
    exit /b
)

echo Using: %PYTHON_CMD%
echo.

REM Step 2: Install Libraries (This will trigger C++ compilation)
echo [2/3] Installing libraries (cryptography, pyinstaller)...
echo This may take a while as it compiles from source...
%PYTHON_CMD% -m pip install cryptography pyinstaller

echo.
REM Step 3: Build
echo [3/3] Building standalone executable (DataVault.exe)...
%PYTHON_CMD% -m PyInstaller --noconfirm --onefile --console --name "DataVault" --clean "file_secure.py"

if %errorlevel% EQU 0 (
    echo.
    echo [+] SUCCESS! Check the 'dist' folder for 'DataVault.exe'
) else (
    echo.
    echo [!] Build Failed. Error Code: %errorlevel%
    echo Did you install "Microsoft C++ Build Tools" as instructed?
)

pause
