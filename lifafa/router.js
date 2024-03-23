const express = require('express');

// Express router
const router = express.Router();

// Controller for lifafa routes
const LifafaController = require('./controller');

// Auth middleware
const { authenticateKey } = require('./middleware');

router.post('/verifyUpiId', authenticateKey, LifafaController.verifyUpiId);
router.post('/create', authenticateKey, LifafaController.createLifafa);
router.post('/claim', authenticateKey, LifafaController.claimLifafa);

router.get('/:lifafaId', authenticateKey, LifafaController.getLifafa);
router.get('/', authenticateKey, LifafaController.getAllLifafa);

module.exports = router;
