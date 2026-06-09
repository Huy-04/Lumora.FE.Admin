@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "REPO_ROOT=%%~fI"
set "HARNESS_REPO_ROOT=%REPO_ROOT%"

if not defined HARNESS_DB set "HARNESS_DB=%REPO_ROOT%\harness.db"
if not defined HARNESS_RUST_CLI set "HARNESS_RUST_CLI=%REPO_ROOT%\scripts\bin\harness-cli.exe"

if not exist "%HARNESS_RUST_CLI%" (
  echo Error: Harness CLI not found at "%HARNESS_RUST_CLI%". 1>&2
  exit /b 1
)

"%HARNESS_RUST_CLI%" %*
exit /b %ERRORLEVEL%
