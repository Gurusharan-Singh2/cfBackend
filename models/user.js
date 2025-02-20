import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username:{
    type:String,
    require:true,
    unique:true
  },
 email:{
    type:String,
    require:true,
    unique:true
  },
  password:{
    type:String,
    require:true,
    
  },
  address:{
    type:String,
    require:true
  },
  avatar:{
    type:String,
    default:"https://www.shutterstock.com/shutterstock/photos/1153673752/display_1500/stock-vector-profile-placeholder-image-gray-silhouette-no-photo-1153673752.jpg"
  },
  role:{
    type:String,
    default:"user",
    enum:["user","admin"]
  }
  ,
  favrioutes:[{
    type:mongoose.Types.ObjectId,
    ref:"Notebooks"
  }],
  cart:[{
    type:mongoose.Types.ObjectId,
    ref:"Notebooks"
  }],
  orders:[{
    type:mongoose.Types.ObjectId,
    ref:"Orders"
  }],
  paymentDetail:[{
    type:mongoose.Types.ObjectId,
    ref:"Payment"
  }]
},{timestamps:true});

const User=mongoose.model("User",userSchema);
export default User