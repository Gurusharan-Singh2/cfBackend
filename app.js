import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connect from './config/Dbcoonect.js';
import Userrouter from './routes/user.js';
import Adminrouter from './routes/admin.js';

import Bookrouter from './routes/book.js';
import FavriouteRouter from './routes/favrioute.js';
import CartRouter from './routes/cart.js';
import OrderRouter from './routes/order.js';
import PaymentRouter from './routes/payment.js';
import ConnectCloudinary from './config/cloudinary.js';



const app=express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));


connect()
ConnectCloudinary();
const Port=process.env.PORT || 8080

// app.get('/',async(req,res)=>{
//   await Notebooks.insertMany(data);
//   res.send("Inserted");

// })
// app.get('/delete',async(req,res)=>{
//   await Orders.deleteMany();
//   res.send("Deleted");

// })

app.use('/api',Userrouter);
app.use('/api',Adminrouter);
app.use('/api',Bookrouter);
app.use('/api',FavriouteRouter);
app.use('/api',CartRouter);
app.use('/api',OrderRouter);
app.use('/api',PaymentRouter);



app.listen(Port,()=>{
  console.log("Server Started");
  
})