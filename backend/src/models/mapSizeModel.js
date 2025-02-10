// models/MapSizeModel.js
import { Sequelize, DataTypes } from 'sequelize';
import { sequelize } from './mapLogModel.js';  // Reuse existing DB connection

// Define the MapSize model
const MapSize = sequelize.define('MapSize', {
    map_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    game_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    min_players: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    max_players: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

// Sync the database
sequelize.sync()
    .then(() => console.log("MapSize table created!"))
    .catch(err => console.error("Error creating MapSize table:", err));

export { MapSize };