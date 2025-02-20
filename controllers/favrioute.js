import User from '../models/user.js';

const AddFavrioute=async(req,res)=>{
 
  
  try {
    const {bookid,id}=req.headers;
    const Userdata=await User.findById(id);
    const isFavriouteBook=Userdata.favrioutes.includes(bookid);
    if(isFavriouteBook){
      return res.status(200).json({message:"NoteBook is already in Favrioute"})
    }
    await User.findByIdAndUpdate(id,{$push:{favrioutes:bookid}})
    return res.status(200).json({message:"NoteBook is added in Favrioute"})
    
  } catch (error) {
    res.status(500).json({ message: error });

  }
}
const DeleteFavrioute=async(req,res)=>{

  
  try {
    const {bookid,id}=req.headers;
    const Userdata=await User.findById(id);
    const isFavriouteBook=Userdata.favrioutes.includes(bookid);
    if(!isFavriouteBook){
      return res.status(200).json({message:"NoteBook is not in Favrioute"})
    }
    await User.findByIdAndUpdate(id,{$pull:{favrioutes:bookid}})
    return res.status(200).json({message:"NoteBook is removed from  Favrioute"})
    
  } catch (error) {
    res.status(500).json({ message: error });

  }
}
const GetFavrioute=async(req,res)=>{    
    try {
      const {id}=req.headers;
      if(!id){
        return res.status(400).json({message:"User is needed"})
      }
      const favrioutebooks=await User.findById(id).populate("favrioutes");
      return res.status(200).json({message:"success", books:favrioutebooks.favrioutes})
      
    } catch (error) {
      res.status(500).json({ message: error });
  
    }
  }

export {AddFavrioute,DeleteFavrioute,GetFavrioute}