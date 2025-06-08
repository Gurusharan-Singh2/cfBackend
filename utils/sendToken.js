export const sendToken=(token,user,statusCode,message,res)=>{
  try {
    
  res.status(statusCode).cookie("token",token,{
    expires:new Date(Date.now()+process.env.COOKIE_EXPIRE*24*60*60*1000),
    httpOnly:true
  }).json({
    success:true,
    userInfo:{
      name:user.name,
      email:user.email,
      role:user.role
      
    },
    message,
    token
  })
  } catch (error) {
    res.status(statusCode).json({
       success:true,
      message: error.message || "Failed to send token",
    })
  }
  
}