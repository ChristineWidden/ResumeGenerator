@echo off
cd /d "D:\Projects\Programming\Other\Resume Generation"

REM Activate virtual environment
call .\venv\Scripts\activate

REM Start the Node server
start "" node app.js

REM Wait a bit for the server to spin up
timeout /t 2 /nobreak >nul

REM Open the browser to the local server
start "" http://localhost:3000

REM Open the folder where generated files are saved
start "" explorer "D:\Projects\Programming\Other\Resume Generation"
start "" explorer "D:\Documents\Official\Resume"
