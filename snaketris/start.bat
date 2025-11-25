@echo off
echo Starting Snaketris Local Server...
echo.
echo This game uses ES Modules which require a local web server to run correctly in Chrome.
echo We will attempt to start a server using Python or Node.js.
echo.

python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Python found. Starting server on port 8000...
    echo Open http://localhost:8000 in your browser.
    python -m http.server 8000
    goto :eof
)

node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Node.js found. Using npx http-server...
    echo Open http://localhost:8080 in your browser.
    call npx http-server .
    goto :eof
)

echo.
echo Error: Neither Python nor Node.js was found.
echo Please install Python or Node.js to run this game, or use a VS Code extension like "Live Server".
pause
