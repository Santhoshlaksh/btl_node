const express = require('express');
const router = express.Router();
const upload = require('../utils/upload'); // multer config
const agentController = require('../controllers/agentController'); // your controller file

// Route for check-in (type 1)
router.post(
  '/checkin',
  upload.fields([
    { name: 'img1', maxCount: 1 },
    { name: 'img2', maxCount: 1 },
    { name: 'img3', maxCount: 1 },
    { name: 'img4', maxCount: 1 },
  ]),
  agentController.checkin
);
