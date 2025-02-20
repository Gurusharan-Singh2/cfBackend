import mongoose from "mongoose";

const orderSchema=new mongoose.Schema({
  user:{
    type:mongoose.Types.ObjectId,
    ref:"User"
  },
  notebook:{
    type:mongoose.Types.ObjectId,
    ref:"Notebooks"
  },
  status:{
    type:String,
    default:"Order Placed",
    enum:["Order Placed", "Out For Delivery", "Delivered"]
  },
},{timestamps:true})

const Orders=mongoose.model("Orders",orderSchema);

export default Orders