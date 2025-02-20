import express from "express";
import auth from "../middlewares/UserAuth.js";
import { AddBook, DeleteBook, UpdateBook } from "../controllers/admin.js";
import upload from "../middlewares/multer.js";


const Adminrouter = express.Router();

Adminrouter.post("/add-book", auth, upload.single("image"), AddBook);
Adminrouter.patch("/update-book", auth, UpdateBook);
Adminrouter.delete("/delete-book", auth, DeleteBook);

export default Adminrouter;
