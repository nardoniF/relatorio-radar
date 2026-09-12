@echo off
title Assistente Juridico - Windows
cd /d "%~dp0"

echo ========================================
echo   ASSISTENTE JURIDICO
echo ========================================
echo.
echo Pasta atual: %CD%
echo.

if not exist "app.py" (
  echo [ERRO] O arquivo app.py nao foi encontrado.
  echo Certifique-se de extrair todos os arquivos do ZIP na mesma pasta.
  goto :fim_erro
)

set "PYLAUNCH="
where py >nul 2>nul
if %errorlevel%==0 set "PYLAUNCH=py -3"
if not defined PYLAUNCH (
  where python >nul 2>nul
  if %errorlevel%==0 set "PYLAUNCH=python"
)

if not defined PYLAUNCH (
  echo [ERRO] Python nao foi encontrado no Windows.
  echo Instale o Python marcando a caixa "Add python.exe to PATH".
  goto :fim_erro
)

echo Usando: %PYLAUNCH%
%PYLAUNCH% --version
if errorlevel 1 goto :fim_erro
echo.

if not exist ".venv\Scripts\python.exe" (
  echo Criando ambiente virtual .venv...
  if exist ".venv" rd /s /q ".venv" 2>nul
  %PYLAUNCH% -m venv .venv
  if errorlevel 1 (
    echo [ERRO] Falha ao criar a pasta .venv.
    goto :fim_erro
  )
)

call "%~dp0.venv\Scripts\activate.bat"

echo Instalando / Verificando dependencias...
python -m pip install -q --upgrade pip
python -m pip install -q -r requirements.txt
if errorlevel 1 (
  echo [ERRO] Falha ao instalar dependencias.
  goto :fim_erro
)

echo.
echo ========================================
echo   Servidor ativo: http://127.0.0.1:8765
echo ========================================
echo.

start "" "http://127.0.0.1:8765"
python app.py
set "ERR=%ERRORLEVEL%"

if not "%ERR%"=="0" (
  echo.
  echo [ERRO] O servidor encerrou com codigo %ERR%.
  goto :fim_erro
)

goto :fim

:fim_erro
echo.
echo ---------- ATENCAO ----------
echo Ocorreu uma falha na execucao.
echo.
pause
exit /b 1

:fim
pause
exit /b 0