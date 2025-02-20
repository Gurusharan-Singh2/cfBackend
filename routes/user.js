import  express from 'express';
import { UpdateAddress, Userdetail, UserLogin, UserSignup } from '../controllers/user.js';
import auth from '../middlewares/UserAuth.js';


const Userrouter=express.Router();



// signup
Userrouter.post('/signup',UserSignup);

// login
Userrouter.post('/login',UserLogin);

// user deatil

Userrouter.get('/get-user',auth,Userdetail)


// update address

Userrouter.put('/update-address',auth,UpdateAddress)





export default Userrouter;