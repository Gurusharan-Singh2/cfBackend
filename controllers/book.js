import Notebooks from "../models/notebooks.js";

const ShowBooks=async(req,res)=>{
  try {
   const books= await Notebooks.find().sort({createdAt:-1})
    return res.status(200).json({message:"success",
      data :books
    })


    
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });

    
  }
}
const RecentBooks=async(req,res)=>{
  try {
   const books= await Notebooks.find().sort({createdAt:-1}).limit(4);
    return res.status(200).json({message:"success",
      data :books
    })


    
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });

    
  }
}
const GetBook = async (req, res) => {
  console.log("Fetching book details...");

  try {
    const { id } = req.params;
    const book = await Notebooks.findById(id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res.status(200).json({
      message: "Success",
      data: book
    });
  } catch (error) {
    console.error("Error fetching book:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


export {ShowBooks,RecentBooks,GetBook };
