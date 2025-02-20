import express from 'express'

const CartRouter=express.Router();
import auth from '../middlewares/UserAuth.js'
import { AddToCart, DeleteFromCart, GetCart } from '../controllers/cart.js';

CartRouter.put('/add-to-cart',auth,AddToCart);
CartRouter.delete('/delete-from-cart/:bookid',auth,DeleteFromCart);
CartRouter.get('/get-cart',auth,GetCart);
export default CartRouter