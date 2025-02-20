import User from "../models/user.js";

const AddToCart=async(req,res)=>{
  try {
    const {id,bookid}=req.headers
    if(!id || !bookid){
      return res.status(400).json({message:"Book id || id not available"});
    }
    const userdata=await User.findById(id);
    const isBookCarted=userdata.cart.includes(bookid);
    if(isBookCarted){
      return res.status(200).json({message:"Book already in cart"});
    }
    await User.findByIdAndUpdate(id,{$push:{cart:bookid}});
    return res.status(200).json({message:"Book Added in cart"});

    
  } catch (error) {
    return res.status(500).json({message:"Invalid response"});

  }
}
const DeleteFromCart=async(req,res)=>{
  try {
    const {id}=req.headers
    const {bookid}=req.params;
    if(!id || !bookid){
      return res.status(400).json({message:"Book id || id not available"});
    }
    const userdata=await User.findById(id);
    const isBookCarted=userdata.cart.includes(bookid);
    if(!isBookCarted){
      return res.status(200).json({message:"Book not in cart"});
    }
    await User.findByIdAndUpdate(id,{$pull:{cart:bookid}});
    return res.status(200).json({message:"Book Deleted from cart"});

    
  } catch (error) {
    return res.status(500).json({message:"Invalid response"});

  }
}


const GetCart=async(req,res)=>{    
  try {
    const {id}=req.headers;
    if(!id){
      return res.status(400).json({message:"User is needed"})
    }
    const user=await User.findById(id).populate("cart");
    return res.status(200).json({message:"success", cart:user.cart.reverse()})
    
  } catch (error) {
    res.status(500).json({ message: error });

  }
}
export {AddToCart,DeleteFromCart,GetCart}