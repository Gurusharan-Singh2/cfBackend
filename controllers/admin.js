import User from "../models/user.js";
import Notebooks from "../models/notebooks.js";
import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'

const AddBook = async (req, res) => {
  try {
   
 // ✅ Debugging file input
  
    
      if (!req.file || !req.file.path) {
        return res.status(400).json({ message: "Image is required" });
      }

    const { id } = req.headers; // Extracting user ID from headers
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Fetch the user from DB
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is admin
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Not Authorized" });
    }

    const { price, pages, gsm, grade, length, breadth } = req.body;
    
    if ( !price || !pages ||  !grade || !length || !breadth) {
      return res.status(400).json({ message: "All fields are required"
       });
    }
   

    
   
    
    const imageUpload=await cloudinary.uploader.upload(req.file.path,{resource_type:"image"});
    

    const url=imageUpload.secure_url
    
    

    // Creating a new Notebook entry
    const notebook = new Notebooks({ url, price, pages, gsm, grade, length, breadth });
    await notebook.save();
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error("Failed to delete local image:", err);
      } else {
        console.log("Local image deleted successfully:", req.file.path);
      }
    });

    res.status(201).json({ message: "Notebook Added", notebook });
  } catch (error) {
    console.error("Error adding notebook:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const UpdateBook=async(req,res)=>{
 
  
  try {
    const {bookid}=req.headers;
    const {price,pages,gsm,grade,length,breadth}=req.body;
    if(!bookid){
      return res.status(200).json({message:"book id not received"});
    }
   
    await Notebooks.findByIdAndUpdate(bookid,{
      price,pages,gsm,grade,length,breadth

    })
    return res.status(200).json({message:"Updated Succesfully"})
    
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

const DeleteBook = async (req, res) => {
  try {
    const { bookid } = req.headers;

    // 1️⃣ Fetch the notebook from MongoDB
    const notebook = await Notebooks.findById(bookid);
    if (!notebook) {
      return res.status(404).json({ message: "Notebook not found" });
    }

    // 2️⃣ Extract public ID from Cloudinary URL
    const imageUrl = notebook.url; // Assuming `url` stores Cloudinary image URL
    const publicId = imageUrl.split("/").pop().split(".")[0]; // Extract public_id
    

    // 3️⃣ Delete image from Cloudinary
    await cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        console.error("Error deleting image from Cloudinary:", error);
      } else {
        console.log("Cloudinary delete response:", result);
      }
    });

    // 4️⃣ Delete the notebook from MongoDB
    await Notebooks.findByIdAndDelete(bookid);

    res.status(200).json({ message: "Book  Deleted Successfully" });

  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



export { AddBook,UpdateBook,DeleteBook };
