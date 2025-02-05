document.addEventListener("DOMContentLoaded", async () => {
    const logsContainer = document.getElementById("logs");

    const fetchLogs = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/maplogs");
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const logs = await response.json();
            renderLogs(logs);
        } catch (error) {
            console.error("Error fetching logs:", error);
            logsContainer.innerHTML = `<p style="color: red;">Failed to load logs.</p>`;
        }
    };

    const renderLogs = (logs) => {
        logsContainer.innerHTML = ""; // Clear previous content
        logs.forEach(log => {
            const li = document.createElement("li");
            li.innerHTML = `<strong>${log.mapName}</strong> - ${log.gameType} (${new Date(log.mapDate).toLocaleDateString()})`;
            logsContainer.appendChild(li);
        });
    };

    fetchLogs();
});