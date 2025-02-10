// models/mapModel.js
import { Sequelize, DataTypes } from 'sequelize';

// Initialize SQLite database
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'maplogdb.sqlite',  // SQLite file
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
