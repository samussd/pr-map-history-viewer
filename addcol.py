import sqlite3

# Connect to both databases
conn_maps = sqlite3.connect('backend/mapsdb.sqlite')
conn_log = sqlite3.connect('backend/maplogdb.sqlite')

cursor_maps = conn_maps.cursor()
cursor_log = conn_log.cursor()

# Step 1: Select the latest mapDate for each mapName, gameMode pair from maplogdb
cursor_log.execute('''
    SELECT mapName, gameType, MAX(mapDate) AS most_recent_date
    FROM mapLogs
    GROUP BY mapName, gameType;
''')

# Fetch the results
recent_dates = cursor_log.fetchall()

# Step 2: Update the maps table with the latest mapDate for each corresponding mapName and gameMode
for mapName, gameType, most_recent_date in recent_dates:
    cursor_maps.execute('''
        UPDATE maps
        SET most_recent_date = ?
        WHERE map_name = ? AND game_mode = ?;
    ''', (most_recent_date, mapName, gameType))

# Commit the changes
conn_maps.commit()

# Close the connections
conn_maps.close()
conn_log.close()