import Notebooks from "../models/notebooks.js";
import redis from "../redis.js";

const ShowBooks = async (req, res) => {
  try {
    // Step 1: Check cache first
    const cachedBooks = await redis.get('books');

    if (cachedBooks) {
      console.log('Serving from Redis cache...');
      return res.status(200).json({
        message: "success (from cache)",
        data: JSON.parse(cachedBooks)
      });
    }

    // Step 2: If not in cache, fetch from MongoDB
    const books = await Notebooks.find().sort({ createdAt: -1 });

    // Step 3: Save result to Redis (for future requests)
    await redis.set('books', JSON.stringify(books), 'EX', 180); // cache for 60 seconds

    return res.status(200).json({
      message: "success (from DB)",
      data: books
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
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
