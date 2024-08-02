import express from 'express'
import paymentController from '../../controllers/authenticated/payment.js';
import verifyToken from '../../middlewares/authentication.js';

const router = express.Router();

router.post('/order/:packageId',verifyToken ,paymentController.createOrder)
router.post('/verify/:id',paymentController.verifyPayment)

export default router;