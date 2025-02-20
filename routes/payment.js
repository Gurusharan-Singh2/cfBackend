import express from 'express';
import { Cashfree } from 'cashfree-pg';
import 'dotenv/config';
import crypto from 'crypto';

import auth from '../middlewares/UserAuth.js';
import Payment from '../models/paymentHistory.js';
import User from '../models/user.js';

Cashfree.XClientId = process.env.CASHFREE_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX; 


const generateOrderId=()=>{ 
  const uniqueId=crypto.randomBytes(16).toString('hex');

  const hash=crypto.createHash('sha256');
  hash.update(uniqueId);

  const orderId=hash.digest('hex');
  return orderId.substring(0,12);

}

const PaymentRouter=express.Router();
PaymentRouter.post('/payment',auth,async(req,res)=>{
  try {

    const {Amount}=req.body
    const {id}=req.headers;
    const user=await User.findById(id)

    
    

    let request={
      "order_amount":Amount,
      "order_currency":"INR",
      "order_id": generateOrderId(),
      "customer_details":{
        "customer_id":user._id,
        "customer_phone":"9999999999",
        "customer_name":user.username,
        "customer_email":user.email,
      },
    }

    const response =await Cashfree.PGCreateOrder("2023-08-01", request);

    return res.json(response.data)
    
    
  } catch (error) {
    console.log(error.message);
    
  }
})
PaymentRouter.post('/verify-payment',auth,async(req,res)=>{
  try {
    let {OrderId}=req.body;
    const {id}=req.headers;
    
    
    
    
    const response=await Cashfree.PGOrderFetchPayments("2023-08-01",OrderId);
    const newPayment = new Payment(response.data[0]);
    const paymentResponse= await newPayment.save()
    await User.findByIdAndUpdate(id,{$push:{paymentDetail:paymentResponse._id}});
    return res.status(200).json({message:response.data , PaymentResponse:paymentResponse});
    
  } catch (error) {
    console.log(error);
    
  }

})

PaymentRouter.get('/getPaymentDetail',auth,async(req,res)=>{
  try {
    const {id}=req.headers;
    const person=await User.findById(id).populate('paymentDetail');
    return res.status(200).json({data:person})
    
  } catch (error) {
    console.log(error);
    return res.json({message:error})
    
  }
})


export default PaymentRouter