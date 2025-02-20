import User from '../models/user.js';
import validator from 'validator';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const UserSignup=async(req,res)=>{
  try {
    const {username,email,password,address}=req.body;
    if(!username|| !email || !password ||  !address){
      return res.status(400).json({ message:"Missing Details"})
    }
    if(username.length<4){
      return res
                 .status(400)
                 .json({message:"Username less than 4"})
    }
    if(!validator.isEmail(email)){
      return res.json({ message:"Please Enter a valid Email"});

    }
    const existingEmail= await User.findOne({email:email})
    if(existingEmail===email){
      return res
      .status(400)
      .json({message:"Email already exist"})
    }
    const existingUsername= await User.findOne({username:username});
    if(existingUsername===username){
      return res
      .status(400)
      .json({message:"Username already exist"})
    }

    if(password.length<8){
      return res
      .status(400)
      .json({message:"password is less than 8 "})
    }
    
    const hashedPassword=await bcrypt.hash(password,10);

    const newUser=new User({username:username,email:email,password:hashedPassword,address:address});
    await newUser.save();
    return res.status(200).json({message:"User Created"})




    
  } catch (error) {
    res.status(500).json({message:error})
    
  }
}


const UserLogin=async(req,res)=>{
  try {
    const {username,password}=req.body;
    const user= await User.findOne({username:username});
    if(!user){
      res.status(400).json({message:"invalid credendtials"})
    }

    const isPassword=await bcrypt.compare(password,user.password);
      if(isPassword){
        const token =jwt.sign( { email: user.email, role: user.role },process.env.JWT_SECRET,{
          expiresIn:"5d"
        })
        
        
        res.status(200).json({id:user._id,email: user.email, role: user.role,token:token});

      }else{
        res.status(400).json({message:"invalid credendtials"});
      }
    
  
  } catch (error) {
    res.status(500).json({message:error})
  }
}

  const Userdetail=async(req,res)=>{
    try {
   
    const {id}=req.headers;
    const data=await User.findById(id).select('-password')
    res.status(200).json({data })
    
      
    } catch (error) {
      res.status(500).json({message:error})
    }
  }
 
const UpdateAddress=async(req,res)=>{
  try {
    const {id}=req.headers;
    const {address}=req.body;
    console.log(address);
    
    
    
    
    await User.findByIdAndUpdate(id,{address:address});
    res.status(200).json({message:"Address Updated"})
    
  } catch (error) {
    res.status(500).json({message:error});
  }

}



export {UserSignup,UserLogin,Userdetail,UpdateAddress}