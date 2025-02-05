import express from 'express';
import cors from 'cors';  // Import CORS
import mapRoutes from './src/routes/mapRoutes.js';
import { updateServerInfo } from './src/services/gameMonitor.js';

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());  // Enable CORS
app.use(express.json());

// Routes
app.use('/api', mapRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

// Start game monitoring
updateServerInfo();
