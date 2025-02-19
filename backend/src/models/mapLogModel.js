// models/mapModel.js
import { Sequelize, DataTypes } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the absolute path to the backend/src/models directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define an absolute path for the SQLite database file
const dbPath = path.join(__dirname, '../../maplogdb.sqlite');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,  // Use absolute path
    define: {
        timestamps: false
    },
});


// Define the GameMap model
const MapLog = sequelize.define('MapLogs', {
    game_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    layout: {
        type: DataTypes.STRING,
        allowNull: false
    },
    map_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    most_recent_date: {
        type: DataTypes.DATE,
        allowNull: true
    }
});

// Sync the database (creates table if it doesn't exist)
sequelize.sync()
    .then(() => console.log("Database & tables created!"))
    .catch(err => console.error("Error creating database:", err));

export { MapLog, sequelize };
