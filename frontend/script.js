document.addEventListener("DOMContentLoaded", async () => {
    const mapsContainer = document.getElementById("maps");
    const filtersForm = document.getElementById("filters-form");
    const gamemodeSelect = document.getElementById("gamemode");
    const daysInput = document.getElementById("days");

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
        mapsContainer.innerHTML = ""; // Clear previous content

        for (const mapName in maps_gamemodes) {
            if (maps_gamemodes.hasOwnProperty(mapName)) {
                const mapData = maps_gamemodes[mapName];

                // Get latest date overall
                const latestDate = mapData
                    .map(entry => new Date(entry.date))
                    .filter(date => !isNaN(date))
                    .sort((a, b) => b - a)[0]; // Get the most recent date

                const formattedLatestDate = latestDate
                    ? latestDate.toLocaleDateString()
                    : "No recent data";

                // Get latest date for "gpm_cq"
                const cqDates = mapData
                    .filter(entry => entry.layout === "gpm_cq")
                    .map(entry => new Date(entry.date))
                    .filter(date => !isNaN(date))
                    .sort((a, b) => b - a)[0];

                const formattedCQDate = cqDates
                    ? cqDates.toLocaleDateString()
                    : "Sem jogos recentes";

                // Get latest date for "gpm_insurgency"
                const insDates = mapData
                    .filter(entry => entry.layout === "gpm_insurgency")
                    .map(entry => new Date(entry.date))
                    .filter(date => !isNaN(date))
                    .sort((a, b) => b - a)[0];

                const formattedInsDate = insDates
                    ? insDates.toLocaleDateString()
                    : "Sem jogos recentes";

                // Create map container
                const mapElement = document.createElement("div");
                mapElement.classList.add("map-card");

                // Create map image
                const mapImage = document.createElement("img");
                mapImage.src = `../images/maps/${mapName}.png`; // Assumes images are named after map names
                mapImage.alt = `${mapName} Image`;

                // Create text for latest overall date
                const latestDateInfo = document.createElement("p");
                latestDateInfo.textContent = `Latest: ${formattedLatestDate}`;

                // Create text for latest gpm_cq date
                const cqInfo = document.createElement("p");
                cqInfo.textContent = `CQ: ${formattedCQDate}`;

                // Create text for latest gpm_insurgency date
                const insInfo = document.createElement("p");
                insInfo.textContent = `INS: ${formattedInsDate}`;

                // Append elements
                mapElement.appendChild(mapImage);
                mapElement.appendChild(latestDateInfo);
                mapElement.appendChild(cqInfo);
                mapElement.appendChild(insInfo);
                mapsContainer.appendChild(mapElement);
            }
        }
    };

    filtersForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const selectedGamemode = gamemodeSelect.value;
        const selectedDays = parseInt(daysInput.value, 10);

        await fetchMaps([selectedGamemode], selectedDays);
    });

    // Fetch initial maps with default parameters
    fetchMaps(["gpm_cq"], 7);
});

async function getAvailableMapsAndGamemodes(gamemodes, days) {
    let maps_gamemodes = {}; // {'gaza_2': [{layout: gpm_cq, date:...}]}

    try {
        const response = await fetch(`http://localhost:5000/api/filtered-maps?gameModes=${gamemodes.join(",")}&days=${days}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        console.log(data);

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
