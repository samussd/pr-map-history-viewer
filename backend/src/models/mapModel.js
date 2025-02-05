// models/mapModel.js
import { Sequelize, DataTypes } from 'sequelize';

// Initialize SQLite database
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'maplogdb.sqlite'  // SQLite file
});

// Define the GameMap model
const MapLog = sequelize.define('MapLogs', {
    gameType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    gameLayout: {
        type: DataTypes.STRING,
        allowNull: false
    },
    mapName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    mapDate: {
        type: DataTypes.DATE,
        allowNull: false
    }
});

// Sync the database (creates table if it doesn't exist)
sequelize.sync()
    .then(() => console.log("Database & tables created!"))
    .catch(err => console.error("Error creating database:", err));

export { MapLog, sequelize };
