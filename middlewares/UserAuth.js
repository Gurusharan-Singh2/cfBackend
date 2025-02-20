import jwt from 'jsonwebtoken'
import User from '../models/user.js'

// admin authentication middleware

const auth=async(req,res,next)=>{
  try {
    const {atoken,email,role}=req.headers
    if(!atoken){
      return res.json({sucess:false,message:"Not Authorized Login  Again"})
    }
    const tokenDecode=jwt.verify(atoken,process.env.JWT_SECRET);
    
    if(tokenDecode.email!==email && tokenDecode.role!==role){
      return res.json({sucess:false,message:"Not Authorized Login  Again"})
    }
    req.user=User;
    next()
    
  } catch (error) {
    console.log(error);
    res.json({sucess:false,message:error.message})
    
  }
}
export default auth