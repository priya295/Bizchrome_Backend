import Razorpay from "razorpay";
import crypto from "crypto";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils.js";
import UserModel from "../../models/user.js";
import PackageModel from "../../models/package.js";
// import UserModel from "../models/user";
class paymentController {
  static createOrder = async (req, res) => {
    try {
      const { packageId } = req.params;
      const userId = req.userId;
      const { amount, currency } = req.body;

      const instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const packageInfo = await PackageModel.findById(packageId, "discount");
      let amountToBePaid = amount;
      if (packageInfo.discount) {
        amountToBePaid =
          parseInt(amount) - parseInt(amount * (packageInfo.discount / 100));
      }

      const options = {
        amount: amountToBePaid * 100,
        currency,
        receipt: crypto.randomBytes(10).toString("hex"),
      };
      instance.orders.create(options, (error, order) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ message: "Something Went Wrong!" });
        }
        order.packageId = packageId;
        order.userId = userId;
        res.status(200).send(order);
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error!" });
    }
  };

  static verifyPayment = async (req, res) => {
    try {
      console.log(req.body, "requestt");
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        packageId,
      } = req.body;
      console.log(razorpay_order_id, "orderrr");
      const userId = req.userId;

      const isVerified = validatePaymentVerification(
        { order_id: razorpay_order_id, payment_id: razorpay_payment_id },
        razorpay_signature,
        process.env.RAZORPAY_KEY_SECRET
      );
      if (isVerified) {
        const subscription = await PackageModel.findById(packageId);
        const packageCredits = subscription.credits;
        //store info in db
        await UserModel.findByIdAndUpdate(
          userId,
          {
            $push: {
              packages: {
                packageId,
                date: new Date(),
                paymentDetails: {
                  paymentId: razorpay_payment_id,
                  orderId: razorpay_order_id,
                  signature: razorpay_signature,
                },
              },
            },
            $inc: { credits: packageCredits },
          },
          { new: true }
        );

        return res
          .status(200)
          .json({ message: "Payment verification successfull" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error!" });
    }
  };
}
export default paymentController;
