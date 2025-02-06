# Map Picker
Ver e filtrar o histórico de mapas de um servidor de Project Reality.

## Requisitos
Node.js  
Utiliza as bibliotecas GameDig e SQLite  
Para instalar todos os requisitos  
```npm install```

## Backend
src/services/gameMonitor.js - Vê o mapa atual rodando no servidor, e em caso de mudança de mapa, salva a data do último mapa na base de dados.  
A base de dados é maplogdb.sqlite  
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