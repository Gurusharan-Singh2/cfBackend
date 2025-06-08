import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import crypto from 'crypto';

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
    minLength:[8,"Password should be at least 8 characters"],
    select:false
    
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  }
,  
  phone:String,
  accountVerified:{
    type:Boolean,
    default:false
  },
  verificationCode:Number,
  verificationCodeExpiry:Date,
  resetPasswordToken:String,
  resetPasswordExpiry:Date,
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
  }],
  unverifiedAt: {
    type: Date,
    default: Date.now,    
    expires: 900           
  },
  createdAt:{
    type:Date,
    default:Date.now
  },
},{timestamps:true});


userSchema.pre("save",async function(next){
  if(!this.isModified("password")) return next();
  this.password=await bcrypt.hash(this.password,10);
  next();
});

userSchema.methods.comparePassword=async function (enterdPassword) {
  return await bcrypt.compare(enterdPassword,this.password);
}


userSchema.methods.generateVerificationCode=function () {
  function randomFiveDigit() {
    return Math.floor(10000 + Math.random() * 90000);
  }
let verificationCode=randomFiveDigit();
this.verificationCode=verificationCode; 
this.   verificationCodeExpiry=Date.now()+10*60*1000;
return verificationCode;
}


userSchema.methods.generateToken= async function () {
  return  jwt.sign({id:this._id},process.env.JWT_SECRET,{
   expiresIn:process.env.JWT_EXPIRE
  })
}


userSchema.methods.generateResetToken= async function(){
  const resetToken= crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken= await crypto.createHash("sha256").update(resetToken).digest("hex");
  
  this.resetPasswordExpiry=Date.now()+15*60*1000;
  return resetToken;
}

const User=mongoose.model("User",userSchema);
export default User