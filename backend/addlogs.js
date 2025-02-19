import fs from 'fs';
import * as cheerio from 'cheerio';
import { updateMapLogDate } from './src/controllers/mapController.js';

const validLayouts = ["Inf", "Std", "Alt", "Lrg"];

const layoutMap = {
    "Infantry": "Inf",
    "Standard": "Std",
    "Alternative": "Alt",
    "Large": "Lrg"
};

const gamemodeNameMap = {
    'Assault & Secure': 'gpm_cq',
    'Insurgency': 'gpm_insurgency',
    'Gun Game': 'gpm_gungame',
    'Command & Control': 'gpm_cnc',
    'Skirmish': 'gpm_skirmish',
    'Vehicle Warfare': 'gpm_vehicles',
    'Cooperative': 'gpm_coop'
};

// Read the HTML file
const html = fs.readFileSync('Publico.html', 'utf8');
const $ = cheerio.load(html);

// Function to parse date and time
const parseDateTime = (dateText, timeText) => {
    return new Date(`${dateText} ${timeText}`);
};

const convertGameMode = (gameInfo) => {
    var arr = gameInfo.split(',');
    return gamemodeNameMap[arr[0]];
};

const convertMapName = (mapName) => mapName.toLowerCase().replace(/\s+/g, '_');

const extractGameLayout = (gameInfo) => {
    var arr = gameInfo.split(',');
    var str = arr[1].trim();
    return layoutMap[str];
};

// Get all table rows and process them in reverse order
let count = 0;
const rows = $('#table tbody tr').toArray().reverse(); // Convert to array and reverse order

for (const element of rows) {
    let dateText = $(element).find('td:nth-child(1)').text().trim().split('\n')[0];
    dateText = dateText.slice(0, -5);
    console.log(dateText);
    
    let timeText = $(element).find('td:nth-child(1) b').text().trim();
    let mapName = $(element).find('td:nth-child(2) b').text().trim();
    let gameInfo = $(element).find('td:nth-child(2) i').text().trim();

    if (!dateText || !timeText || !mapName || !gameInfo) continue;

    let gameType = convertGameMode(gameInfo);
    let gameLayout = extractGameLayout(gameInfo);
    console.log(dateText);
    mapName = convertMapName(mapName);

    const mapDate = parseDateTime(dateText, timeText);

    // Save extracted data into the database
    await updateMapLogDate(mapName, gameType, gameLayout, mapDate);
    console.log(`${count} Saved: ${gameType} ${gameLayout} ${mapName} ${mapDate}`);
    count++;
}

console.log('✅ Map logs extracted and inserted into database.');
