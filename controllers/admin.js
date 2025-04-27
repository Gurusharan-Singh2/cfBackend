import User from "../models/user.js";
import Notebooks from "../models/notebooks.js";
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import redis from "../redis.js"; // import redis here also

const AddBook = async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "Image is required" });
    }

    const { id } = req.headers;
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Not Authorized" });
    }

    const { price, pages, gsm, grade, length, breadth } = req.body;

    if (!price || !pages || !grade || !length || !breadth) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const imageUpload = await cloudinary.uploader.upload(req.file.path, { resource_type: "image" });
    const url = imageUpload.secure_url;

    const notebook = new Notebooks({ url, price, pages, gsm, grade, length, breadth });
    await notebook.save();

    // Delete local file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Failed to delete local image:", err);
      else console.log("Local image deleted successfully:", req.file.path);
    });

    // Invalidate cache
    await redis.del('books');
    await redis.del('recent_books');

    res.status(201).json({ message: "Notebook Added", notebook });
  } catch (error) {
    console.error("Error adding notebook:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const UpdateBook = async (req, res) => {
  try {
    const { bookid } = req.headers;
    const { price, pages, gsm, grade, length, breadth } = req.body;

    if (!bookid) {
      return res.status(400).json({ message: "Book ID not received" });
    }

    await Notebooks.findByIdAndUpdate(bookid, { price, pages, gsm, grade, length, breadth });

    // Invalidate cache
    await redis.del('books');
    await redis.del('recent_books');
    await redis.del(`book:${bookid}`);

    return res.status(200).json({ message: "Updated Successfully" });
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const DeleteBook = async (req, res) => {
  try {
    const { bookid } = req.headers;

    const notebook = await Notebooks.findById(bookid);
    if (!notebook) {
      return res.status(404).json({ message: "Notebook not found" });
    }

    const imageUrl = notebook.url;
    const publicId = imageUrl.split("/").pop().split(".")[0];

    await cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) console.error("Error deleting image from Cloudinary:", error);
      else console.log("Cloudinary delete response:", result);
    });

    await Notebooks.findByIdAndDelete(bookid);

    // Invalidate cache
    await redis.del('books');
    await redis.del('recent_books');
    await redis.del(`book:${bookid}`);

    res.status(200).json({ message: "Book Deleted Successfully" });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { AddBook, UpdateBook, DeleteBook };
