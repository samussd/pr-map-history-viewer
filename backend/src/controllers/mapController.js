// controllers/mapController.js
import { MapLog } from '../models/mapModel.js';
import { Sequelize } from 'sequelize';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { canon_name, canon_layout } from '../../config/mapConstants.js';


// Open connection to `mapsdb.sqlite`
const mapsDb = await open({
    filename: './mapsdb.sqlite',
    driver: sqlite3.Database
});

// ✅ Function to save a new map log (for gameMonitor.js)
export const saveMapLog = async (gameType, gameLayout, mapName, mapDate) => {
    try {
        const newMapLog = await MapLog.create({ gameType, gameLayout, mapName, mapDate });
        console.log(`📝 Map log saved: ${mapName} at ${mapDate}`);
        return newMapLog;
    } catch (error) {
        console.error('❌ Error saving map log:', error);
    }
};

// Create a new map log
export const createMapLog = async (req, res) => {
    try {
        const { gameType, gameLayout, mapName, mapDate } = req.body;
        const newMapLog = await MapLog.create({ gameType, gameLayout, mapName, mapDate });
        res.status(201).json(newMapLog);
    } catch (error) {
        res.status(500).json({ message: 'Error creating map log', error });
    }
};

// Fetch all map logs
export const getAllMapLogs = async (req, res) => {
    try {
        const mapLogs = await MapLog.findAll();
        res.status(200).json(mapLogs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching map logs', error });
    }
};

export const removeMapLog = async (req, res) => {
  try {
      const { mapDate } = req.params;  // Assuming mapDate is passed in the URL
      const mapLog = await MapLog.findOne({ where: { mapDate } });
      
      if (!mapLog) {
          return res.status(404).json({ message: 'Map log not found' });
      }

      await mapLog.destroy();
      res.status(200).json({ message: 'Map log removed successfully' });
  } catch (error) {
      res.status(500).json({ message: 'Error removing map log', error });
  }
};

// Function to fetch filtered maps
export const getFilteredMaps = async (req, res) => {
    try {
        const { gameModes, days } = req.query;
        const gameModeArray = gameModes ? gameModes.split(',') : [];
        const daysInt = parseInt(days, 10) || 7;

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysInt);

        const recentMapLogs = await MapLog.findAll({
            attributes: ['mapName', 'gameType'],
            where: {
                gameType: gameModeArray,
                mapDate: { [Sequelize.Op.gte]: cutoffDate }
            }
        });

        const excludedPairs = recentMapLogs.map(log => ({
            mapName: canon_name[log.mapName] ? canon_name[log.mapName].formatted : log.mapName,
            gameMode: log.gameType
        }));

        let query = `SELECT * FROM Maps`;
        if (excludedPairs.length > 0) {
            query += ` WHERE `;
            const conditions = excludedPairs.map(pair => {
                return `NOT (LOWER(Maps.map_name) = ? AND Maps.game_mode = ?)`;
            });
            query += conditions.join(' AND ');
        }

        const params = excludedPairs.flatMap(pair => [pair.mapName, pair.gameMode]);
        const maps = await mapsDb.all(query, params);

        return res.json(maps);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao buscar mapas filtrados' });
    }
};



