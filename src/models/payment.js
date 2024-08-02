import mongoose from "mongoose";


const paymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    package : {type: mongoose.Schema.Types.ObjectId, ref: 'Package'},
    merchantTransactionId : {type : String},
    status : {type: String},
    txDetails : {type : Object}
});
const payment  = mongoose.model("Payment", paymentSchema);

export default payment;