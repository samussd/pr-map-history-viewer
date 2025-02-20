# Map History Viewer
Ver e filtrar o histórico de mapas de um servidor de Project Reality.

## Requisitos
Node.js  
Utiliza as bibliotecas GameDig e SQLite  
Para instalar todos os requisitos  
```npm install```

## Backend
src/services/gameMonitor.js - Vê o mapa atual rodando no servidor, e em caso de mudança de mapa, salva a data do último mapa na base de dados.  
A base de dados é maplogdb.sqlite (colunas | nome_mapa, gamemode, layout, data_mais_recente)  
Atualmente conectado ao servidor do Reality Brasil.  
Para rodar, utilize  
```cmd
cd backend
node app.js
```  

## Frontend
script.js - Usa a API criada no backend para ler todas as datas dos mapas da base de dados e exibe na página.  
Para rodar, utilize  
```cmd
cd frontend
python -m http.server 5500
```

## Outros  
mapdb.py - Script para popular a base de dados com todos os mapas/gamemode/layout existentes no jogo, com valores nulos nas datas   
addlogs.js - Script para adicionar as datas mais recentes dos mapas na base de dados, a partir de arquivo .html salvo do link:  
https://files.realitybrasil.org/PRServer/BattleRecorder/?srv=1
