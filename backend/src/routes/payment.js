const express = require('express');

const PaymentController = require('../controllers/PaymentController');

let router = express.Router();

router.post('/create', PaymentController.createPayment);
router.post('/callback', PaymentController.callbackPayment);


module.exports = router;
