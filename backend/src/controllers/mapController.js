// controllers/mapController.js
import { MapLog } from '../models/mapLogModel.js';
import { Sequelize } from 'sequelize';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { canon_name, canon_layout } from '../../config/mapConstants.js';


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

export const updateMapLogDate = async (mapName, gameMode, gameLayout, mapDate) => {
    try {
        // Define allowed layouts
        const validLayouts = ["Inf", "Std", "Alt", "Lrg"];

        // Check if the provided layout is valid
        if (!validLayouts.includes(gameLayout)) {
            console.error(`❌ Invalid layout: ${gameLayout}. Allowed values: ${validLayouts.join(", ")}`);
            return null;
        }

        // Find a map log entry that matches mapName and gameMode
        const existingMapLog = await MapLog.findOne({
            where: {
                map_name: mapName,
                game_type: gameMode
            }
        });

        if (!existingMapLog) {
            console.error('❌ No matching map log entry found for map_name and game_type');
            return null;
        }

        // Check if an entry with the same layout already exists
        const layoutExists = await MapLog.findOne({
            where: {
                map_name: mapName,
                game_type: gameMode,
                layout: gameLayout
            }
        });

        if (layoutExists) {
            // If the layout already exists, update the most_recent_date
            layoutExists.most_recent_date = mapDate;
            await layoutExists.save();
            console.log(`📝 Map log date updated: ${mapName} - ${gameMode} - ${gameLayout} at ${mapDate}`);
            return layoutExists;
        } else {
            // If no entry with the same layout exists, create a new one
            const newMapLog = await MapLog.create({
                map_name: mapName,
                game_type: gameMode,
                layout: gameLayout,
                most_recent_date: mapDate
            });
            console.log(`📝 New map log created: ${mapName} - ${gameMode} - ${gameLayout} at ${mapDate}`);
            return newMapLog;
        }
    } catch (error) {
        console.error('❌ Error updating or creating map log:', error);
    }
};

// Function to fetch filtered maps
export const getFilteredMaps = async (req, res) => {
    try {
        const { gameModes, days } = req.query;
        
        // If gameModes or days are not provided, return a bad request response
        if (!gameModes || !days) {
            return res.status(400).json({ message: "Please provide both 'gameModes' and 'days' parameters" });
        }

        // Parse the gameModes and days from the query params
        const gameModesArray = gameModes.split(',');  // Assuming gameModes is a comma-separated list
        const daysInt = parseInt(days, 10);

        // Get the date for filtering based on the days parameter
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - daysInt);

        // Fetch map names that have game types ran in the last 'x' days
        const mapsToExclude = await MapLog.findAll({
            attributes: ['map_name'],  // Only return the map_name column to focus on excluded maps
            where: {
                game_type: {
                    [Sequelize.Op.in]: gameModesArray,  // Include maps with any of the specified game modes
                },
                most_recent_date: {
                    [Sequelize.Op.gte]: dateLimit,  // Exclude only maps that have run in the last 'x' days
                },
            },
            group: ['map_name'],  // Group by map_name to avoid duplicates
            raw: true,  // Return as plain object
        });

        const excludedMapNames = mapsToExclude.map(map => map.map_name);

        // Fetch all map names that are not in the exclusion list
        const filteredMaps = await MapLog.findAll({
            attributes: ['map_name','game_type','layout','most_recent_date'],  // Return the map_name column
            where: {
                map_name: {
                    [Sequelize.Op.notIn]: excludedMapNames,  // Exclude maps that are in the exclusion list
                },
            },
            raw: true,  // Return as plain object
        });

        // Return the filtered map names
        res.status(200).json({ filteredMaps });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while fetching the filtered maps" });
    }
};


