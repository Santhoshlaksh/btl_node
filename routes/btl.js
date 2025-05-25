const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer().any(); // handle any form-data fields
const loginController = require('../controllers/loginController');
const locationController = require('../controllers/locationController');
const makeController = require('../controllers/makeController');
const modelController = require('../controllers/modelController');
const createplan = require('../controllers/createplan');
const activityController = require('../controllers/activityController');
const checkin = require('../controllers/checkin');
const midcheckin = require('../controllers/midcheckin');
router.post('/btl', checkin.uploadImages, (req, res) => {
  const method = req.body.method;

  switch (method) {
    case 'checkin':
      checkin.checkin(req, res);
      break;
    // other methods
  }
});

// First, apply multer to parse multipart/form-data for all requests
router.post('/btl', upload, (req, res, next) => {
    const method = req.body?.method;

    switch (method) {
        case 'login':
            return loginController.login(req, res);
        case 'locationlist':
            return locationController.locationlist(req, res);
        case 'makelist':
            return makeController.makelist(req, res);
        case 'modellist':
            return modelController.modellist(req, res);
        case 'insertplan':
            return createplan.createplan(req, res);
        case 'activitylist':
            return activityController.activitylist(req, res);
        case 'checkin':
            return checkin.checkin(req, res);
        case 'midcheckin':
            return midcheckin.midcheckin(req, res);    
        default:
            return res.status(400).json({ message: 'Invalid method' });
    }
});

module.exports = router;
