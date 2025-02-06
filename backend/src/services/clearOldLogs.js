import { MapLog } from '../models/mapModel.js';

// Function to clear old logs
async function clearOldLogs() {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const outdatedLogs = await MapLog.findAll({
            where: {
                most_recent_date: {
                    [Op.lt]: thirtyDaysAgo
                }
            }
        });

        if (outdatedLogs.length > 0) {
            await MapLog.update(
                { most_recent_date: null },
                {
                    where: {
                        most_recent_date: {
                            [Op.lt]: thirtyDaysAgo
                        }
                    }
                }
            );

            console.log(`Cleared ${outdatedLogs.length} outdated logs.`);
        } else {
            console.log("No outdated logs found.");
        }
    } catch (error) {
        console.error("Error clearing old logs:", error);
    }
}

// Run every 24 hours
setInterval(clearOldLogs, 24 * 60 * 60 * 1000);

// Run immediately on start
clearOldLogs();