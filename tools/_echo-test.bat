@echo off
for /f "usebackq tokens=1,* delims==" %%a in ("_t.env") do echo %%a=%%b > _out.txt
