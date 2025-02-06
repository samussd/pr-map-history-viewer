document.addEventListener("DOMContentLoaded", () => {
    const gamemodeSelect = document.getElementById("gamemode");
    const addGamemodeButton = document.getElementById("add-gamemode");
    const selectedGamemodesContainer = document.getElementById("selected-gamemodes");
    const filtersForm = document.getElementById("filters-form");
    const daysInput = document.getElementById("days");

    const gamemode_name = {
        'gpm_cq': 'AAS',
        'gpm_insurgency': 'INSURGENCY',
        'gpm_gungame': 'GUNGAME',
        'gpm_cnc': 'CNC',
        'gpm_skirmish': 'SKIRMISH',
        'gpm_vehicles': 'VEHICLE WARFARE',
        'gpm_coop': 'COOP'
    }

    const short_gamemode_name = {
        'gpm_cq': 'AAS',
        'gpm_insurgency': 'INS',
        'gpm_gungame': 'GUNGAME',
        'gpm_cnc': 'CNC',
        'gpm_skirmish': 'SKIRM',
        'gpm_vehicles': 'VW',
        'gpm_coop': 'COOP'
    }

    let selectedGamemodes = [];

    const updateSelectedGamemodes = () => {
        selectedGamemodesContainer.innerHTML = ""; // Clear the current tags

        selectedGamemodes.forEach((gamemode) => {
            const tag = document.createElement("span");
            tag.classList.add("gamemode-tag");

            tag.textContent = gamemode_name[gamemode];

            const removeButton = document.createElement("button");
            removeButton.textContent = "X";
            removeButton.classList.add("remove-tag");
            removeButton.addEventListener("click", () => {
                selectedGamemodes = selectedGamemodes.filter(item => item !== gamemode);
                updateSelectedGamemodes();
            });

            tag.appendChild(removeButton);

            selectedGamemodesContainer.appendChild(tag);
        });
    };

    addGamemodeButton.addEventListener("click", () => {
        const selectedOption = gamemodeSelect.value;

        // Only add the gamemode if it's not already selected
        if (!selectedGamemodes.includes(selectedOption)) {
            selectedGamemodes.push(selectedOption);
            updateSelectedGamemodes();
        }
    });

    filtersForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const selectedDays = parseInt(daysInput.value, 10);

        if (selectedGamemodes.length > 0) {
            await fetchMaps(selectedGamemodes, selectedDays);
        }
        else {
            await fetchMaps(['x'], selectedDays);
        }
    });

    // Fetch maps function as before
    const fetchMaps = async (gamemodes, days) => {
        try {
            const maps_gamemodes = await getAvailableMapsAndGamemodes(gamemodes, days);
            console.log(maps_gamemodes);
            renderMaps(maps_gamemodes);
        } catch (error) {
            console.error("Error fetching maps:", error);
            mapsContainer.innerHTML = `<p style="color: red;">Failed to load maps.</p>`;
        }
    };

    const renderMaps = (maps_gamemodes) => {
        const mapsContainer = document.getElementById("maps");
        mapsContainer.innerHTML = ""; // Clear previous content

        for (const mapName in maps_gamemodes) {
            if (maps_gamemodes.hasOwnProperty(mapName)) {
                const mapData = maps_gamemodes[mapName];

                // Create map container
                const mapElement = document.createElement("div");
                mapElement.classList.add("map-card");

                // Create map image
                const mapImage = document.createElement("img");
                mapImage.src = `/images/maps/${mapName}.png`; // Assumes images are named after map names
                mapImage.alt = `${mapName} Image`;

                // Create text overlay container
                const textOverlay = document.createElement("div");
                textOverlay.classList.add("text-overlay");

                // Create title overlay container
                const titleOverlay = document.createElement("div");
                titleOverlay.classList.add("title-overlay");
                const mapNameElement = document.createElement("p");
                mapNameElement.innerHTML = mapName.replace(/2$/, '').replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());;
                titleOverlay.appendChild(mapNameElement);

                // Initialize an empty string for the latest date information
                let latestDateInfo = "Última vez que rodou os modos";

                // Iterate over selected gamemodes and get the latest date for each
                selectedGamemodes.forEach((gamemode) => {
                    // Get the latest date for the selected gamemode
                    const gamemodeData = mapData.filter(entry => entry.layout === gamemode);
                    if (gamemodeData.length > 0) {
                        const latestDate = gamemodeData
                            .map(entry => entry.date ? new Date(entry.date) : null) // Convert to date or null if date is missing
                            .filter(date => date !== null && !isNaN(date)) // Exclude null and invalid dates
                            .sort((a, b) => b - a)[0];
                
                        // Display the latest date for the gamemode with hour and minute
                        if (latestDate) {
                            const formattedDate = latestDate.toLocaleDateString();
                            const formattedTime = latestDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            latestDateInfo += `<br>${short_gamemode_name[gamemode]} -  ${formattedDate} às ${formattedTime}`;
                        } else {
                            latestDateInfo += `<br>${short_gamemode_name[gamemode]} -  Sem dados recentes`;
                        }
                    }
                });

                // Create text for latest dates for selected gamemodes
                const latestDateElement = document.createElement("p");
                latestDateElement.innerHTML = latestDateInfo;

                // Append text element to the overlay
                textOverlay.appendChild(latestDateElement);

                // Append image and overlay to the map card
                mapElement.appendChild(mapImage);
                mapElement.appendChild(titleOverlay);
                mapElement.appendChild(textOverlay);

                mapElement.addEventListener("click", () => {
                    // Toggle the visibility of the detailed information
                    gamemodes = [];
                    textOverlay.classList.toggle('detailed');
                    if (textOverlay.classList.contains('detailed')) {
                        gamemodes = Array.from(gamemodeSelect.options).map(option => option.value);
                    }
                    else {
                        gamemodes = selectedGamemodes;
                    }

                    let latestDateInfo = "Última vez que rodou os modos";
                    gamemodes.forEach((gamemode) => {
                        const gamemodeData = mapData.filter(entry => entry.layout === gamemode);
                        if (gamemodeData.length > 0) {
                            const latestDate = gamemodeData
                                .map(entry => entry.date ? new Date(entry.date) : null)
                                .filter(date => date !== null && !isNaN(date))
                                .sort((a, b) => b - a)[0];
                    
                            if (latestDate) {
                                const formattedDate = latestDate.toLocaleDateString();
                                const formattedTime = latestDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                latestDateInfo += `<br>${short_gamemode_name[gamemode]} -  ${formattedDate} às ${formattedTime}`;
                            } else {
                                latestDateInfo += `<br>${short_gamemode_name[gamemode]} -  Sem dados recentes`;
                            }
                        }
                    });


                    latestDateElement.innerHTML = latestDateInfo;
                });

                // Append map card to the container
                mapsContainer.appendChild(mapElement);
            }
        }
    };

    async function getAvailableMapsAndGamemodes(gamemodes, days) {
        let maps_gamemodes = {}; // {'gaza_2': [{layout: gpm_cq, date:...}]}

        try {
            const response = await fetch(`http://localhost:5000/api/filtered-maps?gameModes=${gamemodes.join(",")}&days=${days}`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const data = await response.json();

            data.filteredMaps.forEach(log => {
                if (!maps_gamemodes[log.map_name]) {
                    maps_gamemodes[log.map_name] = [];
                }
                maps_gamemodes[log.map_name].push({
                    layout: log.game_type,
                    date: log.most_recent_date
                });
            });

        } catch (error) {
            console.error("Error fetching logs:", error);
            return {};
        }

        return maps_gamemodes;
    }
});
