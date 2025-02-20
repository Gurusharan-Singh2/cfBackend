import express from 'express'
import auth from '../middlewares/UserAuth.js';
import { PlaceOrder,GetOrders,GetAllOrders,Update_Order } from '../controllers/order.js';

const OrderRouter=express.Router();
OrderRouter.post('/place-order',auth,PlaceOrder);
OrderRouter.get('/get-orders',auth,GetOrders);
OrderRouter.get('/get-all-orders',auth,GetAllOrders);
OrderRouter.put('/update-order/:orderId',auth,Update_Order);

export default OrderRouter