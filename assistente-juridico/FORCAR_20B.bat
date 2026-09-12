@echo off
chcp 65001 >nul
echo Forçando modelo Groq 20B na config...
python -c "import json, pathlib; p=pathlib.Path.home()/ 'Documents' / 'Assistente Juridico' / 'config.json'; p.parent.mkdir(parents=True, exist_ok=True); d={}; 
import os
if p.exists():
 d=json.loads(p.read_text(encoding='utf-8'))
d['provider']='groq'; d['provider_label']='Groq 20B'; d['model']='openai/gpt-oss-20b'; d['base_url']='https://api.groq.com/openai/v1'; d['enviar_tudo']=False
p.write_text(json.dumps(d,indent=2,ensure_ascii=False),encoding='utf-8'); print('OK:', p); print(d['model'])"
echo.
echo Feche o Assistente e abra Iniciar.bat de novo.
pause
