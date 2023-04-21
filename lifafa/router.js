const express = require('express');

// Express router
const router = express.Router();

// Controller for lifafa routes
const LifafaController = require('./controller');

router.post('/verifyUpiId', LifafaController.verifyUpiId);
router.post('/create', LifafaController.createLifafa);
router.post('/claim', LifafaController.claimLifafa);

router.get('/:lifafaId', LifafaController.getLifafa);
router.get('/', LifafaController.getAllLifafa);

module.exports = router;
