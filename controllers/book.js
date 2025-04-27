import Notebooks from "../models/notebooks.js";
import redis from "../redis.js";

const ShowBooks = async (req, res) => {
  try {
    const cachedBooks = await redis.get('books');

    if (cachedBooks) {
      console.log('📦 Serving all books from Redis cache...');
      return res.status(200).json({
        message: "success (from cache)",
        data: JSON.parse(cachedBooks)
      });
    }

    const books = await Notebooks.find().sort({ createdAt: -1 });

    await redis.set('books', JSON.stringify(books), 'EX', 180); // cache for 3 minutes

    return res.status(200).json({
      message: "success (from DB)",
      data: books
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const RecentBooks = async (req, res) => {
  try {
    const cachedRecent = await redis.get('recent_books');

    if (cachedRecent) {
      console.log('📦 Serving recent books from Redis cache...');
      return res.status(200).json({
        message: "success (from cache)",
        data: JSON.parse(cachedRecent)
      });
    }

    const books = await Notebooks.find().sort({ createdAt: -1 }).limit(4);

    await redis.set('recent_books', JSON.stringify(books), 'EX', 180); // cache for 3 minutes

    return res.status(200).json({
      message: "success (from DB)",
      data: books
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const GetBook = async (req, res) => {
  console.log("📚 Fetching single book details...");

  try {
    const { id } = req.params;

    const cachedBook = await redis.get(`book:${id}`); // unique key for each book

    if (cachedBook) {
      console.log('📦 Serving single book from Redis cache...');
      return res.status(200).json({
        message: "success (from cache)",
        data: JSON.parse(cachedBook)
      });
    }

    const book = await Notebooks.findById(id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    await redis.set(`book:${id}`, JSON.stringify(book), 'EX', 180); // cache individual book

    return res.status(200).json({
      message: "success (from DB)",
      data: book
    });

  } catch (error) {
    console.error("Error fetching book:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { ShowBooks, RecentBooks, GetBook };
