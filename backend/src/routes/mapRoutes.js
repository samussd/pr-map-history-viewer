// routes/mapRoutes.js
import express from 'express';
import { createMapLog, getAllMapLogs, removeMapLog, getFilteredMaps } from '../controllers/mapController.js';

const router = express.Router();

// POST route to create a new map log
router.post('/maplogs', createMapLog);

// GET route to fetch all map logs
router.get('/maplogs', getAllMapLogs);

// DELETE route to remove a map log by mapDate
router.delete('/maplogs/:mapDate', removeMapLog);

router.get('/filtered-maps', getFilteredMaps);

export default router;
