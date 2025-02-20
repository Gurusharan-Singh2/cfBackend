import Orders from "../models/Orders.js";
import User from "../models/user.js";

const PlaceOrder =async(req,res)=>{
  try {
    const {id}=req.headers;
    const {order}=req.body;
    for (const orderData of order){
      const newOrder=new Orders({user:id,notebook:orderData._id});
      const OrderDataFromDb=await newOrder.save();
      await User.findByIdAndUpdate(id,{$push:{orders:OrderDataFromDb._id}});
      await User.findByIdAndUpdate(id,{$pull:{cart:orderData._id}})
    }
    return res.status(200).json({
      status:"succes",
      message:"Order Placed"
    })
  } catch (error) {
    res.status(500).json({ message: error });
  }
}
const GetOrders = async (req, res) => {
  try {
    const { id } = req.headers;
    const userData = await User.findById(id).populate({
      path: "orders",
      populate: { path: "notebook" }
    });

    if (!userData) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    const OrderData = userData.orders.slice().reverse();

    return res.status(200).json({
      status: "success",
      data: OrderData
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

const GetAllOrders =async(req,res)=>{
  try {
    const {id}=req.headers;
    const user=await User.findById(id);
    if(user.role!=="admin"){
      return res.status(200).json({
        message:"You are not  admin"
      })
    } 
    const userData=await Orders.find().populate({
      path:"notebook"}
    ).populate({
      path:"user"
    }).sort({createdAt:-1});
    
    return res.status(200).json({
      status:"succcess",
      data:userData
    })
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ message: error });
  }
}
const Update_Order =async(req,res)=>{
  try {
    const {id}=req.headers;
    const {orderId}=req.params;
    
    
    const user=await User.findById(id);
    if(user.role!=="admin"){
      return res.status(200).json({
        message:"You are not  admin"
      })
    } 
    await Orders.findByIdAndUpdate(orderId,{status:req.body.status})
    
    return res.status(200).json({
      status:"succcess",
      message:"Status Updated Successfully"
    })
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ message: error });
  }
}

export {PlaceOrder,GetOrders,GetAllOrders,Update_Order}