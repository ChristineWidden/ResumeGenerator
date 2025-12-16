@echo off
echo opening resume generation folder
cd /d "D:\Programming\Other\Resume Generation"

REM Activate virtual environment
echo Activating virtual environment
call .\venv\Scripts\activate

REM Start the Node server
echo Starting the Node server
start "" node app.js

REM Wait a bit for the server to spin up
echo Waiting for the server to start
timeout /t 3 /nobreak >nul

REM Open the browser to the local server
echo Opening the browser to the server
start "" http://localhost:3000

REM Open the folder where generated files are saved
echo Opening the working folder
start "" explorer "D:\Programming\Other\Resume Generation"

echo Opening the resume documents folder
start "" explorer "D:\Documents\Official\Resume"

echo Done!
timeout /t 10 /nobreak >nul