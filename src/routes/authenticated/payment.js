import express from 'express'
import paymentController from '../../controllers/authenticated/payment.js';

const router = express.Router();

router.post('/order/:packageId',paymentController.createOrder)
router.post('/verify',paymentController.verifyPayment)

export default router;