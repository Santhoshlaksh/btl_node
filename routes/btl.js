const express = require('express');
const router = express.Router();
const multer = require('multer');
const loginController = require('../controllers/loginController');
const locationController = require('../controllers/locationController');
const makeController = require('../controllers/makeController');
const modelController = require('../controllers/modelController');
const createplan = require('../controllers/createplan');
const activityController = require('../controllers/activityController');
const checkin = require('../controllers/checkin');
const midcheckin = require('../controllers/midcheckin');
const checkout = require('../controllers/checkout');


// Create a generic multer instance to handle all images for any method.
// You can customize per controller if needed, but here is a general approach:
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Use multer ANY to parse multipart/form-data and fill req.body & req.files first
router.post('/btl', upload.any(), (req, res, next) => {
  // Now req.body is populated by multer

  const method = req.body.method;
  if (!method) {
    return res.status(400).json({ message: "Missing 'method' in request body" });
  }

  // Attach the method to req for downstream if needed
  req.methodName = method;

  next();
}, (req, res) => {
  const method = req.methodName;

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
    case 'checkout':
      return checkout.checkout(req, res);
    default:
      return res.status(400).json({ message: 'Invalid method' });
  }
});

module.exports = router;
