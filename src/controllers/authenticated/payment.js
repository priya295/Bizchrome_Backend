import crypto from "crypto";
import UserModel from "../../models/user.js";
import PackageModel from "../../models/package.js";
import axios from "axios";
import payment from "../../models/payment.js";

class paymentController {

  static createOrder = async (req, res) => {
    try {
      const { packageId } = req.params;
      const userId = req.userId;
      const { amount, currency } = req.body;
  
      // Fetch package discount
      const packageInfo = await PackageModel.findById(packageId, "discount");
      let amountToBePaid = amount;
      if (packageInfo && packageInfo.discount) {
        amountToBePaid = parseInt(amount) - parseInt(amount * (packageInfo.discount / 100));
      }
  
      // Generate transaction ID
      const transactionId = crypto.randomBytes(10).toString("hex");
  
      // Prepare data for PhonePe API
      const data = {
        merchantId: process.env.PHONEPE_MERCHANT_ID,
        merchantTransactionId: transactionId,
        amount: amountToBePaid * 100, // Amount in paisa
        merchantUserId: userId,
        redirectUrl: `${process.env.FRONTEND_URL}/app/plan`,
        redirectMode: "REDIRECT",
        callbackUrl: `${process.env.BACKEND_URL}/user/payment/verify/${transactionId}`,
        paymentInstrument: {
          type: "PAY_PAGE",
        },
      };
  
      const payload = JSON.stringify(data);
      const payloadMain = Buffer.from(payload).toString('base64');
      const keyIndex = 1;
      const stringToHash = `${payloadMain}/pg/v1/pay${process.env.PHONEPE_KEY_SECRET}`;
      const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
      const checksum = `${sha256}###${keyIndex}`;
  
      // Make API request to PhonePe
      const response = await axios.post("https://api.phonepe.com/apis/hermes/pg/v1/pay", { request: payloadMain }, {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
        },
        referrerPolicy: 'strict-origin-when-cross-origin',
      });
  
      if (response.status === 200) {
        await payment.create({
          userId: userId,
          package: packageId,
          status: "success",
          merchantTransactionId: transactionId,
          txDetails: response.data,
        });
        res.send(response.data);
      } else {
        res.status(500).json({ message: "Something Went Wrong!" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error!" });
    }
  };

  static verifyPayment = async (req, res) => {
    try {
      console.log(req.body)

      const encodedPayload = req.body.response; // Assuming PhonePe sends the payload in req.body
      const decodedPayload = Buffer.from(encodedPayload, 'base64').toString('utf-8');
      const decodedData = JSON.parse(decodedPayload);
      // const userId = res.req.body.merchantUserId;
      // const merchantTransactionId = res.req.body.transactionId
      // const merchantId = res.req.body.merchantId 
      // const keyIndex = 1
      // const string =  `/pg/v1/status/${merchantId}/${merchantTransactionId}/` + process.env.PHONEPE_KEY_SECRET
      // const sha256 = crypto.createHash('sha256').update(string).digest('hex')
      // const checksum = sha256 + '###' + keyIndex

      // const response = await axios.get(`ttps://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${merchantTransactionId}`, {
      //   headers: {
      //     accept: 'application/json',
      //     'Content-Type': 'application/json',
      //     'X-VERIFY': checksum ,
      //     'X-MERCHANT-ID' : `${process.env.merchantId}`
      //   },
      //   referrerPolicy: 'strict-origin-when-cross-origin', 
      // })
      if(decodedData.data.state !== "COMPLETED") return res.status(400)

      const payment_1 = await payment.findOne({merchantTransactionId: decodedData.data.merchantTransactionId})
      const packageId = payment_1.package
      if (decodedData.code === "PAYMENT_SUCCESS") {
        const subscription = await PackageModel.findById(packageId);
        const packageCredits = subscription.credits;
        await UserModel.findByIdAndUpdate(
          {_id: payment_1.userId},
          {
            $push: {
              packages: {
                packageId,
                date: new Date(),
                paymentDetails: {
                  paymentId: decodedData.data.merchantTransactionId,
                  orderId: decodedData.data.transactionId,
                  signature: decodedData,
                },
              },
            },
            $inc: { credits: packageCredits },
          },
          { new: true }
        );

        return res
          .status(200)   
      } else {
        return res
          .status(400)
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error!" });
    }
  };
}

export default paymentController;
