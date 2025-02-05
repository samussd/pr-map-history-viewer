# Map Picker

## Requisitos
Node.js  
Utiliza as bibliotecas GameDig e SQLite  
Para instalar todos os requisitos  
```npm install```

## Backend
src/services/gameMonitor.js - Vê o mapa atual rodando no servidor, e em caso de mudança de mapa, salva o último na base de dados de mapas rodados

## Frontend
src/components/MapLogs.js - Lê todos os mapas da base de dados e retorna um elemento de HTML para display