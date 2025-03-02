const express = require('express');
const apiController = require('../controllers/api.controller');
const chatController = require('../controllers/chat.controller');

const router = express.Router();

// Маршруты для API
router.get('/health', apiController.getHealth);
router.get('/stats', apiController.getStats);

// Экспортируем маршруты
module.exports = router; 