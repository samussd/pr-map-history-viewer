import { GameDig } from 'gamedig';
import { saveMapLog } from '../controllers/mapController.js';

let lastMap = null

function isEqual(map1, map2) {
  return map1.gameType === map2.gameType && 
  map1.gameLayout === map2.gameLayout && 
  map1.mapName === map2.mapName
}

export async function updateServerInfo() {
    try {
        const state = await GameDig.query({
            type: 'battlefield2',
            host: '144.22.214.56',
            port: 16567,
            listenUdpPort: 29900,
        });

        const currentMap = {
            gameType: state.raw.gametype,
            gameLayout: state.raw.bf2_mapsize,
            mapName: state.raw.mapname,
        };

        if (lastMap === null) {
            lastMap = { ...currentMap };
        }


        if (
            !isEqual(currentMap, lastMap)
        ) {
            const changeTime = new Date().toISOString();
            
            console.log(`CHANGED TO [${currentMap.gameType}, ${currentMap.gameLayout}, ${currentMap.mapName}] at ${changeTime}`);
            
            await saveMapLog(
                lastMap.gameType,
                lastMap.gameLayout,
                lastMap.mapName,
                changeTime
            );

            lastMap = { ...currentMap };
        }
    } catch (error) {
        console.error('Error querying server:', error);
    }
}

// Run every 5 seconds
setInterval(updateServerInfo, 5000);
