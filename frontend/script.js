import { map_links, gamemode_name, short_gamemode_name, map_sizes } from './config/constants.js'

//TODO: Botao para exibir somente mapas que possuem os modos escolhidos.
// ex: Deagle5 só aparecerá se GUNGAME for escolhido.

document.addEventListener("DOMContentLoaded", () => {
    const gamemodeSelect = document.getElementById("gamemode");
    const addGamemodeButton = document.getElementById("add-gamemode");
    const selectedGamemodesContainer = document.getElementById("selected-gamemodes");
    const filtersForm = document.getElementById("filters-form");
    const filterButton = document.getElementById("filter-btn");
    const daysInput = document.getElementById("days");
    const orderPicker = document.getElementById("order-picker");
    const gamemodeCheckBox = document.getElementById('gamemode-checkbox');
    const sizeButtons = document.querySelectorAll('.size-btn');

    let selectedSizes = [];
    let selectedGamemodes = [];
    let MAPS_GAMEMODES = null;

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

    gamemodeSelect.addEventListener("change", () => {
        const selectedOption = gamemodeSelect.value;
    
        if (!selectedGamemodes.includes(selectedOption)) {
            selectedGamemodes.push(selectedOption);
            updateSelectedGamemodes();
        }
    });

    addGamemodeButton.addEventListener("click", () => {
        const selectedOption = gamemodeSelect.value;

        // Only add the gamemode if it's not already selected
        if (!selectedGamemodes.includes(selectedOption)) {
            selectedGamemodes.push(selectedOption);
            updateSelectedGamemodes();
        }
    });

    
    sizeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const size = button.dataset.size;

            if (selectedSizes.includes(size)) {
                button.classList.remove('selected-size')
                selectedSizes = selectedSizes.filter(item => item !== size);
            } else {
                button.classList.add('selected-size')
                selectedSizes.push(size);
            }

            renderMaps(MAPS_GAMEMODES); // Re-render maps after size filter update
        });
    });


    gamemodeCheckBox.addEventListener('change', function () {
        renderMaps(MAPS_GAMEMODES);
    });

    orderPicker.addEventListener('change', function() {
        renderMaps(MAPS_GAMEMODES);
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
            MAPS_GAMEMODES = await getAvailableMapsAndGamemodes(gamemodes, days);
            console.log(MAPS_GAMEMODES);
            renderMaps(MAPS_GAMEMODES);
        } catch (error) {
            console.error("Error fetching maps:", error);
            mapsContainer.innerHTML = `<p style="color: red;">Failed to load maps.</p>`;
        }
    };

    function filterMapsWithSize(map_names, selectedSizes) {
        let filtered_maps = [];
    
        for (const mapName of map_names) {
            let mapSize = map_sizes[mapName];
    
            if (
                selectedSizes.includes(mapSize) ||
                (mapSize === "0" && selectedSizes.includes("1")) ||
                (mapSize === "8" && selectedSizes.includes("4"))
            ) {
                filtered_maps.push(mapName);
            }
        }
    
        return filtered_maps;
    }


    function onlyMapsWithGamemodes(map_names, maps_gamemodes, gamemodes) {
        let maps_with_gamemodes = [];

        for (const mapName of map_names) {
            const mapData = maps_gamemodes[mapName]
            if (!mapData) continue;

            for (const entry of mapData) {
                if (gamemodes.includes(entry.layout)) {
                    maps_with_gamemodes.push(mapName);
                    break;
                }
            }
        }

        return maps_with_gamemodes;
    }

    function sortAlphabetical(maps_gamemode, order = "ascending") {
        let ordered_name_list = Object.keys(maps_gamemode);
        if (order == "ascending") {
            ordered_name_list.sort((a, b) => a.localeCompare(b)); 
        }
        else {
            ordered_name_list.sort((a, b) => b.localeCompare(a));
        }
        return ordered_name_list;
    }

    function sortByDate(maps_gamemodes, gamemodes, order = "ascending") {
        let ordered_name_list = [];
        
        for (const mapName in maps_gamemodes) {
            const mapData = maps_gamemodes[mapName];
            let mostRecent = null;
            
            for (const entry of mapData) {
                if (!gamemodes.includes(entry.layout)) continue;
    
                if (entry.date !== null) {
                    const entryDate = new Date(entry.date);
                    if (!mostRecent || entryDate < mostRecent) {
                        mostRecent = entryDate;
                    }
                }
            }
            
            ordered_name_list.push({ map_name: mapName, recentDate: mostRecent });
        }
    
        ordered_name_list.sort((a, b) => {
            // If both dates are null, keep them as is
            if (a.recentDate === null && b.recentDate === null) return 0;
    
            // If only one date is null, treat it as the oldest based on the order
            if (a.recentDate === null) return order === "ascending" ? -1 : 1;
            if (b.recentDate === null) return order === "ascending" ? 1 : -1;
    
            // Compare dates if both are not null
            const dateComparison = a.recentDate - b.recentDate;
    
            // If descending order, reverse the comparison
            if (order === "descending") {
                return -dateComparison;
            }
    
            return dateComparison;  // Default is ascending
        });
    
        ordered_name_list = ordered_name_list.map((entry) => entry.map_name);
        
        return ordered_name_list;
    }

    const renderMaps = (maps_gamemodes) => {
        const mapsContainer = document.getElementById("maps");
        mapsContainer.innerHTML = ""; // Clear previous content

        const sortOption = orderPicker.value;

        // Determine the sorting method based on the selected option
        let ordered_map_names;
        if (sortOption.startsWith("alphabetical")) {
            const order = sortOption === "alphabetical-asc" ? "ascending" : "descending";
            ordered_map_names = sortAlphabetical(maps_gamemodes, order);
        } else {
            const order = sortOption === "date-desc" ? "descending" : "ascending";
            ordered_map_names = sortByDate(maps_gamemodes, selectedGamemodes, order);
        }

        if (selectedSizes.length > 0) {
            ordered_map_names = filterMapsWithSize(ordered_map_names, selectedSizes);
        }

        if (gamemodeCheckBox.checked) {
            ordered_map_names = onlyMapsWithGamemodes(ordered_map_names, maps_gamemodes, selectedGamemodes);
        }

        ordered_map_names.forEach((mapName) => {
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
                titleOverlay.classList.add("map-title")
                const mapNameElement = document.createElement("p");
                mapNameElement.innerHTML = `${mapName.replace(/2$/, '').replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}`;
                const mapSizeElement = document.createElement("p");
                mapSizeElement.classList.add('small-title-text')
                mapSizeElement.innerHTML = `${map_sizes[mapName]} km`
                titleOverlay.appendChild(mapNameElement);
                titleOverlay.appendChild(mapSizeElement);

                let latestDateInfo = "Última vez que rodou os modos";
                let latestDates = [];

                // Iterate over selected gamemodes and get the latest date for each
                selectedGamemodes.forEach((gamemode) => {
                    // Get the latest date for the selected gamemode
                    const gamemodeData = mapData.filter(entry => entry.layout === gamemode);

                    if (gamemodeData.length > 0) {
                        // Extract and filter valid dates
                        const latestDate = gamemodeData
                            .map(entry => entry.date ? new Date(entry.date) : null)
                            .filter(date => date !== null && !isNaN(date))
                            .sort((a, b) => b - a)[0];

                        // If a valid date exists
                        if (latestDate) {
                            latestDates.push({ date: latestDate, mode: gamemode });
                            
                            // Format the date and time
                            const formattedDate = latestDate.toLocaleDateString();
                            const formattedTime = latestDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            
                            latestDateInfo += `<br>${short_gamemode_name[gamemode] || gamemode} - ${formattedDate} às ${formattedTime}`;
                        } else {
                            latestDateInfo += `<br>${short_gamemode_name[gamemode] || gamemode} - Sem dados recentes`;
                        }
                    }
                });

                if (latestDates.length > 0) {
                    const latestDateFromGamemodes = latestDates.sort((a, b) => b.date - a.date)[0];
                    const latestGamemodeElement = document.createElement("p");

                    // Calculate the difference in days
                    const latestDate = new Date(latestDateFromGamemodes.date);
                    const now = new Date();
                    const timeDiff = now - latestDate;
                    const daysSinceLast = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

                    // Display the most recent gamemode
                    latestGamemodeElement.innerHTML = `Rodou ${short_gamemode_name[latestDateFromGamemodes.mode]} há ${daysSinceLast} dias.`;
                    latestGamemodeElement.classList.add('small-title-text');
                    titleOverlay.appendChild(latestGamemodeElement);
                } else {
                    // Handle case where no valid dates are found
                    const noDataElement = document.createElement("p");
                    noDataElement.classList.add('small-title-text');
                    noDataElement.innerHTML = "Não rodou os modos recentemente.";
                    titleOverlay.appendChild(noDataElement);
                }


                // Create text for latest dates for selected gamemodes
                const latestDateElement = document.createElement("p");
                latestDateElement.innerHTML = latestDateInfo;

                // Append text element to the overlay
                textOverlay.appendChild(latestDateElement);

                // Append image and overlay to the map card
                mapElement.appendChild(mapImage);
                mapElement.appendChild(titleOverlay);
                mapElement.appendChild(textOverlay);
                
                // Botão com link
                mapElement.style.position = "relative"; // To position the button absolutely

                // Create the map button
                const mapButton = document.createElement("button");
                mapButton.classList.add("map-button");
                mapButton.classList.add("specialbtn")
                mapButton.textContent = "Abrir mapa";
                mapButton.style.display = "none"; // Initially hidden

                // Set the link for the map button
                const mapLink = `https://mapgallery.realitymod.com/${map_links[mapName]}`; // Get the map's link from map_links
                if (mapLink) {
                    mapButton.addEventListener("click", () => {
                        window.location.href = mapLink; // Redirect to the map's site
                    });
                }

                // Append the map button to the map card
                mapElement.appendChild(mapButton);

                // Show the button on hover
                mapElement.addEventListener("mouseenter", () => {
                    mapButton.style.display = "block"; // Show the button when hovered
                });
                mapElement.addEventListener("mouseleave", () => {
                    mapButton.style.display = "none"; // Hide the button when not hovered
                });

                mapElement.addEventListener("click", () => {
                    // Toggle the visibility of the detailed information
                    let gamemodes = [];
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
        })
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

    gamemodeSelect.value = 'gpm_cq'
    addGamemodeButton.click();
    gamemodeSelect.value = 'gpm_insurgency'
    addGamemodeButton.click();
    filterButton.click();
    
});
